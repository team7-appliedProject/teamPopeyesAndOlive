package popeye.popeyebackend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.user.domain.BannedUser;

public interface BannedUserRepository extends JpaRepository<BannedUser, Long> {
}
