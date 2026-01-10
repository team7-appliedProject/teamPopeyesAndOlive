package popeye.popeyebackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.dto.admin.AdminDailyDataDto;
import popeye.popeyebackend.dto.admin.BanUserInfoDto;
import popeye.popeyebackend.dto.admin.DevilUserDto;
import popeye.popeyebackend.entity.BannedUser;
import popeye.popeyebackend.entity.DailyStatistics;
import popeye.popeyebackend.entity.DevilUser;
import popeye.popeyebackend.entity.User;
import popeye.popeyebackend.enums.Role;
import popeye.popeyebackend.repository.BannedUserRepository;
import popeye.popeyebackend.repository.DailyStatisticsRepository;
import popeye.popeyebackend.repository.DevilUserRepository;
import popeye.popeyebackend.repository.UserRepository;


import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final DailyStatisticsRepository dailyStatisticsRepository;
    private final DevilUserRepository devilUserRepository;
    private final BannedUserRepository bannedUserRepository;

    // daily data 받기
    @Transactional(readOnly = true)
    public List<AdminDailyDataDto> getDailyData(int days){
        LocalDate startDate = LocalDate.now().minusDays(days);
        LocalDate endDate = LocalDate.now().minusDays(1);

        List<DailyStatistics> dailyStatistics = dailyStatisticsRepository.findByDateBetween(startDate, endDate);
        return dailyStatistics.stream().map(AdminDailyDataDto::from).toList();
    }

    // 유저 차단 관리
    @Transactional
    public void banUser(Long adminId, BanUserInfoDto userInfoDto){
        User banAdmin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("no match admin"));
        User userFound = userRepository.findById(userInfoDto.banUserId())
                .orElseThrow(()->new RuntimeException("no User found"));
        DevilUser devilUser = devilUserRepository.findById(userInfoDto.banUserId())
                .orElseThrow(()->new RuntimeException("no User found"));

        userFound.changeRole(Role.BLOCKED);
        devilUser.plusBlockedDays(userInfoDto.banDays());

        BannedUser bannedUser = BannedUser.builder()
                .bannedAt(LocalDate.now())
                .unbannedAt(LocalDate.now().plusDays(userInfoDto.banDays()))
                .banDays(userInfoDto.banDays())
                .hashedPhoneNumber(devilUser.getHashedPhoneNumber())
                .reason(userInfoDto.reason())
                .admin(banAdmin).build();

        bannedUserRepository.save(bannedUser);
    }

    @Transactional(readOnly = true)
    public List<DevilUserDto> getDevilUsers(int page) {
        Pageable pageable = PageRequest.of(page, 30, Sort.by("user.nickname").ascending());

        Page<DevilUser> devilUsers = devilUserRepository.findAll(pageable);

        return devilUsers.stream().map(DevilUserDto::from).toList();
    }
}
