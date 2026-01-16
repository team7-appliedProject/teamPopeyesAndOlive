package popeye.popeyebackend.notification.dto.response;

import popeye.popeyebackend.notification.domain.Notification;

public record NotiReadRes(
        Long notiId,
        boolean isRead
) {
    public static NotiReadRes from(Notification noti) {
        return new NotiReadRes(
                noti.getId(),
                noti.isRead()
        );
    }
}
