package popeye.popeyebackend.pay.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import popeye.popeyebackend.pay.domain.Withdrawal;
import popeye.popeyebackend.pay.enums.WithdrawalStatus;

import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {

	/**
	 * 출금 즉시 처리용: withdrawalId로 조회 (Creator와 User fetch join, 비관적 락)
	 *
	 * 동시성 방어: PESSIMISTIC_WRITE 락으로 withdrawal row 잠금
	 * - 같은 withdrawalId에 대한 동시 요청 방지
	 * - 잔액 계산과 상태 업데이트가 원자적으로 수행됨
	 */
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("""
		select w
		from Withdrawal w
		join fetch w.creator c
		join fetch c.user
		where w.id = :withdrawalId
		""")
	Optional<Withdrawal> findByIdWithCreatorAndUser(@Param("withdrawalId") Long withdrawalId);

	// 크리에이터의 출금 내역 조회 (기간 + 페이징)
	@Query("""
		select w
		from Withdrawal w
		where w.creator.id = :creatorId
		  and w.requestedAt >= :from
		  and w.requestedAt < :toExclusive
		order by w.requestedAt desc
		""")
	Page<Withdrawal> findByCreatorIdAndRequestedAtRange(
		@Param("creatorId") Long creatorId,
		@Param("from") LocalDateTime from,
		@Param("toExclusive") LocalDateTime toExclusive,
		Pageable pageable
	);

	// 크리에이터의 출금 내역 조회 (레거시 - 사용 중단 예정)
	List<Withdrawal> findByCreatorIdOrderByRequestedAtDesc(Long creatorId);

	// 크리에이터별 출금 완료 금액 합계
	@Query("""
		select coalesce(sum(w.amount), 0)
		from Withdrawal w
		where w.creator.id = :creatorId
		  and w.status = :status
		""")
	long sumAmountByCreatorIdAndStatus(@Param("creatorId") Long creatorId, @Param("status") WithdrawalStatus status);
}
