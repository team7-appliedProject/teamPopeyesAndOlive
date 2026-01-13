package popeye.popeyebackend.content.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.dto.request.ContentCreateRequest;
import popeye.popeyebackend.content.dto.response.ContentResponse;
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
}
