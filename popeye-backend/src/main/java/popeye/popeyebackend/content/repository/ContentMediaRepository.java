package popeye.popeyebackend.content.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.content.domain.ContentMedia;

public interface ContentMediaRepository extends JpaRepository<ContentMedia,Long> {
}
