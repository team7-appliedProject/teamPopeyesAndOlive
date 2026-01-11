package popeye.popeyebackend.user.domain;

import jakarta.persistence.*;
import lombok.Getter;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentBookmark;
import popeye.popeyebackend.pay.entity.Credit;
import popeye.popeyebackend.pay.entity.Order;
import popeye.popeyebackend.pay.entity.Payment;
import popeye.popeyebackend.pay.entity.Settlement;
import popeye.popeyebackend.notificaion.domain.Notification;
import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.user.enums.Role;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
public class User {
    @Id
    private Long id;

    private String email;

    private String nickname;

    private String password;

    @Enumerated
    private Role role;

    private LocalDateTime createdAt =  LocalDateTime.now();

    @Column(name = "phone_number", unique = true)
    private Long number;

    @Column(name = "total_spinach")
    private Integer totalSpinach = 0;

    @Column(name = "total_starcandy")
    private Integer totalStarcandy = 0;


    @OneToMany(mappedBy = "creator")
    private List<Content> contents;

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

    @OneToOne(mappedBy = "user")
    private DevilUser devilUser;

    @OneToMany(mappedBy = "admin")
    private List<BannedUser> bannedUserList;

    @OneToMany(mappedBy = "reporter")
    private List<Report> reports;

    @OneToMany(mappedBy = "reported")
    private List<Report> reporteds;

    public void changeRole (Role role) {
        this.role = role;
    }
}
