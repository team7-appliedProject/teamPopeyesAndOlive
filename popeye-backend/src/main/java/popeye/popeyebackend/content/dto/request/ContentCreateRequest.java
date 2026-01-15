package popeye.popeyebackend.content.dto.request;

import lombok.Getter;

@Getter
public class ContentCreateRequest {
    private String title;
    private String content;
    private int price;
    private int discountRate;
    private boolean isFree;
}