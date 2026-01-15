package popeye.popeyebackend.pay.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.pay.domain.Credit;
import popeye.popeyebackend.pay.enums.CreditType;
import popeye.popeyebackend.pay.enums.ReasonType;
import popeye.popeyebackend.pay.repository.CreditRepository;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreditExpirationService {
    private final CreditRepository creditRepository;
    private final CreditHistoryService creditHistoryService;

    @Transactional
    public int expireFreeCreditsNow() {
        LocalDateTime now = LocalDateTime.now();

        List<Credit> targets = creditRepository.findExpiredFreeCredits(now);

        for (Credit credit : targets){
            int expiredAmount = credit.getAmount();
            if (expiredAmount <= 0) continue;

            creditHistoryService.record(
                    credit.getUser(),
                    CreditType.FREE,
                    ReasonType.EXPIRE,
                    -expiredAmount,
                    null,
                    null
            );
            credit.zeroize();
        }
        log.info("만료된 무료 크레딧 행={}", targets.size());
        return targets.size();
    }
}
