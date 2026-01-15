package popeye.popeyebackend.pay.toss.dto.cancel;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class TossCancelResponseDto {
    private String paymentKey;
    private String orderId;
    private String status;
    private Integer totalAmount;
}
