package popeye.popeyebackend.content.controller;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
        import popeye.popeyebackend.content.service.ContentBookmarkService;
import popeye.popeyebackend.global.security.details.PrincipalDetails;

@RestController
@RequestMapping("/api/bookmark")
@RequiredArgsConstructor
public class ContentBookmarkController {

    private final ContentBookmarkService bookmarkService;

    // 북마크 토글 (추가/삭제)
    @PostMapping("/contents/{contentId}")
    public ResponseEntity<BookmarkResponse> toggleBookmark(
            @AuthenticationPrincipal PrincipalDetails details,
            @PathVariable("contentId") Long id
    ) {
        // 서비스에서 현재 상태가 북마크 되었는지 여부를 반환하도록 수정 필요
        boolean isBookmarked = bookmarkService.bookmark(details.getUserId(), id);

        // JSON 형태로 응답 (프론트엔드가 기대하는 구조)
        return ResponseEntity.ok(new BookmarkResponse(isBookmarked));
    }
    @Getter
    @AllArgsConstructor
    class BookmarkResponse {
        private boolean bookmarked;
    }
}
