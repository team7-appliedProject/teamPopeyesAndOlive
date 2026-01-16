package popeye.popeyebackend.global.security.details;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import popeye.popeyebackend.user.domain.User;

import java.util.Collection;
import java.util.Collections;

public class PrincipalDetails implements UserDetails {
	private final User user;

	public PrincipalDetails(User user) {
		this.user = user;
	}

	public User getUser() {
		return user;
	}

	public Long getUserId() {
		return user.getId();
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
	}

	@Override
	public String getPassword() {
		return user.getPassword();
	}

	@Override
	public String getUsername() {
		return user.getEmail();
	}
}
