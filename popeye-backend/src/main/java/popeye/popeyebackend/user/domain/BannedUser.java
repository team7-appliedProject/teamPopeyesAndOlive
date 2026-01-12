package popeye.popeyebackend.user.domain;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "banned_users")
public class BannedUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate unbannedAt = LocalDate.now().plusMonths(1);

    private String hashedPhoneNumber;
}
