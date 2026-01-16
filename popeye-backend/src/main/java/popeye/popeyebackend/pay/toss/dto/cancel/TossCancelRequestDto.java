package popeye.popeyebackend.pay.toss.dto.cancel;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TossCancelRequestDto {
    private String cancelReason;

    private Integer cancelAmount;
}
