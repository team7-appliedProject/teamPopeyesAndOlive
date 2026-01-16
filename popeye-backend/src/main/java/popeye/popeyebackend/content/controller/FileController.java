package popeye.popeyebackend.content.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import popeye.popeyebackend.content.enums.MediaType;
import popeye.popeyebackend.content.global.s3.S3Uploader;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/files")
public class FileController {

    private final S3Uploader s3Uploader;

    // 사진 or 비디오 업로드시 바로 진행
    @PostMapping("/upload")
    public ResponseEntity<String> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam MediaType mediaType) {
            String dirName = mediaType.name();

            String url = s3Uploader.upload(file, dirName);
        return ResponseEntity.ok(url);
    }
}
