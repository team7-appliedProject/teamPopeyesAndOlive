package popeye.popeyebackend.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import popeye.popeyebackend.user.domain.BannedUser;

@Schema(description = "밴할 유저의 정보")
public record BanUserInfoDto(
        @Schema(description = "해당 유저의 pk id값")
        Long banUserId,

        @Schema(description = "밴 사유", example = "반복적인 게시글 도배")
        String reason,

        @Schema(description = "밴 일자, null시 영구밴")
        Integer banDays
) {
    public static BanUserInfoDto from(BannedUser bannedUser) {
        return new BanUserInfoDto(
                bannedUser.getId(),
                bannedUser.getReason(),
                bannedUser.getBanDays()
        );
    }
}
