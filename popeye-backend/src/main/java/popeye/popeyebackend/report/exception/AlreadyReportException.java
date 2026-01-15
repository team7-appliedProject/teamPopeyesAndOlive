package popeye.popeyebackend.report.exception;

public class AlreadyReportException extends RuntimeException {
    public AlreadyReportException(String message) {
        super(message);
    }
}
