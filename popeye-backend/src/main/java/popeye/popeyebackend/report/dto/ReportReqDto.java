package popeye.popeyebackend.report.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import popeye.popeyebackend.report.enums.TargetType;

@Schema(description = "신고하기 요청 dto")
public record ReportReqDto(
        @Schema(description = "신고 이유", example = "불법 게시물이에요")
        String reason,
        @Schema(description = "신고한 게시글 종류", example = "CONTENT")
        TargetType type,
        @Schema(description = "신고한 게시글의 pk값")
        Long targetId,
        @Schema(description = "신고한 사람의 pk값")
        Long reportUserId
) {
}
