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
import popeye.popeyebackend.content.dto.response.*;
import popeye.popeyebackend.content.enums.ContentStatus;
import popeye.popeyebackend.content.global.s3.S3Uploader;
import popeye.popeyebackend.content.repository.ContentBanRepository;
import popeye.popeyebackend.content.enums.MediaType;
import popeye.popeyebackend.content.repository.ContentMediaRepository;
import popeye.popeyebackend.content.exception.AccessDeniedException;
import popeye.popeyebackend.content.exception.ContentNotFoundException;
import popeye.popeyebackend.content.exception.UserNotFoundException;
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.content.repository.ContentLikeRepository;
import popeye.popeyebackend.content.repository.ContentBookmarkRepository;
import popeye.popeyebackend.pay.domain.Order;
import popeye.popeyebackend.pay.enums.OrderStatus;
import popeye.popeyebackend.pay.repository.OrderRepository;
import popeye.popeyebackend.user.domain.Creator;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.CreatorRepository;
import popeye.popeyebackend.user.service.UserService;
import popeye.popeyebackend.user.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ContentService {

    private final ContentRepository contentRepository;
    private final ContentBanRepository contentBanRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final CreatorRepository creatorRepository;
    private final OrderRepository orderRepository;
    private final ContentMediaRepository contentMediaRepository;
    private final S3Uploader s3Uploader;
    private final ContentLikeRepository contentLikeRepository;
    private final ContentBookmarkRepository contentBookmarkRepository;

    // 생성
    public Long createContent(Long userId, ContentCreateRequest req) {

        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        Creator creator = creatorRepository.findByUser(user)
                .orElseThrow(() -> new IllegalStateException("크리에이터 권한이 없습니다."));

        Content content = Content.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .price(req.getPrice())
                .discountRate(req.getDiscountRate())
                .isFree(req.isFree())
                .creator(creator)
                .build();

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

    @Transactional
    public ContentResponse getContent(Long contentId, Long userId) {

        Content content = contentRepository
                .findByIdAndContentStatus(contentId, ContentStatus.ACTIVE)
                .orElseThrow(ContentNotFoundException::new);

        User viewer = null;
        if (userId != null) {
            viewer = userRepository.findById(userId)
                    .orElse(null);
        }

        // 조회수 증가 (로그인 여부와 관계없이)
        content.increaseViewCount();
        contentRepository.save(content);

        // 사용자별 좋아요/북마크 상태 확인
        boolean isLiked = false;
        boolean isBookmarked = false;
        if (viewer != null) {
            isLiked = contentLikeRepository.existsByUserAndContent(viewer, content);
            isBookmarked = contentBookmarkRepository.existsByUserAndContent(viewer, content);
        }

        if (viewer != null && canViewFullContent(content, viewer)) {
            return FullContentResponse.from(content, isLiked, isBookmarked);
        }

        return PreviewContentResponse.from(content, isLiked, isBookmarked);
    }

    // 콘텐츠 삭제
    public void deleteContent(Long userId, Long contentId) {

        Content content = contentRepository.findById(contentId)
                .orElseThrow(ContentNotFoundException::new);

        if (!content.getCreator().getId().equals(userId)) {
            throw new AccessDeniedException("작성자만 삭제할 수 있습니다.");
        }

        content.softDelete();
    }

    public void hardDeleteContent(Long adminUserId, Long contentId) {

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(UserNotFoundException::new);

        if (!admin.getRole().equals("ADMIN")) {
            throw new AccessDeniedException("관리자만 하드 삭제할 수 있습니다.");
        }

        Content content = contentRepository.findById(contentId)
                .orElseThrow(ContentNotFoundException::new);

        // 컨텐츠에서 저장했던 파일 삭제
        List<ContentMedia> contentMedia = content.getContentMedia();
        for (ContentMedia media : contentMedia) {
            s3Uploader.deleteFile(media.getMediaUrl());
        }

        contentRepository.delete(content);
    }


    private boolean canViewFullContent(Content content, User viewer) {

        boolean isCreator = content.getCreator().getId().equals(viewer.getId());
        boolean isAdmin = viewer.getRole().name().equals("ADMIN");

        if (isCreator || isAdmin) {
            return true;
        }

        if (content.isFree()) {
            return true;
        }

        if (hasPurchased(viewer.getId(), content.getId())){
            return true;
        }
        return false;
    }

    // 구매여부
    private boolean hasPurchased(Long userId, Long contentId) {
        Optional<Order> orderOpt = orderRepository.findByUserIdAndContentId(userId, contentId);
        if (orderOpt.isEmpty()) {
            return false;
        }
        Order order = orderOpt.get();
        return order.getOrderStatus().equals(OrderStatus.COMPLETED);
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

    public List<ContentListRes> getFreeContentList(boolean isfree, int page, int size, Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Content> list = contentRepository.findByContentStatusAndIsFree(ContentStatus.ACTIVE, isfree, pageable);
        
        User viewer = null;
        if (userId != null) {
            viewer = userRepository.findById(userId).orElse(null);
        }
        
        final User finalViewer = viewer;
        return list.stream().map(content -> {
            boolean liked = false;
            boolean bookmarked = false;
            boolean purchased = false;
            
            if (finalViewer != null) {
                liked = contentLikeRepository.existsByUserAndContent(finalViewer, content);
                bookmarked = contentBookmarkRepository.existsByUserAndContent(finalViewer, content);
                purchased = hasPurchased(finalViewer.getId(), content.getId());
            }
            
            return ContentListRes.from(content, liked, bookmarked, purchased);
        }).toList();
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

    @Transactional(readOnly = true)
    public List<ContentListRes> getContentList(int page, int size, Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Content> all = contentRepository.findAllByContentStatus(ContentStatus.ACTIVE, pageable);
        
        User viewer = null;
        if (userId != null) {
            viewer = userRepository.findById(userId).orElse(null);
        }
        
        final User finalViewer = viewer;
        return all.stream().map(content -> {
            boolean liked = false;
            boolean bookmarked = false;
            boolean purchased = false;
            
            if (finalViewer != null) {
                liked = contentLikeRepository.existsByUserAndContent(finalViewer, content);
                bookmarked = contentBookmarkRepository.existsByUserAndContent(finalViewer, content);
                purchased = hasPurchased(finalViewer.getId(), content.getId());
            }
            
            return ContentListRes.from(content, liked, bookmarked, purchased);
        }).toList();
    }
}
