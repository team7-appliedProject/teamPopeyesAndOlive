package popeye.popeyebackend.pay.service;

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
import popeye.popeyebackend.pay.repository.projection.ContentSettlementSummaryProjection;
import popeye.popeyebackend.pay.repository.SettlementRepository;
import popeye.popeyebackend.pay.repository.WithdrawalRepository;
import popeye.popeyebackend.pay.enums.WithdrawalStatus;
import popeye.popeyebackend.pay.repository.projection.ContentSettlementPeriodProjection;
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

	public AvailableBalanceResponse getAvailableBalance(Long loginUserId, Long creatorId) {
		validateCreator(loginUserId, creatorId);
		return calculateAvailableBalanceDetail(creatorId);
	}

	public AvailableBalanceResponse calculateAvailableBalanceDetail(Long creatorId) {
		long settlementSum = settlementRepository.sumTotalAmountByCreator(creatorId);
		long withdrawnSum = withdrawalRepository.sumAmountByCreatorIdAndStatus(creatorId, WithdrawalStatus.SUC);
		long available = settlementSum - withdrawnSum;
		return new AvailableBalanceResponse(settlementSum, withdrawnSum, available);
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
	 * 컨텐츠의 일별 정산 내역 조회 (월 단위)
	 */
	public DailyContentSettlementResponse getMonthlyContentSettlement(
		Long loginUserId,
		Long creatorId,
		Long contentId,
		String month
	) {
		YearMonth ym = parseMonth(month);

		// creatorId 검증
		validateCreator(loginUserId, creatorId);

		// contentId 소유 검증
		Content content = contentRepository.findByIdWithCreator(contentId)
			.orElseThrow(() -> new IllegalArgumentException("콘텐츠를 찾을 수 없습니다: " + contentId));

		if (!creatorId.equals(content.getCreator().getId())) {
			throw new IllegalArgumentException("본인 소유의 콘텐츠만 조회할 수 있습니다.");
		}

		// 월 범위 계산
		LocalDateTime fromDateTime = ym.atDay(1).atStartOfDay();
		LocalDateTime toDateTimeExclusive = ym.plusMonths(1).atDay(1).atStartOfDay();

		// 일별(DAY) DB 집계
		List<ContentSettlementPeriodProjection> projections =
			settlementRepository.findContentSettlementPeriodsByDay(
				contentId,
				fromDateTime,
				toDateTimeExclusive
			);

		List<ContentSettlementPeriodItem> items = projections.stream()
			.map(proj -> {
				LocalDateTime start = proj.getPeriodStart();
				return new ContentSettlementPeriodItem(
					start,
					start.plusDays(1),
					proj.getOrderCount(),
					proj.getTotalRevenue(),
					proj.getTotalPlatformFee(),
					proj.getTotalPayout(),
					proj.getLatestSettledAt()
				);
			})
			.toList();

		return new DailyContentSettlementResponse(
			contentId,
			ym.atDay(1),
			ym.atEndOfMonth(),
			items
		);
	}

	private void validateCreator(Long loginUserId, Long creatorId) {
		Creator creator = creatorRepository.findByIdWithUser(creatorId)
			.orElseThrow(() ->
				new IllegalArgumentException("크리에이터를 찾을 수 없습니다: " + creatorId)
			);

		if (!creator.getUser().getId().equals(loginUserId)) {
			throw new IllegalArgumentException("크리에이터 본인만 조회할 수 있습니다.");
		}
	}

	private YearMonth parseMonth(String month) {
		try {
			return YearMonth.parse(month);
		} catch (DateTimeParseException e) {
			throw new IllegalArgumentException(
				"잘못된 월 형식입니다. YYYY-MM 형식으로 입력해주세요. (예: 2026-01)", e
			);
		}
	}
}
