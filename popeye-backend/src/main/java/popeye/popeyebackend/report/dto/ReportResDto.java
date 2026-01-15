package popeye.popeyebackend.report.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.report.enums.ReportState;

import java.time.LocalDateTime;

@Schema(description = "신고 응답 dto")
public record ReportResDto(
        @Schema(description = "처리한 신고의 식별값")
        Long reportId,
        @Schema(description = "처리 이유", example = "불법 게시글")
        String reason,
        @Schema(description = "처리 상황 성공 : true, 거짓 : false, 반려 : rejected", example = "true")
        ReportState state,
        @Schema(description = "리포트 처리 시간")
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
