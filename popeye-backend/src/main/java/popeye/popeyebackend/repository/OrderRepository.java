package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.entity.Order;

import java.time.LocalDateTime;

public interface OrderRepository extends JpaRepository<Order,Long> {
    @Query("select coalesce(sum(o.usedSpinach), 0) from Order o " +
            "where o.orderDate between :start and :end")
    Long sumDailySpinachUsedByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
