package popeye.popeyebackend.pay.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import popeye.popeyebackend.pay.enums.PaymentType;
import popeye.popeyebackend.pay.enums.PgProvider;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class PaymentListItemResponseDto {
    private Long paymentId;
    private String pgOrderId;

    private PaymentType paymentType;

    private int amount;        // 원(₩)
    private int creditAmount;  // 크레딧

    private PgProvider pgProvider;

    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime canceledAt;

    private String receiptUrl;
    private String failureReason;
}
