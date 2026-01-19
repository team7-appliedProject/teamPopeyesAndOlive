package popeye.popeyebackend.pay.repository.projection;

import java.time.LocalDateTime;

/**
 * 콘텐츠별 누적 정산 요약 조회용 Projection 인터페이스
 */
public interface ContentSettlementSummaryProjection {
	Long getContentId();
	String getTitle();
	Long getSettlementCount();
	Long getTotalPayout();
	Long getTotalRevenue();
	Long getTotalPlatformFee();
	LocalDateTime getLastSettledAt();
}
