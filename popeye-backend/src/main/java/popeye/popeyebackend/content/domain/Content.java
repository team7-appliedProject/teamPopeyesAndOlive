package popeye.popeyebackend.content.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import popeye.popeyebackend.pay.domain.Order;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.user.domain.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contents")
@Getter
@Builder
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String content;

    private int price;

    private int discountRate;

    private boolean isFree;

    private Integer viewCount;

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

    public void activate() {    // 컨텐츠 공개
        this.contentStatus = ContentStatus.ACTIVE;
        this.modifiedAt = LocalDateTime.now();
    }

    public void inactivate() {
        this.contentStatus = ContentStatus.INACTIVE;
        this.modifiedAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return this.contentStatus.equals(ContentStatus.ACTIVE);
    }

    private long viewCount = 0;
    public void increaseViewCount() {
        this.viewCount++;
    }

    public void publish() {
        this.status = ContentStatus.ACTIVE;
        this.modifiedAt = LocalDateTime.now();
    }

    private long likeCount = 0;

    public void increaseLike() {
        this.likeCount++;
    }

    public void decreaseLike() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }
}