package popeye.popeyebackend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.user.domain.DevilUser;
import popeye.popeyebackend.user.domain.User;

import java.util.Optional;

public interface DevilUserRepository extends JpaRepository<DevilUser, Long> {
    Optional<DevilUser> findByUser(User user);
}
