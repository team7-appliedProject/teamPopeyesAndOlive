package popeye.popeyebackend.content.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentBan;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.content.repository.ContentBanRepository;
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.user.domain.User;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentService {
    private final ContentRepository contentRepository;
    private final ContentBanRepository contentBanRepository;

    @Transactional
    public void activeContent(Long contentId){
        Content content = contentRepository.findById(contentId)
                .orElseThrow(()->new RuntimeException("컨텐츠가 없습니다."));

        ContentStatus contentStatus = content.getContentStatus();
        if (contentStatus == ContentStatus.ACTIVE) {
            throw new RuntimeException("already active content");
        } else {
            content.setContentStatus(ContentStatus.ACTIVE);
            ContentBan ban = contentBanRepository.findByContent(content);
            ban.release();
        }
    }

    @Transactional
    public void inactiveContent(Long contentId, String reason, User admin) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(()->new RuntimeException("컨텐츠가 없습니다."));

        ContentStatus contentStatus = content.getContentStatus();
        if (contentStatus == ContentStatus.INACTIVE) {
            throw new RuntimeException("already active content");
        } else {
            content.setContentStatus(ContentStatus.INACTIVE);
            ContentBan contentBan = ContentBan.builder()
                    .reason(reason)
                    .admin(admin).build();
            contentBanRepository.save(contentBan);
        }
    }

    @Transactional(readOnly = true)
    public Content getContentById(Long contentId) {
        return contentRepository.findById(contentId)
                .orElseThrow(()-> new RuntimeException("no content"));
    }

    @Transactional
    public void autoInactiveContent(Long contentId, String reason) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(()->new RuntimeException("no content"));
        content.setContentStatus(ContentStatus.INACTIVE);
        ContentBan ban = ContentBan.builder()
                .reason(reason).build();
    }
}
