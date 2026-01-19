package popeye.popeyebackend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.user.domain.Creator;
import popeye.popeyebackend.user.domain.User;

import java.util.Optional;

public interface CreatorRepository extends JpaRepository<Creator,Long> {
    // 승격 유저에게 크리에이터 정보 있는지 판단
    boolean existsByUser(User user);
    Optional<Creator> findByUser(User user);

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
