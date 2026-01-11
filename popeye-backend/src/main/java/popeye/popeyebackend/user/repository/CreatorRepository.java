package popeye.popeyebackend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.user.domain.Creator;

public interface CreatorRepository extends JpaRepository<Creator, Long> {
}
