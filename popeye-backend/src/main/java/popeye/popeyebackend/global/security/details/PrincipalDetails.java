package popeye.popeyebackend.global.security.details;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import popeye.popeyebackend.user.domain.User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

//UserDetails 인터페이스 구현 클래스 - 사용자 인증 정보를 캡슐화
public class PrincipalDetails implements UserDetails, OAuth2User {
	private final User user;
    Map<String, Object> attributes;

	public PrincipalDetails(User user) {
		this.user = user;
	}

    public PrincipalDetails(User user, Map<String, Object> attributes) {
        this.attributes = attributes;
        this.user = user;
    }

    //User 도메인 객체 반환 (컨트롤러에서 사용)
    public User getUser() {
        return user;
    }

    //사용자 ID 반환 (컨트롤러에서 사용)
    public Long getUserId() {
        return user.getId();
    }

    //권한 정보 반환 (Spring Security에서 사용)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
    }

    //비밀번호 반환 (Spring Security에서 사용)
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    //사용자명 반환 (이메일, Spring Security에서 사용)
    @Override
    public String getUsername() {
        return user.getEmail();
    }

    //계정 만료 여부 (기본: 만료되지 않음)
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    //계정 잠금 여부 (기본: 잠금되지 않음)
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    //자격증명 만료 여부 (기본: 만료되지 않음)
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    //계정 활성화 여부 (탈퇴하지 않은 사용자만 활성화)
    @Override
    public boolean isEnabled() {
        return user.getDeletedAt() == null;
    }

    @Override
    public String getName() {
        return user.getNickname();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
}
