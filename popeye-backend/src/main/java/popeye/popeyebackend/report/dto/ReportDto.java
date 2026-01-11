package popeye.popeyebackend.report.dto;

import popeye.popeyebackend.report.domain.Report;

public record ReportDto (
        Long id,
        String reportNickname,
        String reportedNickname,
        String reason
){
    public static ReportDto from(Report report){
        return new ReportDto(
                report.getId(),
                report.getReporter().getNickname(),
                report.getReported().getNickname(),
                report.getReportDescription()
        );
    }
}
