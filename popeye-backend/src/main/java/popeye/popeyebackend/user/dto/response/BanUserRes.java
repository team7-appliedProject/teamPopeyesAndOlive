package popeye.popeyebackend.user.dto.response;

import popeye.popeyebackend.user.domain.BannedUser;

import java.time.LocalDate;

public record BanUserRes(
    Long id,
    String nickName,
    LocalDate bannedAt,
    LocalDate unbannedAt,
    Integer banDays,
    String reason
) {
    public static BanUserRes from(BannedUser bannedUser) {
        return new BanUserRes(
                bannedUser.getUser().getId(),
                bannedUser.getUser().getNickname(),
                bannedUser.getBannedAt(),
                bannedUser.getUnbannedAt(),
                bannedUser.getBanDays(),
                bannedUser.getReason());
    }
}
