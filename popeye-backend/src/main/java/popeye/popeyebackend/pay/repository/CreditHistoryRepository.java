package popeye.popeyebackend.pay.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.pay.domain.CreditHistory;

public interface CreditHistoryRepository extends JpaRepository<CreditHistory, Long> {
    Page<CreditHistory> findByUser_IdOrderByChangedAtDesc(Long userId, Pageable pageable);
}
