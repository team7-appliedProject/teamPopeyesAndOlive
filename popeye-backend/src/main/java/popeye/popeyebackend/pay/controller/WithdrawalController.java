package popeye.popeyebackend.pay.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import popeye.popeyebackend.pay.dto.withdrawal.WithdrawalRequest;
import popeye.popeyebackend.pay.dto.withdrawal.WithdrawalResponse;
import popeye.popeyebackend.pay.service.WithdrawalService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/creators/{creatorId}/withdrawals")
public class WithdrawalController {

	private final WithdrawalService withdrawalService;

	/**
	 * 출금 신청
	 */
	@PostMapping
	public ResponseEntity<WithdrawalResponse> requestWithdrawal(
		// @AuthenticationPrincipal PrincipalDetails userDetails,
		@PathVariable Long creatorId,
		@Valid @RequestBody WithdrawalRequest request
	) {
		// Long loginUserId = userDetails.getUserId();
		Long loginUserId = 1L;

		return ResponseEntity.ok(withdrawalService.requestWithdrawal(loginUserId, creatorId, request));
	}

	/**
	 * 크리에이터의 출금 내역 조회 (월 기반 + 페이지네이션)
	 */
	@GetMapping
	public ResponseEntity<Page<WithdrawalResponse>> getWithdrawals(
		// @AuthenticationPrincipal PrincipalDetails userDetails,
		@PathVariable Long creatorId,
		@RequestParam(required = false) String month,
		@RequestParam(defaultValue = "0") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		// Long loginUserId = userDetails.getUserId();
		Long loginUserId = 1L;

		PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "requestedAt"));
		return ResponseEntity.ok(withdrawalService.getWithdrawals(loginUserId, creatorId, month, pageable));
	}
}
