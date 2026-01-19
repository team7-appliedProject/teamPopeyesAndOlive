package popeye.popeyebackend.content.exception;

public class ContentNotFoundException extends RuntimeException {
    public ContentNotFoundException() {
        super("콘텐츠를 찾을 수 없습니다.");
    }
}
