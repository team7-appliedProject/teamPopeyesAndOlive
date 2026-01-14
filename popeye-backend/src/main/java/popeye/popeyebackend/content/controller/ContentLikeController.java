package popeye.popeyebackend.content.controller;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentLike;
import popeye.popeyebackend.user.domain.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "content_likes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ContentLikeController {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    private LocalDateTime createdAt;

    public static ContentLike create(User user, Content content) {
        ContentLike like = new ContentLike();
        like.user = user;
        like.content = content;
        like.createdAt = LocalDateTime.now();
        return like;
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long id) {
        likeService.toggleLike(1L, id); // 임시 userId
        return ResponseEntity.ok().build();
    }
}
}
