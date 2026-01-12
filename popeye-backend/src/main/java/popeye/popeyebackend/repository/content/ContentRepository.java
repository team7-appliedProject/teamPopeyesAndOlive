package popeye.popeyebackend.repository.content;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.enums.ContentStatus;
import java.util.Optional;

public interface ContentRepository extends JpaRepository<Content, Long> {

    Optional<Content> findByIdAndContentStatus(Long id, ContentStatus status);

    Page<Content> findAllByContentStatus(ContentStatus status, Pageable pageable);
}
