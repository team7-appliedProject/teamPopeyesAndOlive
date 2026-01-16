package popeye.popeyebackend.pay.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.pay.enums.OrderStatus;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "orders", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "content_id"})
})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id; // 주문 ID

    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 구매자 ID

    @ManyToOne
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;    // 콘텐츠 아이디

    @Column(name = "credit_used", nullable = false)
    private Integer totalCreditUsed; // 청구된 크레딧

    @Column(name = "used_spinach")
    private Integer usedFreeCredit; // 사용된 시금치 수

    @Column(name = "used_starcandy")
    private Integer usedPaidCredit; // 사용된 별사탕 수

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    private Boolean settlement = false; // 크리에이터 정산 여부

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.orderStatus = OrderStatus.COMPLETED;
    }
}
