package popeye.popeyebackend.content.domain;

import jakarta.persistence.*;
import popeye.popeyebackend.pay.entity.Order;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.content.enums.ContentStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contents")
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String content;

    private int price;

    private int discountRate;

    private boolean isFree;

    private LocalDateTime createdAt =  LocalDateTime.now();

    private LocalDateTime modifiedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ContentStatus contentStatus = ContentStatus.INACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    @OneToMany(mappedBy = "content")
    private List<ContentBookmark> bookmarks;

    @OneToMany(mappedBy = "content")
    private List<Order> orders;
}