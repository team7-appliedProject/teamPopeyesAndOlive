package popeye.popeyebackend.content.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import popeye.popeyebackend.user.domain.User;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class ContentBan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reason;
    private LocalDateTime date = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    private User admin;

    @Builder
    public ContentBan(String reason, User admin) {
        this.reason = reason;
        this.admin = admin;
    }
}
