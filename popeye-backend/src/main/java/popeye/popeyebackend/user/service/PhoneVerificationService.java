package popeye.popeyebackend.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

//U-02: 휴대폰 본인 인증-TTL
@Slf4j
@Service
@RequiredArgsConstructor
public class PhoneVerificationService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String PREFIX = "sms:"; // Redis 키 접두사
    private static final long VERIFICATION_LIMIT_TIME = 3 * 60L; // 3분

    //인증번호 생성 및 발송 (가상)
    public void sendVerificationCode(String phoneNumber) {
        // 1. 6자리 난수 생성
        String verificationCode = String.format("%06d", new Random().nextInt(1000000));

        // 2. Redis에 저장 (Key: sms:01012345678, Value: 인증번호, TTL: 3분)
        redisTemplate.opsForValue().set(
                PREFIX + phoneNumber,
                verificationCode,
                VERIFICATION_LIMIT_TIME,
                TimeUnit.SECONDS
        );

        // 3. 실제 SMS 발송 로직 (현재는 로그로 대체)
        log.info("수신자: {}, 인증번호: {} [3분 이내에 입력해주세요]", phoneNumber, verificationCode);

        // TODO: Naver Cloud SMS 또는 CoolSMS API 연동 시 이곳에 코드 작성
    }

    //인증번호 검증
    public boolean verifyCode(String phoneNumber, String inputCode) {
        String storedCode = redisTemplate.opsForValue().get(PREFIX + phoneNumber);

        if (storedCode == null) {
            throw new IllegalArgumentException("인증 시간이 만료되었거나 유효하지 않은 번호입니다.");
        }

        if (!storedCode.equals(inputCode)) {
            throw new IllegalArgumentException("인증번호가 일치하지 않습니다.");
        }

        // 인증 성공 시 Redis에서 해당 정보 삭제 (1회성 확인)
        redisTemplate.delete(PREFIX + phoneNumber);

        // 가입 시 확인을 위해 "인증 완료" 마킹을 별도로 할 수도 있습니다.
        redisTemplate.opsForValue().set(PREFIX + phoneNumber + ":verified", "true", 10, TimeUnit.MINUTES);

        return true;
    }

    //가입 인증 확인
    public boolean isVerified(String phoneNumber) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + phoneNumber + ":verified"));
    }
}