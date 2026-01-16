package popeye.popeyebackend.report.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.content.service.ContentService;
import popeye.popeyebackend.report.domain.Report;
import popeye.popeyebackend.report.dto.ReportReqDto;
import popeye.popeyebackend.report.dto.ReportProcessDto;
import popeye.popeyebackend.report.dto.ReportResDto;
import popeye.popeyebackend.report.enums.ReportState;
import popeye.popeyebackend.report.enums.TargetType;
import popeye.popeyebackend.report.exception.AlreadyProcessedException;
import popeye.popeyebackend.report.exception.AlreadyReportException;
import popeye.popeyebackend.report.exception.NoReportFoundException;
import popeye.popeyebackend.report.exception.MissedReportTypeException;
import popeye.popeyebackend.report.repository.ReportRepository;
import popeye.popeyebackend.user.domain.DevilUser;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.service.UserService;

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
    private final UserService userService;

    // 신고 목록 받기
    @Transactional(readOnly = true)
    public Page<Report> getReports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reportRepository.findByState(ReportState.REQUESTED, pageable);
    }

    // 신고 처리
    @Transactional
    public void reportProcess(Long reportId, ReportProcessDto reportProcessDto) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new NoReportFoundException("Report not found"));

        ReportState state = report.getState();

        if (state != ReportState.REQUESTED) {
            throw new AlreadyProcessedException("이미 처리된 신고입니다.");
        }

        switch (reportProcessDto.state()) {
            case REJECTED -> {
                report.setReportState(ReportState.REJECTED);
            }
            case TRUE -> {
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
        content.inactivate();
        content.getCreator().getUser().getDevilUser().plusDevilCount();
    }

    // 신고 누적시 자동 차단 기능 -> 신고 발생시 handleContentAutoBlock을 실행하면 차단 횟수 추가
    @Transactional
    public void handleContentAutoBlock(Long contentId, Long userId) {
        Content content = contentService.getContentById(contentId);
        if (content.getContentStatus() == ContentStatus.INACTIVE) {
            return;
        }
        String key = "report:count:content:" + contentId; // 신고 횟수

        Long count = redisTemplate.opsForValue().increment(key);


        if (count != null && count == 1) {
            redisTemplate.expire(key, Duration.ofHours(REPORT_TTL));
        }

        if (count != null && count >= REPORT_LIMIT) {
            contentService.autoInactiveContent(contentId, "신고 누적으로 차단되었습니다.");
            redisTemplate.delete(key);
            log.info("게시글 {}번이 신고 누적으로 자동 차단되었습니다.", contentId);
        }
    }

    // 게시글 신고하기
    @Transactional
    public ReportResDto makeReport(Long reportUserId,ReportReqDto reportReqDto) {
        Report save = switch (reportReqDto.type()) {
            case CONTENT -> {
                Report report = addContentReport(reportUserId, reportReqDto);
                Report saveReport = reportRepository.save(report);
                handleContentAutoBlock(saveReport.getTargetContent().getId(), reportUserId);
                yield saveReport;
            }

            default -> throw new MissedReportTypeException("잘못된 신고 타입입니다.");
        };

        return ReportResDto.from(save);
    }

    private Report addContentReport(Long reportUserId, ReportReqDto reportReqDto) {
        User reporter = userService.getUser(reportUserId);
        Content content = contentService.getContentById(reportReqDto.targetId());
        if (reportRepository.existsByTargetContentAndReporter(content, reporter)) {
            throw new AlreadyReportException("이미 신고한 게시글입니다.");
        }
        return Report.builder()
                .reportDescription(reportReqDto.reason())
                .targetType(TargetType.CONTENT)
                .reporter(reporter)
                .targetContent(content).build();
    }
}
