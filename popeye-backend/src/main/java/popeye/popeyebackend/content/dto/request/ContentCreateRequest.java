package popeye.popeyebackend.content.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class ContentCreateRequest {
    private String title;
    private String content;
    private int price;
    private int discountRate;

    @JsonProperty("free")
    private boolean isFree;
}