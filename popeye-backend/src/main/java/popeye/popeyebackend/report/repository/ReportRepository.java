package popeye.popeyebackend.report.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.report.domain.Report;

public interface ReportRepository extends JpaRepository<Report, Long> {
}
