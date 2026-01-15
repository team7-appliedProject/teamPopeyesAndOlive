package popeye.popeyebackend.pay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.pay.domain.Order;

import java.time.LocalDateTime;

public interface OrderRepository extends JpaRepository<Order,Long> {
    @Query("select coalesce(sum(o.usedFreeCredit), 0) from Order o " +
            "where o.createdAt between :start and :end")
    Long sumDailySpinachUsedByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    boolean existsByUser_IdAndContent_Id(Long userId, Long contentId);

}
