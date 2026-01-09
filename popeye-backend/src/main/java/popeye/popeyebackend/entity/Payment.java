package popeye.popeyebackend.entity;

import jakarta.persistence.*;
import popeye.popeyebackend.enums.PaymentType;
import popeye.popeyebackend.enums.PgProvider;

@Entity
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int amount;
    private PaymentType paymentType;
    private PgProvider pgProvider;
    @Column(name = "receipt_url")
    private String receipt;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
