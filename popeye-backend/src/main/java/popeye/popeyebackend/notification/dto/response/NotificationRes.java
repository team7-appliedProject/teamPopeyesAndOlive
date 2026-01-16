package popeye.popeyebackend.notification.dto.response;

import popeye.popeyebackend.notification.domain.Notification;

import java.time.LocalDateTime;

public record NotificationRes (
        Long id,
        String msg,
        LocalDateTime date
){
    public static NotificationRes from (Notification notification) {
        return new NotificationRes(
                notification.getId(),
                notification.getMessage(),
                notification.getDate()
        );
    }
}
