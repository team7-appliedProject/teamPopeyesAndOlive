package popeye.popeyebackend.batch.writer;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.batch.dto.SettlementItemDto;
import popeye.popeyebackend.pay.domain.Settlement;
import popeye.popeyebackend.pay.repository.OrderSettlementRepository;
import popeye.popeyebackend.pay.repository.SettlementRepository;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.UserRepository;

/**
 * 정산 배치 Writer
 * Processor가 생성한 SettlementItemDto를 받아 DB 저장 및 Order 업데이트
 */
@StepScope
@Component
@RequiredArgsConstructor
public class SettlementBatchWriter implements ItemWriter<SettlementItemDto> {

	private final SettlementRepository settlementRepository;
	private final OrderSettlementRepository orderSettlementRepository;
	private final UserRepository userRepository;
	private final ContentRepository contentRepository;

	@Value("#{jobParameters['fromDate']}")
	private String fromDateStr;

	@Value("#{jobParameters['toDate']}")
	private String toDateStr;

	private static final ZoneId ZONE = ZoneId.of("Asia/Seoul");

	@SuppressWarnings("unchecked")
	@Override
	public void write(Chunk<? extends SettlementItemDto> chunk) throws Exception {
		List<SettlementItemDto> items = (List<SettlementItemDto>) chunk.getItems();

		if (items.isEmpty()) {
			return;
		}

		// creator, content 엔티티를 한 번에 조회하여 N+1 문제 방지
		List<Long> creatorIds = items.stream()
			.map(SettlementItemDto::creatorId)
			.distinct()
			.toList();
		List<Long> contentIds = items.stream()
			.map(SettlementItemDto::contentId)
			.distinct()
			.toList();

		// User와 Content 엔티티에 @Getter가 없으므로 리플렉션으로 id 접근
		Map<Long, User> creatorMap = userRepository.findAllById(creatorIds).stream()
			.collect(Collectors.toMap(
				this::getUserId,
				creator -> creator
			));
		Map<Long, Content> contentMap = contentRepository.findAllById(contentIds).stream()
			.collect(Collectors.toMap(
				this::getContentId,
				content -> content
			));

		LocalDateTime settledAt = LocalDateTime.now(ZONE);

		// Settlement 저장
		for (SettlementItemDto item : items) {
			User creator = creatorMap.get(item.creatorId());
			Content content = contentMap.get(item.contentId());

			if (creator == null || content == null) {
				continue; // 데이터 무결성 문제 시 스킵
			}

			Settlement settlement = Settlement.builder()
				.totalAmount(item.netAmount())
				.feeRate(item.feeRate())
				.settledAt(settledAt)
				.creator(creator)
				.content(content)
				.build();

			settlementRepository.save(settlement);
		}

		// 정산 완료된 주문 표시 (마지막 chunk에서만 실행)
		// [주의] chunk.isEnd()는 Spring Batch 5.x에서 정확히 동작하지만,
		// 배치 프레임워크 버전에 따라 동작 차이가 있을 수 있으므로 주의 필요
		if (chunk.isEnd()) {
			LocalDateTime from = LocalDateTime.parse(fromDateStr);
			LocalDateTime to = LocalDateTime.parse(toDateStr);
			orderSettlementRepository.markOrdersAsSettled(from, to);
		}
	}

	/**
	 * User 엔티티의 id 필드 접근 (리플렉션 사용)
	 */
	private Long getUserId(User user) {
		try {
			java.lang.reflect.Field idField = popeye.popeyebackend.user.domain.User.class.getDeclaredField("id");
			idField.setAccessible(true);
			return (Long) idField.get(user);
		} catch (Exception e) {
			throw new RuntimeException("Failed to get user id", e);
		}
	}

	/**
	 * Content 엔티티의 id 필드 접근 (리플렉션 사용)
	 */
	private Long getContentId(Content content) {
		try {
			java.lang.reflect.Field idField = popeye.popeyebackend.content.domain.Content.class.getDeclaredField("id");
			idField.setAccessible(true);
			return (Long) idField.get(content);
		} catch (Exception e) {
			throw new RuntimeException("Failed to get content id", e);
		}
	}
}

