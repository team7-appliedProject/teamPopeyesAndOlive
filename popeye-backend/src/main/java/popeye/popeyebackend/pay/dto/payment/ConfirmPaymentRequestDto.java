package popeye.popeyebackend.pay.dto.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ConfirmPaymentRequestDto {

    @NotNull
    private String pgOrderId;

    @NotNull
    private String paymentKey;

    @Min(value = 10, message = "승인 금액은 10원 이상이어야 합니다.")
    private int amount;

    private String receiptUrl;
}
