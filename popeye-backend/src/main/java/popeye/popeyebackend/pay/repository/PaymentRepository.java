package popeye.popeyebackend.pay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import popeye.popeyebackend.pay.domain.Payment;
import popeye.popeyebackend.pay.enums.PaymentType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment,Long> {

    List<Payment> findByUser_Id(Long userId);
    Optional<Payment> findByIdAndPaymentType(Long paymentId, PaymentType paymentType);
    Optional<Payment> findByPgOrderId(String pgOrderId);

    @Query("select coalesce(sum(p.amount), 0) from Payment p " +
            "where p.createdAt between :start and :end " +
            "and p.paymentType = :type")
    Long sumTotalAmountByDate(LocalDateTime start, LocalDateTime end, PaymentType type);
}
