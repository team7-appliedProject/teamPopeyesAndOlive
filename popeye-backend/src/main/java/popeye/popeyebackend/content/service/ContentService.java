package popeye.popeyebackend.content.service;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.domain.ContentMedia;
import popeye.popeyebackend.content.dto.request.ContentCreateRequest;
import popeye.popeyebackend.content.dto.response.ContentResponse;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.content.enums.MediaType;
import popeye.popeyebackend.content.repository.ContentMediaRepository;
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentService {
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final ContentMediaRepository contentMediaRepository;

    public Long createContent(Long userId, ContentCreateRequest req) {
        User creator = userRepository.findById(userId).orElseThrow();

        Content content = Content.create( //build 패턴
                creator,
                req.getTitle(),
                req.getBody(),
                req.getPrice(), //null 처리하기
                req.getDiscountRate(), //여기도
                req.isFree()
        );

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

    public ContentResponse getContent(Long contentId) {
        Content content = contentRepository
                .findByIdAndContentStatus(contentId, ContentStatus.ACTIVE)
                .orElseThrow();

        content.increaseViewCount();
        return ContentResponse.from(content);
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
}
