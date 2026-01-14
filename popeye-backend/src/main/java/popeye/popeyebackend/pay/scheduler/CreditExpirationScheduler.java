package popeye.popeyebackend.pay.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import popeye.popeyebackend.pay.service.CreditExpirationService;

@Slf4j
@Component
@RequiredArgsConstructor
public class CreditExpirationScheduler {
    private final CreditExpirationService creditExpirationService;

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul") // 초 분 시 일 월 요일
    public void expireFreeCreditsDaily(){
        log.info("크레딧 만료 스케줄러 시작");
        int updated = creditExpirationService.expireFreeCreditsNow();
        log.info("크레딧 만료 처리 완료. 총 {}건의 크레딧 만료됨.", updated);
    }
}
