package popeye.popeyebackend.admin.dto;

import popeye.popeyebackend.user.domain.DevilUser;

public record DevilUserDto (
        Long userId,
        String nickname,
        String email,
        Integer devilCount,
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
