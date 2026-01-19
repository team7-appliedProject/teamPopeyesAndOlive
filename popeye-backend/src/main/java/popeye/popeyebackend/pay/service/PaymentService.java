package popeye.popeyebackend.pay.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import popeye.popeyebackend.global.exception.ErrorCode;
import popeye.popeyebackend.pay.domain.Credit;
import popeye.popeyebackend.pay.domain.Payment;
import popeye.popeyebackend.pay.dto.payment.PreparePaymentResponseDto;
import popeye.popeyebackend.pay.enums.ReasonType;
import popeye.popeyebackend.pay.toss.TossPaymentsClient;
import popeye.popeyebackend.pay.toss.dto.confirm.TossConfirmResponseDto;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.pay.enums.CreditType;
import popeye.popeyebackend.pay.enums.PaymentType;
import popeye.popeyebackend.pay.enums.PgProvider;
import popeye.popeyebackend.global.exception.ApiException;
import popeye.popeyebackend.pay.repository.CreditRepository;
import popeye.popeyebackend.pay.repository.PaymentRepository;
import popeye.popeyebackend.user.service.UserService;


import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private static final int WON_PER_CREDIT = 10;

    private final PaymentRepository paymentRepository;
    private final CreditRepository creditRepository;
    private final TossPaymentsClient tossPaymentsClient;
    private final CreditHistoryService creditHistoryService;
    private final UserService userService;

    private String generatePgOrderId(){
        return "ORD_" + UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * 결제 준비: Payment(CREATED) 생성
     * - Toss 결제창 호출 전에 서버에 결제 의도를 저장하는 단계
     */
    @Transactional
    public PreparePaymentResponseDto prepareCharge(Long userId, int creditAmount, PgProvider pgProvider){

        User user = userService.getUser(userId);

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
    public void confirmCharge(String pgOrderId, String paymentKey, Integer amount){
        log.info("결제 승인 시작: pgOrderId={}, paymentKey={}, amount={}", pgOrderId, paymentKey, amount);
        
        Payment payment = paymentRepository.findByPgOrderId(pgOrderId)
                .orElseThrow(() -> {
                    log.error("Payment를 찾을 수 없음: pgOrderId={}", pgOrderId);
                    return new ApiException(ErrorCode.PAYMENT_NOT_FOUND);
                });

        log.info("Payment 조회 성공: paymentId={}, paymentType={}, amount={}", 
                payment.getId(), payment.getPaymentType(), payment.getAmount());

        // 멱등성1: 이미 승인(DONE)된 결제면 중복 처리 방지
        if (payment.getPaymentType() == PaymentType.DONE){
            log.info("이미 승인된 결제: paymentId={}", payment.getId());
            return;
        }

        // 멱등성2: 이미 해당 payment로 credit이 생성되어 있으면 중복 생성 방지
        if (creditRepository.existsByPayment_Id(payment.getId())){
            log.info("이미 Credit이 생성된 결제: paymentId={}", payment.getId());
            return;
        }

        // amount가 전달되지 않으면 서버에 저장된 값 사용
        int finalAmount = (amount != null) ? amount : payment.getAmount();
        log.info("최종 금액: finalAmount={} (전달된 amount={}, 서버 저장 amount={})", 
                finalAmount, amount, payment.getAmount());
        
        // 1) 서버 저장값과 Client 전달 amount 1차 검증(변조 방지)
        // amount가 null이면 서버 값 사용하므로 항상 같아야 함
        if (amount != null && payment.getAmount() != finalAmount) {
            // 승인 실패(또는 변조)로 간주
            log.error("금액 불일치: server={}, client={}", payment.getAmount(), finalAmount);
            payment.abort("AMOUNT_MISMATCH: server=" + payment.getAmount() + ", client=" + finalAmount);
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 2) Toss 승인 API 실제 호출
        TossConfirmResponseDto tossRes;
        try {
            log.info("Toss 승인 API 호출: paymentKey={}, pgOrderId={}, amount={}", 
                    paymentKey, pgOrderId, finalAmount);
            tossRes = tossPaymentsClient.confirm(paymentKey, pgOrderId, finalAmount);
            log.info("Toss 승인 API 성공: totalAmount={}", 
                    tossRes != null && tossRes.getTotalAmount() != null ? tossRes.getTotalAmount() : "null");
        } catch (HttpStatusCodeException e) {
            String errorBody = e.getResponseBodyAsString();
            log.error("Toss 승인 API 실패: status={}, body={}", 
                    e.getStatusCode(), errorBody);
            
            // "기존 요청을 처리중입니다" 에러인 경우, 이미 처리 중이므로 Payment 상태 확인
            if (errorBody != null && errorBody.contains("기존 요청을 처리중입니다")) {
                log.warn("Toss에서 '기존 요청을 처리중입니다' 에러 발생. Payment 상태 확인 후 처리");
                
                // 잠시 대기 후 Payment 상태 재확인
                try {
                    Thread.sleep(1000); // 1초 대기
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
                
                // Payment 상태 재확인
                Payment refreshedPayment = paymentRepository.findByPgOrderId(pgOrderId)
                        .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));
                
                // 이미 승인되었으면 성공으로 처리
                if (refreshedPayment.getPaymentType() == PaymentType.DONE) {
                    log.info("Payment가 이미 승인됨. 성공으로 처리");
                    return; // 이미 처리되었으므로 종료
                }
            }
            
            payment.abort("TOSS_CONFIRM_FAILED: " + errorBody);
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        } catch (Exception e) {
            log.error("Toss 승인 API 예외 발생", e);
            payment.abort("TOSS_CONFIRM_EXCEPTION: " + e.getMessage());
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 3) Toss 응답 기반 2차 검증
        if (tossRes == null || tossRes.getTotalAmount() == null || tossRes.getTotalAmount() != finalAmount) {
            log.error("Toss 응답 검증 실패: tossRes={}, totalAmount={}, expected={}", 
                    tossRes, tossRes != null ? tossRes.getTotalAmount() : "null", finalAmount);
            payment.abort("TOSS_AMOUNT_MISMATCH");
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 4) 승인 성공 반영: Payment CREATED -> DONE
        String receiptUrl = (tossRes.getReceipt() != null) ? tossRes.getReceipt().getUrl() : null;
        payment.approve(paymentKey, receiptUrl);

        User user = payment.getUser();
        user.increasePaidCredit(payment.getCreditAmount());

        Credit credit = Credit.builder()
                .user(payment.getUser())
                .payment(payment)
                .creditType(CreditType.PAID)
                .amount(payment.getCreditAmount())
                .expiredAt(null)
                .build();
        creditRepository.save(credit);


        creditHistoryService.record(
                payment.getUser(),
                CreditType.PAID,
                ReasonType.CHARGE,
                +payment.getCreditAmount(),
                null,
                payment.getId()
        );

    }



    /**
    * 환불:
    * - 조건: Payment DONE + "사용 이력 없는 경우" (전액 환불)
    * - 처리: Payment -> CANCELED, 해당 PAID Credit amount = 0
    */
    @Transactional
    public void refund(Long paymentId, String cancelReason, Long userId){
        Payment payment = paymentRepository
                .findByIdAndPaymentType(paymentId, PaymentType.DONE)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

        // 권한 체크
        if (!payment.getUser().getId().equals(userId)) {
            throw new ApiException(ErrorCode.HANDLE_ACCESS_DENIED);
        }

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
            tossPaymentsClient.cancel(payment.getPaymentKey(), cancelReason);
        } catch (HttpStatusCodeException e) {
            payment.abort("TOSS_CANCEL_FAILED: " + e.getResponseBodyAsString());
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        // 2) PG 취소 성공 후에만 로컬 상태 변경
        credit.zeroize();
        payment.cancel();

        User user = payment.getUser();
        user.decreasePaidCredit(payment.getCreditAmount());

        creditHistoryService.record(
                payment.getUser(),
                CreditType.PAID,
                ReasonType.REFUND,
                -payment.getCreditAmount(),
                null,
                payment.getId()
        );
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


}
