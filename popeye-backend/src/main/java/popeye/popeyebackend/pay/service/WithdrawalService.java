package popeye.popeyebackend.pay.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import popeye.popeyebackend.pay.domain.Withdrawal;
import popeye.popeyebackend.pay.dto.withdrawal.WithdrawalRequest;
import popeye.popeyebackend.pay.dto.withdrawal.WithdrawalResponse;
import popeye.popeyebackend.pay.enums.WithdrawalStatus;
import popeye.popeyebackend.pay.repository.SettlementRepository;
import popeye.popeyebackend.pay.repository.WithdrawalRepository;
import popeye.popeyebackend.user.domain.Creator;
import popeye.popeyebackend.user.repository.CreatorRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class WithdrawalService {

	private final WithdrawalRepository withdrawalRepository;
	private final SettlementRepository settlementRepository;
	private final CreatorRepository creatorRepository;

	/**
	 * 출금 신청 및 즉시 처리
	 * 출금 신청 생성 직후 트랜잭션 내에서 즉시 처리(SUC/REJ 확정)
	 *
	 * 처리 흐름:
	 * 1) 입력 검증 (금액 >= 1)
	 * 2) Withdrawal 엔티티 생성 (status=REQ)
	 * 3) 트랜잭션 내에서 즉시 처리 (비관적 락 적용)
	 * 4) 최종 상태 반영된 WithdrawalResponse 반환
	 */
	@Transactional
	public WithdrawalResponse requestWithdrawal(Long loginUserId, Long creatorId, WithdrawalRequest request) {

		// 입력 검증
		if (request.getAmount() < 1) {
			throw new IllegalArgumentException("출금 금액은 1 이상이어야 합니다.");
		}

		// Creator 조회
		Creator creator = creatorRepository.findByIdWithUser(creatorId)
			.orElseThrow(() -> new IllegalArgumentException("크리에이터를 찾을 수 없습니다: " + creatorId));

		// 인증
		if (!loginUserId.equals(creator.getUser().getId())) {
			throw new IllegalArgumentException("크리에이터 본인만 조회할 수 있습니다.");
		}

		// Withdrawal 엔티티 생성 (status=REQ)
		Withdrawal withdrawal = Withdrawal.request(creator, request.getAmount());
		Withdrawal saved = withdrawalRepository.save(withdrawal);

		// 트랜잭션 내에서 즉시 처리
		processWithdrawalImmediately(saved.getId());

		// 최신 상태로 다시 조회하여 반환
		Withdrawal updated = withdrawalRepository.findById(saved.getId())
			.orElseThrow(() -> new IllegalStateException("출금 신청을 찾을 수 없습니다: " + saved.getId()));

		return new WithdrawalResponse(
			updated.getId(),
			updated.getCreator().getId(),
			updated.getAmount(),
			updated.getStatus(),
			updated.getRequestedAt(),
			updated.getProcessedAt(),
			updated.getFailureReason()
		);
	}

	/**
	 * 출금 즉시 처리 (트랜잭션 내에서 실행)
	 *
	 * 동시성 방어: 비관적 락(PESSIMISTIC_WRITE)으로 withdrawal row 잠금
	 * - 같은 withdrawalId에 대한 동시 요청 방지
	 * - 잔액 계산과 상태 업데이트가 원자적으로 수행됨
	 *
	 * @param withdrawalId 출금 신청 ID
	 * @throws IllegalStateException 출금 신청을 찾을 수 없거나 이미 처리된 경우
	 */
	private void processWithdrawalImmediately(Long withdrawalId) {
		log.info("출금 즉시 처리 시작: withdrawalId={}", withdrawalId);

		// 비관적 락으로 withdrawal 조회 (동시성 방어)
		Withdrawal withdrawal = withdrawalRepository.findByIdWithCreatorAndUser(withdrawalId)
			.orElseThrow(() -> new IllegalStateException("출금 신청을 찾을 수 없습니다: " + withdrawalId));

		// 이미 처리된 경우 스킵
		if (withdrawal.getStatus() != WithdrawalStatus.REQ) {
			log.warn("출금 신청이 이미 처리되었습니다: withdrawalId={}, status={}", withdrawalId, withdrawal.getStatus());
			return;
		}

		// 잔액 계산
		Long creatorId = withdrawal.getCreator().getId();
		Long userId = withdrawal.getCreator().getUser().getId();
		long available = calculateAvailableBalanceForProcessing(creatorId, userId);

		// 상태 결정 및 업데이트
		if (available >= withdrawal.getAmount()) {
			// 지급 가능: SUC
			withdrawal.markAsSuccess();
			log.info("출금 처리 성공: withdrawalId={}, amount={}, available={}", withdrawalId, withdrawal.getAmount(),
				available);
		} else {
			// 지급 불가: REJ
			String reason = String.format("출금 가능 잔액 부족 (가능: %d, 요청: %d)", available, withdrawal.getAmount());
			withdrawal.markAsRejected(reason);
			log.warn("출금 처리 거절: withdrawalId={}, amount={}, available={}, reason={}", withdrawalId,
				withdrawal.getAmount(), available, reason);
		}

		withdrawalRepository.save(withdrawal);
		log.info("출금 즉시 처리 완료: withdrawalId={}, status={}", withdrawalId, withdrawal.getStatus());
	}

	/**
	 * 출금 처리용 잔액 계산
	 * available = SUM(Settlement 정산금) - SUM(Withdrawal.amount where status = SUC)
	 *
	 * Note: Settlement는 User를 creator로 사용하고, Withdrawal는 Creator를 사용합니다.
	 * 따라서 User의 id와 Creator의 id를 모두 받아야 합니다.
	 */
	private long calculateAvailableBalanceForProcessing(Long creatorId, Long userId) {
		// Settlement는 User를 creator로 사용하므로 User의 id를 전달
		long settlementSum = settlementRepository.sumTotalAmountByCreator(userId);
		// Withdrawal는 Creator를 사용하므로 Creator의 id를 전달
		long withdrawnSum = withdrawalRepository.sumAmountByCreatorIdAndStatus(creatorId, WithdrawalStatus.SUC);
		return settlementSum - withdrawnSum;
	}

	/**
	 * 크리에이터의 출금 내역 조회
	 */
	@Transactional(readOnly = true)
	public List<WithdrawalResponse> getWithdrawals(Long loginUserId, Long creatorId) {

		// Creator 조회 (user는 여기서 필요 없지만 일관성을 위해 fetch join 사용)
		Creator creator = creatorRepository.findByIdWithUser(creatorId)
			.orElseThrow(() -> new IllegalArgumentException("크리에이터를 찾을 수 없습니다: " + creatorId));

		// 인증
		if (!loginUserId.equals(creator.getUser().getId())) {
			throw new IllegalArgumentException("크리에이터 본인만 조회할 수 있습니다.");
		}
		return withdrawalRepository.findByCreatorIdOrderByRequestedAtDesc(creatorId).stream()
			.map(w -> new WithdrawalResponse(
				w.getId(),
				w.getCreator().getId(),
				w.getAmount(),
				w.getStatus(),
				w.getRequestedAt(),
				w.getProcessedAt(),
				w.getFailureReason()
			))
			.toList();
	}
}


