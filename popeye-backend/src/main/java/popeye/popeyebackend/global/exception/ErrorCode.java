package popeye.popeyebackend.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common (C)
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "적절하지 않은 입력값입니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C002", "허용되지 않은 메서드입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C003", "서버 내부 오류가 발생했습니다."),
    HANDLE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "C004", "접근 권한이 없습니다."),

    // User/Auth (U)
    EMAIL_DUPLICATION(HttpStatus.BAD_REQUEST, "U001", "이미 가입된 이메일입니다."),
    NICKNAME_DUPLICATION(HttpStatus.BAD_REQUEST, "U002", "이미 사용 중인 닉네임입니다."),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "U003", "이메일 또는 비밀번호가 일치하지 않습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U004", "해당 사용자를 찾을 수 없습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "U005", "유효하지 않은 토능입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "U006", "만료된 토큰입니다."),

    // pay
    INVALID_REQUEST(HttpStatus.BAD_REQUEST,"P001", "잘못된 요청입니다."),
    PAYMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "P002","결제 정보를 찾을 수 없습니다."),
    ALREADY_REFUNDED(HttpStatus.BAD_REQUEST, "P003","이미 환불된 결제입니다."),
    NOT_ENOUGH_CREDIT(HttpStatus.BAD_REQUEST, "P004","크레딧이 부족합니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}