package popeye.popeyebackend.content.dto.response;

import popeye.popeyebackend.content.domain.ContentBan;

import java.time.LocalDateTime;

public record BannedContentRes(
        Long id,
        String reason,
        LocalDateTime date,
        String title,
        String content
){
    public static BannedContentRes from(ContentBan contentBan){
        return new BannedContentRes(
                contentBan.getId(),
                contentBan.getReason(),
                contentBan.getDate(),
                contentBan.getContent().getTitle(),
                contentBan.getContent().getContent()
        );
    }
}
