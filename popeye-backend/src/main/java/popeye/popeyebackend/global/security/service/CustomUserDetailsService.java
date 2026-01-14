package popeye.popeyebackend.global.security.service;

import popeye.popeyebackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		return userRepository.findByEmail(email)
			.map(this::createUserDetails)
			.orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email));
	}

	private UserDetails createUserDetails(popeye.popeyebackend.user.domain.User user) {
		return User.builder()
			.username(user.getEmail())
			.password(user.getPassword())
			.roles(user.getRole().name())
			.build();
	}
}