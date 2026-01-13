package popeye.popeyebackend.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import popeye.popeyebackend.global.exception.dto.ErrorResponse;
import popeye.popeyebackend.report.exception.AlreadyProcessedException;
import popeye.popeyebackend.report.exception.AlreadyReportException;
import popeye.popeyebackend.report.exception.MissedReportTypeException;
import popeye.popeyebackend.report.exception.NoReportFoundException;
import popeye.popeyebackend.user.exception.UserNotFoundException;

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
}
