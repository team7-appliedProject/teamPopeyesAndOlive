package popeye.popeyebackend.notification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import popeye.popeyebackend.notification.dto.response.MainDto;
import popeye.popeyebackend.notification.service.MainService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/main")
public class MainController {

    private final MainService mainService;

    @GetMapping
    public ResponseEntity<MainDto> getMain() {
        return ResponseEntity.ok(mainService.getMainDto());
    }
}
