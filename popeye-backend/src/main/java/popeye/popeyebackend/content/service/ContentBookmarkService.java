package popeye.popeyebackend.content.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentBookmark;
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

    public void bookmark(Long userId, Long contentId) {
        User user = userRepository.findById(userId).orElseThrow();
        Content content = contentRepository.findById(contentId).orElseThrow();

        if (bookmarkRepository.existsByUserAndContent(user, content)) {
            throw new IllegalStateException("이미 북마크됨");
        }

        bookmarkRepository.save(ContentBookmark.create(user, content));
    }

    public void unbookmark(Long userId, Long contentId) {
        User user = userRepository.findById(userId).orElseThrow();
        Content content = contentRepository.findById(contentId).orElseThrow();

        bookmarkRepository.deleteByUserAndContent(user, content);
    }
}
