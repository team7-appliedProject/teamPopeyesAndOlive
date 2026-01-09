package popeye.popeyebackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.dto.admin.AdminDailyDataDto;
import popeye.popeyebackend.entity.DailyStatistics;
import popeye.popeyebackend.repository.DailyStatisticsRepository;
import popeye.popeyebackend.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final DailyStatisticsRepository dailyStatisticsRepository;

    // daily data 받기
    @Transactional(readOnly = true)
    public List<AdminDailyDataDto> getDailyData(int days){
        LocalDate startDate = LocalDate.now().minusDays(days);
        LocalDate endDate = LocalDate.now().minusDays(1);

        List<DailyStatistics> dailyStatistics = dailyStatisticsRepository.findByDateBetween(startDate, endDate);
        return dailyStatistics.stream().map(AdminDailyDataDto::from).toList();
    }
}
