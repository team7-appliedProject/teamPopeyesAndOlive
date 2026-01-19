package popeye.popeyebackend.pay.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import popeye.popeyebackend.pay.domain.Order;
import popeye.popeyebackend.pay.repository.projection.SettlementAggregateProjection;

@Repository
public interface OrderSettlementRepository extends JpaRepository<Order, Long> {
	/**
	 * 어제 범위의 (SUCCESS & settlement=false) 주문을
	 * content -> creator로 조인해서 creator_id, content_id별 총 매출(gross)을 집계한다.
	 *
	 * Projection 인터페이스를 사용하여 타입 안전하게 반환
	 */
	@Query(value = """
		SELECT c.creator_id AS creatorId,
		       o.content_id AS contentId,
		       COALESCE(SUM(o.credit_used), 0) AS grossSum
		FROM `orders` o
		JOIN `contents` c ON c.id = o.content_id
		WHERE o.order_status = 'SUCCESS'
		  AND o.settlement = false
		  AND o.order_date >= :from
		  AND o.order_date < :to
		GROUP BY c.creator_id, o.content_id
		""", nativeQuery = true)
	List<SettlementAggregateProjection> aggregateGrossByCreatorAndContent(
		@Param("from") LocalDateTime from,
		@Param("to") LocalDateTime to
	);

	/**
	 * 정산 대상 주문을 일괄적으로 settlement=true로 변경
	 */
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query(value = """
		UPDATE `orders` o
		SET o.settlement = true
		WHERE o.order_status = 'SUCCESS'
		  AND o.settlement = false
		  AND o.order_date >= :from
		  AND o.order_date < :to
		""", nativeQuery = true)
	int markOrdersAsSettled(
		@Param("from") LocalDateTime from,
		@Param("to") LocalDateTime to
	);
}
