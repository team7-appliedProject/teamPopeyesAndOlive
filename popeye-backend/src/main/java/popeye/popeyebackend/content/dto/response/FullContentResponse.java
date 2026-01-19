package popeye.popeyebackend.content.dto.response;

import lombok.Getter;
import popeye.popeyebackend.content.domain.Content;

@Getter
public class FullContentResponse extends ContentResponse{

    private Long id;
    private String title;
    private String content;
    private Integer price;   // Integer로 변경
    private boolean isFree;
    private Integer viewCount;
    private Long likeCount;
    private Boolean isLiked;
    private Boolean isBookmarked;
    private Integer discountRate;

    public static FullContentResponse from(Content c, boolean isLiked, boolean isBookmarked) {
        FullContentResponse r = new FullContentResponse();
        r.id = c.getId();
        r.title = c.getTitle();
        r.content = c.getContent();
        r.isFree = c.isFree();
        r.viewCount = c.getViewCount();
        r.likeCount = c.getLikeCount();
        r.discountRate = c.getDiscountRate();
        r.isLiked = isLiked;
        r.isBookmarked = isBookmarked;

        // 무료 콘텐츠면 가격 숨김
        r.price = c.isFree() ? null : c.getPrice();

        return r;
    }
}
