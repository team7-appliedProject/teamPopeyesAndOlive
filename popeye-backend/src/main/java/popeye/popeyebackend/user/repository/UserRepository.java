package popeye.popeyebackend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.user.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
