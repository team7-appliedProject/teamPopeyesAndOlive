package popeye.popeyebackend.global.security.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import popeye.popeyebackend.global.security.jwt.JwtTokenProvider;
import popeye.popeyebackend.user.domain.User;

import java.io.IOException;

//U-05: OAuth2 로그인 성공 시 JWT 토큰 발급 및 리다이렉트 처리
// 환경 변수 GOOGLE_CLIENT_ID가 설정되어 있고 "disabled"가 아닐 때만 활성화
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${popeye.oauth2.redirect-uri:http://localhost:3000/oauth2/redirect}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        User user = oAuth2User.getUser();

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().name());

        log.info("OAuth2 로그인 성공 - Email: {}, Role: {}", user.getEmail(), user.getRole());

        String targetUrl = redirectUri + "?token=" + token + "&tokenType=Bearer";

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
