package popeye.popeyebackend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "settlements")
public class Settlement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int amount;
    private int feeRate;
    private LocalDateTime settledAt;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;
}
