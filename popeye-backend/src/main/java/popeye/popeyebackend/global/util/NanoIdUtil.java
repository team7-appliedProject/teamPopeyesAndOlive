package popeye.popeyebackend.global.util;

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;
import java.util.Random;

//레퍼럴->나노아이디
public class NanoIdUtil {

    // [멤버 변수/필드] 가독성을 위해 헷갈리기 쉬운 문자(0, O, 1, I, L)를 제외한 알파벳과 숫자
    private static final char[] DEFAULT_ALPHABET =
            "23456789ABCDEFGHJKLMNPQRSTUVWXYZ".toCharArray();

    private NanoIdUtil() {
    }

    //레퍼럴 코드 길이제한(8자)
    public static String generateReferralCode() {
        return generate(8);
    }

    //레퍼럴코드 생성
    public static String generate(int size) {
        return NanoIdUtils.randomNanoId(
                new Random(),
                DEFAULT_ALPHABET,
                size
        );
    }
}