package popeye.popeyebackend.content.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentBan;
import popeye.popeyebackend.content.dto.request.ContentCreateRequest;
import popeye.popeyebackend.content.dto.response.ContentResponse;
import popeye.popeyebackend.content.dto.response.FullContentResponse;
import popeye.popeyebackend.content.dto.response.PreviewContentResponse;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.content.repository.ContentBanRepository;
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.service.UserService;
import popeye.popeyebackend.user.repository.UserRepository;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class ContentService {
    private final ContentRepository contentRepository;
    private final ContentBanRepository contentBanRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    public Long createContent(Long userId, ContentCreateRequest req) {
        User creator = userRepository.findById(userId).orElseThrow();

        Content content = Content.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .price(req.getPrice())
                .discountRate(req.getDiscountRate())
                .isFree(req.isFree()).build();

        return contentRepository.save(content).getId();
    }

    @Transactional
    public void activeContent(Long contentId){
        Content content = contentRepository.findById(contentId)
                .orElseThrow(()->new RuntimeException("컨텐츠가 없습니다."));

        ContentStatus contentStatus = content.getContentStatus();
        if (contentStatus == ContentStatus.ACTIVE) {
            throw new RuntimeException("already active content");
        } else {
            content.activate();
            ContentBan ban = contentBanRepository.findByContentAndIsBanned(content, true);
            ban.release();
        }
    }

    @Transactional
    public void inactiveContent(Long contentId, String reason, Long adminId) {
        User admin = userService.getUser(adminId);
        Content content = contentRepository.findById(contentId)
                .orElseThrow(()->new RuntimeException("컨텐츠가 없습니다."));

        ContentStatus contentStatus = content.getContentStatus();
        if (contentStatus == ContentStatus.INACTIVE) {
            throw new RuntimeException("already active content");
        } else {
            content.inactivate();
            ContentBan contentBan = ContentBan.builder()
                    .reason(reason)
                    .admin(admin)
                    .content(content).build();
            contentBanRepository.save(contentBan);
        }
    }

    @Transactional(readOnly = true)
    public Content getContentById(Long contentId) {
        return contentRepository.findById(contentId)
                .orElseThrow(()-> new RuntimeException("no content"));
    }

    @Transactional
    public void autoInactiveContent(Long contentId, String reason) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(()->new RuntimeException("no content"));
        content.activate();
        ContentBan ban = ContentBan.builder()
                .reason(reason).build();
    }

    @Transactional(readOnly = true)
    public ContentResponse getContent(Long contentId) {
        Content content = contentRepository
                .findByIdAndContentStatus(contentId, ContentStatus.ACTIVE)
                .orElseThrow();

        content.increaseViewCount();
        return ContentResponse.from(content);
    }

    @Transactional(readOnly = true)
    public Object getContentWithAccessControl(Long contentId, boolean hasPurchased) {
        Content c = contentRepository.findByIdAndContentStatus(contentId, ContentStatus.ACTIVE)
                .orElseThrow();
        c.increaseViewCount();

        if (c.isFree() || hasPurchased) {
            return FullContentResponse.from(c);
        }
        return PreviewContentResponse.from(c);
    }

    public void deleteContent(Long userId, Long contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow();

        if (!content.getCreator().getId().equals(userId)) {
            throw new IllegalStateException("작성자만 삭제할 수 있습니다.");
        }

        content.inactivate(); // 실제 삭제 아님 (비공개 처리)
    }
}
