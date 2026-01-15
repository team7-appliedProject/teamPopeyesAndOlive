package popeye.popeyebackend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.enums.Role;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 로그인을 위한 이메일 조회
    Optional<User> findByEmail(String email);

    // 중복 가입 체크(닉네임, 이메일)
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);


//이게머람
//  @Modifying: 이 쿼리가 SELECT가 아니라 수정(UPDATE/DELETE)임을 명시
//  @Query: 직접 실행할 쿼리 작성. (벌크 연산)
    @Modifying(clearAutomatically = true) // 수정 후 영속성 컨텍스트를 비워줌
    @Query("UPDATE User u SET u.role = :role WHERE u.email = :email")
    int updateRoleByEmail(@Param("email") String email, @Param("role") Role role);

    @Query("select count(u) from User u " +
            "where u.createdAt between :start and :end ")
    Long countTotalAmountByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("select coalesce(sum(u.totalStarcandy), 0) from User u")
    Long sumTotalStarcandyAmount();

    @Query("select coalesce(sum(u.totalSpinach), 0) from User u")
    Long sumTotalSpinachAmount();
}
