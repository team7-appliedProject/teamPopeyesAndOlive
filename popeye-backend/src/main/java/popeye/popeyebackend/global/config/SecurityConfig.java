package popeye.popeyebackend.global.config;

import popeye.popeyebackend.global.security.jwt.JwtAuthenticationFilter;
import popeye.popeyebackend.global.security.jwt.JwtTokenProvider;
import popeye.popeyebackend.global.security.oauth2.CustomOAuth2UserService;
import popeye.popeyebackend.global.security.oauth2.OAuth2SuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    
    // OAuth2 빈들은 선택적 주입 (없을 수 있음)
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final CustomOAuth2UserService customOAuth2UserService;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id:disabled}")
    private String googleClientId;
    
    // OAuth2 빈들을 선택적으로 주입받기 위한 생성자
    public SecurityConfig(JwtTokenProvider jwtTokenProvider,
                          @org.springframework.beans.factory.annotation.Autowired(required = false) OAuth2SuccessHandler oAuth2SuccessHandler,
                          @org.springframework.beans.factory.annotation.Autowired(required = false) CustomOAuth2UserService customOAuth2UserService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 미사용
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/api/auth/**", "/error").permitAll(); // 인증 불필요 경로 (U-06: 비밀번호 재설정 포함)
                    auth.requestMatchers(
                            "/v3/api-docs/**",
                            "/swagger-ui/**",
                            "/swagger-ui.html"
                    ).permitAll();
                    auth.requestMatchers("/api/admin/**").permitAll();
                    auth.requestMatchers("/api/report/**").permitAll();
                    
                    // U-05: OAuth2 설정이 있을 때만 OAuth2 경로 허용
                    if (isOAuth2Enabled()) {
                        auth.requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll();
                    }
                    
                    auth.anyRequest().authenticated(); // 그 외 모든 요청은 인증 필요
                });
        
        // U-05: OAuth2 설정이 있을 때만 OAuth2 로그인 활성화
        if (isOAuth2Enabled()) {
            http.oauth2Login(oauth2 -> oauth2
                    .successHandler(oAuth2SuccessHandler)
                    .userInfoEndpoint(userInfo -> userInfo
                            .userService(customOAuth2UserService)
                    )
            );
        }
        
        // UsernamePasswordAuthenticationFilter 이전에 JWT 인증 필터를 실행
        http.addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    
    // OAuth2가 활성화되어 있는지 확인
    private boolean isOAuth2Enabled() {
        return oAuth2SuccessHandler != null 
                && customOAuth2UserService != null 
                && googleClientId != null 
                && !googleClientId.isEmpty()
                && !googleClientId.equals("disabled");
    }
}
