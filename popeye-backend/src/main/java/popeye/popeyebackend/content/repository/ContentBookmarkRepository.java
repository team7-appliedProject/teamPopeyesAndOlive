package popeye.popeyebackend.content.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.content.domain.ContentBookmark;

public interface ContentBookmarkRepository extends JpaRepository<ContentBookmark, Long> {
}
