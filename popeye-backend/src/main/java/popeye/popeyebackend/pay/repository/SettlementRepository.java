package popeye.popeyebackend.pay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.pay.domain.Settlement;

public interface SettlementRepository extends JpaRepository<Settlement,Long> {
}
