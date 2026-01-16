package popeye.popeyebackend.user.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.user.domain.BannedUser;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.enums.Role;

import java.util.Optional;

public interface BannedUserRepository extends JpaRepository<BannedUser, Long> {
    Optional<BannedUser> findByUser(User user);

    Page<BannedUser> findAllByUserRole(Role role, Pageable pageable);
}
