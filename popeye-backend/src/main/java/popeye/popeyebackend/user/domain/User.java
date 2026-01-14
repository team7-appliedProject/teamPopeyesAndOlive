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

    private final LocalDateTime createdAt =  LocalDateTime.now();

    @Column(name = "phone_number", unique = true, nullable = false)
    private String phoneNumber;

    @Column(name = "total_spinach")
    private Integer totalSpinach;// = 0;

    @Column(name = "total_starcandy")
    private Integer totalStarcandy;// = 0;

    @OneToMany(mappedBy = "creator")
    private List<Settlement> settlements;
//
//    @OneToMany(mappedBy = "user")
//    private List<Order> orders;
//
//    @OneToMany(mappedBy = "user")
//    private List<Credit> credits;
//
//    @OneToMany(mappedBy = "user")
//    private List<Payment> payments;
//
//    @OneToMany(mappedBy = "user")
//    private List<Notification> notifications;
//
//    @OneToMany(mappedBy = "user")
//    private List<ContentBookmark> bookmarks;
//
//    @OneToMany(mappedBy = "admin")
//    private List<BannedUser> bannedUserList;
//
//    @OneToMany(mappedBy = "reporter")
//    private List<Report> reports;

      @OneToOne(mappedBy = "user")
      private DevilUser devilUser;
//
//    @OneToMany(mappedBy = "admin")
//    private List<ContentBan> contentBans;
//
//    @OneToOne(mappedBy = "user")
//    private Creator creator;
//
//    @OneToOne(mappedBy = "user")
//    private BannedUser bannedUser;

    public void changeRole (Role role) {
        this.role = role;
    }


}
