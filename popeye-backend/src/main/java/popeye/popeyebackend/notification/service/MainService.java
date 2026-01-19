package popeye.popeyebackend.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.notification.dto.response.MainDto;
import popeye.popeyebackend.user.enums.Role;
import popeye.popeyebackend.user.repository.CreatorRepository;
import popeye.popeyebackend.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class MainService {

    private final ContentRepository contentRepository;
    private final CreatorRepository creatorRepository;
    private final UserRepository userRepository;

    public MainDto getMainDto() {
        Long totalContent = contentRepository.countByContentStatus(ContentStatus.ACTIVE);
        Long totalOlive = creatorRepository.count();
        Long totalUser = userRepository.countAllByRole(Role.USER);
        return new MainDto(totalContent, totalOlive, totalUser);
    }
}
