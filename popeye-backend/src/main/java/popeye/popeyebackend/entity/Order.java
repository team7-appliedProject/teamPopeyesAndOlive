package popeye.popeyebackend.entity;

import jakarta.persistence.*;
import popeye.popeyebackend.enums.OrderStatus;

import java.time.LocalDateTime;

@Entity
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantity;
    private LocalDateTime orderDate=LocalDateTime.now();
    private OrderStatus orderStatus;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "content_id")
    private Content content;
}
