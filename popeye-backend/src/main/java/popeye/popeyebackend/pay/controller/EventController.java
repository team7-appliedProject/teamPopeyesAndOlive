package popeye.popeyebackend.pay.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import popeye.popeyebackend.global.security.details.PrincipalDetails;
import popeye.popeyebackend.pay.service.EventRewardService;


@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventRewardService eventRewardService;

    @PostMapping("/free-credits")
    public ResponseEntity<Long> grantFreeCredits(
            // @AuthenticationPrincipal PrincipalDetails principalDetails, // 추후 사용 예정
            @RequestParam int amount){

        // 임시: 인증 시스템 완성 전까지 임시 userId 사용
        Long userId = 1L; // TODO: 인증 시스템 완성 후 principalDetails.getUserId()로 변경
        // Long userId = principalDetails.getUserId();

        Long creditId = eventRewardService.rewardFreeCredit(userId, amount);
        return ResponseEntity.ok(creditId);
    }
}
