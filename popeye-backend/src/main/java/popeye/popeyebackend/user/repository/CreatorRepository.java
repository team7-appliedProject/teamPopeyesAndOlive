package popeye.popeyebackend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.user.domain.Creator;

import java.util.Optional;

public interface CreatorRepository extends JpaRepository<Creator,Long> {
	
	/**
	 * User를 함께 조회 (fetch join)
	 */
	@Query("""
		select c
		from Creator c
		join fetch c.user
		where c.id = :id
		""")
	Optional<Creator> findByIdWithUser(@Param("id") Long id);
}
