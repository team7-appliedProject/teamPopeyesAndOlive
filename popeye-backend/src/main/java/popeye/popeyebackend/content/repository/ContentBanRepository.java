package popeye.popeyebackend.content.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.content.domain.ContentBan;

public interface ContentBanRepository extends JpaRepository<ContentBan, Integer> {
}
