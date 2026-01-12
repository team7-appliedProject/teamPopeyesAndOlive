package popeye.popeyebackend.report.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.report.enums.ReportState;

public interface ReportRepository extends JpaRepository<Report, Long> {

    Page<Report> findByState(ReportState state, Pageable pageable);
}
