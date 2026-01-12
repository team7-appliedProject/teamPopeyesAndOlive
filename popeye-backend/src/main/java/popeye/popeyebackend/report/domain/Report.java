package popeye.popeyebackend.report.domain;

import jakarta.persistence.*;
import lombok.Getter;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.report.enums.ReportState;
import popeye.popeyebackend.report.enums.TargetType;
import popeye.popeyebackend.user.domain.User;

@Entity
@Getter
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String reportDescription;

    @Enumerated(EnumType.STRING)
    private ReportState state = ReportState.REQUESTED;

    @Enumerated(EnumType.STRING)
    private TargetType targetType;

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = true)
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "target_content", nullable = true)
    private Content targetContent;

    // 추 후 report reply기능 추가


    public void setReportState(ReportState reportState) {
        this.state = reportState;
    }
}
