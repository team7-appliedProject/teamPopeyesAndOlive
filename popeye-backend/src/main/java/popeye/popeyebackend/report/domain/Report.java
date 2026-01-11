package popeye.popeyebackend.report.domain;

import jakarta.persistence.*;
import lombok.Getter;
import popeye.popeyebackend.user.domain.User;

@Entity
@Getter
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String reportDescription;

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = true)
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "target_user_id", nullable = false)
    private User reported;
}
