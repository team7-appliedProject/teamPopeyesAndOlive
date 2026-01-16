package popeye.popeyebackend.pay.dto.settlement;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ContentSettlementPeriodItem {
	private LocalDateTime periodStart;
	private LocalDateTime periodEnd;
	private Long orderCount;
	private Long totalRevenue;
	private Long totalPlatformFee;
	private Long totalPayout;
	private LocalDateTime latestSettledAt; // 있으면, 없으면 null
}
