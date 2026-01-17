package popeye.popeyebackend.global.security.oauth2;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.enums.Role;
import popeye.popeyebackend.user.repository.UserRepository;

import java.util.Map;

//U-05: OAuth2 소셜 로그인 사용자 정보 처리 서비스
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    //OAuth2 로그인 시 사용자 정보를 가져와서 처리
    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"
        String providerId = oAuth2User.getAttribute("sub"); // Google의 고유 ID

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        log.info("OAuth2 로그인 시도 - Provider: {}, Email: {}, Name: {}", provider, email, name);

        //기존 사용자 조회 (provider와 providerId로 조회)
        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> {
                    return userRepository.findByEmail(email)
                            .map(existingUser -> {
                                existingUser.updateOAuth2Info(provider, providerId);
                                log.info("기존 사용자에 소셜 로그인 정보 추가: {}", email);
                                return existingUser;
                            })
                            .orElseGet(() -> {
                                return createOAuth2User(email, name, picture, provider, providerId);
                            });
                });

        if (picture != null && !picture.equals(user.getProfileImageUrl())) {
            user.updateProfile(user.getNickname(), picture);
        }

        userRepository.save(user);

        return new CustomOAuth2User(oAuth2User, user);
    }

    //OAuth2 신규 사용자 생성
    private User createOAuth2User(String email, String name, String picture, String provider, String providerId) {
        String nickname = generateUniqueNickname(name != null ? name : email.split("@")[0]);

        User user = User.builder()
                .email(email)
                .nickname(nickname)
                .password(null)
                .role(Role.USER)
                .phoneNumber("01000000000")
                .phoneNumberCollectionConsent(false)
                .profileImageUrl(picture)
                .provider(provider)
                .providerId(providerId)
                .totalSpinach(1000)
                .totalStarcandy(0)
                .build();

        user.generateReferralCode();

        log.info("OAuth2 신규 사용자 생성: {} ({})", email, nickname);
        return userRepository.save(user);
    }

    private String generateUniqueNickname(String baseNickname) {
        String nickname = baseNickname;
        int suffix = 1;

        while (userRepository.existsByNickname(nickname)) {
            nickname = baseNickname + suffix;
            suffix++;
        }
        return nickname;
    }
}
