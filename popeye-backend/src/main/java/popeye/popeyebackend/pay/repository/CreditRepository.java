package popeye.popeyebackend.pay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.pay.domain.Credit;

public interface CreditRepository extends JpaRepository<Credit,Long> {
}
