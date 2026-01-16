package popeye.popeyebackend.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

//U-08: 크리에이터 정산 정보 등록 요청
@Getter
@NoArgsConstructor
public class SettlementInfoRequest {
    @NotBlank(message = "예금주명은 필수입니다.")
    private String realName;

    @NotBlank(message = "은행명은 필수입니다.")
    private String bank_name;

    @NotBlank(message = "계좌번호는 필수입니다.")
    private String account;
}