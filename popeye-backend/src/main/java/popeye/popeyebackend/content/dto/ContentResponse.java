package popeye.popeyebackend.content.dto;

import lombok.Getter;
import popeye.popeyebackend.content.domain.Content;

@Getter
public class ContentResponse {

    private Long id;
    private String title;
    private int price;
    private boolean isFree;
    private String status;

    public static ContentResponse from(Content content) {
        ContentResponse res = new ContentResponse();
        res.id = content.getId();
        res.title = content.getTitle();
        res.price = content.getPrice();
        res.isFree = content.isFree();
        res.status = content.getContentStatus().name();
        return res;
    }
}
