package popeye.popeyebackend.content.service;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentBan;
import popeye.popeyebackend.content.domain.ContentMedia;
import popeye.popeyebackend.content.dto.request.ContentCreateRequest;
import popeye.popeyebackend.content.dto.response.BannedContentRes;
import popeye.popeyebackend.content.dto.response.ContentResponse;
import popeye.popeyebackend.content.dto.response.FullContentResponse;
import popeye.popeyebackend.content.dto.response.PreviewContentResponse;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.content.repository.ContentBanRepository;
import popeye.popeyebackend.content.enums.MediaType;
import popeye.popeyebackend.content.repository.ContentMediaRepository;
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.service.UserService;
import popeye.popeyebackend.user.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentService {
    private final ContentRepository contentRepository;
    private final ContentBanRepository contentBanRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final ContentMediaRepository contentMediaRepository;

    public Long createContent(Long userId, ContentCreateRequest req) {
        User creator = userRepository.findById(userId).orElseThrow();

        Content content = Content.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .price(req.getPrice())
                .discountRate(req.getDiscountRate())
                .isFree(req.isFree()).build();

        Content saved = contentRepository.save(content);

        // 여기부터 S3 Repo에 추가
        List<ExtractedMediaInfo> extractedUrls = extractImageUrls(saved.getContent());
        List<ContentMedia> contentMedia = new ArrayList<>();

        for (ExtractedMediaInfo url : extractedUrls) {
            ContentMedia media = ContentMedia.builder()
                    .content(saved)
                    .mediaUrl(url.getMediaUrl())
                    .mediaType(url.getMediaType())
                    .build();

            contentMedia.add(media);
        }
        contentMediaRepository.saveAll(contentMedia);

        return saved.getId();
    }

    @Transactional
    public void activeContent(Long contentId){
        Content content = contentRepository.findById(contentId)
                .orElseThrow(()->new RuntimeException("컨텐츠가 없습니다."));

        ContentStatus contentStatus = content.getContentStatus();
        if (contentStatus == ContentStatus.ACTIVE) {
            throw new RuntimeException("already active content");
        } else {
            content.activate();
            ContentBan ban = contentBanRepository.findByContentAndIsBanned(content, true);
            ban.release();
        }
    }

    @Transactional
    public void inactiveContent(Long contentId, String reason, Long adminId) {
        User admin = userService.getUser(adminId);
        Content content = contentRepository.findById(contentId)
                .orElseThrow(()->new RuntimeException("컨텐츠가 없습니다."));

        ContentStatus contentStatus = content.getContentStatus();
        if (contentStatus == ContentStatus.INACTIVE) {
            throw new RuntimeException("already active content");
        } else {
            content.inactivate();
            ContentBan contentBan = ContentBan.builder()
                    .reason(reason)
                    .admin(admin)
                    .content(content).build();
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
        content.activate();
        ContentBan ban = ContentBan.builder()
                .reason(reason).build();
    }

    @Transactional(readOnly = true)
    public ContentResponse getContent(Long contentId) {
        Content content = contentRepository
                .findByIdAndContentStatus(contentId, ContentStatus.ACTIVE)
                .orElseThrow();

        content.increaseViewCount();
        return ContentResponse.from(content);
    }

    @Transactional(readOnly = true)
    public Object getContentWithAccessControl(Long contentId, boolean hasPurchased) {
        Content c = contentRepository.findByIdAndContentStatus(contentId, ContentStatus.ACTIVE)
                .orElseThrow();
        c.increaseViewCount();

        if (c.isFree() || hasPurchased) {
            return FullContentResponse.from(c);
        }
        return PreviewContentResponse.from(c);
    }

    public void deleteContent(Long userId, Long contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow();

        if (!content.getCreator().getId().equals(userId)) {
            throw new IllegalStateException("작성자만 삭제할 수 있습니다.");
        }

        content.inactivate(); // 실제 삭제 아님 (비공개 처리)
    }


    // content에서 media url 추출
    private List<ExtractedMediaInfo> extractImageUrls(String htmlContent) {
        List<ExtractedMediaInfo> urls = new ArrayList<>();
        if (htmlContent == null || htmlContent.isEmpty()) return urls;

        // Jsoup으로 HTML 파싱
        Document doc = Jsoup.parse(htmlContent);

        // img 태그만 모두 찾기
        Elements imgTags = doc.select("img");
        for (Element img : imgTags) {
            // src 속성값(URL) 꺼내기
            String src = img.attr("src");
            if (isValidUrl(src)) {
                urls.add(new ExtractedMediaInfo(src, MediaType.IMAGE));
            }
        }

        Elements videoTags = doc.select("video");
        for (Element video : videoTags) {
            String src = video.attr("src");

            // video 태그 자체에 src가 없으면 자식인 source 태그를 확인
            if (src == null || src.isEmpty()) {
                Element source = video.select("source").first();
                if (source != null) {
                    src = source.attr("src");
                }
            }

            if (isValidUrl(src)) {
                urls.add(new ExtractedMediaInfo(src, MediaType.VIDEO));
            }
        }
        return urls;
    }

    @Getter
    @AllArgsConstructor
    private static class ExtractedMediaInfo {
        private String mediaUrl;
        private MediaType mediaType;
    }

    private boolean isValidUrl(String url) {
        return url != null && !url.isBlank();
    }

    @Transactional(readOnly = true)
    public List<BannedContentRes> getBannedContentList(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ContentBan> banned = contentBanRepository.findAllByIsBanned(true, pageable);
        return banned.stream().map(BannedContentRes::from).toList();
    }
}
