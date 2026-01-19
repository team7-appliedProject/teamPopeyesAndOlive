package popeye.popeyebackend.content.dto.response;

import lombok.Getter;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.enums.ContentStatus;

@Getter
public class PreviewContentResponse extends ContentResponse { // 비로그인,미구매자는 미리보기만 봄

    private Long id;
    private String title;
    private String preview;
    private boolean isFree;
    private Integer price;
    private ContentStatus status;
    private Integer viewCount;
    private Long likeCount;
    private Boolean isLiked;
    private Boolean isBookmarked;
    private Integer discountRate;

    public static PreviewContentResponse from(Content c, boolean isLiked, boolean isBookmarked) {
        PreviewContentResponse r = new PreviewContentResponse();
        r.id = c.getId();
        r.title = c.getTitle();
        r.isFree = c.isFree();
        r.viewCount = c.getViewCount();
        r.price = c.getPrice();
        r.status = c.getContentStatus();
        r.likeCount = c.getLikeCount();
        r.discountRate = c.getDiscountRate();
        r.isLiked = isLiked;
        r.isBookmarked = isBookmarked;
        r.preview = c.getContent().substring(0,
                Math.min(100, c.getContent().length()));

        return r;
    }
}
