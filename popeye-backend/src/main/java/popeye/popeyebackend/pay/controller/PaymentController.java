package popeye.popeyebackend.pay.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.global.security.details.PrincipalDetails;
import popeye.popeyebackend.pay.dto.payment.ChargeRequestDto;
import popeye.popeyebackend.pay.dto.payment.ConfirmPaymentRequestDto;
import popeye.popeyebackend.pay.dto.payment.PreparePaymentResponseDto;
import popeye.popeyebackend.pay.dto.payment.RefundRequestDto;


import popeye.popeyebackend.pay.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    /**
     * 결제 준비
     * POST /api/payments/prepare
     */
    @PostMapping("/prepare")
    public ResponseEntity<PreparePaymentResponseDto> prepare(
            @AuthenticationPrincipal PrincipalDetails principalDetails,
            @Valid @RequestBody ChargeRequestDto chargeRequestDto
            ){

        Long userId = principalDetails.getUserId();

        PreparePaymentResponseDto responseDto = paymentService.prepareCharge(
                userId,
                chargeRequestDto.getCreditAmount(),
                chargeRequestDto.getPgProvider()
        );

        return ResponseEntity.ok(responseDto);
    }

    /**
     * 결제 승인 반영(성공:DONE + PAID Credit 1 row)
     * POST /api/payments/confirm
     */
    @PostMapping("/confirm")
    public ResponseEntity<Void> confirm(
            @Valid @RequestBody ConfirmPaymentRequestDto confirmPaymentRequestDto
            ){

        paymentService.confirmCharge(
                confirmPaymentRequestDto.getPgOrderId(),
                confirmPaymentRequestDto.getPaymentKey(),
                confirmPaymentRequestDto.getAmount()
        );
        return ResponseEntity.noContent().build();
    }

    /**
     * 결제 환불
     * POST /api/payments/{paymentId}/refund
     */
    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<Void> refund(@PathVariable Long paymentId,
                                       @Valid @RequestBody RefundRequestDto refundRequestDto,
                                       @AuthenticationPrincipal PrincipalDetails principalDetails
                                       ){

       Long userId = principalDetails.getUserId();

        paymentService.refund(paymentId, refundRequestDto.getCancelReason(), userId);
        return ResponseEntity.noContent().build();
    }
}
