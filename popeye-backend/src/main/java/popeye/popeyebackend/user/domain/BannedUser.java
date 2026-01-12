package popeye.popeyebackend.user.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "banned_users")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BannedUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate unbannedAt;

    private String reason;

    private String hashedPhoneNumber;

    private LocalDate bannedAt;

    private Integer banDays;

    @OneToOne
    @JoinColumn(name = "ban_user")
    private User user;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private User admin;

    @Builder
    public BannedUser(LocalDate unbannedAt, String reason, String hashedPhoneNumber, LocalDate bannedAt, Integer banDays, User admin) {
        this.unbannedAt = unbannedAt;
        this.reason = reason;
        this.hashedPhoneNumber = hashedPhoneNumber;
        this.bannedAt = bannedAt;
        this.banDays = banDays;
        this.admin = admin;
    }

    public boolean isUnbanned () {
        return unbannedAt.isBefore(LocalDate.now());
    }
}
