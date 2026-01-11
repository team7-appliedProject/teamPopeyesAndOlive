package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.entity.Credit;
import popeye.popeyebackend.enums.CreditType;

import java.time.LocalDateTime;
import java.util.List;

public interface CreditRepository extends JpaRepository<Credit, Long> {
    List<Credit> findByUserId(Long userId);
    @Query("select c from Credit c " +
            "where c.user.id = :userId " +
            "and (c.expiredAt is null or c.expiredAt > :now)")
    List<Credit> findUsableCredits(
            @Param("userId") Long userId,
            @Param("now")LocalDateTime now
    );
}
