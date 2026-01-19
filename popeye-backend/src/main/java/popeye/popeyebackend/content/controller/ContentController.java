package popeye.popeyebackend.content.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.dto.request.ContentCreateRequest;
import popeye.popeyebackend.content.dto.response.BannedContentRes;
import popeye.popeyebackend.content.dto.response.ContentListRes;
import popeye.popeyebackend.content.dto.response.ContentResponse;
import popeye.popeyebackend.content.service.ContentService;
import popeye.popeyebackend.global.security.details.PrincipalDetails;

import java.util.List;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @PreAuthorize("hasRole('CREATOR')")
    @PostMapping
    public ResponseEntity<Long> create(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @RequestBody ContentCreateRequest req) {
        Long userId = principalDetails.getUserId();
        Long id = contentService.createContent(userId, req); // 임시 userId
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }

    @GetMapping("/{contentId}")
    public ResponseEntity<ContentResponse> getContent(
            @AuthenticationPrincipal PrincipalDetails details,
            @PathVariable Long contentId) {
        Long userId = details != null ? details.getUserId() : null;
        ContentResponse content = contentService.getContent(contentId, userId);
        return ResponseEntity.ok(content);
    } //제작자랑 어드민은 자기꺼보게

    @DeleteMapping("/{contentId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal PrincipalDetails details,
            @PathVariable Long contentId
    ) {
        contentService.deleteContent(details.getUserId(), contentId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/banlist")
    public ResponseEntity<List<BannedContentRes>> getBannedContent(
            @RequestParam int page, @RequestParam int size
    ){
        List<BannedContentRes> list = contentService.getBannedContentList(page, size);
        return ResponseEntity.ok(list);
    }

    @GetMapping()
    public ResponseEntity<List<ContentListRes>> getAllContent(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(contentService.getContentList(page, size));
    }

    @GetMapping("/free")
    public ResponseEntity<List<ContentListRes>> getFreeContent(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(contentService.getFreeContentList(true, page, size));
    }

    @GetMapping("/paid")
    public ResponseEntity<List<ContentListRes>> getPaidContent(@RequestParam int page, @RequestParam int size) {
        return ResponseEntity.ok(contentService.getFreeContentList(false, page, size));
    }
}
