package popeye.popeyebackend.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.notification.domain.Notification;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdAndIsRead(Long userId, boolean read);

    Optional<Notification> findByUserIdAndId(Long userId, Long id);
}
