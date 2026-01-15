package popeye.popeyebackend.pay.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.pay.domain.CreditHistory;
import popeye.popeyebackend.pay.enums.CreditType;
import popeye.popeyebackend.pay.enums.ReasonType;
import popeye.popeyebackend.pay.repository.CreditHistoryRepository;
import popeye.popeyebackend.user.domain.User;

@Service
@RequiredArgsConstructor
public class CreditHistoryService {
    private final CreditHistoryRepository creditHistoryRepository;

    @Transactional
    public void record(User user,
                       CreditType creditType,
                       ReasonType reasonType,
                       int delta,
                       Long orderId,
                       Long paymentId){
        CreditHistory history = CreditHistory.builder()
                .user(user)
                .creditType(creditType)
                .reasonType(reasonType)
                .delta(delta)
                .orderId(orderId)
                .paymentId(paymentId)
                .build();
        creditHistoryRepository.save(history);
    }
}
