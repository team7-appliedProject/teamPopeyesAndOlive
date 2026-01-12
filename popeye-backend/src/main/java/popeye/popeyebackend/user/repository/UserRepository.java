package popeye.popeyebackend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.user.domain.User;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 로그인을 위한 이메일 조회
    Optional<User> findByEmail(String email);

    // 중복 가입 체크(닉네임, 이메일)
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);

    @Query("select count(u) from User u " +
            "where u.createdAt between :start and :end ")
    Long countTotalAmountByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("select coalesce(sum(u.totalStarcandy), 0) from User u")
    Long sumTotalStarcandyAmount();

    @Query("select coalesce(sum(u.totalSpinach), 0) from User u")
    Long sumTotalSpinachAmount();
}
