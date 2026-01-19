package popeye.popeyebackend.pay.dto.withdrawal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WithdrawalRequest {
	@NotNull
	@Min(value = 1, message = "출금 금액은 1 이상이어야 합니다.")
	private long amount;
}
