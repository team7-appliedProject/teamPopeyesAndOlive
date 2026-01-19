package popeye.popeyebackend.content.controller;

import jakarta.persistence.*;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import popeye.popeyebackend.content.service.ContentLikeService;
import popeye.popeyebackend.global.security.details.PrincipalDetails;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentLikeController {
    private final ContentLikeService contentLikeService;

    @PostMapping("/{contentId}/like")
    public ResponseEntity<Void> toggleLike(
          @AuthenticationPrincipal PrincipalDetails details,
            @PathVariable Long contentId) {
        contentLikeService.toggleLike(details.getUserId(), contentId);
        return ResponseEntity.ok().build();
    }
}
