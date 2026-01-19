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

    // 북마크 추가
    @PostMapping("/contents/{contentId}")
    public ResponseEntity<Void> bookmark(
            @AuthenticationPrincipal PrincipalDetails details,
            @PathVariable("contentId") Long id
    ) {
        bookmarkService.bookmark(details.getUserId(), id);
        return ResponseEntity.ok().build();
    }

    // 북마크 삭제
    @DeleteMapping("/contents/{contentId}")
    public ResponseEntity<Void> unbookmark(
            @AuthenticationPrincipal PrincipalDetails details,
            @PathVariable("contentId") Long id
    ) {
        bookmarkService.unbookmark(details.getUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
