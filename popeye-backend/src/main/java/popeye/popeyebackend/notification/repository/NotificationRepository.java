package popeye.popeyebackend.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.notification.domain.Notification;

public interface NotificationRepository extends JpaRepository<Notification,Long> {
}
