package popeye.popeyebackend.dailystatistics.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.dailystatistics.domain.DailyStatistics;
import popeye.popeyebackend.dailystatistics.repository.DailyStatisticsRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DailyStatisticsService {
    private final DailyStatisticsRepository dailyStatisticsRepository;

    @Transactional(readOnly = true)
    public List<DailyStatistics> getDailyData(int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        LocalDate endDate = LocalDate.now().minusDays(1);

        return dailyStatisticsRepository.findByDateBetween(startDate, endDate);
    }
}
