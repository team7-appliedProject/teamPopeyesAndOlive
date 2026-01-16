package popeye.popeyebackend.notification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.global.security.details.PrincipalDetails;
import popeye.popeyebackend.notification.dto.response.NotiReadRes;
import popeye.popeyebackend.notification.dto.response.NotificationRes;
import popeye.popeyebackend.notification.service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationRes>> getAllNotifications(
            @AuthenticationPrincipal PrincipalDetails details
            ) {
        Long userId = details.getUserId();
        List<NotificationRes> noti = notificationService.findAll(userId);
        return ResponseEntity.ok(noti);
    }

    @PatchMapping("/{notiId}")
    public ResponseEntity<NotiReadRes> readNotification(
            @AuthenticationPrincipal PrincipalDetails details,
            @PathVariable Long notiId
    ){
        Long userId = details.getUserId();
        NotiReadRes res = notificationService.readNotification(userId, notiId);
        return ResponseEntity.ok(res);
    }
}
