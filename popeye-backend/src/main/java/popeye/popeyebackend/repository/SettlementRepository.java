package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.Settlement;

public interface SettlementRepository extends JpaRepository<Settlement,Long> {
}
