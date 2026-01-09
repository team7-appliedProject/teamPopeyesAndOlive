package popeye.popeyebackend.entity;

import ch.qos.logback.core.status.Status;
import jakarta.persistence.*;
import popeye.popeyebackend.enums.PaymentType;
import popeye.popeyebackend.enums.PgProvider;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int amount;
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(name = "pg_provider")
    private PgProvider pgProvider;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "receipt_url")
    private String receipt;
}
