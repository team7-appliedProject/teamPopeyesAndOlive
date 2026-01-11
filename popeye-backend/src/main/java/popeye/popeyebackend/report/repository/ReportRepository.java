package popeye.popeyebackend.report.repository;

import org.springframework.data.jpa.repository.support.JpaRepositoryImplementation;
import popeye.popeyebackend.report.domain.Report;

public interface ReportRepository extends JpaRepositoryImplementation<Report,Long> {
}
