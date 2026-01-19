package popeye.popeyebackend.pay.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import popeye.popeyebackend.pay.domain.Withdrawal;
import popeye.popeyebackend.pay.dto.withdrawal.WithdrawalRequest;
import popeye.popeyebackend.pay.dto.withdrawal.WithdrawalResponse;
import popeye.popeyebackend.pay.enums.WithdrawalStatus;
import popeye.popeyebackend.pay.repository.WithdrawalRepository;
import popeye.popeyebackend.user.domain.Creator;
import popeye.popeyebackend.user.repository.CreatorRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class WithdrawalService {

	private final WithdrawalRepository withdrawalRepository;
	private final SettlementService settlementService;
	private final CreatorRepository creatorRepository;

	@Transactional
	public WithdrawalResponse requestWithdrawal(Long loginUserId, Long creatorId, WithdrawalRequest request) {

		// 입력 검증
		if (request.getAmount() < 1) {
			throw new IllegalArgumentException("출금 금액은 1 이상이어야 합니다.");
		}

		// Creator 검증
		Creator creator = validateCreator(loginUserId, creatorId);

		// Withdrawal 엔티티 생성 (status=REQ)
		Withdrawal withdrawal = Withdrawal.request(creator, request.getAmount());
		Withdrawal saved = withdrawalRepository.save(withdrawal);

		// 트랜잭션 내에서 즉시 처리 (처리된 엔티티를 반환받아 재조회 방지)
		Withdrawal processed = processWithdrawalImmediately(saved.getId());

		// processWithdrawalImmediately가 반환한 엔티티를 사용 (동일 트랜잭션 내에서 이미 업데이트됨)
		return new WithdrawalResponse(
			processed.getId(),
			processed.getCreator().getId(),
			processed.getAmount(),
			processed.getStatus(),
			processed.getRequestedAt(),
			processed.getProcessedAt(),
			processed.getFailureReason()
		);
	}

	private Withdrawal processWithdrawalImmediately(Long withdrawalId) {
		log.info("출금 즉시 처리 시작: withdrawalId={}", withdrawalId);

		// 비관적 락으로 withdrawal 조회 (동시성 방어)
		Withdrawal withdrawal = withdrawalRepository.findByIdWithCreatorAndUser(withdrawalId)
			.orElseThrow(() -> new IllegalStateException("출금 신청을 찾을 수 없습니다: " + withdrawalId));

		// 이미 처리된 경우 스킵
		if (withdrawal.getStatus() != WithdrawalStatus.REQ) {
			log.warn("출금 신청이 이미 처리되었습니다: withdrawalId={}, status={}", withdrawalId, withdrawal.getStatus());
			return withdrawal;
		}

		// 잔액 계산
		Long creatorId = withdrawal.getCreator().getId();
		long available = settlementService.calculateAvailableBalanceDetail(creatorId).getAvailable();

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
		
		// 처리된 엔티티를 반환하여 재조회 방지
		return withdrawal;
	}

	@Transactional(readOnly = true)
	public Page<WithdrawalResponse> getWithdrawals(
		Long loginUserId,
		Long creatorId,
		String month,
		Pageable pageable
	) {
		validateCreator(loginUserId, creatorId);

		YearMonth ym = parseMonthOrNow(month);

		LocalDateTime fromDateTime = ym.atDay(1).atStartOfDay();
		LocalDateTime toDateTimeExclusive = ym.plusMonths(1).atDay(1).atStartOfDay();

		return withdrawalRepository
			.findByCreatorIdAndRequestedAtRange(creatorId, fromDateTime, toDateTimeExclusive, pageable)
			.map(w -> new WithdrawalResponse(
				w.getId(),
				w.getCreator().getId(),
				w.getAmount(),
				w.getStatus(),
				w.getRequestedAt(),
				w.getProcessedAt(),
				w.getFailureReason()
			));
	}

	private YearMonth parseMonthOrNow(String month) {
		if (month == null || month.isBlank()) {
			return YearMonth.now();
		}
		try {
			return YearMonth.parse(month);
		} catch (DateTimeParseException e) {
			throw new IllegalArgumentException(
				"잘못된 월 형식입니다. YYYY-MM 형식으로 입력해주세요. (예: 2026-01)", e
			);
		}
	}

	private Creator validateCreator(Long loginUserId, Long creatorId) {
		Creator creator = creatorRepository.findByIdWithUser(creatorId)
			.orElseThrow(() ->
				new IllegalArgumentException("크리에이터를 찾을 수 없습니다: " + creatorId)
			);

		if (!creator.getUser().getId().equals(loginUserId)) {
			throw new IllegalArgumentException("크리에이터 본인만 조회할 수 있습니다.");
		}
		return creator;
	}
}


