package popeye.popeyebackend.pay.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.pay.dto.ChargeRequestDto;
import popeye.popeyebackend.pay.dto.ConfirmPaymentRequestDto;
import popeye.popeyebackend.pay.dto.PreparePaymentResponseDto;
import popeye.popeyebackend.pay.dto.RefundRequestDto;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.UserRepository;
import popeye.popeyebackend.pay.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final UserRepository userRepository;
    /**
     * 결제 준비
     * POST /api/payments/prepare
     */
    @PostMapping("/prepare")
    public ResponseEntity<PreparePaymentResponseDto> prepare(
            @Valid @RequestBody ChargeRequestDto chargeRequestDto
            ){
        //임시 사용자
        User user = userRepository.findById(1L).orElseThrow();

        PreparePaymentResponseDto responseDto = paymentService.prepareCharge(
                user,
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
                                       @Valid @RequestBody RefundRequestDto refundRequestDto){
        paymentService.refund(paymentId, refundRequestDto.getCancelReason());
        return ResponseEntity.noContent().build();
    }
}
