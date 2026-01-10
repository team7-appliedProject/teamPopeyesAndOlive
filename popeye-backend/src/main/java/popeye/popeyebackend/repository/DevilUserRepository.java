package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.DevilUser;

public interface DevilUserRepository extends JpaRepository<DevilUser, Long> {
}
