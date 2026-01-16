package popeye.popeyebackend.pay.exception;

import lombok.Getter;
import popeye.popeyebackend.global.exception.ErrorCode;

@Getter
public class ApiException extends RuntimeException{
    private final ErrorCode errorCode;

    public ApiException(ErrorCode errorCode){
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
