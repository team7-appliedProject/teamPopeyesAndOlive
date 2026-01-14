package popeye.popeyebackend.pay.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import popeye.popeyebackend.pay.domain.Credit;
import popeye.popeyebackend.pay.domain.Payment;
import popeye.popeyebackend.pay.dto.payment.PreparePaymentResponseDto;
import popeye.popeyebackend.pay.toss.TossPaymentsClient;
import popeye.popeyebackend.pay.toss.dto.confirm.TossConfirmResponseDto;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.pay.enums.CreditType;
import popeye.popeyebackend.pay.enums.PaymentType;
import popeye.popeyebackend.pay.enums.PgProvider;
import popeye.popeyebackend.pay.exception.ApiException;
import popeye.popeyebackend.pay.exception.ErrorCode;
import popeye.popeyebackend.pay.repository.CreditRepository;
import popeye.popeyebackend.pay.repository.PaymentRepository;


import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private static final int WON_PER_CREDIT = 10;

    private final PaymentRepository paymentRepository;
    private final CreditRepository creditRepository;
    private final TossPaymentsClient tossPaymentsClient;
    private final CreditHistoryService creditHistoryService;

    private String generatePgOrderId(){
        return "ORD_" + UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * 결제 준비: Payment(CREATED) 생성
     * - Toss 결제창 호출 전에 서버에 결제 의도를 저장하는 단계
     */
    @Transactional
    public PreparePaymentResponseDto prepareCharge(User user, int creditAmount, PgProvider pgProvider){

        if (creditAmount <= 0){
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }
        int amount = creditAmount * WON_PER_CREDIT;

        String pgOrderId = generatePgOrderId();

        Payment payment = Payment.builder()
                .user(user)
                .amount(amount)
                .creditAmount(creditAmount)
                .pgProvider(pgProvider)
                .pgOrderId(pgOrderId)
                .build();
        paymentRepository.save(payment);
        return new PreparePaymentResponseDto(payment.getId(), pgOrderId);
    }

    /**
     * 결제 승인 성공 반영:
     * - Payment: CREATED -> DONE
     * - Credit(PAID): Payment 1건당 1 row 생성 (amount=creditAmount)
     */
    @Transactional
    public void confirmCharge(String pgOrderId, String paymentKey, int amount){
        Payment payment = paymentRepository.findByPgOrderId(pgOrderId)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

        // 멱등성1: 이미 승인(DONE)된 결제면 중복 처리 방지
        if (payment.getPaymentType() == PaymentType.DONE){
            return;
        }

        // 멱등성2: 이미 해당 payment로 credit이 생성되어 있으면 중복 생성 방지
        if (creditRepository.existsByPayment_Id(payment.getId())){
            return;
        }

        // 1) 서버 저장값과 Client 전달 amount 1차 검증(변조 방지)
        if (payment.getAmount() != amount) {
            // 승인 실패(또는 변조)로 간주
            payment.abort("AMOUNT_MISMATCH");
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 2) Toss 승인 API 실제 호출
        TossConfirmResponseDto tossRes;
        try {
            tossRes = tossPaymentsClient.confirm(paymentKey, pgOrderId, amount);
        } catch (HttpStatusCodeException e) {
            payment.abort("TOSS_CONFIRM_FAILED: " + e.getResponseBodyAsString());
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 3) Toss 응답 기반 2차 검증
        if (tossRes == null || tossRes.getTotalAmount() == null || tossRes.getTotalAmount() != amount) {
            payment.abort("TOSS_AMOUNT_MISMATCH");
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 4) 승인 성공 반영: Payment CREATED -> DONE
        String receiptUrl = (tossRes.getReceipt() != null) ? tossRes.getReceipt().getUrl() : null;
        payment.approve(paymentKey, receiptUrl);

        Credit credit = Credit.builder()
                .user(payment.getUser())
                .payment(payment)
                .creditType(CreditType.PAID)
                .amount(payment.getCreditAmount())
                .expiredAt(null)
                .build();
        creditRepository.save(credit);
    }

    /**
     * 결제 승인 실패 반영:
     * - Payment: CREATED -> ABORTED
     * - Credit 생성 없음
     */
    @Transactional
    public void abortCharge(Long paymentId, String reason){
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));
        payment.abort(reason);
    }

    /**
    * 환불:
    * - 조건: Payment DONE + "사용 이력 없는 경우" (전액 환불)
    * - 처리: Payment -> CANCELED, 해당 PAID Credit amount = 0
    */
    @Transactional
    public void refund(Long paymentId, String cancelReason){
        Payment payment = paymentRepository
                .findByIdAndPaymentType(paymentId, PaymentType.DONE)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

        // 멱등성1: 이미 환불 완료면 성공 처리
        if (payment.getPaymentType() == PaymentType.CANCELED){
            return;
        }

        // 멱등성2: 환불 가능한 상태 검증
        if (payment.getPaymentType() != PaymentType.DONE){
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 데이터 무결성 체크
        if (payment.getPaymentKey() == null){
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 크레딧 상태 체크
        Credit credit = creditRepository.findByPayment_Id(paymentId)
                        .orElseThrow(() -> new ApiException(ErrorCode.INVALID_REQUEST));

        // 크레딧 수량이 결제 당시와 다르다면 이미 사용한 것으로 간주
        if (credit.getAmount() != payment.getCreditAmount()) {
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 7일 이내 환불 가능 여부 체크 (7일 이후는 수동 처리)
        LocalDateTime deadline = credit.getPaidAt().plusDays(7);
        if (LocalDateTime.now().isAfter(deadline)){
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 1) PG 취소 먼저 호출 (성공해야만 로컬 상태 변경)
        try {
            tossPaymentsClient.cancel(payment.getPaymentKey(), "사용자 요청 환불"); // cancelReason 필수 :contentReference[oaicite:8]{index=8}
        } catch (HttpStatusCodeException e) {
            payment.abort("TOSS_CANCEL_FAILED: " + e.getResponseBodyAsString());
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 2) PG 취소 성공 후에만 로컬 상태 변경
        credit.zeroize();
        payment.cancel();
    }


}
