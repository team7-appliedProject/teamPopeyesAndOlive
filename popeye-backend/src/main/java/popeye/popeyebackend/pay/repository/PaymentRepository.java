package popeye.popeyebackend.pay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.pay.domain.Payment;

public interface PaymentRepository extends JpaRepository<Payment,Long> {
}
