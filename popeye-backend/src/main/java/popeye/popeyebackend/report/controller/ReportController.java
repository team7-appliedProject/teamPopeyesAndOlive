package popeye.popeyebackend.report.controller;

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
public class ReportController {
    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResDto> saveReport(@RequestBody ReportReqDto reportDto) {
        ReportResDto resDto = reportService.makeReport(reportDto);
        return ResponseEntity.ok(resDto);
    }
}
