package popeye.popeyebackend.notificaion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.notificaion.domain.Notification;

public interface NotificationRepository extends JpaRepository<Notification,Long> {
}
