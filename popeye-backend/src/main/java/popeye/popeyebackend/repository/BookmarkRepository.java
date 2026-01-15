package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.content.domain.ContentBookmark;


public interface BookmarkRepository extends JpaRepository<ContentBookmark, Long> {
}
