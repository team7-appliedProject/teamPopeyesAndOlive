package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import popeye.popeyebackend.entity.Payment;
import popeye.popeyebackend.enums.PaymentType;

import java.time.LocalDateTime;

public interface PaymentRepository extends JpaRepository<Payment,Long> {

    @Query("select coalesce(sum(p.amount), 0) from Payment p " +
            "where p.createdAt between :start and :end " +
            "and p.paymentType = :type")
    Long sumTotalAmountByDate(LocalDateTime start, LocalDateTime end, PaymentType type);
}
