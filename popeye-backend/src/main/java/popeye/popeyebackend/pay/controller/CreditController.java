package popeye.popeyebackend.pay.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.global.security.details.PrincipalDetails;
import popeye.popeyebackend.pay.dto.credit.CreditHistoryItemResponseDto;
import popeye.popeyebackend.pay.service.CreditHistoryQueryService;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
public class CreditController {

    private final CreditHistoryQueryService creditHistoryQueryService;

    @GetMapping("/histories/me")
    public ResponseEntity<Page<CreditHistoryItemResponseDto>> myHistories(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            Pageable pageable
    ) {
        Long userId = principalDetails.getUserId();
        return ResponseEntity.ok(creditHistoryQueryService.getMyHistory(userId, pageable));
    }
}
