package popeye.popeyebackend.batch.statistics;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.StepContribution;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.infrastructure.repeat.RepeatStatus;
import org.springframework.stereotype.Component;
import popeye.popeyebackend.dailystatistics.domain.DailyStatistics;
import popeye.popeyebackend.dailystatistics.repository.DailyStatisticsRepository;
import popeye.popeyebackend.pay.enums.CreditType;
import popeye.popeyebackend.pay.enums.PaymentType;
import popeye.popeyebackend.pay.repository.CreditRepository;
import popeye.popeyebackend.pay.repository.OrderRepository;
import popeye.popeyebackend.pay.repository.PaymentRepository;
import popeye.popeyebackend.pay.repository.SettlementRepository;
import popeye.popeyebackend.user.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DailyStatsTasklet implements Tasklet {

    private final PaymentRepository paymentRepository;
    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;
    private final CreditRepository creditRepository;
    private final DailyStatisticsRepository dailyStatisticsRepository;
    private final OrderRepository orderRepository;

    @Override
    public @Nullable RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime start = yesterday.atStartOfDay();
        LocalDateTime end = yesterday.atTime(23, 59, 59);

        // 당일 매출
        Long dailyPaymentAmount = paymentRepository.sumTotalAmountByDate(start, end, PaymentType.DONE);

        // 당일 정산
        Long dailySettlementAmount = settlementRepository.sumTotalAmountByDate(start, end);

        // 당일 신규 가입자
        Long newUsers = userRepository.countTotalAmountByDate(start, end);

        // 총 별사탕 유통량
        Long totalStarCandy = userRepository.sumTotalStarcandyAmount();

        // 총 시금치 유통량
        Long totalSpinachAmount = userRepository.sumTotalSpinachAmount();

        // 당일 시금치 유통량
        Long spinachAmount = creditRepository.sumDailySpinachAmountByDate(start, end, CreditType.FREE);

        // 당일 시금치 사용량 (만료 포함)
        Long dailySpinachUsed = orderRepository.sumDailySpinachUsedByDate(start, end);

        DailyStatistics statistics = DailyStatistics.builder()
                .dailyPaymentAmount(dailyPaymentAmount)
                .dailySettlementAmount(dailySettlementAmount)
                .dailyNetRevenue(dailyPaymentAmount - dailySettlementAmount)
                .dailyNewUserCount(newUsers)
                .dailySpinachIssued(spinachAmount)
                .totalSpinachIssued(totalSpinachAmount)
                .dailySpinachUsed(dailySpinachUsed)
                .totalStarcandy(totalStarCandy)
                .build();

        dailyStatisticsRepository.save(statistics);
        return RepeatStatus.FINISHED;
    }
}
