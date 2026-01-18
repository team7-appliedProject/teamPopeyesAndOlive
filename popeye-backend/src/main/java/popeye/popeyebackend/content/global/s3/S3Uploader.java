package popeye.popeyebackend.content.global.s3;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import popeye.popeyebackend.user.domain.User;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Uploader {

    private final AmazonS3 amazonS3;
    private static final String DEFAULT_PROFILE_URL = "https://popeye-project-media-bucket.s3.ap-northeast-2.amazonaws.com/user_profile/%EB%BD%80%EB%B9%A0%EC%9D%B4.jpg";

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public String upload(MultipartFile file, String dirName) {
        // 파일 이름 중복 방지
        String originalFilename = file.getOriginalFilename();
        String folder = dirName.toLowerCase();
        String fileName = folder + "/" + UUID.randomUUID() + file.getOriginalFilename();

        // 2. 메타 데이터 설정
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        // 3. 전송
        try {
            amazonS3.putObject(bucket, fileName, file.getInputStream(), metadata);
        } catch (IOException e) {
            throw new RuntimeException("S3 upload failed: " + e.getMessage());
        }

        return amazonS3.getUrl(bucket, fileName).toString();
    }

    @Transactional
    public String updateProfileImage(User user, MultipartFile file) {
        String oldImageUrl = user.getProfileImageUrl();
        String dirName = "user_profile";

        String newImageUrl = upload(file, dirName);
        user.updateProfile(newImageUrl);

        if (!oldImageUrl.equals(DEFAULT_PROFILE_URL) && oldImageUrl != null) {
            deleteFile(oldImageUrl);
        }
        return newImageUrl;
    }

    public void deleteFile(String fileUrl) {
        String key = extractKeyFromUrl(fileUrl);

        try {
            amazonS3.deleteObject(bucket, key);

        } catch (Exception e) {
            log.error("S3 파일 삭제 실패: {}", e.getMessage());
        }
    }

    // URL에서 순수 파일명(Key)을 발라내는 헬퍼 메서드
    private String extractKeyFromUrl(String fileUrl) {
        try {
            String path = new java.net.URL(fileUrl).getPath();

            // 맨 앞의 '/' 제거 (S3 Key는 /로 시작하지 않음)
            if (path.startsWith("/")) {
                path = path.substring(1);
            }

            // 한글 파일명 등 깨짐 방지를 위해 디코딩 필수! ("%20" -> " ")
            return URLDecoder.decode(path, StandardCharsets.UTF_8.toString());

        } catch (Exception e) {
            throw new IllegalArgumentException("잘못된 URL 형식입니다.");
        }
    }
}
