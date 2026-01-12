package popeye.popeyebackend.pay.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PreparePaymentResponseDto {
    private Long paymentId;
    private String pgOrderId;
}
