package popeye.popeyebackend.entity;

import jakarta.persistence.*;
import popeye.popeyebackend.enums.OrderStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id; // 주문 ID

    private int quantity;
    private LocalDateTime orderDate=LocalDateTime.now();
    private OrderStatus orderStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // 구매자 ID

    @ManyToOne
    @JoinColumn(name = "content_id")
    private Content content;    // 콘텐츠 아이디

    @Column(name = "credit_used")
    private Integer creditUsed; // 청구된 크레딧

    @Column(name = "used_spinach")
    private Integer usedSpinach; // 사용된 시금치 수

    @Column(name = "used_starcandy")
    private Integer usedStarcandy; // 사용된 별사탕 수

    private Boolean settlement = false; // 크리에이터 정산 여부
}
