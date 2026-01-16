package popeye.popeyebackend.pay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import popeye.popeyebackend.pay.domain.Settlement;

import java.time.LocalDateTime;
import java.util.List;

public interface SettlementRepository extends JpaRepository<Settlement,Long> {

    /**
     * 특정 기간의 정산 금액 합계
     * totalAmount는 이미 net amount(수수료 제외 금액)이므로 단순 합계만 계산
     */
    @Query("select coalesce(sum(s.totalAmount), 0) from Settlement s " +
            "where s.settledAt between :start and :end ")
    Long sumTotalAmountByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * 크리에이터의 총 정산 금액 합계
     */
    @Query("""
        select coalesce(sum(s.totalAmount), 0)
        from Settlement s
        where s.creator.id = :creatorId
        """)
    long sumTotalAmountByCreator(@Param("creatorId") Long creatorId);

	/**
	 * 크리에이터의 콘텐츠별 누적 정산 요약 조회
	 * contentId별로 그룹화하여 집계
	 * - content와 join하여 title 가져오기
	 * - totalRevenue, totalPlatformFee 계산 포함
	 * 
	 * 수수료 계산 정책: 버림 처리 (FLOOR 사용)
	 * - totalRevenue = totalAmount / (1 - feeRate/100) 계산 시 버림
	 * - Batch의 RoundingMode.DOWN과 일치하도록 통일
	 */
	@Query(value = """
		SELECT 
			s.content_id AS contentId,
			c.title AS title,
			COUNT(*) AS settlementCount,
			COALESCE(SUM(s.total_amount), 0) AS totalPayout,
			COALESCE(SUM(
				CASE 
					WHEN s.fee_rate <= 0 OR s.fee_rate >= 100 THEN s.total_amount
					ELSE FLOOR(s.total_amount * 100.0 / (100 - s.fee_rate))
				END
			), 0) AS totalRevenue,
			COALESCE(SUM(
				CASE 
					WHEN s.fee_rate <= 0 OR s.fee_rate >= 100 THEN 0
					ELSE FLOOR(s.total_amount * 100.0 / (100 - s.fee_rate)) - s.total_amount
				END
			), 0) AS totalPlatformFee,
			COALESCE(MAX(s.settled_at), NULL) AS lastSettledAt
		FROM settlements s
		INNER JOIN contents c ON c.id = s.content_id
		WHERE s.creator_id = :creatorId
		GROUP BY s.content_id, c.title
		""", nativeQuery = true)
	List<ContentSettlementSummaryProjection> findContentSettlementSummariesByCreatorId(
		@Param("creatorId") Long creatorId);

	/**
	 * 특정 콘텐츠의 기간별 정산 내역 조회 (DAY 단위)
	 * 수수료 계산 정책: 버림 처리 (FLOOR 사용)
	 */
	@Query(value = """
		SELECT 
		    CAST(DATE(s.settled_at) AS DATETIME) AS periodStart,
		    COUNT(*) AS orderCount,
		    COALESCE(SUM(
		        CASE 
		            WHEN s.fee_rate <= 0 OR s.fee_rate >= 100 THEN s.total_amount
		            ELSE FLOOR(s.total_amount * 100.0 / (100 - s.fee_rate))
		        END
		    ), 0) AS totalRevenue,
		    COALESCE(SUM(
		        CASE 
		            WHEN s.fee_rate <= 0 OR s.fee_rate >= 100 THEN 0
		            ELSE FLOOR(s.total_amount * 100.0 / (100 - s.fee_rate)) - s.total_amount
		        END
		    ), 0) AS totalPlatformFee,
		    COALESCE(SUM(s.total_amount), 0) AS totalPayout,
		    MAX(s.settled_at) AS latestSettledAt
		FROM settlements s
		WHERE s.content_id = :contentId
		  AND s.settled_at >= :from
		  AND s.settled_at < :to
		GROUP BY CAST(DATE(s.settled_at) AS DATETIME)
		ORDER BY periodStart ASC
		""", nativeQuery = true)
	List<ContentSettlementPeriodProjection> findContentSettlementPeriodsByDay(
		@Param("contentId") Long contentId,
		@Param("from") LocalDateTime from,
		@Param("to") LocalDateTime to);
}
