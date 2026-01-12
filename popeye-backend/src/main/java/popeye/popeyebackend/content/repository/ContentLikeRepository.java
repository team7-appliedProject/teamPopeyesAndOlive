package popeye.popeyebackend.content.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.content.domain.ContentLike;

public interface ContentLikeRepository extends JpaRepository<ContentLike,Long> {
}
