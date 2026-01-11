package popeye.popeyebackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import popeye.popeyebackend.enums.PaymentType;
import popeye.popeyebackend.enums.PgProvider;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int amount;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

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

    @PrePersist
    void prePersist(){
        this.createdAt = LocalDateTime.now();
        this.paymentType = PaymentType.UNKNOWN;
    }

    public void complete(){
        this.paymentType = PaymentType.DONE;
    }
    public void cancel(){
        this.paymentType = PaymentType.CANCELED;
    }
}
