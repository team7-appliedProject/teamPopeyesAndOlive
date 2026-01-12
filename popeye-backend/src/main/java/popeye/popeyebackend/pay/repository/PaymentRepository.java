package popeye.popeyebackend.pay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.pay.domain.Payment;
import popeye.popeyebackend.pay.enums.PaymentType;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment,Long> {

    List<Payment> findByUser_Id(Long userId);
    Optional<Payment> findByIdAndPaymentType(Long paymentId, PaymentType paymentType);
    Optional<Payment> findByPgOrderId(String pgOrderId);



}
