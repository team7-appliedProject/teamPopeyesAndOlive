package popeye.popeyebackend.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import popeye.popeyebackend.global.common.ApiResponse;
import popeye.popeyebackend.global.security.details.PrincipalDetails;
import popeye.popeyebackend.user.dto.request.ProfileImageUpdateRequest;
import popeye.popeyebackend.user.dto.request.UpdateProfileRequest;
import popeye.popeyebackend.user.dto.response.BanUserRes;
import popeye.popeyebackend.user.dto.response.ProfilePhotoRes;
import popeye.popeyebackend.user.dto.response.UserProfileResponse;
import popeye.popeyebackend.user.service.UserService;

import java.util.List;

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

    // 프로필 사진 변경
    @PatchMapping("/me/profile_photo")
    public ResponseEntity<ProfilePhotoRes> updatePhoto(
            @AuthenticationPrincipal PrincipalDetails details,
            MultipartFile file){
        ProfilePhotoRes res = userService.updateProfile(details.getUserId(), file);
        return ResponseEntity.ok(res);
    }

    // 밴 유저 조회
    @GetMapping("/ban-user")
    public ResponseEntity<List<BanUserRes>> getBanUser(
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "0") int page
    ){
        List<BanUserRes> bannedUsers = userService.getBannedUsers(size, page);
        return ResponseEntity.ok(bannedUsers);
    }
}