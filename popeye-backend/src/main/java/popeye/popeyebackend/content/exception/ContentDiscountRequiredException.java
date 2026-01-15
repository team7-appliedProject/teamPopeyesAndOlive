package popeye.popeyebackend.content.exception;

public class ContentDiscountRequiredException extends ContentError {

    public ContentDiscountRequiredException() {
        super("유료 콘텐츠는 할인율이 필수입니다.");
    }
}
