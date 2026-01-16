package popeye.popeyebackend.global.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;


// U-08: 양방향 암호화(AES-256) 유틸리티-계좌복호화
@Component
public class EncryptionUtil {

    private static final String ALGORITHM = "AES";
    private final String secretKey;

    // application.yml의 popeye.secret-key를 공유하거나 별도의 키를 지정할 수 있습니다.
    public EncryptionUtil(@Value("${popeye.secret-key}") String secretKey) {
        // AES-256은 32바이트 키를 요구합니다. 키 길이를 맞추는 로직 포함.
        this.secretKey = String.format("%-32s", secretKey).substring(0, 32);
    }

    //문자열 암호화
    public String encrypt(String plainText) {
        if (plainText == null) return null;
        try {
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("암호화 중 오류가 발생했습니다.", e);
        }
    }

    //문자열 복호화
    public String decrypt(String encryptedText) {
        if (encryptedText == null) return null;
        try {
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            byte[] decoded = Base64.getDecoder().decode(encryptedText);
            byte[] decrypted = cipher.doFinal(decoded);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("복호화 중 오류가 발생했습니다.", e);
        }
    }
}