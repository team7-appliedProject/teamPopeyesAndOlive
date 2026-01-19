package popeye.popeyebackend.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import popeye.popeyebackend.global.util.NanoIdUtil;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.UserRepository;

//레퍼럴 코드 생성 전용 서비스
//순환 참조를 방지하기 위해 별도 서비스로 분리

@Slf4j
@Service
@RequiredArgsConstructor
public class ReferralCodeService {

    private final UserRepository userRepository;
    private static final int MAX_ATTEMPTS = 10; // 최대 시도 횟수

    //레퍼럴코드 생성
    public void generateUniqueReferralCode(User user) {
        if (user.getReferralCode() != null) {
            return; // 이미 코드가 있으면 생성하지 않음
        }

        String referralCode;
        int attempts = 0;

        do {
            referralCode = NanoIdUtil.generateReferralCode();
            attempts++;
            if (attempts >= MAX_ATTEMPTS) {
                throw new RuntimeException("레퍼럴 코드 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        } while (userRepository.existsByReferralCode(referralCode));

        // 중복이 아닌 것이 확인되었으므로 직접 설정
        user.setReferralCode(referralCode);
    }
}
