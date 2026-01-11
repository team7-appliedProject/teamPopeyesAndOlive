package popeye.popeyebackend.report.domain;

import jakarta.persistence.*;
import popeye.popeyebackend.user.domain.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String reason;
    private LocalDateTime createTime;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "reported_id")
    private User reported;
}
