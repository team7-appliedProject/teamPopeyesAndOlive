package popeye.popeyebackend.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.dto.ChargeRequestDto;
import popeye.popeyebackend.dto.ChargeResponseDto;
import popeye.popeyebackend.entity.User;
import popeye.popeyebackend.repository.UserRepository;
import popeye.popeyebackend.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final UserRepository userRepository;
    /**
     * 별사탕 충전
     * POST /api/payments/charge
     */
    @Operation(
            summary = "별사탕 충전",
            description = "PG 결제가 완료되었다고 가정하고 유료 크레딧을 충전한다."
    )
    @PostMapping("/charge")
    public ResponseEntity<ChargeResponseDto> charge(
            @Valid @RequestBody ChargeRequestDto chargeRequestDto
            ){
        //임시 사용자
        User user = new User();
        user.setId(1L);

        Long paymentId = paymentService.chargePaidCredit(
                user,
                chargeRequestDto.getAmount(),
                chargeRequestDto.getPgProvider()
        );
        return ResponseEntity.ok(new ChargeResponseDto(paymentId));
    }

    /**
     * 결제 환불
     * POST /api/payments/{paymentId}/refund
     */
    @Operation(
            summary = "결제 환불",
            description = "결제 완료된 건에 대해 즉시 환불 처리한다."
    )
    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<Void> refund(@PathVariable Long paymentId){
        paymentService.refund(paymentId);
        return ResponseEntity.noContent().build();
    }
}
