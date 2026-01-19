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

    // 로그인을 위한 이메일 조회 (탈퇴 사용자 제외)
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    Optional<User> findByEmail(@Param("email") String email);

    // 중복 가입 체크(닉네임, 이메일) - 탈퇴 사용자 제외
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    boolean existsByEmail(@Param("email") String email);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.nickname = :nickname AND u.deletedAt IS NULL")
    boolean existsByNickname(@Param("nickname") String nickname);

    // U-09: 탈퇴한 사용자 조회 (재가입 제한 확인용)
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NOT NULL")
    Optional<User> findDeletedUserByEmail(@Param("email") String email);

    // U-01: 추천인 코드로 사용자 찾기 (탈퇴 사용자 제외)
    @Query("SELECT u FROM User u WHERE u.referralCode = :referralCode AND u.deletedAt IS NULL")
    Optional<User> findByReferralCode(@Param("referralCode") String referralCode);

    // U-01: 추천인 코드 중복 체크 (탈퇴 사용자 제외)
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.referralCode = :referralCode AND u.deletedAt IS NULL")
    boolean existsByReferralCode(@Param("referralCode") String referralCode);

    // U-05: OAuth2 소셜 로그인 사용자 찾기 (provider와 providerId로 조회)
    @Query("SELECT u FROM User u WHERE u.provider = :provider AND u.providerId = :providerId AND u.deletedAt IS NULL")
    Optional<User> findByProviderAndProviderId(@Param("provider") String provider, @Param("providerId") String providerId);

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

    long countAllByRole(Role role);
}
