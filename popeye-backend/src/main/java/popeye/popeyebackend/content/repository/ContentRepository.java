package popeye.popeyebackend.content.repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.enums.ContentStatus;
import java.util.Optional;

public interface ContentRepository extends JpaRepository<Content, Long> {

    Optional<Content> findByIdAndContentStatus(Long id, ContentStatus status);

    Page<Content> findAllByContentStatus(ContentStatus status, Pageable pageable);

	/**
	 * Content를 creator와 함께 조회 (fetch join)
	 */
	@Query("""
		SELECT c
		FROM Content c
		JOIN FETCH c.creator
		WHERE c.id = :contentId
		""")
	Optional<Content> findByIdWithCreator(@Param("contentId") Long contentId);

    Page<Content> findByIsFree(boolean isFree, Pageable pageable);

    Long countByContentStatus(ContentStatus status);
}
