package popeye.popeyebackend.content.dto.response;

import lombok.Getter;

@Getter
public class ToggleBookmarkResponse {
    private boolean bookmarked;

    public ToggleBookmarkResponse(boolean bookmarked) {
        this.bookmarked = bookmarked;
    }
}

