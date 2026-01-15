package popeye.popeyebackend.content.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentLike;
import popeye.popeyebackend.content.exception.ContentError;
import popeye.popeyebackend.content.repository.ContentLikeRepository;
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentLikeService {

    private final ContentLikeRepository likeRepository;
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;

    public void toggleLike(Long userId, Long contentId) {
        User user = userRepository.findById(userId).orElseThrow();

        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ContentError("컨텐츠를 찾을 수 없습니다."));

        boolean alreadyLiked =
                likeRepository.existsByUserAndContent(user, content);

        if (alreadyLiked) {
            likeRepository.deleteByUserAndContent(user, content);
            content.decreaseLike();
        } else {
            ContentLike contentLike = ContentLike.builder()
                    .user(user)
                    .content(content).build();

            likeRepository.save(contentLike);
            content.increaseLike();
        }
    }
}
