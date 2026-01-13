package popeye.popeyebackend.report.dto;

import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.report.enums.ReportState;

import java.time.LocalDateTime;

public record ReportResDto(
        Long reportId,
        String reason,
        ReportState state,
        LocalDateTime reportAt
) {
    public static ReportResDto from(Report report) {
        return new ReportResDto(
                report.getId(),
                report.getReportDescription(),
                report.getState(),
                report.getReportAt()
        );
    }
}
