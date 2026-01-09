package popeye.popeyebackend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import popeye.popeyebackend.dto.admin.AdminDailyDataDto;
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
}
