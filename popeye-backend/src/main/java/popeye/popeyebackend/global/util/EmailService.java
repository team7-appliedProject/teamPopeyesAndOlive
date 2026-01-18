package popeye.popeyebackend.global.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

//U-06: 공통 이메일 발송 서비스
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    //텍스트 메일 발송, 비동기처리(@Async)
    @Async
    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("popeye-support@gmail.com");

        try {
            mailSender.send(message);
            log.info("이메일 발송 완료: {}", to);
        } catch (Exception e) {
            log.error("이메일 발송 실패: {}", to, e);
        }
    }
}