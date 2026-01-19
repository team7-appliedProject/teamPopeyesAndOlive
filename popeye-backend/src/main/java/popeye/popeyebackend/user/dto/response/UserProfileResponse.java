package popeye.popeyebackend.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

//U-04: 내 프로필 정보 응답
@Getter
@Builder
@AllArgsConstructor
public class UserProfileResponse {
    private Long creatorId;
    private String email;
    private String nickname;
    private String profileImageUrl;
    private String role;
    private String referralCode;
    private int totalSpinach;
    private int totalStarcandy;
}