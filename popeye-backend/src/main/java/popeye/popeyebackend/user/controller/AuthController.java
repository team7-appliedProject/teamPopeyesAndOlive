package popeye.popeyebackend.user.controller;

import popeye.popeyebackend.user.dto.request.LoginRequest;
import popeye.popeyebackend.user.dto.request.SignupRequest;
import popeye.popeyebackend.user.dto.response.TokenResponse;
import popeye.popeyebackend.user.service.UserService;
import popeye.popeyebackend.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/signup")
    public ApiResponse<Long> signup(@Valid @RequestBody SignupRequest request) {
        Long userId = userService.signup(request);
        return ApiResponse.success("회원가입이 완료되었습니다.", userId);
    }

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = userService.login(request);
        return ApiResponse.success("로그인에 성공하였습니다.", response);
    }
}