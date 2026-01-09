package popeye.popeyebackend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "banned_users")
public class BannedUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime unbannedAt = LocalDateTime.now().plusMonths(1);

    private String hashedPhoneNumber;
}
