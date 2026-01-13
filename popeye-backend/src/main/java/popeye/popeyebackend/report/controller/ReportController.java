package popeye.popeyebackend.report.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import popeye.popeyebackend.report.dto.ReportReqDto;
import popeye.popeyebackend.report.dto.ReportResDto;
import popeye.popeyebackend.report.service.ReportService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/report")
@Tag(name = "Report API", description = "신고하기 관련 기능")
public class ReportController {
    private final ReportService reportService;

    @Operation(summary = "신고하기", description = "유저가 신고하기 기능")
    @PostMapping
    public ResponseEntity<ReportResDto> saveReport(@RequestBody ReportReqDto reportDto) {
        ReportResDto resDto = reportService.makeReport(reportDto);
        return ResponseEntity.ok(resDto);
    }
}
