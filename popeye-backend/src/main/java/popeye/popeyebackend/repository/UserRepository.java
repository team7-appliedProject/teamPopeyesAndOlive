package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.entity.User;

import java.time.LocalDateTime;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("select count(u) from User u " +
            "where u.createdAt between :start and :end ")
    Long countTotalAmountByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("select coalesce(sum(u.totalStarcandy), 0) from User u")
    Long sumTotalStarcandyAmount();

    @Query("select coalesce(sum(u.totalSpinach), 0) from User u")
    Long sumTotalSpinachAmount();
}
