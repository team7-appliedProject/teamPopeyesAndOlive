package popeye.popeyebackend.content.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.stereotype.Service;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.dto.request.ContentCreateRequest;
import popeye.popeyebackend.content.dto.response.ContentResponse;
import popeye.popeyebackend.content.dto.response.FullContentResponse;
import popeye.popeyebackend.content.dto.response.PreviewContentResponse;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.content.exception.AccessDeniedException;
import popeye.popeyebackend.content.exception.ContentNotFoundException;
import popeye.popeyebackend.content.exception.UserNotFoundException;
import popeye.popeyebackend.content.repository.ContentRepository;

@Service
@RequiredArgsConstructor
@Transactional

public class ContentService {

    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final CreatorRepository creatorRepository;
    private final OrderRepository orderRepository;

    // 생성
    public Long createContent(Long userId, ContentCreateRequest req) {

        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        Creator creator = creatorRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("크리에이터 권한이 없습니다."));

        Content content = Content.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .price(req.getPrice())
                .discountRate(req.getDiscountRate())
                .isFree(req.isFree())
                .creator(creator)
                .build();

        return contentRepository.save(content).getId();
    }

    // 조회
    public ContentResponse getContent(Long contentId, Long userId) {

        Content content = contentRepository
                .findByIdAndContentStatus(contentId, ContentStatus.ACTIVE)
                .orElseThrow(ContentNotFoundException::new);

        User viewer = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        if (canViewFullContent(content, viewer)) {
            content.increaseViewCount();
            return FullContentResponse.from(content);
        }

        return PreviewContentResponse.from(content);
    }

    // 콘텐츠 삭제
    public void deleteContent(Long userId, Long contentId) {

        Content content = contentRepository.findById(contentId)
                .orElseThrow(ContentNotFoundException::new);

        if (!content.getCreator().getId().equals(userId)) {
            throw new AccessDeniedException("작성자만 삭제할 수 있습니다.");
        }

        content.softDelete();
    }

    public void hardDeleteContent(Long adminUserId, Long contentId) {

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(UserNotFoundException::new);

        if (!admin.isAdmin()) {
            throw new AccessDeniedException("관리자만 하드 삭제할 수 있습니다.");
        }

        Content content = contentRepository.findById(contentId)
                .orElseThrow(ContentNotFoundException::new);

        contentRepository.delete(content);
    }


    private boolean canViewFullContent(Content content, User viewer) {

        boolean isCreator = content.getCreator().getId().equals(viewer.getId());
        boolean isAdmin = false; // 임시 (viewer.isAdmin())

        if (isCreator || isAdmin) {
            return true;
        }

        if (content.isFree()) {
            return true;
        }

        return hasPurchased(viewer.getId(), content.getId());
        return false;
    }

    // 구매여부
    private boolean hasPurchased(Long userId, Long contentId) {
        return orderRepository.existsByUser_IdAndContent_IdAndOrderStatus(
                userId,
                contentId,
                OrderStatus.COMPLETED
        );
    }
}
