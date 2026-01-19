package popeye.popeyebackend.pay.dto.credit;

import lombok.AllArgsConstructor;
import lombok.Getter;
import popeye.popeyebackend.pay.enums.CreditType;
import popeye.popeyebackend.pay.enums.ReasonType;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CreditHistoryItemResponseDto {
    private Long creditHistoryId;
    private CreditType creditType;
    private ReasonType reasonType;
    private int delta;
    private LocalDateTime changedAt;

    private Long orderId;     // nullable
    private Long paymentId;   // nullable
}
