package popeye.popeyebackend.report.dto;

import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.report.enums.ReportState;
import popeye.popeyebackend.report.enums.TargetType;

public record ReportProcessDto(
        Long reportId,
        Long targetId,
        TargetType targetType,
        String reason,
        ReportState state
){
    public static ReportProcessDto from(Report report){
        return new ReportProcessDto(
                report.getId(),
                switch (report.getTargetType()){
                    case CONTENT -> report.getTargetContent().getId();
                },
                report.getTargetType(),
                report.getReportDescription(),
                report.getState()
        );
    }
}
