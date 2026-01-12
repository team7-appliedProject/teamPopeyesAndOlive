package popeye.popeyebackend.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.global.security.JwtTokenProvider;
import popeye.popeyebackend.user.domain.BannedUser;
import popeye.popeyebackend.user.domain.DevilUser;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.enums.Role;
import popeye.popeyebackend.user.repository.BannedUserRepository;
import popeye.popeyebackend.user.repository.CreatorRepository;
import popeye.popeyebackend.user.repository.DevilUserRepository;
import popeye.popeyebackend.user.repository.UserRepository;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final DevilUserRepository devilUserRepository;
    private final CreatorRepository creatorRepository;
    private final BannedUserRepository bannedUserRepository;

    //회원가입 부분이라 기존 코드 위에 구현
    @Transactional
    public Long signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .nickname(request.getNickname())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .phoneNumber(request.getPhoneNumber())
                .totalSpinach(1000)
                .totalStarcandy(0)
                .build();

        return userRepository.save(user).getId();
    }

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().name());
        return TokenResponse.of(token);
    }

    @Transactional
    public void executeBan(User admin, Long targetId, int banDays, String reason){
        User userFound = userRepository.findById(targetId)
                .orElseThrow(()->new RuntimeException("no User found"));
        DevilUser devilUser = devilUserRepository.findByUser(userFound)
                .orElseThrow(()->new RuntimeException("no User found"));

        userFound.changeRole(Role.BLOCKED);
        devilUser.plusBlockedDays(banDays);

        BannedUser bannedUser = BannedUser.builder()
                .bannedAt(LocalDate.now())
                .unbannedAt(LocalDate.now().plusDays(banDays))
                .banDays(banDays)
                .hashedPhoneNumber(devilUser.getHashedPhoneNumber())
                .reason(reason)
                .admin(admin).build();

        bannedUserRepository.save(bannedUser);
    }

    @Transactional
    public void unBanUser(Long targetId){
        User targetUser = userRepository.findById(targetId)
                .orElseThrow(()->new RuntimeException("no User found"));
        BannedUser user = bannedUserRepository.findByUser(targetUser)
                .orElseThrow(()->new RuntimeException("no User found"));
        user.setUnbannedAt(LocalDate.now());
        // role을 바꿔주는 역할은 CustomUserDetailsService에서 실시
    }

    @Transactional(readOnly = true)
    public Page<DevilUser> getDevilUsers(int page) {
        Pageable pageable = PageRequest.of(page, 30, Sort.by("user.nickname").ascending());
        return devilUserRepository.findAll(pageable);
    }
}
