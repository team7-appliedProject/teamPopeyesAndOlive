package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment,Long> {
}
