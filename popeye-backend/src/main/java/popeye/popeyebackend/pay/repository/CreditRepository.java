package popeye.popeyebackend.pay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.pay.domain.Credit;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CreditRepository extends JpaRepository<Credit, Long> {
    List<Credit> findByUser_Id(Long userId);

    Optional<Credit> findByPayment_Id(Long paymentId);

    boolean existsByPayment_Id(Long paymentId);
    @Query("select c from Credit c " +
            "where c.user.id = :userId " +
            "and (c.expiredAt is null or c.expiredAt > :now)")
    List<Credit> findUsableCredits(
            @Param("userId") Long userId,
            @Param("now")LocalDateTime now
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Credit c set c.amount = 0 " +
            "where c.creditType = popeye.popeyebackend.pay.enums.CreditType.FREE " +
            "and c.expiredAt is not null " +
            "and c.expiredAt <: now " +
            "and c.amount > 0 ")
    int expireFreeCredits(@Param("now") LocalDateTime now);
}
