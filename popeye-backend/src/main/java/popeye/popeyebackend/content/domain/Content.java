package popeye.popeyebackend.content.domain;

import jakarta.persistence.*;
import lombok.Getter;
import popeye.popeyebackend.pay.domain.Order;
import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.user.domain.Creator;
import popeye.popeyebackend.content.enums.ContentStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contents")
@Getter
public class Content {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String content;

    private int price;

    private int discountRate;

    private boolean isFree;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime modifiedAt;

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

    public void setContentStatus(ContentStatus contentStatus) {
        this.contentStatus = contentStatus;
    }
}