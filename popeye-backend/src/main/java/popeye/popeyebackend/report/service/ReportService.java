package popeye.popeyebackend.report.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.content.service.ContentService;
import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.report.dto.ReportProcessDto;
import popeye.popeyebackend.report.enums.ReportState;
import popeye.popeyebackend.report.repository.ReportRepository;
import popeye.popeyebackend.user.domain.DevilUser;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {
    private final ReportRepository reportRepository;
    private final StringRedisTemplate redisTemplate;

    private static final int REPORT_LIMIT = 30; // 30번 신고되면 차단
    private static final long REPORT_TTL = 24;
    private final ContentService contentService;

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

    // 신고 누적시 자동 차단 기능 -> 신고 발생시 handleContentAutoBlock을 실행하면 차단 횟수 추가
    @Transactional
    public void handleContentAutoBlock(Long contentId) {
        Content content = contentService.getContentById(contentId);
        if (content.getContentStatus() == ContentStatus.INACTIVE) {
            return;
        }
        String key = "report:count:content:" + contentId;

        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, Duration.ofHours(REPORT_TTL));
        }

        if (count != null && count >= REPORT_LIMIT) {
            contentService.autoInactiveContent(contentId, "신고 누적으로 차단되었습니다.");
        }

        redisTemplate.delete(key);

        log.info("게시글 {}번이 신고 누적으로 자동 차단되었습니다.", contentId);
    }
}
