package popeye.popeyebackend.pay.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import popeye.popeyebackend.pay.dto.settlement.AvailableBalanceResponse;
import popeye.popeyebackend.pay.repository.SettlementRepository;
import popeye.popeyebackend.pay.repository.WithdrawalRepository;
import popeye.popeyebackend.pay.enums.WithdrawalStatus;
import popeye.popeyebackend.user.domain.Creator;
import popeye.popeyebackend.user.repository.CreatorRepository;

/**
 * 정산 서비스 (API용)
 * 배치 로직은 settlement.batch 패키지로 분리됨
 */
@Service
@RequiredArgsConstructor
public class SettlementService {

	private final SettlementRepository settlementRepository;
	private final WithdrawalRepository withdrawalRepository;
	private final CreatorRepository creatorRepository;

	/**
	 * 크리에이터의 인출 가능 잔액 조회
	 *
	 * Note: Settlement는 User를 creator로 사용하고, Withdrawal는 Creator를 사용합니다.
	 * 따라서 Creator를 조회하여 User의 id를 얻어야 합니다.
	 */
	@Transactional(readOnly = true)
	public AvailableBalanceResponse getAvailableBalance(Long loginUserId, Long creatorId) {
		// Creator 조회하여 User의 id 얻기 (fetch join으로 user도 함께 로드)
		Creator creator = creatorRepository.findByIdWithUser(creatorId)
			.orElseThrow(() -> new IllegalArgumentException("크리에이터를 찾을 수 없습니다: " + creatorId));
		Long userId = creator.getUser().getId();

		if (!loginUserId.equals(userId)) {
			throw new IllegalArgumentException("크리에이터 본인만 조회할 수 있습니다.");
		}

		// Settlement는 User를 creator로 사용하므로 User의 id를 전달
		long settlementSum = settlementRepository.sumTotalAmountByCreator(userId);
		// Withdrawal는 Creator를 사용하므로 Creator의 id를 전달
		long withdrawnSum = withdrawalRepository.sumAmountByCreatorIdAndStatus(creatorId, WithdrawalStatus.SUC);
		long available = settlementSum - withdrawnSum;
		return new AvailableBalanceResponse(settlementSum, withdrawnSum, available);
	}

}
