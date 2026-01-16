package popeye.popeyebackend.global.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

//개인정보 해싱 유틸리티
public class HashUtil {

    //문자열을 SHA-256 해시값 변환
    public static String hashPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) return null;

        // 하이픈 제거 로직
        String cleanNumber = phoneNumber.replaceAll("[^0-9]", "");

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(cleanNumber.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("해싱 알고리즘을 찾을 수 없습니다.", e);
        }
    }
}