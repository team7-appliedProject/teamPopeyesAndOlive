package popeye.popeyebackend.pay.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.pay.enums.PaymentType;
import popeye.popeyebackend.pay.enums.PgProvider;

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

    @Column(name = "credit_amount")
    private int creditAmount;

    @Column(name = "payment_key")
    private String paymentKey;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "pg_provider")
    private PgProvider pgProvider;

    @Column(name = "pg_order_id", nullable = false, unique = true, updatable = false)
    private String pgOrderId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    @Column(name = "receipt_url")
    private String receipt;

    @Column(name = "failure_reason")
    private String failureReason;

    @PrePersist
    void prePersist(){
        this.createdAt = LocalDateTime.now();
        this.paymentType = PaymentType.CREATED;
    }

    public void approve(String paymentKey, String receipt){
        if (this.paymentType != PaymentType.CREATED){
            throw new IllegalStateException("CREATED 상태에서만 결제 승인 가능");
        }
        this.paymentKey = paymentKey;
        this.receipt = receipt;
        this.paymentType = PaymentType.DONE;
        this.approvedAt = LocalDateTime.now();
    }

    public void abort(String reason){
        if (this.paymentType != PaymentType.CREATED){
            throw new IllegalStateException("CREATED 상태에서만 결제 승인 가능");
        }
        this.paymentType = PaymentType.ABORTED;
        this.failureReason = reason;
    }

    public void cancel(){
        if (this.paymentType != PaymentType.DONE){
            throw new IllegalStateException("DONE 상태에서만 결제 승인 가능");
        }
        this.paymentType = PaymentType.CANCELED;
        this.canceledAt = LocalDateTime.now();
    }
}
