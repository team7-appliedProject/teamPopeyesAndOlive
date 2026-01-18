package popeye.popeyebackend.content.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
// import popeye.popeyebackend.user.domain.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_bookmarks")
@Getter
@NoArgsConstructor
public class ContentBookmark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bookmark_id")
    private Long id;

    private Integer price;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id") // BIGINT(FK)
//    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id") // BIGINT(FK)
    private Content content;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder
    public ContentBookmark(Content content, Integer price) { // User user
        //this.user = user;
        this.content = content;
        this.price = price;
    }
}