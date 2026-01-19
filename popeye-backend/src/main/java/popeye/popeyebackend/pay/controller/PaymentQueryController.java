package popeye.popeyebackend.pay.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.global.security.details.PrincipalDetails;
import popeye.popeyebackend.pay.dto.payment.PaymentListItemResponseDto;
import popeye.popeyebackend.pay.service.PaymentQueryService;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentQueryController {

    private final PaymentQueryService paymentQueryService;

    @GetMapping("/me")
    public ResponseEntity<Page<PaymentListItemResponseDto>> myPayments(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            Pageable pageable
    ) {
        Long userId = principalDetails.getUserId();
        return ResponseEntity.ok(paymentQueryService.getMyPayments(userId, pageable));
    }
}
