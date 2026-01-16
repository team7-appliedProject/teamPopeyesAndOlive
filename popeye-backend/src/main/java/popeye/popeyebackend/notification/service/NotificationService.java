package popeye.popeyebackend.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.global.exception.ApiException;
import popeye.popeyebackend.global.exception.ErrorCode;
import popeye.popeyebackend.notification.domain.Notification;
import popeye.popeyebackend.notification.dto.response.NotiReadRes;
import popeye.popeyebackend.notification.dto.response.NotificationRes;
import popeye.popeyebackend.notification.exception.NoNotificationException;
import popeye.popeyebackend.notification.exception.NotificationAlreadyRead;
import popeye.popeyebackend.notification.repository.NotificationRepository;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationRes> findAll(Long userId) {
        List<Notification> noti = notificationRepository.findByUserIdAndIsRead(userId, false);

        return noti.stream().map(NotificationRes::from).toList();
    }

    @Transactional
    public NotiReadRes readNotification(Long userId, Long notiId) {
        Notification noti = notificationRepository.findByUserIdAndId(userId, notiId)
                .orElseThrow(() -> new ApiException(ErrorCode.NO_NOTIFICATION));

        if (noti.isRead()) {
            throw new ApiException(ErrorCode.ALREADY_READ);
        }

        noti.readNotification();

        return NotiReadRes.from(noti);
    }
}
