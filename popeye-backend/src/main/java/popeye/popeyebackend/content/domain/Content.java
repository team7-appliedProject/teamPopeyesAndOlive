package popeye.popeyebackend.content.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import popeye.popeyebackend.pay.domain.Order;
import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.user.domain.Creator;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.user.domain.User;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contents")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String content;
    @Column(nullable = false)
    private int price;
    @Column(nullable = false)
    private int discountRate;
    @Column(nullable = false)
    private boolean isFree;

    private LocalDateTime modifiedAt;

    @Builder.Default
    private Integer viewCount = 0;
    @Builder.Default
    private LocalDateTime createdAt =  LocalDateTime.now();

    @Builder.Default
    private long likeCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ContentStatus contentStatus = ContentStatus.INACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private Creator creator;

    @OneToMany(mappedBy = "content")
    private List<ContentBookmark> bookmarks;

    @OneToMany(mappedBy = "content")
    private List<Order> orders;

    @OneToMany(mappedBy = "targetContent")
    private List<Report> reports;

    @OneToMany(fetch = FetchType.LAZY)
    private List<ContentBan> contentBan;

    @OneToMany(mappedBy = "content")
    private List<ContentMedia> contentMedia;

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

    public void increaseViewCount() {
        this.viewCount++;
    }

    public void publish() {
        this.contentStatus = ContentStatus.ACTIVE;
        this.modifiedAt = LocalDateTime.now();
    }

    public void increaseLike() {
        this.likeCount++;
    }

    public void decreaseLike() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }
}