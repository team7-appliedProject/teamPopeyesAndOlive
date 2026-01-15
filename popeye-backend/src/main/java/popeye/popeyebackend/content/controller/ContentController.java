package popeye.popeyebackend.content.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.content.dto.request.ContentCreateRequest;
import popeye.popeyebackend.content.service.ContentService;
import popeye.popeyebackend.global.security.details.PrincipalDetails;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody ContentCreateRequest req) {
        Long id = contentService.createContent(1L, req); // 임시 userId
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }

    @GetMapping("/{userId}")
    public Object get(@PathVariable Long userId) {
        boolean hasPurchased = orderService.hasPurchased(userId, contentId); //유료서비스
        return contentService.getContentWithAccessControl(id, hasPurchased);
    } //제작자랑 어드민은 자기꺼보게

    @DeleteMapping("/{contentId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal PrincipalDetails details,
            @PathVariable Long contentId
    ) {
        contentService.deleteContent(details.getUserId(), contentId);
        return ResponseEntity.noContent().build();
    }

}
