package popeye.popeyebackend.content.dto.response;

import lombok.Getter;
import popeye.popeyebackend.content.domain.Content;

@Getter
public class FullContentResponse {

    private Long id;
    private String title;
    private String content;
    private Integer price;   // Integer로 변경
    private boolean isFree;

    public static FullContentResponse from(Content c) {
        FullContentResponse r = new FullContentResponse();
        r.id = c.getId();
        r.title = c.getTitle();
        r.content = c.getContent();
        r.isFree = c.isFree();

        // 무료 콘텐츠면 가격 숨김
        r.price = c.isFree() ? null : c.getPrice();

        return r;
    }
}
