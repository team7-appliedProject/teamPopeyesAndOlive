package popeye.popeyebackend.pay.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import popeye.popeyebackend.global.security.details.PrincipalDetails;
import popeye.popeyebackend.pay.dto.settlement.AvailableBalanceResponse;
import popeye.popeyebackend.pay.dto.settlement.ContentSettlementSummaryResponse;
import popeye.popeyebackend.pay.dto.settlement.DailyContentSettlementResponse;
import popeye.popeyebackend.pay.service.SettlementService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/creators/{creatorId}/settlements")
public class SettlementController {

	private final SettlementService settlementService;

	@GetMapping("/available-balance")
	public ResponseEntity<AvailableBalanceResponse> getAvailableBalance(
		 @AuthenticationPrincipal PrincipalDetails userDetails,
		@PathVariable Long creatorId
	) {
		 Long loginUserId = userDetails.getUserId();

		return ResponseEntity.ok(settlementService.getAvailableBalance(loginUserId, creatorId));
	}

	@GetMapping("/by-content")
	public ResponseEntity<List<ContentSettlementSummaryResponse>> getContentSettlementSummaries(
		 @AuthenticationPrincipal PrincipalDetails userDetails,
		@PathVariable Long creatorId
	) {
		 Long loginUserId = userDetails.getUserId();

		return ResponseEntity.ok(settlementService.getContentSettlementSummaries(loginUserId, creatorId));
	}

	@GetMapping("/contents/{contentId}")
	public ResponseEntity<DailyContentSettlementResponse> getMonthlyContentSettlement(
		 @AuthenticationPrincipal PrincipalDetails userDetails,
		@PathVariable Long creatorId,
		@PathVariable Long contentId,
		@RequestParam String month
	) {
		 Long loginUserId = userDetails.getUserId();

		return ResponseEntity.ok(
			settlementService.getMonthlyContentSettlement(loginUserId, creatorId, contentId, month)
		);
	}
}
