package popeye.popeyebackend.batch.reader;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.batch.item.support.AbstractItemCountingItemStreamItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.stereotype.Component;

import popeye.popeyebackend.pay.repository.OrderSettlementRepository;
import popeye.popeyebackend.pay.repository.SettlementAggregateProjection;

/**
 * 정산 배치 Reader
 * JobParameters로부터 날짜 범위를 받아 정산 대상만 조회
 * 
 * [주의사항] 메모리 사용:
 * - 현재 구현은 전체 데이터를 메모리에 로드합니다.
 * - 대량 데이터 처리 시 OOM(Out of Memory) 위험이 있습니다.
 * - 향후 개선: 커서 기반 페이징 또는 JdbcCursorItemReader 사용 권장
 */
@StepScope
@Component
public class SettlementBatchReader extends AbstractItemCountingItemStreamItemReader<SettlementAggregateProjection> {

	@Autowired
	private OrderSettlementRepository orderSettlementRepository;

	@Value("#{jobParameters['fromDate']}")
	private String fromDateStr;

	@Value("#{jobParameters['toDate']}")
	private String toDateStr;

	private List<SettlementAggregateProjection> aggregates;
	private int currentIndex = 0;

	public SettlementBatchReader() {
		setName("settlementBatchReader");
	}

	@Override
	protected SettlementAggregateProjection doRead() throws Exception {
		// 첫 호출 시 데이터 조회 (전체 데이터를 메모리에 로드)
		// 대량 데이터 처리 시 메모리 부족 가능성 있음
		if (aggregates == null) {
			LocalDateTime from = LocalDateTime.parse(fromDateStr);
			LocalDateTime to = LocalDateTime.parse(toDateStr);

			aggregates = orderSettlementRepository.aggregateGrossByCreatorAndContent(from, to);
			currentIndex = 0;
		}

		// 모든 데이터를 읽었으면 null 반환 (배치 종료)
		if (currentIndex >= aggregates.size()) {
			return null;
		}

		// 다음 항목 반환
		return aggregates.get(currentIndex++);
	}

	@Override
	protected void doOpen() throws Exception {
		// 초기화 로직 (필요시)
	}

	@Override
	protected void doClose() throws Exception {
		// 정리 로직 (필요시)
		aggregates = null;
		currentIndex = 0;
	}
}

