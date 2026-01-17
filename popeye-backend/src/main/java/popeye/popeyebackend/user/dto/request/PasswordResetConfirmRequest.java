package popeye.popeyebackend.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//U-06: 비밀번호 재설정 확인 DTO
@Getter
@Setter
@NoArgsConstructor
public class PasswordResetConfirmRequest {
    @NotBlank(message = "토큰은 필수 입력 값입니다.")
    private String token;

    @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
    @Pattern(regexp = "(?=.*[0-9])(?=.*[a-zA-Z])(?=.*\\W)(?=\\S+$).{8,16}",
            message = "비밀번호는 8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.")
    private String newPassword;
}
