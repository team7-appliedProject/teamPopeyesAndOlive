package popeye.popeyebackend.pay.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import popeye.popeyebackend.pay.service.EventFreeCreditService;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.UserRepository;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventFreeCreditService eventFreeCreditService;
    private final UserRepository userRepository;

    @PostMapping("/free-credits")
    public ResponseEntity<Long> grantFreeCredits(@RequestParam int amount){
        // 임시 사용자
        User user = userRepository.findById(1L).orElseThrow();

        Long creditId = eventFreeCreditService.grantFreeCredit(user, amount);
        return ResponseEntity.ok(creditId);
    }
}
