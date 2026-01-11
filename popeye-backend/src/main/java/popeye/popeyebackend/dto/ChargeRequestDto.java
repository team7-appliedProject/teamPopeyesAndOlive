package popeye.popeyebackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import popeye.popeyebackend.enums.PgProvider;

@Getter
public class ChargeRequestDto {
    @Min(value = 10, message = "충전 금액은 10원 이상이어야 합니다.")
    private int amount;

    @NotNull(message = "PG 제공자는 필수입니다.")
    private PgProvider pgProvider;

}
