package popeye.popeyebackend.report.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.report.enums.ReportState;
import popeye.popeyebackend.report.enums.TargetType;

import java.time.LocalDateTime;

@Schema(description = "신고 처리 과정 dto")
public record ReportProcessDto(
        @Schema(description = "신고한 게시글 식별값")
        Long targetId,
        @Schema(description = "게시글 타입", example = "PICTURE")
        TargetType targetType,
        @Schema(description = "신고 처리 사유")
        String reason,
        @Schema(description = "게시글 상태")
        ReportState state,
        @Schema(description = "신고일")
        LocalDateTime date
) {
    public static ReportProcessDto from(Report report) {
        return new ReportProcessDto(
                switch (report.getTargetType()) {
                    case CONTENT -> report.getTargetContent().getId();
                },
                report.getTargetType(),
                report.getReportDescription(),
                report.getState(),
                report.getReportAt()
        );
    }
}
