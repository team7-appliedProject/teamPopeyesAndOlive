package popeye.popeyebackend.entity;

import jakarta.persistence.*;
import popeye.popeyebackend.enums.ContentStatus;

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

    private ContentStatus contentStatus = ContentStatus.INACTIVE;

    @ManyToOne
    private User creator;

    @OneToMany(mappedBy = "content")
    private List<Bookmark> bookmarks;

    @OneToMany(mappedBy = "content")
    private List<Order> orders;
}
