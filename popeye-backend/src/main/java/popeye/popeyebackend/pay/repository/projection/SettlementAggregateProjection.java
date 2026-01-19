package popeye.popeyebackend.pay.repository.projection;

/**
 * 정산 집계 결과를 위한 Projection 인터페이스
 * Object[] 대신 타입 안전한 인터페이스 사용
 */
public interface SettlementAggregateProjection {
	Long getCreatorId();
	Long getContentId();
	Long getGrossSum();
}







