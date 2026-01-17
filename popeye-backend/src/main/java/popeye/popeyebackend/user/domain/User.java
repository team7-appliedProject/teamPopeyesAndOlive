package popeye.popeyebackend.user.domain;

import jakarta.persistence.*;
import lombok.*;
import popeye.popeyebackend.content.domain.ContentBan;
import popeye.popeyebackend.content.domain.ContentBookmark;
import popeye.popeyebackend.notification.domain.Notification;
import popeye.popeyebackend.pay.domain.Credit;
import popeye.popeyebackend.pay.domain.Order;
import popeye.popeyebackend.pay.domain.Payment;
import popeye.popeyebackend.pay.domain.Settlement;
import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.user.enums.Role;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String nickname;

    @Column(nullable = true)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder.Default
    private final LocalDateTime createdAt =  LocalDateTime.now();

    @Column(name = "phone_number", unique = true, nullable = false)
    private String phoneNumber;

    @Column(name = "total_spinach")
    @Builder.Default
    private Integer totalSpinach = 0;

    @Column(name = "total_starcandy")
    @Builder.Default
    private Integer totalStarcandy = 0;

    // U-04: 프로필 이미지 URL
    @Column(name = "profile_image_url")
    private String profileImageUrl;

    // U-04: 추천 코드
    @Column(name = "referral_code", unique = true)
    private String referralCode;

    // U-09: 회원 탈퇴 일시 (Soft Delete)
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // U-01: 연락처 수집 동의 (차단 시 수집 목적)
    @Column(name = "phone_number_collection_consent", nullable = false)
    @Builder.Default
    private Boolean phoneNumberCollectionConsent = false;

    // U-05: OAuth2 소셜 로그인 제공자 (google, local 등)
    @Column(name = "provider")
    private String provider;

    // U-05: OAuth2 소셜 로그인 제공자 ID (Google의 경우 sub 값)
    @Column(name = "provider_id")
    private String providerId;

    @OneToMany(mappedBy = "creator")
    private List<Settlement> settlements;

    @OneToMany(mappedBy = "user")
    private List<Order> orders;

    @OneToMany(mappedBy = "user")
    private List<Credit> credits;

    @OneToMany(mappedBy = "user")
    private List<Payment> payments;

    @OneToMany(mappedBy = "user")
    private List<Notification> notifications;

    @OneToMany(mappedBy = "user")
    private List<ContentBookmark> bookmarks;

    @OneToMany(mappedBy = "admin")
    private List<BannedUser> bannedUserList;

    @OneToMany(mappedBy = "reporter")
    private List<Report> reports;

    @OneToOne(mappedBy = "user")
    private DevilUser devilUser;

    @OneToMany(mappedBy = "admin")
    private List<ContentBan> contentBans;

    @OneToOne(mappedBy = "user")
    private Creator creator;

    @OneToOne(mappedBy = "user")
    private BannedUser bannedUser;

    public void changeRole (Role role) {
        this.role = role;
    }

    //U-04 프로필정보 수정
    public void updateProfile(String nickname, String profileImageUrl) {
        if (nickname != null && !nickname.isBlank()) {
            this.nickname = nickname;
        }
        if (profileImageUrl != null) {
            this.profileImageUrl = profileImageUrl;
        }
    }

    //U-04 추천코드 생성
    public void generateReferralCode() {
        if (this.referralCode == null) {
            // UUID의 앞 8자리를 대문자로 추출하여 고유 코드 생성
            this.referralCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
    public void updateRole(Role newRole) {
        this.role = newRole;
    }

    //U-06: 비밀번호 재설정
    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    //U-09: 회원 탈퇴
    public void deleteUser(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    //U-01: 시금치 추가 (추천인 리워드 지급용)
    public void addSpinach(int amount) {
        this.totalSpinach = (this.totalSpinach == null ? 0 : this.totalSpinach) + amount;
    }

    //U-05: OAuth2 소셜 로그인 정보 업데이트
    public void updateOAuth2Info(String provider, String providerId) {
        this.provider = provider;
        this.providerId = providerId;
    }
}