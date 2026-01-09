package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.Credit;

public interface CreditRepository extends JpaRepository<Credit,Long> {
}
