package popeye.popeyebackend.user.domain;

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

    private LocalDateTime blockedAt;

    @Column
    private Integer devilCount;

    @Column
    private String hashedPhoneNumber;
}