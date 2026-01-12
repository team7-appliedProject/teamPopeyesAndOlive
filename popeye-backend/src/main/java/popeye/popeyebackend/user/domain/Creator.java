package popeye.popeyebackend.user.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import popeye.popeyebackend.content.domain.Content;

import java.util.List;

@Entity
@Getter
@Table(name = "creators")
@NoArgsConstructor
public class Creator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 500)
    private String account;

    @OneToMany(mappedBy = "creator")
    private List<Content> contents;
}