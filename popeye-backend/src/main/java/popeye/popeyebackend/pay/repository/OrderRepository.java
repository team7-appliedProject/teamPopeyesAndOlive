package popeye.popeyebackend.pay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.pay.domain.Order;

public interface OrderRepository extends JpaRepository<Order,Long> {
    boolean existsByUser_IdAndContent_Id(Long userId, Long contentId);

}
