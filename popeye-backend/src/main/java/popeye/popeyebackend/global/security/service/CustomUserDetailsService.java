package popeye.popeyebackend.global.security.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.global.security.details.PrincipalDetails;
import popeye.popeyebackend.user.domain.BannedUser;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.enums.Role;
import popeye.popeyebackend.user.exception.UserNotFoundException;
import popeye.popeyebackend.user.repository.BannedUserRepository;
import popeye.popeyebackend.user.repository.CreatorRepository;
import popeye.popeyebackend.user.repository.UserRepository;

import java.time.LocalDate;

//Spring Security UserDetailsService 구현 - 사용자 인증 정보 로드
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final BannedUserRepository bannedUserRepository;
    private final CreatorRepository creatorRepository;

    //이메일을 통해 UserDetails 로드 (Spring Security에서 호출)
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("유저를 찾을 수 없습니다."));

        //차단된 사용자 상태 검증 및 자동 복구
        if (user.getRole() == Role.BLOCKED) {
            validateBanStatus(user);
        }

        //PrincipalDetails 반환 (UserDetails 인터페이스 구현체)
        return new PrincipalDetails(user);
    }

    //차단된 사용자 상태 검증 및 자동 복구 로직
    private void validateBanStatus(User user) {
        BannedUser bannedInfo = bannedUserRepository.findByUser(user)
                .orElseThrow(() -> new UserNotFoundException("해당 유저를 찾을 수 없습니다."));
        
        //차단 해제 기간이 지났으면 자동으로 USER 역할로 복구
        if (bannedInfo.getUnbannedAt() != null && bannedInfo.getUnbannedAt().isBefore(LocalDate.now())) {
            user.changeRole(Role.USER);
        }

        //크리에이터면 CREATOR 역할로 복구
        if (creatorRepository.findByUser(user).isPresent()) {
            user.changeRole(Role.CREATOR);
        }
    }
}