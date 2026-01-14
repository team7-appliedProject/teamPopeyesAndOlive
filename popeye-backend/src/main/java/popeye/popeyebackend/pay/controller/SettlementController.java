package popeye.popeyebackend.pay.controller;

import java.time.LocalDate;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import popeye.popeyebackend.pay.dto.settlement.AvailableBalanceResponse;
import popeye.popeyebackend.pay.dto.settlement.ContentSettlementSummaryResponse;
import popeye.popeyebackend.pay.dto.settlement.DailyContentSettlementResponse;
import popeye.popeyebackend.pay.service.SettlementService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/settlements")
public class SettlementController {

	private final SettlementService settlementService;

	// TODO: 인증 추가 예정
	@GetMapping("/creators/{creatorId}/available")
	public ResponseEntity<AvailableBalanceResponse> getAvailableBalance(
		// @AuthenticationPrincipal User user,
		@PathVariable Long creatorId) {
		return ResponseEntity.ok(settlementService.getAvailableBalance(creatorId));
	}
/*

	// 크리에이터의 콘텐츠별 누적 정산 리스트
	@GetMapping("/creators/{creatorId}/contents")
	public ResponseEntity<ContentSettlementSummaryResponse> getContentSettlementSummaries(
		@PathVariable Long creatorId
	) {
		return ResponseEntity.ok(settlementService.getContentSettlementSummaries(creatorId));
	}
*/
/*
	// 특정 콘텐츠의 일별 정산(기간 조회, 기본값=어제는 서비스에서 처리)
	@GetMapping("/creators/{creatorId}/contents/{contentId}/daily")
	public ResponseEntity<DailyContentSettlementResponse> getDailyContentSettlement(
		@PathVariable Long creatorId,
		@PathVariable Long contentId,
		@RequestParam(required = false) LocalDate from,
		@RequestParam(required = false) LocalDate to
	) {
		return ResponseEntity.ok(settlementService.getDailyContentSettlement(creatorId, contentId, from, to));
	}
	*/
}
