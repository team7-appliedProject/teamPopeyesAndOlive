package popeye.popeyebackend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.user.domain.Creator;
import popeye.popeyebackend.user.domain.User;

import java.util.Optional;

public interface CreatorRepository extends JpaRepository<Creator,Long> {
    Optional<Creator> findByUser(User user);
}
