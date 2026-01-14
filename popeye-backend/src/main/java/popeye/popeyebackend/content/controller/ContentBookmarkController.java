package popeye.popeyebackend.content.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.content.service.ContentBookmarkService;
import popeye.popeyebackend.global.security.details.PrincipalDetails;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentBookmarkController {

    private final ContentBookmarkService bookmarkService;

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<Void> bookmark(
            @AuthenticationPrincipal PrincipalDetails details,
            @PathVariable Long id) {
        Long userId = details.getUserId();
        bookmarkService.bookmark(userId, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/bookmark")
    public ResponseEntity<Void> unbookmark(@PathVariable Long id) {
        bookmarkService.unbookmark(1L, id);
        return ResponseEntity.noContent().build();
    }
}
