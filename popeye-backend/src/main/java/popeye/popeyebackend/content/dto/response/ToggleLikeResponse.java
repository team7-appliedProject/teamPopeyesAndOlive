package popeye.popeyebackend.content.dto.response;

import lombok.Getter;

@Getter
public class ToggleLikeResponse {
    private boolean liked;
    private long likeCount;

    public ToggleLikeResponse(boolean liked, long likeCount) {
        this.liked = liked;
        this.likeCount = likeCount;
    }
}

