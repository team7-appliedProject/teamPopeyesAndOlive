package popeye.popeyebackend.pay.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.pay.domain.Credit;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.service.UserService;

@Service
@RequiredArgsConstructor
public class EventRewardService {

    private final FreeCreditPolicyService freeCreditPolicyService;
    private final UserService userService;


    @Transactional
    public Long rewardFreeCredit(Long userId, int amount){
        User user = userService.getUser(userId);

        Credit credit = freeCreditPolicyService.grantFreeCredit(user, amount);
        return credit.getId();
    }
}
