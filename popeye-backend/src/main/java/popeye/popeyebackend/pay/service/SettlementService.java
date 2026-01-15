package popeye.popeyebackend.pay.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.pay.dto.settlement.AvailableBalanceResponse;
import popeye.popeyebackend.pay.dto.settlement.ContentSettlementPeriodItem;
import popeye.popeyebackend.pay.dto.settlement.ContentSettlementSummaryResponse;
import popeye.popeyebackend.pay.dto.settlement.DailyContentSettlementResponse;
import popeye.popeyebackend.pay.repository.ContentSettlementSummaryProjection;
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
@Transactional(readOnly = true)
public class SettlementService {

	private final SettlementRepository settlementRepository;
	private final WithdrawalRepository withdrawalRepository;
	private final CreatorRepository creatorRepository;
	private final ContentRepository contentRepository;

	/**
	 * 크리에이터의 인출 가능 잔액 계산 (내부/다른 서비스에서 사용)
	 * available = SUM(Settlement 정산금) - SUM(Withdrawal.amount where status = SUC)
	 * 
	 * @param creatorId 크리에이터 ID
	 * @return 인출 가능 잔액
	 */
	public long calculateAvailableBalance(Long creatorId) {
		BalanceCalculation balance = calculateBalance(creatorId);
		return balance.available();
	}

	/**
	 * 크리에이터의 인출 가능 잔액 조회 (API용)
	 * 검증 후 상세 정보(settlementSum, withdrawnSum, available)와 함께 반환
	 */
	public AvailableBalanceResponse getAvailableBalance(Long loginUserId, Long creatorId) {
		validateCreator(loginUserId, creatorId);
		BalanceCalculation balance = calculateBalance(creatorId);
		return new AvailableBalanceResponse(balance.settlementSum(), balance.withdrawnSum(), balance.available());
	}

	/**
	 * 잔액 계산 로직 (중복 제거용 내부 메서드)
	 */
	private BalanceCalculation calculateBalance(Long creatorId) {
		long settlementSum = settlementRepository.sumTotalAmountByCreator(creatorId);
		long withdrawnSum = withdrawalRepository.sumAmountByCreatorIdAndStatus(creatorId, WithdrawalStatus.SUC);
		long available = settlementSum - withdrawnSum;
		return new BalanceCalculation(settlementSum, withdrawnSum, available);
	}

	/**
	 * 잔액 계산 결과를 담는 record
	 */
	private record BalanceCalculation(long settlementSum, long withdrawnSum, long available) {
	}

	/**
	 * Creator의 각 컨텐츠별 누적 정산 요약 조회
	 */
	public List<ContentSettlementSummaryResponse> getContentSettlementSummaries(
		Long loginUserId, Long creatorId) {
		validateCreator(loginUserId, creatorId);

		// DB 집계 쿼리로 contentId별 집계 조회 (1번만 실행)
		List<ContentSettlementSummaryProjection> summaries =
			settlementRepository.findContentSettlementSummariesByCreatorId(creatorId);

		// Projection → Response DTO 매핑
		return summaries.stream()
			.map(summary -> new ContentSettlementSummaryResponse(
				summary.getContentId(),
				summary.getTitle(),
				summary.getTotalRevenue(),
				summary.getTotalPlatformFee(),
				summary.getTotalPayout(),
				summary.getLastSettledAt(),
				summary.getSettlementCount()
			))
			.toList();
	}

	/**
	 * 컨텐츠의 일별 정산 내역 조회
	 */
	public DailyContentSettlementResponse getMonthlyContentSettlement(Long loginUserId, Long creatorId, Long contentId,
		String month) {
		DateRange range = parseMonthToDateRange(month);

		// creatorId 검증
		validateCreator(loginUserId, creatorId);

		// contentId 소유 검증
		Content content = contentRepository.findByIdWithCreator(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠를 찾을 수 없습니다: " + contentId));

		Creator contentCreator = content.getCreator();
		if (!creatorId.equals(contentCreator.getId())) {
			throw new IllegalArgumentException("본인 소유의 콘텐츠만 조회할 수 있습니다.");
		}

		// 기간별 DateTime 변환
		LocalDateTime fromDateTime = range.from().atStartOfDay();
		LocalDateTime toDateTime = range.to().plusDays(1).atStartOfDay(); // to 포함을 위해 +1일

		// 일별(DAY) DB 집계 쿼리 실행
		List<popeye.popeyebackend.pay.repository.ContentSettlementPeriodProjection> projections =
			settlementRepository.findContentSettlementPeriodsByDay(contentId, fromDateTime, toDateTime);

		// Projection → Response DTO 매핑
		List<ContentSettlementPeriodItem> items = projections.stream()
			.map(proj -> {
				LocalDateTime periodStart = proj.getPeriodStart();
				LocalDateTime periodEnd = periodStart.plusDays(1); // 일 단위이므로 +1일
				return new ContentSettlementPeriodItem(
					periodStart,
					periodEnd,
					proj.getOrderCount(),
					proj.getTotalRevenue(),
					proj.getTotalPlatformFee(),
					proj.getTotalPayout(),
					proj.getLatestSettledAt()
				);
			})
			.toList();

		return new DailyContentSettlementResponse(contentId, range.from(), range.to(), items);
	}

	public void validateCreator(Long loginUserId, Long creatorId) {
		Creator creator = creatorRepository.findByIdWithUser(creatorId)
			.orElseThrow(() ->
				new IllegalArgumentException("크리에이터를 찾을 수 없습니다: " + creatorId)
			);

		if (!creator.getUser().getId().equals(loginUserId)) {
			throw new IllegalArgumentException("크리에이터 본인만 조회할 수 있습니다.");
		}
	}

	private DateRange parseMonthToDateRange(String month) {
		try {
			YearMonth ym = YearMonth.parse(month);
			return new DateRange(
				ym.atDay(1),
				ym.atEndOfMonth()
			);
		} catch (DateTimeParseException e) {
			throw new IllegalArgumentException(
				"잘못된 월 형식입니다. YYYY-MM 형식으로 입력해주세요. (예: 2026-01)", e
			);
		}
	}

	public record DateRange(LocalDate from, LocalDate to) {}

}
