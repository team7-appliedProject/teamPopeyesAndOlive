package popeye.popeyebackend.content.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.content.domain.Content;

public interface ContentRepository extends JpaRepository<Content, Long> {
}
