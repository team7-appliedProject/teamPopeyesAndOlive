package popeye.popeyebackend.user.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
    USER("ROLE_USER"),
    CREATOR("ROLE_CREATOR"),
    ADMIN("ROLE_ADMIN"),
    BLOCKED("ROLE_BLOCKED");

    private final String key;

}