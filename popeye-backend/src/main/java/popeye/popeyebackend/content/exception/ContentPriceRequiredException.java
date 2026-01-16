package popeye.popeyebackend.content.exception;

public class ContentPriceRequiredException extends ContentError {

    public ContentPriceRequiredException() {
        super("유료 콘텐츠는 가격이 필수입니다.");
    }
}
