package popeye.popeyebackend.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

//U-04: 프로필 정보 수정 요청을 위한 DTO
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String nickname;
}