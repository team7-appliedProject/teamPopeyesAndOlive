package popeye.popeyebackend.pay.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.global.exception.ApiException;
import popeye.popeyebackend.global.exception.ErrorCode;
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
            // @AuthenticationPrincipal PrincipalDetails principalDetails, // 추후 사용 예정
            @Valid @RequestBody ChargeRequestDto chargeRequestDto
            ){

        // 임시: 인증 시스템 완성 전까지 임시 userId 사용
        Long userId = 1L; // TODO: 인증 시스템 완성 후 principalDetails.getUserId()로 변경
        // Long userId = principalDetails.getUserId();

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
        
        // amount 검증: null이 아니고 10 미만이면 에러
        if (confirmPaymentRequestDto.getAmount() != null && confirmPaymentRequestDto.getAmount() < 10) {
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        try {
            paymentService.confirmCharge(
                    confirmPaymentRequestDto.getPgOrderId(),
                    confirmPaymentRequestDto.getPaymentKey(),
                    confirmPaymentRequestDto.getAmount()
            );
        } catch (ApiException e) {
            // 에러를 그대로 전달
            throw e;
        } catch (Exception e) {
            // 예상치 못한 에러
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }
        
        return ResponseEntity.noContent().build();
    }

    /**
     * 결제 환불
     * POST /api/payments/{paymentId}/refund
     */
    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<Void> refund(@PathVariable Long paymentId,
                                       @Valid @RequestBody RefundRequestDto refundRequestDto
                                       // @AuthenticationPrincipal PrincipalDetails principalDetails // 추후 사용 예정
                                       ){

        // 임시: 인증 시스템 완성 전까지 임시 userId 사용
        Long userId = 1L; // TODO: 인증 시스템 완성 후 principalDetails.getUserId()로 변경
        // Long userId = principalDetails.getUserId();

        paymentService.refund(paymentId, refundRequestDto.getCancelReason(), userId);
        return ResponseEntity.noContent().build();
    }
}
