package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification,Long> {
}
