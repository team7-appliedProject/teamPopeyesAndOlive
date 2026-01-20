package popeye.popeyebackend.content.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentBookmark;
import popeye.popeyebackend.content.exception.ContentError;
import popeye.popeyebackend.content.repository.ContentBookmarkRepository;
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentBookmarkService {

    private final ContentBookmarkRepository bookmarkRepository;
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;

    public boolean bookmark(Long userId, Long contentId) {
        User user = userRepository.findById(userId)
                .orElseThrow();
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ContentError("컨텐츠를 찾을 수 없습니다."));

        // 토글 방식: 이미 북마크되어 있으면 삭제, 없으면 추가
        if (bookmarkRepository.existsByUserAndContent(user, content)) {
            bookmarkRepository.deleteByUserAndContent(user, content);
            return false;
        } else {
            ContentBookmark contentBookmark = ContentBookmark.builder()
                    .user(user)
                    .content(content)
                    .price(content.getPrice()).build();
            bookmarkRepository.save(contentBookmark);
            return true;
        }
    }

    public void unbookmark(Long userId, Long contentId) {
        User user = userRepository.findById(userId).orElseThrow();
        Content content = contentRepository.findById(contentId).orElseThrow();

        bookmarkRepository.deleteByUserAndContent(user, content);
    }
}
