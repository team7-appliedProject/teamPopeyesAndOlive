package popeye.popeyebackend.pay.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * 계좌번호를 AES-256으로 암호화/복호화하는 AttributeConverter
 * 환경변수에서 암호화 키를 읽어 사용
 */
@Converter
public class AccountEncryptConverter implements AttributeConverter<String, String> {

	private static final String ALGORITHM = "AES";
	private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";
	private static final String ENV_SECRET_KEY = "POPEYE_ACCOUNT_SECRET_KEY";
	private static final int REQUIRED_KEY_LENGTH = 32; // AES-256 requires 32 bytes
	
	// 키 캐싱을 위한 volatile 변수
	private static volatile byte[] cachedSecretKey = null;
	
	/**
	 * 환경변수에서 암호화 키를 읽어 반환
	 * Base64 디코딩 후 32바이트 길이를 검증하고, 키는 한 번만 생성하여 캐싱
	 * 
	 * @return 32바이트 AES-256 암호화 키
	 * @throws RuntimeException 환경변수가 없거나 키 길이가 올바르지 않은 경우
	 */
	private static byte[] getSecretKey() {
		if (cachedSecretKey != null) {
			return cachedSecretKey;
		}
		
		synchronized (AccountEncryptConverter.class) {
			if (cachedSecretKey != null) {
				return cachedSecretKey;
			}
			
			String envKey = System.getenv(ENV_SECRET_KEY);
			if (envKey == null || envKey.trim().isEmpty()) {
				throw new RuntimeException(
					"Environment variable " + ENV_SECRET_KEY + " is not set or is empty"
				);
			}
			
			try {
				byte[] decodedKey = Base64.getDecoder().decode(envKey);
				
				if (decodedKey.length != REQUIRED_KEY_LENGTH) {
					throw new RuntimeException(
						"Invalid key length: expected " + REQUIRED_KEY_LENGTH + 
						" bytes (AES-256), but got " + decodedKey.length + " bytes"
					);
				}
				
				cachedSecretKey = decodedKey;
				return cachedSecretKey;
			} catch (IllegalArgumentException e) {
				throw new RuntimeException(
					"Failed to decode base64 key from environment variable " + ENV_SECRET_KEY, 
					e
				);
			}
		}
	}

	@Override
	public String convertToDatabaseColumn(String attribute) {
		if (attribute == null) {
			return null;
		}
		try {
			byte[] secretKey = getSecretKey();
			SecretKeySpec keySpec = new SecretKeySpec(secretKey, ALGORITHM);
			Cipher cipher = Cipher.getInstance(TRANSFORMATION);
			cipher.init(Cipher.ENCRYPT_MODE, keySpec);
			byte[] encrypted = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));
			return Base64.getEncoder().encodeToString(encrypted);
		} catch (Exception e) {
			throw new RuntimeException("Failed to encrypt account", e);
		}
	}

	@Override
	public String convertToEntityAttribute(String dbData) {
		if (dbData == null) {
			return null;
		}
		try {
			byte[] secretKey = getSecretKey();
			SecretKeySpec keySpec = new SecretKeySpec(secretKey, ALGORITHM);
			Cipher cipher = Cipher.getInstance(TRANSFORMATION);
			cipher.init(Cipher.DECRYPT_MODE, keySpec);
			byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(dbData));
			return new String(decrypted, StandardCharsets.UTF_8);
		} catch (Exception e) {
			throw new RuntimeException("Failed to decrypt account", e);
		}
	}
}

