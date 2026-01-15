package popeye.popeyebackend.pay.dto.order;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PurchaseResponseDto {
    private Long orderId;
    private Integer totalCreditUsed;
    private Integer usedFreeCredit;
    private Integer usedPaidCredit;
}
