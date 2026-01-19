package popeye.popeyebackend.pay.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.pay.domain.Credit;
import popeye.popeyebackend.pay.enums.CreditType;
import popeye.popeyebackend.pay.enums.ReasonType;
import popeye.popeyebackend.pay.repository.CreditRepository;
import popeye.popeyebackend.user.domain.User;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FreeCreditPolicyService {
    private static final int FREE_CREDIT_EXPIRE_DAYS = 7;
    private final CreditRepository creditRepository;
    private final CreditHistoryService creditHistoryService;

    @Transactional
    public Credit grantFreeCredit(User user, int amount){
        if (amount <= 0){
            throw new IllegalArgumentException("무료 크레딧 금액은 0보다 커야 합니다.");
        }

        LocalDateTime now = LocalDateTime.now();

        Credit credit = Credit.builder()
                .user(user)
                .creditType(CreditType.FREE)
                .amount(amount)
                .expiredAt(now.plusDays(FREE_CREDIT_EXPIRE_DAYS))
                .build();


        Credit saved = creditRepository.save(credit);

        creditHistoryService.record(
                user,
                CreditType.FREE,
                ReasonType.CHARGE,
                amount,
                null,
                null
        );
        user.increaseFreeCredit(amount);

        return saved;
    }
}
