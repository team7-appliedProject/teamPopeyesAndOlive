package popeye.popeyebackend.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import popeye.popeyebackend.content.global.s3.S3Uploader;
import popeye.popeyebackend.global.security.jwt.JwtTokenProvider;
import popeye.popeyebackend.pay.service.FreeCreditPolicyService;
import popeye.popeyebackend.user.domain.BannedUser;
import popeye.popeyebackend.user.domain.Creator;
import popeye.popeyebackend.user.domain.DevilUser;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.dto.request.LoginRequest;
import popeye.popeyebackend.user.dto.request.PasswordResetConfirmRequest;
import popeye.popeyebackend.user.dto.request.PasswordResetRequest;
import popeye.popeyebackend.user.dto.request.SettlementInfoRequest;
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
import popeye.popeyebackend.global.util.EmailService;
import popeye.popeyebackend.global.util.HashUtil;
import popeye.popeyebackend.user.service.PhoneVerificationService;
import popeye.popeyebackend.user.service.ReferralCodeService;

import java.time.LocalDate;
import java.util.List;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

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
    private final PhoneVerificationService phoneVerificationService;
    private final RedisTemplate<String, String> redisTemplate;
    private final EmailService emailService;
    private final ReferralCodeService referralCodeService;
    private static final String PASSWORD_RESET_PREFIX = "password:reset:";
    private static final long PASSWORD_RESET_TTL = 30 * 60L; // 30분
    private final FreeCreditPolicyService freeCreditPolicyService;

    //U-01: 회원가입, U-02: 본인 인증 검증 추가
    @Transactional
    public Long signup(SignupRequest request) {
        // 휴대폰폰 본인 인증 완료 여부 확인
        if (!phoneVerificationService.isVerified(request.getPhoneNumber())) {
            throw new IllegalArgumentException("본인 인증이 완료되지 않았습니다. 먼저 휴대폰 인증을 완료해주세요.");
        }

        String hashedPhone = HashUtil.hashPhoneNumber(request.getPhoneNumber());
        if (bannedUserRepository.existsByHashedPhoneNumber(hashedPhone)) {
            throw new IllegalArgumentException("차단된 휴대폰 번호로는 가입할 수 없습니다.");
        }

        // U-09: 탈퇴한 사용자 재가입 제한 (30일)
        Optional<User> deletedUser = userRepository.findDeletedUserByEmail(request.getEmail());
        if (deletedUser.isPresent()) {
            User user = deletedUser.get();
            if (user.getDeletedAt() != null) {
                LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
                if (user.getDeletedAt().isAfter(thirtyDaysAgo)) {
                    long remainingDays = 30 - java.time.temporal.ChronoUnit.DAYS.between(user.getDeletedAt(), LocalDateTime.now());
                    throw new IllegalArgumentException(
                            String.format("탈퇴한 계정은 30일 이내 재가입할 수 없습니다. (남은 기간: %d일)", remainingDays)
                    );
                }
            }
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        // U-01: 추천인 코드 검증 및 처리
        User referrer = null;
        if (request.getReferralCode() != null && !request.getReferralCode().isBlank()) {
            referrer = userRepository.findByReferralCode(request.getReferralCode())
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 추천인 코드입니다."));

            // 자기 자신의 추천 코드는 사용할 수 없음
            if (referrer.getEmail().equals(request.getEmail())) {
                throw new IllegalArgumentException("자기 자신의 추천 코드는 사용할 수 없습니다.");
            }
        }

        // U-01: 연락처 수집 동의 확인 (동의하지 않으면 회원가입 불가)
        if (request.getPhoneNumberCollectionConsent() == null || !request.getPhoneNumberCollectionConsent()) {
            throw new IllegalArgumentException("회원가입을 위해서는 연락처 수집 동의가 필수입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .nickname(request.getNickname())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .phoneNumber(request.getPhoneNumber())
                .phoneNumberCollectionConsent(request.getPhoneNumberCollectionConsent())
                .build();

        // U-04: 고유 추천 코드 자동 생성 (나노아이디 사용, 중복 체크 포함)
        referralCodeService.generateUniqueReferralCode(user);

        User savedUser = userRepository.save(user);

        freeCreditPolicyService.grantFreeCredit(savedUser, 1000);


        // U-01: 추천인 코드 입력 시 리워드 지급 (SYS-02: 쌍방에게 크레딧 지급)
        if (referrer != null) {
            // 추천인에게 리워드 지급
            freeCreditPolicyService.grantFreeCredit(referrer, 500);// 추천인에게 500 시금치 지급
            userRepository.save(referrer);

            // 신규 가입자에게 추가 리워드 지급
            freeCreditPolicyService.grantFreeCredit(user, 500); // 신규 가입자에게 추가 500 시금치 지급
            userRepository.save(savedUser);

            log.info("추천인 코드 사용: 추천인 {}에게 500 시금치, 신규 가입자 {}에게 500 시금치 지급",
                    referrer.getEmail(), savedUser.getEmail());
        }

        DevilUser devilUser = DevilUser.builder()
                .user(user)
                .hashedPhoneNumber(HashUtil.hashPhoneNumber(request.getPhoneNumber()))
                .build();
        devilUserRepository.save(devilUser);

        return userRepository.save(user).getId();
    }

    //로그인: 인증 후 JWT 토큰 발급 - 완료
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().name());
        return TokenResponse.of(token);
    }

    //U-04: 내 프로필 정보 조회 - 완료
    @Transactional //추천코드 없을 때를 대비
    public UserProfileResponse getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        // U-04: 기존 사용자 중 코드가 없는 경우를 대비한 지연 생성 (나노아이디 사용, 중복 체크 포함)
        if (user.getReferralCode() == null) {
            referralCodeService.generateUniqueReferralCode(user);
        }

        // 변경된 부분: Creator 객체가 있을 때만 ID를 가져오고, 없으면 null 처리
        Long creatorId = (user.getCreator() != null) ? user.getCreator().getId() : null;

        return UserProfileResponse.builder()
                .creatorId(creatorId)
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole().name())
                .referralCode(user.getReferralCode())
                .totalSpinach(user.getTotalSpinach())
                .totalStarcandy(user.getTotalStarcandy())
                .build();
    }

    //U-04: 프로필 수정 (닉네임, 프로필 이미지) - 완료
    @Transactional
    public void updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        // 닉네임 변경 시 중복 체크
        if (request.getNickname() != null && !request.getNickname().equals(user.getNickname())) {
            if (userRepository.existsByNickname(request.getNickname())) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }
        }

        user.updateProfile(request.getNickname());
    }

    @Transactional(readOnly = true)
    public Page<DevilUser> getDevilUsers(int page) {
        Pageable pageable = PageRequest.of(page, 30, Sort.by("user.nickname").ascending());
        return devilUserRepository.findAll(pageable);
    }

    //U-03: 권한 등록 (크리에이터 권한 신청 및 획득) - 완료

    @Transactional
    public void promoteToCreator(String email) {
        log.info("권한 승격 프로세스 시작 - 대상 이메일: {}", email);

        // 1. 사용자 존재 여부 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("해당 이메일의 사용자를 찾을 수 없습니다."));

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
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));
    }
    
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));
    }

    //U-07: 유저 차단 실행 (휴대폰 번호 해싱 저장) - 완료

    @Transactional
    public void executeBan(Long adminId, Long targetId, int banDays, String reason) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("관리자를 찾을 수 없습니다."));
        User targetUser = userRepository.findById(targetId)
                .orElseThrow(() -> new IllegalArgumentException("대상 사용자를 찾을 수 없습니다."));

        DevilUser devilUser = devilUserRepository.findByUser(targetUser)
                .orElseThrow(() -> new IllegalArgumentException("악성 유저 정보가 없습니다."));

        // 1. 상태 변경
        targetUser.changeRole(Role.BLOCKED);
        devilUser.plusBlockedDays(banDays);

        Optional<BannedUser> banUser = bannedUserRepository.findByUser(targetUser);

        if (banUser.isPresent() && banUser.get().getBannedAt().isBefore(LocalDate.now())) {
            BannedUser user = banUser.get();
            user.updateBan(banDays, reason);
            return;
        }

        // 2. [U-01] 연락처 수집 동의 확인 (차단 시 수집 목적)
        // 모든 유저는 회원가입 시 연락처 수집 동의가 필수이므로, 동의하지 않은 유저는 존재하지 않음
        // 하지만 안전을 위해 확인 로직 유지
        if (targetUser.getPhoneNumberCollectionConsent() == null || !targetUser.getPhoneNumberCollectionConsent()) {
            throw new IllegalArgumentException("차단 처리를 위해서는 연락처 수집 동의가 필요합니다. 해당 사용자는 연락처 수집에 동의하지 않았습니다.");
        }

        // 3. [U-07] 휴대폰 번호 해싱
        String hashedPhone = devilUser.getHashedPhoneNumber();

        // 4. 차단 기록 저장 (BannedUser 엔티티의 Builder는 bannedUser 파라미터 사용)
        BannedUser bannedUser = BannedUser.builder()
                .bannedAt(LocalDate.now())
                .unbannedAt(LocalDate.now().plusDays(banDays))
                .banDays(banDays)
                .hashedPhoneNumber(hashedPhone) // 해시값 보관
                .reason(LocalDate.now() + " - " + reason)
                .admin(admin)
                .bannedUser(targetUser) // Builder 파라미터명에 맞춰 수정
                .build();

        bannedUserRepository.save(bannedUser);
        log.info("사용자 {} 차단 및 번호 해싱 완료", targetUser.getEmail());
    }

    @Transactional
    public void unBanUser(Long targetId) {
        BannedUser user = bannedUserRepository.findByUserId(targetId)
                .orElseThrow(() -> new UserNotFoundException("차단된 사용자 정보를 찾을 수 없습니다."));
        user.setUnbannedAt(LocalDate.now());
        // role을 바꿔주는 역할은 CustomUserDetailsService에서 실시
    }

    //U-08: 크리에이터 정산 정보 업데이트 (실명, 은행, 암호화 계좌)
    @Transactional
    public void updateSettlementInfo(String email, SettlementInfoRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        Creator creator = creatorRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("크리에이터 권한이 없습니다."));

        creator.updateSettlementInfo(
                request.getRealName(),
                request.getBank_name(),
                request.getAccount()
        );

        log.info("크리에이터 {}님의 정산 정보(예금주: {})가 업데이트되었습니다.", email, request.getRealName());
    }

    @Transactional
    public ProfilePhotoRes updateProfile(
            Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("no User found"));

        String uploadUrl = s3Uploader.updateProfileImage(user, file);

        user.changeProfilePhoto(uploadUrl);
        return new ProfilePhotoRes(uploadUrl);
    }

    @Transactional(readOnly = true)
    public List<BanUserRes> getBannedUsers(int size, int page) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BannedUser> allByBlockedUser = bannedUserRepository.findAllByUserRole(Role.BLOCKED, pageable);
        return allByBlockedUser.stream().map(BanUserRes::from).toList();
    }
    //U-06: 비밀번호 재설정 요청 (이메일 발송)
    public void requestPasswordReset(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("가입되지 않은 이메일입니다."));

        // 재설정 토큰 생성 (UUID)
        String resetToken = UUID.randomUUID().toString();
        String redisKey = PASSWORD_RESET_PREFIX + resetToken;

        // Redis에 토큰 저장 (30분 유효)
        redisTemplate.opsForValue().set(
                redisKey,
                user.getEmail(),
                PASSWORD_RESET_TTL,
                TimeUnit.SECONDS
        );

        // 이메일 발송 (비동기)
        String resetLink = "http://localhost:8080/api/auth/password/reset?token=" + resetToken;
        String emailContent = String.format(
                "안녕하세요, %s님.\n\n" +
                "비밀번호 재설정을 요청하셨습니다.\n" +
                "아래 링크를 클릭하여 새 비밀번호를 설정해주세요.\n\n" +
                "%s\n\n" +
                "이 링크는 30분간 유효합니다.\n" +
                "본인이 요청하지 않으셨다면 이 이메일을 무시해주세요.\n\n" +
                "뽀빠이 팀 드림",
                user.getNickname(),
                resetLink
        );

        emailService.sendEmail(
                user.getEmail(),
                "[뽀빠이] 비밀번호 재설정 안내",
                emailContent
        );

        log.info("비밀번호 재설정 이메일 발송 완료: {}", user.getEmail());
    }

    //U-06: 비밀번호 재설정 처리
    @Transactional
    public void resetPassword(PasswordResetConfirmRequest request) {
        String redisKey = PASSWORD_RESET_PREFIX + request.getToken();
        String email = redisTemplate.opsForValue().get(redisKey);

        if (email == null) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 토큰입니다.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        // 새 비밀번호로 업데이트
        user.updatePassword(passwordEncoder.encode(request.getNewPassword()));

        // 토큰 삭제 (1회성 사용)
        redisTemplate.delete(redisKey);

        log.info("비밀번호 재설정 완료: {}", email);
    }

    //U-09: 회원 탈퇴 (Soft Delete, 30일 재가입 제한)
    @Transactional
    public void withdrawUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        // 이미 탈퇴한 사용자인지 확인
        if (user.getDeletedAt() != null) {
            throw new IllegalArgumentException("이미 탈퇴한 계정입니다.");
        }

        // Soft Delete: deletedAt에 현재 시간 기록
        user.deleteUser(LocalDateTime.now());

        log.info("회원 탈퇴 완료: {} (탈퇴 일시: {})", email, user.getDeletedAt());
    }
}
