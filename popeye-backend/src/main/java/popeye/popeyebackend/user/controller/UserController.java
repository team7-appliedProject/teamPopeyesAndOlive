package popeye.popeyebackend.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import popeye.popeyebackend.global.common.ApiResponse;
import popeye.popeyebackend.user.dto.request.SettlementInfoRequest;
import popeye.popeyebackend.user.dto.request.UpdateProfileRequest;
import popeye.popeyebackend.user.dto.response.UserProfileResponse;
import popeye.popeyebackend.user.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    //크리에이터 권한 신청 및 승격
    @PatchMapping("/me/creator")
    public ApiResponse<Void> promoteToCreator(@AuthenticationPrincipal UserDetails userDetails) {
        userService.promoteToCreator(userDetails.getUsername());
        //void?
        return ApiResponse.<Void>success("크리에이터 권한으로 승격되었습니다.", null);
    }

        //U-04 내 프로필 조회
    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponse response = userService.getMyProfile(userDetails.getUsername());
        return ApiResponse.success("내 프로필 정보를 성공적으로 조회했습니다.", response);
    }

    //U-04: 내 프로필 정보 수정
    @PatchMapping("/me")
    public ApiResponse<Void> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        userService.updateProfile(userDetails.getUsername(), request);
        return ApiResponse.success("프로필 정보가 수정되었습니다.", null);
    }

    //U-08: 크리에이터 정산 정보 업데이트
    @PatchMapping("/me/settlement")
    public ApiResponse<Void> updateSettlementInfo(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SettlementInfoRequest request) {
        userService.updateSettlementInfo(userDetails.getUsername(), request);
        return ApiResponse.success("정산 정보가 업데이트되었습니다.", null);
    }
}