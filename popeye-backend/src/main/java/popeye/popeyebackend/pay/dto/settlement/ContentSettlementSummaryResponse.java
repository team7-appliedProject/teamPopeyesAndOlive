package popeye.popeyebackend.pay.dto.settlement;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContentSettlementSummaryResponse {
	private Long contentId;
	private String title;
	private Long totalRevenue; // 총 매출
	private Long platformFee; // 플랫폼 수수료
	private Long totalPayout; // 총 정산 금액 (수수료 제외)
	private LocalDateTime lastSettledAt; // 최근 정산 일시
	private Long settlementCount; // 정산 횟수
}
