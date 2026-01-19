package popeye.popeyebackend.pay.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ConfirmPaymentRequestDto {

    @NotNull
    private String pgOrderId;

    @NotNull
    private String paymentKey;

    // Optional: 전달되지 않으면 서버에서 pgOrderId로 조회한 Payment의 amount 사용
    // @Min 검증 제거: 컨트롤러에서 수동 검증
    private Integer amount; // null 허용 (서버에서 조회)

    private String receiptUrl;
}
