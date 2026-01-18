package popeye.popeyebackend.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.admin.dto.AdminDailyDataDto;
import popeye.popeyebackend.admin.dto.BanUserInfoDto;
import popeye.popeyebackend.admin.dto.DevilUserDto;
import popeye.popeyebackend.admin.dto.InactiveContentDto;
import popeye.popeyebackend.admin.service.AdminService;
import popeye.popeyebackend.global.security.details.PrincipalDetails;
import popeye.popeyebackend.report.dto.ReportProcessDto;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "ADMIN API", description = "관리자 전영 기능(통계, 유저/컨텐츠 관리")
public class AdminController {
    private final AdminService adminService;

    @Operation(summary = "일일 통계", description = "일일 통계를 원하는 날짜만큼 설정해서 불러옵니다.")
    @GetMapping("/statistics")
    public ResponseEntity<List<AdminDailyDataDto>> getStatistics(
            @Parameter(description = "원하는 통계 데이터 날자 수")
            @RequestParam int days) {
        return ResponseEntity.ok(adminService.getDailyData(days));
    }

    @Operation(summary = "유저 악성 정보 조회", description = "플랫폼 활동에서 잘못한 정보들을 모아서 보여줍니다.")
    @GetMapping("/devil-users")
    public ResponseEntity<List<DevilUserDto>> getDevilUsers(
            @RequestParam(defaultValue = "0") int page) {
        List<DevilUserDto> devilUsers = adminService.getDevilUsers(page);
        return ResponseEntity.ok(devilUsers);
    }

    @Operation(summary = "유저 밴", description = "관리자가 유저를 차단합니다.")
    @PatchMapping("/devil-users")
    public ResponseEntity<Void> banUser(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @RequestBody BanUserInfoDto banUserInfoDto) {
        adminService.banUser(
                principalDetails.getUserId(),
                banUserInfoDto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "유저 밴 해제", description = "차단한 유저를 풀어줍니다.")
    @PatchMapping("/devil-users/{banId}")
    public ResponseEntity<Void> unbanUser(
            @Parameter(description = "차단 해제할 유저의 pk값")
            @PathVariable Long banId) {
        adminService.unbanUser(banId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "악성 게시글 차단", description = "운영 정책에 위반된 게시글을 삭제합니다.")
    @PatchMapping("/illegal-contents")
    public ResponseEntity<Void> banIllegalContents(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @RequestBody InactiveContentDto dto) {
        adminService.inactiveContent(principalDetails.getUserId(), dto);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "게시글 차단 해제", description = "잘못 차단된 게시글의 차단을 해제합니다.")
    @PatchMapping("/illegal-contents/{contentId}")
    public ResponseEntity<Void> unbanContents(
            @Parameter(description = "차단 해제할 게시글의 pk값")
            @PathVariable Long contentId) {
        adminService.activeContent(contentId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "신고 조회", description = "유저들의 신고를 조회합니다.")
    @GetMapping("/reports")
    public ResponseEntity<List<ReportProcessDto>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<ReportProcessDto> reports = adminService.getReports(page, size);
        return ResponseEntity.ok(reports);
    }

    @Operation(summary = "신고 처리", description = "신고 처리를 결정합니다.")
    @PatchMapping("/reports/{reportId}")
    public ResponseEntity<Void> reportProcess(
            @PathVariable Long reportId,
            @RequestBody ReportProcessDto reportProcessDto) {
        adminService.reportProcess(reportId, reportProcessDto);
        return ResponseEntity.ok().build();
    }
}
