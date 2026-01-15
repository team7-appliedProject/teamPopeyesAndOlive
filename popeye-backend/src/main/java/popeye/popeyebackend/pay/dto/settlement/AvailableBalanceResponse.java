package popeye.popeyebackend.pay.dto.settlement;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AvailableBalanceResponse {
	private long settlementSum;
	private long withdrawnSum;
	private long available;
}
