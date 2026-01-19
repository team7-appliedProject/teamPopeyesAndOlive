package popeye.popeyebackend.report.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.report.enums.ReportState;
import popeye.popeyebackend.report.enums.TargetType;
import popeye.popeyebackend.user.domain.User;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reportDescription;

    @Enumerated(EnumType.STRING)
    private ReportState state = ReportState.REQUESTED;

    @Enumerated(EnumType.STRING)
    private TargetType targetType;

    private LocalDateTime reportAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = true)
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "target_content", nullable = true)
    private Content targetContent;

    @Builder
    public Report(String reportDescription, TargetType targetType, User reporter, Content targetContent) {
        this.reportDescription = reportDescription;
        this.targetType = targetType;
        this.reporter = reporter;
        this.targetContent = targetContent;
    }

    // 추 후 report reply기능 추가


    public void setReportState(ReportState reportState) {
        this.state = reportState;
    }
}
