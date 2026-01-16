package popeye.popeyebackend.pay.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class RefundRequestDto {
    @NotBlank
    private String cancelReason;
}
