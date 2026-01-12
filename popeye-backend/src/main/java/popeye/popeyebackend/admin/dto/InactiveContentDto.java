package popeye.popeyebackend.admin.dto;

import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.enums.ContentStatus;

public record InactiveContentDto(
        Long contentId,
        String reason,
        ContentStatus status
) {
    public static InactiveContentDto getInactiveContentDto(Content content) {
        return new InactiveContentDto(
                content.getId(),

        )
    }
}
