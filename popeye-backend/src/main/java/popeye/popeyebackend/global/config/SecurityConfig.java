package popeye.popeyebackend.global.config;

import popeye.popeyebackend.global.security.jwt.JwtAuthenticationFilter;
import popeye.popeyebackend.global.security.jwt.JwtTokenProvider;
import popeye.popeyebackend.global.security.oauth2.CustomOAuth2UserService;
import popeye.popeyebackend.global.security.oauth2.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
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

import java.util.Optional;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final Optional<OAuth2SuccessHandler> oAuth2SuccessHandler;
    private final Optional<CustomOAuth2UserService> customOAuth2UserService;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id:disabled}")
    private String googleClientId;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 세션 미사용
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/error").permitAll() // 인증 불필요 경로 (U-06: 비밀번호 재설정 포함)
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        .requestMatchers("/api/admin/**").permitAll()
                        .requestMatchers("/api/report/**").permitAll()
                        .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
                );
        
        // U-05: OAuth2 설정이 있을 때만 OAuth2 로그인 활성화
        if (isOAuth2Enabled()) {
            http.authorizeHttpRequests(auth -> auth
                    .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
            );
            http.oauth2Login(oauth2 -> oauth2
                    .successHandler(oAuth2SuccessHandler.get())
                    .userInfoEndpoint(userInfo -> userInfo
                            .userService(customOAuth2UserService.get())
                    )
            );
        }
        
        // UsernamePasswordAuthenticationFilter 이전에 JWT 인증 필터를 실행
        http.addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    
    // OAuth2가 활성화되어 있는지 확인
    private boolean isOAuth2Enabled() {
        return oAuth2SuccessHandler.isPresent() 
                && customOAuth2UserService.isPresent() 
                && googleClientId != null 
                && !googleClientId.isEmpty()
                && !googleClientId.equals("disabled");
    }
}
