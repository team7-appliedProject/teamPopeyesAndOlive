package popeye.popeyebackend.content.dto.response;

import popeye.popeyebackend.content.domain.Content;

public record ContentListRes(
        Long contentId,
        String title,
        String creatorNickname,
        boolean isFree
) {
    public static ContentListRes from(Content content) {
        return new ContentListRes(content.getId(),
        content.getTitle(),
        content.getCreator().getName(),
                content.isFree()
        );
    }
}
