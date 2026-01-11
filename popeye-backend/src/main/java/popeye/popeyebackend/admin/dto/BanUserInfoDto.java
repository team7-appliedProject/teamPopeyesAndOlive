package popeye.popeyebackend.admin.dto;

import popeye.popeyebackend.user.domain.BannedUser;

public record BanUserInfoDto (
        Long banUserId,
        String reason,
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
