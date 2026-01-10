package popeye.popeyebackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "devil_users")
@NoArgsConstructor
public class DevilUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private Long blockedDays = 0L;

    @Column
    private Integer devilCount = 0;

    @Column
    private String hashedPhoneNumber;

    public void plusBlockedDays(int days) {
        this.blockedDays += days;
    }

    public void plusDevilCount() {
        this.devilCount++;
    }
}