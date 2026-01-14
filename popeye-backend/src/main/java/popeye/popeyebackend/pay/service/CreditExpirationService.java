package popeye.popeyebackend.pay.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.pay.repository.CreditRepository;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreditExpirationService {
    private final CreditRepository creditRepository;

    @Transactional
    public int expireFreeCreditsNow() {
        LocalDateTime now = LocalDateTime.now();
        int updated = creditRepository.expireFreeCredits(now);
        log.info("만료된 무료 크레딧 {}", updated);
        return updated;
    }
}
