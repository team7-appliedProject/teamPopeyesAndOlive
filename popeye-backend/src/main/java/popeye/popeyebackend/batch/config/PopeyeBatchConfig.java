package popeye.popeyebackend.batch.config;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import lombok.RequiredArgsConstructor;
import popeye.popeyebackend.batch.settlement.dto.SettlementItemDto;
import popeye.popeyebackend.batch.settlement.processor.SettlementBatchProcessor;
import popeye.popeyebackend.batch.settlement.reader.SettlementBatchReader;
import popeye.popeyebackend.batch.settlement.writer.SettlementBatchWriter;
import popeye.popeyebackend.batch.statistics.DailyStatsTasklet;
import popeye.popeyebackend.pay.repository.projection.SettlementAggregateProjection;

/**
 * 정산 배치 Job/Step 정의
 * 비즈니스 로직은 Reader/Processor/Writer에 위임
 */
@Configuration
@RequiredArgsConstructor
public class PopeyeBatchConfig {

	private final JobRepository jobRepository;
	private final PlatformTransactionManager transactionManager;
	private final SettlementBatchReader settlementBatchReader;
	private final SettlementBatchProcessor settlementBatchProcessor;
	private final SettlementBatchWriter settlementBatchWriter;

    private final DailyStatsTasklet dailyStatsTasklet;


    @Bean
	public Job settlementJob() {
		return new JobBuilder("settlementJob", jobRepository)
			.start(settlementStep())
			.build();
	}

	@Bean
	public Step settlementStep() {
		return new StepBuilder("settlementStep", jobRepository)
			.<SettlementAggregateProjection, SettlementItemDto>chunk(100, transactionManager)
			.reader(settlementBatchReader)
			.processor(settlementBatchProcessor)
			.writer(settlementBatchWriter)
			.build();
	}

    @Bean
    public Job statisticsJob() {
        return new JobBuilder("statisticsJob", jobRepository)
                .start(statisticsStep())
                .build();
    }

    @Bean
    public Step statisticsStep() {
        return new StepBuilder("statisticsStep", jobRepository)
                .tasklet(dailyStatsTasklet, transactionManager)
                .build();
    }
}
