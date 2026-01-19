package popeye.popeyebackend.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import popeye.popeyebackend.content.domain.ContentBan;

@Schema(description = "게시글 차단 정보")
public record InactiveContentDto(
        @Schema(description = "차단할 게시글의 pk값")
        Long contentId,
        @Schema(description = "차단 사유")
        String reason
) {
    public static InactiveContentDto getInactiveContentDto(ContentBan contentBan) {
        return new InactiveContentDto(
                contentBan.getContent().getId(),
                contentBan.getReason()
        );
    }
}