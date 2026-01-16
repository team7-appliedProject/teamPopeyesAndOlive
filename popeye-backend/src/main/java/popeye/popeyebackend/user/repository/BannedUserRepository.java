package popeye.popeyebackend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.user.domain.BannedUser;
import popeye.popeyebackend.user.domain.User;

import java.util.Optional;

public interface BannedUserRepository extends JpaRepository<BannedUser, Long> {
    Optional<BannedUser> findByUser(User user);
}
