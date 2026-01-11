package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.ContentBookmark;

public interface BookmarkRepository extends JpaRepository<ContentBookmark, Long> {
}
