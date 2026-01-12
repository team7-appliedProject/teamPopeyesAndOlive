package popeye.popeyebackend.content.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentBan;

import java.util.List;

public interface ContentBanRepository extends JpaRepository<ContentBan, Long> {
    ContentBan findByContent(Content content);
}
