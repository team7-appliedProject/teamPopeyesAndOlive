package popeye.popeyebackend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.user.domain.Creator;
import popeye.popeyebackend.user.domain.User;

public interface CreatorRepository extends JpaRepository<Creator,Long> {
    // 승격 유저에게 크리에이터 정보 있는지 판단
    boolean existsByUser(User user);
}
