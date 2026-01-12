package popeye.popeyebackend.pay.toss.dto.confirm;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class TossConfirmResponseDto {
    private String paymentKey;
    private String orderId;
    private String status;
    private Integer totalAmount;
    private String approvedAt;
    private Receipt receipt;

    @Getter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Receipt {
        private String url;
    }
}
