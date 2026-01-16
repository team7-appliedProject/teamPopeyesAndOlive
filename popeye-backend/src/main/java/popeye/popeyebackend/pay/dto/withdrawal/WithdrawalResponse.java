package popeye.popeyebackend.pay.dto.withdrawal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import popeye.popeyebackend.pay.enums.WithdrawalStatus;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class WithdrawalResponse {
	private Long id;
	private Long creatorId;
	private Long amount;
	private WithdrawalStatus status;
	private LocalDateTime requestedAt;
	private LocalDateTime processedAt;
	private String failureReason;
}
