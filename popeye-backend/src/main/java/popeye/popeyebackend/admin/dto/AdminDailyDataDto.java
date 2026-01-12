package popeye.popeyebackend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import popeye.popeyebackend.dailystatistics.domain.DailyStatistics;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class AdminDailyDataDto {
    private LocalDate localDate;
    private Long dailyPaymentAmount;
    private Long dailySettlementAmount;
    private Long dailyNetRevenue;
    private Long dailyNewUserCount;
    private Long dailySpinachIssued;
    private Long totalSpinachIssued;
    private Long dailySpinachUsed;
    private Long totalStarcandy;

    public static AdminDailyDataDto from(DailyStatistics dailyStatistics){
        return new AdminDailyDataDto(
                dailyStatistics.getDate(),
                dailyStatistics.getDailyPaymentAmount(),
                dailyStatistics.getDailySettlementAmount(),
                dailyStatistics.getDailyNetRevenue(),
                dailyStatistics.getDailyNewUserCount(),
                dailyStatistics.getDailySpinachIssued(),
                dailyStatistics.getTotalSpinachIssued(),
                dailyStatistics.getDailySpinachUsed(),
                dailyStatistics.getTotalStarcandy()
        );
    }
}
