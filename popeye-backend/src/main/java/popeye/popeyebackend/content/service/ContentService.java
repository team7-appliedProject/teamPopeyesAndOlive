package popeye.popeyebackend.content.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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
import popeye.popeyebackend.pay.enums.OrderStatus;
import popeye.popeyebackend.pay.repository.OrderRepository;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentService {

    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    // 콘텐츠 생성
    public Long createContent(Long userId, ContentCreateRequest req) {
        User creator = userRepository.findById(userId).orElseThrow();

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

    // 콘텐츠 조회 (접근 제어 + 조회수 정책)
    public ContentResponse getContent(Long contentId, Long userId) {

        Content content = contentRepository
                .findByIdAndContentStatus(contentId, ContentStatus.ACTIVE)
                .orElseThrow(ContentNotFoundException::new);

        User viewer = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);


        boolean isCreator = content.getCreator().getId().equals(userId);
        boolean isAdmin = viewer.isAdmin();

        // 제작자 or 관리자 → 전체 공개 + 조회수 증가
        if (isCreator || isAdmin) {
            content.increaseViewCount();
            return FullContentResponse.from(content);
        }

        // 무료 콘텐츠 → 전체 공개 + 조회수 증가
        if (content.isFree()) {
            content.increaseViewCount();
            return FullContentResponse.from(content);
        }

        // 구매 완료 → 전체 공개 + 조회수 증가
        if (hasPurchased(userId, contentId)) {
            content.increaseViewCount();
            return FullContentResponse.from(content);
        }

        // 그 외 → 미리보기 (조회수 증가 x)
        return PreviewContentResponse.from(content);
    }

    // 소프트 삭제
    public void deleteContent(Long userId, Long contentId) {
        Content content = contentRepository.findById(contentId).orElseThrow();

        if (!content.getCreator().getId().equals(userId)) {
            throw new AccessDeniedException("작성자만 삭제할 수 있습니다.");
        }

        content.inactivate();
    }

    public void hardDeleteContent(Long adminUserId, Long contentId) {

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(UserNotFoundException::new);

        if (!admin.isAdmin()) {
            throw new AccessDeniedException("관리자만 하드 삭제할 수 있습니다.");
        }

        Content content = contentRepository.findById(contentId)
                .orElseThrow(ContentNotFoundException::new);

        contentRepository.delete(content); // 물리 삭제
    }


    // 구매 여부 조회 (pay 도메인 read-only)
    private boolean hasPurchased(Long userId, Long contentId) {
        return orderRepository.existsByUser_IdAndContent_IdAndOrderStatus(
                userId,
                contentId,
                OrderStatus.COMPLETED
        );
    }
}
