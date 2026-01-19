package popeye.popeyebackend.batch.settlement.processor;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import popeye.popeyebackend.batch.settlement.dto.SettlementItemDto;
import popeye.popeyebackend.pay.repository.projection.SettlementAggregateProjection;

/**
 * 정산 배치 Processor
 * 집계 결과를 받아 net 계산 및 Settlement DTO 생성
 * 저장은 하지 않고 DTO만 반환
 */
@StepScope
@Component
@RequiredArgsConstructor
public class SettlementBatchProcessor
	implements ItemProcessor<SettlementAggregateProjection, SettlementItemDto> {

	@Value("#{jobParameters['feeRate'] ?: '0.10'}")
	private String feeRateStr;

	@Override
	public SettlementItemDto process(SettlementAggregateProjection item) throws Exception {
		Long creatorId = item.getCreatorId();
		Long contentId = item.getContentId();
		Long grossSum = item.getGrossSum() != null ? item.getGrossSum() : 0L;

		// 수수료율 계산
		BigDecimal feeRate = BigDecimal.valueOf(Double.parseDouble(feeRateStr));
		Integer feeRatePercent = feeRate.multiply(BigDecimal.valueOf(100)).intValue();

		// net 계산 (버림)
		Long netAmount = calculateNet(grossSum, feeRate);

		return new SettlementItemDto(creatorId, contentId, grossSum, netAmount, feeRatePercent);
	}

	/**
	 * 수수료를 제외한 순수익 계산 (버림)
	 */
	private Long calculateNet(Long gross, BigDecimal feeRate) {
		BigDecimal grossDecimal = BigDecimal.valueOf(gross);
		BigDecimal net = grossDecimal.multiply(BigDecimal.ONE.subtract(feeRate));
		return net.setScale(0, RoundingMode.DOWN).longValue();
	}
}

