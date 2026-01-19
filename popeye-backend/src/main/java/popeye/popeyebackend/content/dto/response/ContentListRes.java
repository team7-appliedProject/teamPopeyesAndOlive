package popeye.popeyebackend.content.dto.response;

import popeye.popeyebackend.content.domain.Content;

public record ContentListRes(
        Long contentId,
        String title,
        String creatorNickname,
        Boolean liked,
        Boolean bookmarked,
        Boolean purchased,
        Long likeCount,
        Integer viewCount,
        Integer price,
        Boolean free,
        Integer discountRate
) {
    public static ContentListRes from(Content content, Boolean liked, Boolean bookmarked, Boolean purchased) {
        return new ContentListRes(
                content.getId(),
                content.getTitle(),
                content.getCreator().getName(),
                liked,
                bookmarked,
                purchased,
                content.getLikeCount(),
                content.getViewCount(),
                content.getPrice(),
                content.isFree(),
                content.getDiscountRate()
        );
    }
}
