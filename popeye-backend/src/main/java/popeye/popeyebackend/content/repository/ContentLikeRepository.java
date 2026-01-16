package popeye.popeyebackend.content.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentLike;
import popeye.popeyebackend.user.domain.User;

public interface ContentLikeRepository extends JpaRepository<ContentLike, Long> {

    boolean existsByUserAndContent(User user, Content content);

    void deleteByUserAndContent(User user, Content content);
}
