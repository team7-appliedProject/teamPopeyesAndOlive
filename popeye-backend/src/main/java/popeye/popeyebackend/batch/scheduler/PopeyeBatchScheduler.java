package popeye.popeyebackend.batch.scheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import popeye.popeyebackend.pay.service.CreditExpirationService;

/**
 * 정산 배치 스케줄러
 * 매일 자정 KST에 전날 주문 정산 실행
 * JobParameters로 날짜 범위 전달
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PopeyeBatchScheduler {

	private final JobLauncher jobLauncher;
	private final Job settlementJob;
    private final Job statisticsJob;

    private final CreditExpirationService creditExpirationService;


    private static final ZoneId ZONE = ZoneId.of("Asia/Seoul");
	private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
	private static final double FEE_RATE = 0.10;

	/**
	 * 매일 자정(00:00) KST에 전날 주문 정산 실행
	 */
	@Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
	public void runDailySettlement() {
		log.info("Daily settlement batch started");

		try {
			// 어제 날짜 범위 계산
			LocalDate today = LocalDate.now(ZONE);
			LocalDateTime from = today.minusDays(1).atStartOfDay();
			LocalDateTime to = today.atStartOfDay();

			// JobParameters 생성
			// run.id는 나노초 기반으로 생성하여 동일 밀리초 실행 시 충돌 방지
			JobParameters jobParameters = new JobParametersBuilder()
				.addString("fromDate", from.format(FORMATTER))
				.addString("toDate", to.format(FORMATTER))
				.addString("feeRate", String.valueOf(FEE_RATE))
				.addLong("run.id", System.nanoTime())
				.toJobParameters();

			// Job 실행
			jobLauncher.run(settlementJob, jobParameters);

			log.info("Daily settlement batch completed successfully");
		} catch (Exception e) {
			log.error("Daily settlement batch failed", e);
			throw new RuntimeException("Settlement batch failed", e);
		}
	}

    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul") // 초 분 시 일 월 요일
    public void expireFreeCreditsDaily(){
        log.info("무료 크레딧 만료 스케줄러 시작");
        int updated = creditExpirationService.expireFreeCreditsNow();
        log.info("크레딧 만료 처리 완료. 업데이트된 행 개수= {}", updated);
    }

    @Scheduled(cron = "0 10 0 * * *")
    public void runDailyStatistics() {
        try {
            JobParameters jobParameters = new JobParametersBuilder()
                    .addLong("time", System.currentTimeMillis())
                    .toJobParameters();

            jobLauncher.run(statisticsJob, jobParameters);
        } catch (Exception e) {
            log.error("통계 배치 실패", e);
        }
    }
}





