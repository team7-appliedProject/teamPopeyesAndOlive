package popeye.popeyebackend.content.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentBookmark;
import popeye.popeyebackend.user.domain.User;

import java.util.List;

public interface ContentBookmarkRepository
        extends JpaRepository<ContentBookmark, Long> {

     boolean existsByUserAndContent(User user, Content content);

     void deleteByUserAndContent(User user, Content content);

     List<ContentBookmark> findAllByUserOrderByCreatedAtDesc(User user);

}
