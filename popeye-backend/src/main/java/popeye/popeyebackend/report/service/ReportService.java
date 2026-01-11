package popeye.popeyebackend.report.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.report.dto.ReportProcessDto;
import popeye.popeyebackend.report.enums.ReportState;
import popeye.popeyebackend.report.repository.ReportRepository;
import popeye.popeyebackend.user.domain.DevilUser;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {
    private final ReportRepository reportRepository;

    @Transactional(readOnly = true)
    public Page<Report> getReports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reportRepository.findByState(ReportState.REQUESTED, pageable);
    }

    @Transactional
    public void reportProcess(ReportProcessDto reportProcessDto) {
        Report report = reportRepository.findById(reportProcessDto.reportId())
                .orElseThrow(() -> new RuntimeException("Report not found"));

        ReportState state = report.getState();

        if (state != ReportState.REQUESTED) {
            throw new RuntimeException("이미 처리된 신고입니다.");
        }

        switch (reportProcessDto.state()) {
            case REJECTED -> {
                report.setReportState(ReportState.REJECTED);
            }
            case TRUE ->{
                switch (reportProcessDto.targetType()) {
                    case CONTENT -> blockContent(report.getTargetContent());
                }
                report.setReportState(ReportState.TRUE);
            }
            case FALSE -> {
                if (report.getReporter() == null) {
                    report.setReportState(ReportState.FALSE);
                    log.info("신고자가 탈퇴했습니다.");
                    return;
                }
                DevilUser devilUser = report.getReporter().getDevilUser();
                devilUser.plusDevilCount();
                report.setReportState(ReportState.FALSE);
            }
        }
    }

    private void blockContent(Content content) {
        content.setContentStatus(ContentStatus.INACTIVE);
        content.getCreator().getUser().getDevilUser().plusDevilCount();
    }
}
