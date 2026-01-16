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

    // U-07: 해시된 전화번호로 차단 여부 확인
    boolean existsByHashedPhoneNumber(String hashedPhoneNumber);
    Page<BannedUser> findAllByUserRole(Role role, Pageable pageable);
}
