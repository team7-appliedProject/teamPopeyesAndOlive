package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
