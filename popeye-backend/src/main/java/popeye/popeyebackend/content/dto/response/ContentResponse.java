package popeye.popeyebackend.content.dto.response;

import lombok.Getter;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.enums.ContentStatus;

@Getter
public class ContentResponse {

    private Long id;
    private String title;
    private Integer price;
    private boolean isFree;
    private ContentStatus status;

    public static ContentResponse from(Content content) {
        ContentResponse res = new ContentResponse();
        res.id = content.getId();
        res.title = content.getTitle();
        res.price = content.getPrice();
        res.isFree = content.isFree();
        res.status = content.getContentStatus();
        return res;
    }
}
