package popeye.popeyebackend.dailystatistics.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.dailystatistics.domain.DailyStatistics;

import java.time.LocalDate;
import java.util.List;

public interface DailyStatisticsRepository extends JpaRepository<DailyStatistics, Long> {
    List<DailyStatistics> findByDateBetween(LocalDate startDate, LocalDate endDate);
}
