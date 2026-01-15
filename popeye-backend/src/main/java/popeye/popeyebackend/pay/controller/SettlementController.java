package popeye.popeyebackend.pay.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import popeye.popeyebackend.pay.dto.settlement.AvailableBalanceResponse;
import popeye.popeyebackend.pay.service.SettlementService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/creators/{creatorId}/settlements")
public class SettlementController {

	private final SettlementService settlementService;

	@GetMapping("/available-balance")
	public ResponseEntity<AvailableBalanceResponse> getAvailableBalance(
		// @AuthenticationPrincipal PrincipalDetails userDetails,
		@PathVariable Long creatorId) {
		// Long loginUserId = userDetails.getUserId();
		Long loginUserId = 1L;

		return ResponseEntity.ok(settlementService.getAvailableBalance(loginUserId, creatorId));
	}
}