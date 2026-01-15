package popeye.popeyebackend.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.user.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {
	// 로그인을 위한 이메일 조회
	Optional<User> findByEmail(String email);
}
