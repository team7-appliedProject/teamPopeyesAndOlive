package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.entity.Credit;
import popeye.popeyebackend.enums.CreditType;

import java.time.LocalDateTime;

public interface CreditRepository extends JpaRepository<Credit,Long> {

    @Query("select coalesce(sum(c.amount), 0) from Credit c " +
            "where c.paidAt between :start and :end " +
            "and c.creditType = :type")
    Long sumDailySpinachAmountByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("type") CreditType type);
}
