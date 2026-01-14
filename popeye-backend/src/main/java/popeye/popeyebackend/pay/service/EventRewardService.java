package popeye.popeyebackend.pay.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.pay.domain.Credit;
import popeye.popeyebackend.user.domain.User;

@Service
@RequiredArgsConstructor
public class EventRewardService {

    private final FreeCreditPolicyService freeCreditPolicyService;

    @Transactional
    public Long rewardFreeCredit(User user, int amount){
        Credit credit = freeCreditPolicyService.grantFreeCredit(user, amount);
        return credit.getId();
    }
}
