package popeye.popeyebackend.pay.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.pay.enums.CreditType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "credits")
public class Credit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private CreditType creditType;

    private int amount;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "paid_at", nullable = false, updatable = false)
    private LocalDateTime paidAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @PrePersist
    void prePersist() {
        this.paidAt = LocalDateTime.now();
    }

    public boolean isExpired(LocalDateTime now) {
        return expiredAt != null && now.isAfter(expiredAt);
    }

    // 환불/만료: amount=0 처리
    public void zeroize(){
        this.amount = 0;
    }

    // Credit 차감
    public void deduct(int value) {
        if (value < 0) throw new IllegalArgumentException("차감 값은 0이상이어야 합니다.");
        if (this.amount < value) throw new IllegalStateException("Credit 수량이 부족합니다.");
        this.amount -= value;
    }
}
