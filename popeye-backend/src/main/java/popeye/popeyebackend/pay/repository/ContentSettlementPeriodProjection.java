package popeye.popeyebackend.pay.repository;

import java.time.LocalDateTime;

/**
 * 컨텐츠 기간별 정산 조회용 Projection 인터페이스
 */
public interface ContentSettlementPeriodProjection {
	LocalDateTime getPeriodStart();
	Long getOrderCount();
	Long getTotalRevenue();
	Long getTotalPlatformFee();
	Long getTotalPayout();
	LocalDateTime getLatestSettledAt();
}
