package popeye.popeyebackend.content.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.content.dto.request.ContentCreateRequest;
import popeye.popeyebackend.content.dto.response.ContentResponse;
import popeye.popeyebackend.content.service.ContentService;

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

    @GetMapping("/{id}")
    public Object get(@PathVariable Long id) {
        boolean hasPurchased = paymentService.hasPurchased(userId, contentId); //결제부분
        return contentService.getContentWithAccessControl(id, hasPurchased);
    }
    @DeleteMapping("/{contentId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long contentId
    ) {
        contentService.deleteContent(user.getUserId(), contentId);
        return ResponseEntity.noContent().build();
    }

}
