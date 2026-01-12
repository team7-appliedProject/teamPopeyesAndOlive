package popeye.popeyebackend.batch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class Scheduler {

    private final JobLauncher jobRunner;
    private final Job statisticsJob;

    @Scheduled(cron = "0 10 0 * * *")
    public void runDailyStatistics() {
        try {
            JobParameters jobParameters = new JobParametersBuilder()
                    .addLong("time", System.currentTimeMillis())
                    .toJobParameters();

            jobRunner.run(statisticsJob, jobParameters);
        } catch (Exception e) {
            log.error("통계 배치 실패", e);
        }
    }
}
