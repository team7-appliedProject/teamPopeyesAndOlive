package popeye.popeyebackend.dto.admin;

import popeye.popeyebackend.entity.BannedUser;

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
