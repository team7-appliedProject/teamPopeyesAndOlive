package popeye.popeyebackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "daily_statistics")
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class DailyStatistics {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @Builder.Default
    private LocalDate date = LocalDate.now().minusDays(1);

    private Long dailyPaymentAmount;

    private Long dailySettlementAmount;

    private Long dailyNetRevenue;

    private Long dailyNewUserCount;

    private Long dailySpinachIssued;

    private Long totalSpinachIssued;

    private Long dailySpinachUsed;

    private Long totalStarcandy;
}
