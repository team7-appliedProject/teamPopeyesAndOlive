package popeye.popeyebackend.user.domain;

import jakarta.persistence.*;
import lombok.*;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.global.common.AesAttributeConverter;

import java.util.List;

@Entity
@Getter
@Table(name = "creators")
@NoArgsConstructor(access = AccessLevel.PROTECTED) //외부 객체생성 방지
@AllArgsConstructor
@Builder
public class Creator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    //정산계좌
    @Convert(converter = AesAttributeConverter.class)
    @Column(length = 500, nullable = true)
    private String account;

    //은행이름
    @Column(length = 100)
    private String bank_name;

    //예금주명
    @Column(length = 100)
    private String name;

    @OneToMany(mappedBy = "creator")
    private List<Content> contents;

    //정적팩토리 메서드 유저객체->크리에이터 객체
    public static Creator from(User user) {
        return Creator.builder()
                .user(user)
                .build();
    }

    //U-08: 크리에이터 정산 정보 업데이트
    public void updateSettlementInfo(String realName, String bankName, String account) {
        this.name = realName;
        this.bank_name = bankName;
        this.account = account;
    }
}