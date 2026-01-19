package popeye.popeyebackend.user.controller;

import popeye.popeyebackend.user.dto.request.LoginRequest;
import popeye.popeyebackend.user.dto.request.PasswordResetConfirmRequest;
import popeye.popeyebackend.user.dto.request.PasswordResetRequest;
import popeye.popeyebackend.user.dto.request.SignupRequest;
import popeye.popeyebackend.user.dto.request.SmsSendRequest;
import popeye.popeyebackend.user.dto.request.SmsVerifyRequest;
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

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.success("로그아웃이 완료되었습니다.", null);
    }

    //U-02: 인증번호 발송 요청
    @PostMapping("/sms/send")
    public ApiResponse<Void> sendSms(@Valid @RequestBody SmsSendRequest request) {
        verificationService.sendVerificationCode(request.getPhoneNumber());
        return ApiResponse.success("인증번호가 발송되었습니다. (3분 유효)", null);
    }

    //U-02: 인증번호 검증 요청
    @PostMapping("/sms/verify")
    public ApiResponse<Void> verifySms(@Valid @RequestBody SmsVerifyRequest request) {
        verificationService.verifyCode(request.getPhoneNumber(), request.getCode());
        return ApiResponse.success("본인 인증에 성공하였습니다.", null);
    }

    //U-06: 비밀번호 재설정 요청 (이메일 발송)
    @PostMapping("/password/reset")
    public ApiResponse<Void> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        userService.requestPasswordReset(request);
        return ApiResponse.success("비밀번호 재설정 링크가 이메일로 발송되었습니다.", null);
    }

    //U-06: 비밀번호 재설정 처리
    @PostMapping("/password/reset/confirm")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody PasswordResetConfirmRequest request) {
        userService.resetPassword(request);
        return ApiResponse.success("비밀번호가 성공적으로 재설정되었습니다.", null);
    }

}