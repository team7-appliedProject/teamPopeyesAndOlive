package popeye.popeyebackend.content.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.content.service.ContentBookmarkService;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentBookmarkController {

    private final ContentBookmarkService bookmarkService;

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<Void> bookmark(@PathVariable Long id) {
        bookmarkService.bookmark(1L, id); // 임시 userId
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/bookmark")
    public ResponseEntity<Void> unbookmark(@PathVariable Long id) {
        bookmarkService.unbookmark(1L, id);
        return ResponseEntity.noContent().build();
    }
}
