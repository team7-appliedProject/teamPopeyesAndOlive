package popeye.popeyebackend.admin.dto;

import popeye.popeyebackend.content.domain.ContentBan;
import popeye.popeyebackend.content.enums.ContentStatus;

public record InactiveContentDto(
        Long contentId,
        String reason,
        ContentStatus status
) {
    public static InactiveContentDto getInactiveContentDto(ContentBan contentBan) {
        return new InactiveContentDto(
                contentBan.getContent().getId(),
                contentBan.getReason(),
                contentBan.getContent().getContentStatus()
        );
    }
}
