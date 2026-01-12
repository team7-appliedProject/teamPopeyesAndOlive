package popeye.popeyebackend.admin.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.admin.dto.AdminDailyDataDto;
import popeye.popeyebackend.admin.dto.BanUserInfoDto;
import popeye.popeyebackend.admin.dto.DevilUserDto;
import popeye.popeyebackend.admin.service.AdminService;
import popeye.popeyebackend.report.dto.ReportProcessDto;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/statistics")
    public ResponseEntity<List<AdminDailyDataDto>> getStatistics(@RequestParam int days) {
        return ResponseEntity.ok(adminService.getDailyData(days));
    }

    @GetMapping("/devil-users")
    public ResponseEntity<List<DevilUserDto>> getDevilUsers(@RequestParam(defaultValue = "0")int page) {
        List<DevilUserDto> devilUsers = adminService.getDevilUsers(page);
        return ResponseEntity.ok(devilUsers);
    }

    @PatchMapping("/devil-user")
    public ResponseEntity<Void> banUser(@AuthenticationPrincipal UserDetails userDetails, @RequestBody BanUserInfoDto banUserInfoDto) {
        adminService.banUser(userDetails.getUser(), banUserInfoDto);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/illegal-contents")
    public ResponseEntity<Void> banIllegalContents(@AuthenticationPrincipal UserDetails userDetails) {

    }

    @GetMapping("/reports")
    public ResponseEntity<List<ReportProcessDto>> getReports(
            @RequestParam(defaultValue = "0")int page,
            @RequestParam(defaultValue = "10")int size) {
        List<ReportProcessDto> reports = adminService.getReports(page, size);
        return ResponseEntity.ok(reports);
    }

    @PostMapping("/reports")
    public ResponseEntity<Void> reportProcess(@RequestBody ReportProcessDto reportProcessDto) {
        adminService.reportProcess(reportProcessDto);
        return ResponseEntity.ok().build();
    }
}
