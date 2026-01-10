package popeye.popeyebackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.dto.admin.AdminDailyDataDto;
import popeye.popeyebackend.dto.admin.BanUserInfoDto;
import popeye.popeyebackend.service.AdminService;

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

    @PatchMapping("/manage")
    public void banUser(@AuthenticationPrincipal UserDetails userDetails, @RequestBody BanUserInfoDto banUserInfoDto) {
        userDetails.getAuthorities().contains("ROLE_ADMIN") ?
                adminService.banUser(userDetails.getUsername(), banUserInfoDto) : return;
    }

    @GetMapping("/manage")
    public ResponseEntity<List<BanUserInfoDto>> getDevilUsers() {
        return null;
    }
}
