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
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentService {
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;

    public Long createContent(Long userId, ContentCreateRequest req) {
        User creator = userRepository.findById(userId).orElseThrow();

        Content content = Content.create( //build 패턴
                creator,
                req.getTitle(),
                req.getBody(),
                req.getPrice(), //null 처리하기
                req.getDiscountRate(), //여기도
                req.isFree()
        );

        return contentRepository.save(content).getId();
    }

    public ContentResponse getContent(Long contentId) {
        Content content = contentRepository
                .findByIdAndContentStatus(contentId, ContentStatus.ACTIVE)
                .orElseThrow();

        content.increaseViewCount();
        return ContentResponse.from(content);
    }

    @Transactional(readOnly = true)
    public Object getContentWithAccessControl(Long contentId, boolean hasPurchased) {
        Content c = contentRepository.findByIdAndStatus(contentId, ContentStatus.ACTIVE).orElseThrow();
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
