package popeye.popeyebackend.admin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.admin.dto.AdminDailyDataDto;
import popeye.popeyebackend.admin.dto.BanUserInfoDto;
import popeye.popeyebackend.admin.dto.DevilUserDto;
import popeye.popeyebackend.dailystatistics.service.DailyStatisticsService;
import popeye.popeyebackend.report.dto.ReportDto;
import popeye.popeyebackend.report.repository.ReportRepository;
import popeye.popeyebackend.report.service.ReportService;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.service.UserService;


import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final DailyStatisticsService dailyStatisticsService;
    private final UserService userService;
    private final ReportService reportService;


    // daily data 받기
    @Transactional(readOnly = true)
    public List<AdminDailyDataDto> getDailyData(int days){
        return dailyStatisticsService.getDailyData(days).stream().map(AdminDailyDataDto::from).toList();
    }

    // 유저 차단 관리
    @Transactional
    public void banUser(User admin, BanUserInfoDto userInfoDto){
        userService.executeBan(admin, userInfoDto.banUserId(), userInfoDto.banDays(), userInfoDto.reason());
    }

    // 유저 악성 정보
    @Transactional(readOnly = true)
    public List<DevilUserDto> getDevilUsers(int page) {
        return userService.getDevilUsers(page).stream().map(DevilUserDto::from).toList();
    }

    // 신고 리스트
    @Transactional(readOnly = true)
    public List<ReportDto> getReports(int page, int size) {
        return reportService.getReports(page, size).stream().map(ReportDto::from).toList();
    }
}
