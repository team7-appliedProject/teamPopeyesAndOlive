package popeye.popeyebackend.content.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import popeye.popeyebackend.user.domain.User;

import java.time.LocalDate;
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
    private LocalDate releaseDate;

    private boolean isBanned = true;

    @ManyToOne(fetch = FetchType.LAZY)
    private User admin;

    @OneToOne
    @JoinColumn(name = "content_id")
    private Content content;

    @Builder
    public ContentBan(String reason, User admin) {
        this.reason = reason;
        this.admin = admin;
    }

    public void release() {
        this.releaseDate = LocalDate.now();
        this.isBanned = false;
    }
}
