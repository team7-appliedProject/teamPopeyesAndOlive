package popeye.popeyebackend.batch.settlement.dto;

/**
 * 정산 배치 Processor에서 생성하는 DTO
 * Reader가 읽은 집계 결과를 Processor가 처리한 후 Writer로 전달
 */
public record SettlementItemDto(
	Long creatorId,
	Long contentId,
	Long grossSum,
	Long netAmount,
	Integer feeRate
) {
}






