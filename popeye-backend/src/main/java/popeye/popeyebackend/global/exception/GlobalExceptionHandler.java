package popeye.popeyebackend.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import popeye.popeyebackend.global.common.ApiResponse;
import popeye.popeyebackend.global.exception.dto.ErrorResponse;
import popeye.popeyebackend.notification.exception.NoNotificationException;
import popeye.popeyebackend.report.exception.AlreadyProcessedException;
import popeye.popeyebackend.report.exception.AlreadyReportException;
import popeye.popeyebackend.report.exception.MissedReportTypeException;
import popeye.popeyebackend.report.exception.NoReportFoundException;
import popeye.popeyebackend.user.exception.UserNotFoundException;

import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> userNotFoundException(UserNotFoundException e) {
        log.error(e.getMessage());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of("USER_NOT_FOUND", e.getMessage()));
    }

    @ExceptionHandler(AlreadyProcessedException.class)
    public ResponseEntity<ErrorResponse> alreadyProcessedException(AlreadyProcessedException e) {
        log.error(e.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of("ALREADY_PROCESSED", e.getMessage()));
    }

    @ExceptionHandler(AlreadyReportException.class)
    public ResponseEntity<ErrorResponse> alreadyReportException(AlreadyReportException e) {
        log.error(e.getMessage());

        return ResponseEntity
                .status(HttpStatus.ALREADY_REPORTED)
                .body(ErrorResponse.of("ALREADY_REPORTED", e.getMessage()));
    }

    @ExceptionHandler(MissedReportTypeException.class)
    public ResponseEntity<ErrorResponse> missedReportTypeException(MissedReportTypeException e) {
        log.error(e.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of("MISSED_REPORT_TYPE", e.getMessage()));
    }

    @ExceptionHandler(NoReportFoundException.class)
    public ResponseEntity<ErrorResponse> noReportFoundException(NoReportFoundException e) {
        log.error(e.getMessage());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of("NO_REPORT_FOUND", e.getMessage()));
    }

    //Bean Validation (@Valid) 검증 실패 시 호출
    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<ApiResponse<?>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.error("MethodArgumentNotValidException: {}", e.getMessage());
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return ResponseEntity
                .status(ErrorCode.INVALID_INPUT_VALUE.getStatus())
                .body(ApiResponse.error(message));
    }

    //미지원HTTP메서드 호출시
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    protected ResponseEntity<ApiResponse<?>> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e) {
        log.error("HttpRequestMethodNotSupportedException: {}", e.getMessage());
        return ResponseEntity
                .status(ErrorCode.METHOD_NOT_ALLOWED.getStatus())
                .body(ApiResponse.error(ErrorCode.METHOD_NOT_ALLOWED.getMessage()));
    }

    //비즈니스 로직 예외 처리
    @ExceptionHandler(BusinessException.class)
    protected ResponseEntity<ApiResponse<?>> handleBusinessException(BusinessException e) {
        log.error("BusinessException: {}", e.getErrorCode().getMessage());
        ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.error(errorCode.getMessage()));
    }

    /**
     * 비즈니스 예외
     */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException e) {
        return ResponseEntity
                .status(e.getErrorCode().getStatus())
                .body(ErrorResponse.of(e.getErrorCode().name(),e.getErrorCode().getMessage()));
    }

    // ----- 알림 오류
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleNoNotificationException(ApiException e) {
        return ResponseEntity
                .status(e.getErrorCode().getStatus())
                .body(ErrorResponse.of(e.getErrorCode().name(), e.getMessage()));
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleAlreadyReadException(ApiException e) {
        return ResponseEntity
                .status(e.getErrorCode().getStatus())
                .body(ErrorResponse.of(e.getErrorCode().name(), e.getMessage()));
    }

    //기타 최상위 예외처리
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ApiResponse<?>> handleException(Exception e) {
        log.error("Unhandled Exception: ", e);
        return ResponseEntity
                .status(ErrorCode.INTERNAL_SERVER_ERROR.getStatus())
                .body(ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
    }
}
