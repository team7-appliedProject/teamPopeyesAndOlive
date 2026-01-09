package popeye.popeyebackend.entity;

import jakarta.persistence.*;
import popeye.popeyebackend.enums.Role;

import java.time.LocalDateTime;
import java.util.List;

@Entity
public class User {
    @Id
    private Long id;

    private String email;

    private String nickname;

    private String password;

    private Role role;

    private LocalDateTime createdAt =  LocalDateTime.now();

    @Column(name = "phone_number")
    private Long number;

    private Integer devilCount;

    private LocalDateTime blockedAt;

    @OneToMany
    private List<Content> contents;

    @OneToMany
    private List<Settlement> settlements;

    @OneToMany
    private List<Order> orders;

    @OneToMany
    private List<Credit> credits;

    @OneToMany
    private List<Payment> payments;

    @OneToMany
    private List<Notification> notifications;
}
