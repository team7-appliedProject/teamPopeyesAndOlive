package popeye.popeyebackend.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//U-02: SMS 인증번호 검증 요청
@Getter
@Setter
@NoArgsConstructor
public class SmsVerifyRequest {
    @NotBlank(message = "전화번호는 필수 입력 값입니다.")
    @Pattern(regexp = "^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$", message = "올바른 전화번호 형식이 아닙니다.")
    private String phoneNumber;

    @NotBlank(message = "인증번호는 필수 입력 값입니다.")
    @Pattern(regexp = "^[0-9]{6}$", message = "인증번호는 6자리 숫자입니다.")
    private String code;
}
