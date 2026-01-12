package popeye.popeyebackend.pay.domain;

import jakarta.persistence.*;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.pay.enums.CreditType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "credits")
public class Credit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private CreditType creditType;
    private int amount;
    private LocalDate expiredAt;
    private LocalDateTime paidAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
