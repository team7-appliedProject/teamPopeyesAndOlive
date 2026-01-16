package popeye.popeyebackend.pay.toss.dto.confirm;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TossConfirmRequestDto {
    private String paymentKey;

    @JsonProperty("orderId")
    private String pgOrderId;

    private int amount;
}
