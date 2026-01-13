package popeye.popeyebackend.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import popeye.popeyebackend.user.domain.DevilUser;

@Schema(description = "유저 악성 정보")
public record DevilUserDto (
        @Schema(description = "유저 pk값")
        Long userId,
        @Schema(description = "유저 닉네임")
        String nickname,
        @Schema(description = "유저 이메일")
        String email,
        @Schema(description = "유저 신고 횟수")
        Integer devilCount,
        @Schema(description = "유저 총 밴일수")
        Long blockedDays
) {
    public static DevilUserDto from(DevilUser devilUser) {
        return new DevilUserDto(
                devilUser.getUser().getId(),
                devilUser.getUser().getNickname(),
                devilUser.getUser().getEmail(),
                devilUser.getDevilCount(),
                devilUser.getBlockedDays()
        );
    }
}
