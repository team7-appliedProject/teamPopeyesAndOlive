package popeye.popeyebackend.pay.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import popeye.popeyebackend.pay.enums.PgProvider;

@Getter
public class ChargeRequestDto {
    @Min(value = 1, message = "충전 크레딧은 1 이상이어야 합니다.")
    private int creditAmount;

    @NotNull(message = "PG 제공자는 필수입니다.")
    private PgProvider pgProvider;

}
