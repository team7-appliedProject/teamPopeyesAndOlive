package popeye.popeyebackend.content.controller;

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
    public ResponseEntity<popeye.popeyebackend.content.dto.response.ToggleBookmarkResponse> toggleBookmark(
            @AuthenticationPrincipal PrincipalDetails details,
            @PathVariable("contentId") Long id
    ) {
        popeye.popeyebackend.content.dto.response.ToggleBookmarkResponse response = 
                bookmarkService.bookmark(details.getUserId(), id);
        return ResponseEntity.ok(response);
    }
}
