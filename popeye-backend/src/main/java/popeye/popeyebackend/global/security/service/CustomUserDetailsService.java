package popeye.popeyebackend.global.security.service;

import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.user.domain.BannedUser;
import popeye.popeyebackend.user.enums.Role;
import popeye.popeyebackend.user.exception.UserNotFoundException;
import popeye.popeyebackend.user.repository.BannedUserRepository;
import popeye.popeyebackend.user.repository.CreatorRepository;
import popeye.popeyebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final BannedUserRepository bannedUserRepository;
    private final CreatorRepository creatorRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException, UserNotFoundException {
        popeye.popeyebackend.user.domain.User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new UserNotFoundException("유저를 찾을 수 없습니다."));

        if (user.getRole() == Role.BLOCKED) {
            validateBanStatus(user);
        }

        return createUserDetails(user);
    }

    private void validateBanStatus(popeye.popeyebackend.user.domain.User user) {
        BannedUser bannedInfo = bannedUserRepository.findByUser(user)
                .orElseThrow(() -> new UserNotFoundException("해당 유저를 찾을 수 없습니다."));
        if (bannedInfo.getUnbannedAt() != null && bannedInfo.getUnbannedAt().isBefore(LocalDate.now())) {
            user.changeRole(Role.USER);
        }

        if (creatorRepository.findByUser(user).isPresent()) {
            user.changeRole(Role.CREATOR);
        }
    }

    private UserDetails createUserDetails(popeye.popeyebackend.user.domain.User user) {
        return User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }
}