package popeye.popeyebackend.content.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.content.domain.Content;

public interface ContentRepository extends JpaRepository<Content, Long> {
	
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
}
