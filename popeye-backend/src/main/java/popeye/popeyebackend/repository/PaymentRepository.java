package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.Payment;
import popeye.popeyebackend.enums.PaymentType;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment,Long> {
    Optional<Payment> findById(Long paymentId);
    List<Payment> findByUserId(Long userId);
    Optional<Payment> findByIdAndPaymentType(
            Long paymentId,
            PaymentType paymentType
    );

}
