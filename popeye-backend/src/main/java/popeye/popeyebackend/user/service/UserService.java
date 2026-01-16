package popeye.popeyebackend.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import popeye.popeyebackend.content.global.s3.S3Uploader;
import popeye.popeyebackend.global.security.jwt.JwtTokenProvider;
import popeye.popeyebackend.user.domain.BannedUser;
import popeye.popeyebackend.user.domain.Creator;
import popeye.popeyebackend.user.domain.DevilUser;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.dto.request.LoginRequest;
import popeye.popeyebackend.user.dto.request.SignupRequest;
import popeye.popeyebackend.user.dto.request.UpdateProfileRequest;
import popeye.popeyebackend.user.dto.response.BanUserRes;
import popeye.popeyebackend.user.dto.response.ProfilePhotoRes;
import popeye.popeyebackend.user.dto.response.TokenResponse;
import popeye.popeyebackend.user.dto.response.UserProfileResponse;
import popeye.popeyebackend.user.enums.Role;
import popeye.popeyebackend.user.exception.UserNotFoundException;
import popeye.popeyebackend.user.repository.BannedUserRepository;
import popeye.popeyebackend.user.repository.CreatorRepository;
import popeye.popeyebackend.user.repository.DevilUserRepository;
import popeye.popeyebackend.user.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@Slf4j
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
    private final S3Uploader s3Uploader;

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

        // 추천코드 생성
        user.generateReferralCode();

        return userRepository.save(user).getId();
    }

    //로그인: 인증 후 JWT 토큰 발급
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().name());
        return TokenResponse.of(token);
    }

    //U-04: 내 프로필 정보 조회
    @Transactional //추천코드 없을 때를 대비
    public UserProfileResponse getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 기존 사용자 중 코드가 없는 경우를 대비한 지연 생성
        if (user.getReferralCode() == null) {
            user.generateReferralCode();
        }

        return UserProfileResponse.builder()
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole().name())
                .referralCode(user.getReferralCode())
                .totalSpinach(user.getTotalSpinach())
                .totalStarcandy(user.getTotalStarcandy())
                .build();
    }

    //U-04: 프로필 수정 (닉네임)
    @Transactional
    public void updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 닉네임 변경 시 중복 체크
        if (request.getNickname() != null && !request.getNickname().equals(user.getNickname())) {
            if (userRepository.existsByNickname(request.getNickname())) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
        }

        user.updateProfile(request.getNickname());
    }

    @Transactional
    public void executeBan(Long adminId, Long targetId, int banDays, String reason) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new UserNotFoundException("admin not found"));
        User userFound = userRepository.findById(targetId)
                .orElseThrow(() -> new UserNotFoundException("no User found"));
        DevilUser devilUser = devilUserRepository.findByUser(userFound)
                .orElseThrow(() -> new UserNotFoundException("no Devil-User found"));

        userFound.changeRole(Role.BLOCKED);
        devilUser.plusBlockedDays(banDays);

        BannedUser bannedUser = BannedUser.builder()
                .bannedAt(LocalDate.now())
                .unbannedAt(LocalDate.now().plusDays(banDays))
                .banDays(banDays)
                .hashedPhoneNumber(devilUser.getHashedPhoneNumber())
                .reason(reason)
                .admin(admin)
                .bannedUser(userFound).build();

        bannedUserRepository.save(bannedUser);
    }

    @Transactional
    public void unBanUser(Long targetId) {
        User targetUser = userRepository.findById(targetId)
                .orElseThrow(() -> new UserNotFoundException("no User found"));
        BannedUser user = bannedUserRepository.findByUser(targetUser)
                .orElseThrow(() -> new UserNotFoundException("no User found"));
        user.setUnbannedAt(LocalDate.now());
        // role을 바꿔주는 역할은 CustomUserDetailsService에서 실시
    }

    @Transactional(readOnly = true)
    public Page<DevilUser> getDevilUsers(int page) {
        Pageable pageable = PageRequest.of(page, 30, Sort.by("user.nickname").ascending());
        return devilUserRepository.findAll(pageable);
    }

    @Transactional
    public void promoteToCreator(String email) {
        log.info("권한 승격 프로세스 시작 - 대상 이메일: {}", email);

        // 1. 사용자 존재 여부 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자를 찾을 수 없습니다."));

        // 2. 이미 크리에이터인지 확인
        if (user.getRole() == Role.CREATOR) {
            log.warn("사용자 {}는 이미 크리에이터 권한을 가지고 있습니다.", email);
            return;
        }

        // 3. 직접 UPDATE 쿼리 실행 (더티 체킹보다 확실한 방법)
        int updatedCount = userRepository.updateRoleByEmail(email, Role.CREATOR);

        if (updatedCount == 0) {
            log.error("DB 업데이트에 실패했습니다. (영향받은 행 없음)");
            throw new RuntimeException("권한 변경 중 오류가 발생했습니다.");
        }
        // 4. Creator 테이블에 레코드 추가
        // 이미 Creator 정보가 있는지 한 번 더 체크 (안전 장치)
        if (!creatorRepository.existsByUser(user)) {
            Creator newCreator = Creator.from(user);
            creatorRepository.save(newCreator);
            log.info("creators 테이블에 레코드가 성공적으로 생성되었습니다.");
        }

        log.info("사용자 {} 권한 승격 완료 (USER -> CREATOR)", email);
    }

    @Transactional(readOnly = true)
    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("no User found"));
    }

    @Transactional
    public ProfilePhotoRes updateProfile(
            Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("no User found"));

        String dirName = "user_profile";
        String uploadUrl = s3Uploader.upload(file, dirName);

        user.changeProfilePhoto(uploadUrl);
        return new ProfilePhotoRes(uploadUrl);
    }

    @Transactional(readOnly = true)
    public List<BanUserRes> getBannedUsers(int size, int page) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BannedUser> allByBlockedUser = bannedUserRepository.findAllByUserRole(Role.BLOCKED, pageable);
        return allByBlockedUser.stream().map(BanUserRes::from).toList();
    }
}
