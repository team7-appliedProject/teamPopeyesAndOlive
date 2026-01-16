package popeye.popeyebackend.content.dto.response;

import lombok.Getter;
import popeye.popeyebackend.content.domain.Content;

@Getter
public class FullContentResponse {  // 구매자는 전체보기가능

    private Long id;
    private String title;
    private String content;
    private int price;
    private boolean isFree;

    public static FullContentResponse from(Content c) {
        FullContentResponse r = new FullContentResponse();
        r.id = c.getId();
        r.title = c.getTitle();
        r.content = c.getContent();
        r.price = c.getPrice();
        r.isFree = c.isFree();
        return r;
    }
}
