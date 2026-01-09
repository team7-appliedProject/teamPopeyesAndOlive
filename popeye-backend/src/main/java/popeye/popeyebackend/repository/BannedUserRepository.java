package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.BannedUser;

public interface BannedUserRepository extends JpaRepository<BannedUser, Long> {
}
