package popeye.popeyebackend.notification.exception;

public class NotificationAlreadyRead extends RuntimeException {
    public NotificationAlreadyRead(String message) {
        super(message);
    }
}
