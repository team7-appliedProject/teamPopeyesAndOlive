package popeye.popeyebackend.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import popeye.popeyebackend.dailystatistics.domain.DailyStatistics;

import java.time.LocalDate;

@Schema(description = "일일 통계 자료")
public record AdminDailyDataDto(
        @Schema(description = "해당 일자")
        LocalDate localDate,
        @Schema(description = "일일 매출")
        Long dailyPaymentAmount,
        @Schema(description = "일일 정산 내역")
        Long dailySettlementAmount,
        @Schema(description = "일일 순수익")
        Long dailyNetRevenue,
        @Schema(description = "일일 신규 유저")
        Long dailyNewUserCount,
        @Schema(description = "일일 무료 재화 발행량")
        Long dailySpinachIssued,
        @Schema(description = "총 무료 재화 발행량")
        Long totalSpinachIssued,
        @Schema(description = "일일 무료 재화 사용량")
        Long dailySpinachUsed,
        @Schema(description = "총 유료 재화 발행량")
        Long totalStarcandy
) {


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
