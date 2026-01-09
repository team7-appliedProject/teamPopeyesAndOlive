package popeye.popeyebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.entity.Content;

public interface ContentRepository extends JpaRepository<Content, Long> {
}
