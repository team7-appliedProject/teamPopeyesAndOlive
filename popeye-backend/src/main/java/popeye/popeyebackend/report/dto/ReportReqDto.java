package popeye.popeyebackend.report.dto;

import popeye.popeyebackend.report.enums.TargetType;

public record ReportReqDto(
        String reason,
        TargetType type,
        Long targetId,
        Long reportUserId
) {
}
