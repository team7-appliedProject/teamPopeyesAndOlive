package popeye.popeyebackend.pay.dto.settlement;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DailyContentSettlementResponse {
	private Long contentId;
	private LocalDate from;
	private LocalDate to;
	private List<ContentSettlementPeriodItem> items;
}
