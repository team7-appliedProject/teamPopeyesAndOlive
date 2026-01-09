package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.Order;

public interface OrderRepository extends JpaRepository<Order,Long> {
}
