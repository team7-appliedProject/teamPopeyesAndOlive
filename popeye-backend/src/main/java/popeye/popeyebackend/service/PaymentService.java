package popeye.popeyebackend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.entity.Credit;
import popeye.popeyebackend.entity.Payment;
import popeye.popeyebackend.entity.User;
import popeye.popeyebackend.enums.CreditType;
import popeye.popeyebackend.enums.PaymentType;
import popeye.popeyebackend.enums.PgProvider;
import popeye.popeyebackend.exception.ApiException;
import popeye.popeyebackend.exception.ErrorCode;
import popeye.popeyebackend.repository.CreditRepository;
import popeye.popeyebackend.repository.PaymentRepository;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final CreditRepository creditRepository;

    //별사탕 충전
    @Transactional
    public Long chargePaidCredit(User user, int amount, PgProvider pgProvider){

        if (amount <= 0){
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }
        Payment payment = Payment.builder()
                .user(user)
                .amount(amount)
                .pgProvider(pgProvider)
                .paymentType(PaymentType.UNKNOWN)
                .build();
        paymentRepository.save(payment);

        payment.complete();

        Credit credit = Credit.builder()
                .user(user)
                .creditType(CreditType.PAID)
                .amount(amount)
                .expiredAt(null)
                .build();

        creditRepository.save(credit);

        return payment.getId();
    }

    //결제 환불
    @Transactional
    public void refund(Long paymentId){
        Payment payment = paymentRepository
                .findByIdAndPaymentType(paymentId, PaymentType.DONE)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

        //사용자 PAID 크레딧 중 가장 최근 것 조회
        List<Credit> paidCredits = creditRepository.findByUserId(payment.getUser().getId());
        Credit refundTarget = paidCredits.stream()
                .filter(c -> c.getCreditType() == CreditType.PAID)
                .max(Comparator.comparing(Credit::getPaidAt))
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_ENOUGH_CREDIT));

        creditRepository.delete(refundTarget);

        payment.cancel();
    }
}
