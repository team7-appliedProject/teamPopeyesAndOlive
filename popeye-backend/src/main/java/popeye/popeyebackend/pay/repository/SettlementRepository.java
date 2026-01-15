package popeye.popeyebackend.pay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.pay.domain.Settlement;

import java.time.LocalDateTime;

public interface SettlementRepository extends JpaRepository<Settlement,Long> {

    @Query("select coalesce(sum(s.amount * ( 1 - s.feeRate / 100.0)), 0) from Settlement s " +
            "where s.settledAt between :start and :end ")
    Long sumTotalAmountByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
