package popeye.popeyebackend.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
public class UserService {
    private final UserRepository userRepository;
    private final DevilUserRepository devilUserRepository;
    private final CreatorRepository creatorRepository;
    private final BannedUserRepository bannedUserRepository;

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
