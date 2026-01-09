package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.DailyStatistics;

import java.time.LocalDate;
import java.util.List;

public interface DailyStatisticsRepository extends JpaRepository<DailyStatistics, Long> {
    List<DailyStatistics> findByDateBetween(LocalDate startDate, LocalDate endDate);
}
