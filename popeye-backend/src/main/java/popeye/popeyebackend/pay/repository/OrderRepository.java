package popeye.popeyebackend.pay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.pay.domain.Order;

public interface OrderRepository extends JpaRepository<Order,Long> {
}
