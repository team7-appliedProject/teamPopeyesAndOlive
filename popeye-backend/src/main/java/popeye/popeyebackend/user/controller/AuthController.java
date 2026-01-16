package popeye.popeyebackend.user.controller;

import popeye.popeyebackend.user.dto.request.LoginRequest;
import popeye.popeyebackend.user.dto.request.SignupRequest;
import popeye.popeyebackend.user.dto.response.TokenResponse;
import popeye.popeyebackend.user.service.PhoneVerificationService;
import popeye.popeyebackend.user.service.UserService;
import popeye.popeyebackend.global.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final PhoneVerificationService verificationService;


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

    //인증번호 발송 요청
    @PostMapping("/sms/send")
    public ApiResponse<Void> sendSms(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get( "phoneNumber");
        verificationService.sendVerificationCode(phoneNumber);
        return ApiResponse.success("인증번호가 발송되었습니다. (3분 유효)", null);
    }

    //인증번호 검증 요청
    @PostMapping("/sms/verify")
    public ApiResponse<Void> verifySms(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String code = request.get("code");
        verificationService.verifyCode(phoneNumber, code);
        return ApiResponse.success("본인 인증에 성공하였습니다.", null);
    }

}