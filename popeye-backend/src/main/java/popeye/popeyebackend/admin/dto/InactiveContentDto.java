package popeye.popeyebackend.admin.dto;

import popeye.popeyebackend.content.domain.ContentBan;

public record InactiveContentDto(
        Long contentId,
        String reason
) {
    public static InactiveContentDto getInactiveContentDto(ContentBan contentBan) {
        return new InactiveContentDto(
                contentBan.getContent().getId(),
                contentBan.getReason()

        );
    }
}