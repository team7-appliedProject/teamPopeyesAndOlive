package popeye.popeyebackend.admin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.admin.dto.AdminDailyDataDto;
import popeye.popeyebackend.admin.dto.BanUserInfoDto;
import popeye.popeyebackend.admin.dto.DevilUserDto;
import popeye.popeyebackend.admin.dto.InactiveContentDto;
import popeye.popeyebackend.content.service.ContentService;
import popeye.popeyebackend.dailystatistics.service.DailyStatisticsService;
import popeye.popeyebackend.report.dto.ReportProcessDto;
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
    private final ContentService contentService;


    // daily data 받기
    @Transactional(readOnly = true)
    public List<AdminDailyDataDto> getDailyData(int days) {
        return dailyStatisticsService.getDailyData(days).stream().map(AdminDailyDataDto::from).toList();
    }

    // 유저 차단 관리
    @Transactional
    public void banUser(Long adminId, BanUserInfoDto userInfoDto) {
        userService.executeBan(adminId, userInfoDto.banUserId(), userInfoDto.banDays(), userInfoDto.reason());
    }

    // 유저 차단 해제
    @Transactional
    public void unbanUser(Long userId) {
        userService.unBanUser(userId);
    }

    // 유저 악성 정보
    @Transactional(readOnly = true)
    public List<DevilUserDto> getDevilUsers(int page) {
        return userService.getDevilUsers(page).stream().map(DevilUserDto::from).toList();
    }

    // 컨텐츠 벤
    @Transactional
    public void inactiveContent(Long adminId, InactiveContentDto inactiveContentDto) {
        contentService.inactiveContent(inactiveContentDto.contentId()
                , inactiveContentDto.reason()
                , adminId);
    }

    @Transactional
    public void activeContent(Long contentId) {
        contentService.activeContent(contentId);
    }

    // 신고 리스트
    @Transactional(readOnly = true)
    public List<ReportProcessDto> getReports(int page, int size) {
        return reportService.getReports(page, size).stream().map(ReportProcessDto::from).toList();
    }

    // 신고 처리
    @Transactional
    public void reportProcess(ReportProcessDto reportProcessDto) {
        reportService.reportProcess(reportProcessDto);
    }
}
