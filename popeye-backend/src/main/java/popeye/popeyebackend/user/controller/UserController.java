package popeye.popeyebackend.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import popeye.popeyebackend.global.common.ApiResponse;
import popeye.popeyebackend.global.security.details.PrincipalDetails;
import popeye.popeyebackend.user.dto.request.SettlementInfoRequest;
import popeye.popeyebackend.user.dto.request.UpdateProfileRequest;
import popeye.popeyebackend.user.dto.response.BanUserRes;
import popeye.popeyebackend.user.dto.response.ProfilePhotoRes;
import popeye.popeyebackend.user.dto.response.UserProfileResponse;
import popeye.popeyebackend.user.service.UserService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    private final UserService userService;
    private final popeye.popeyebackend.user.service.UserBookmarkService userBookmarkService;

    //크리에이터 권한 신청 및 승격
    @PatchMapping("/me/creator")
    public ApiResponse<Void> promoteToCreator(@AuthenticationPrincipal PrincipalDetails userDetails) {
        userService.promoteToCreator(userDetails.getUsername());
        //void?
        return ApiResponse.<Void>success("크리에이터 권한으로 승격되었습니다.", null);
    }

        //U-04 내 프로필 조회
    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(@AuthenticationPrincipal PrincipalDetails userDetails) {
        UserProfileResponse response = userService.getMyProfile(userDetails.getUsername());
        log.info("크리에이터 아이디 : " + response.getCreatorId());
        return ApiResponse.success("내 프로필 정보를 성공적으로 조회했습니다.", response);
    }

    //U-04: 내 프로필 정보 수정
    @PatchMapping("/me")
    public ApiResponse<Void> updateProfile(
            @AuthenticationPrincipal PrincipalDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        userService.updateProfile(userDetails.getUsername(), request);
        return ApiResponse.success("프로필 정보가 수정되었습니다.", null);
    }

    //U-08: 크리에이터 정산 정보 업데이트
    @PatchMapping("/me/settlement")
    public ApiResponse<Void> updateSettlementInfo(
            @AuthenticationPrincipal PrincipalDetails userDetails,
            @Valid @RequestBody SettlementInfoRequest request) {
        userService.updateSettlementInfo(userDetails.getUsername(), request);
        return ApiResponse.success("정산 정보가 업데이트되었습니다.", null);
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
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/ban-user")
    public ResponseEntity<List<BanUserRes>> getBanUser(
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "0") int page
    ){
        List<BanUserRes> bannedUsers = userService.getBannedUsers(size, page);
        return ResponseEntity.ok(bannedUsers);
    }

    //U-09: 회원 탈퇴 (Soft Delete, 30일 재가입 제한)
    @DeleteMapping("/me")
    public ApiResponse<Void> withdrawUser(@AuthenticationPrincipal PrincipalDetails userDetails) {
        userService.withdrawUser(userDetails.getUsername());
        return ApiResponse.success("회원 탈퇴가 완료되었습니다. 30일 후 재가입이 가능합니다.", null);
    }

    // 북마크한 컨텐츠 목록 조회
    @GetMapping("/me/bookmarks")
    public ResponseEntity<List<popeye.popeyebackend.content.dto.response.ContentListRes>> getBookmarkedContents(
            @AuthenticationPrincipal PrincipalDetails details) {
        List<popeye.popeyebackend.content.dto.response.ContentListRes> contents = 
                userBookmarkService.getBookmarkedContents(details.getUserId());
        return ResponseEntity.ok(contents);
    }

    // 구매한 컨텐츠 목록 조회
    @GetMapping("/me/purchases")
    public ResponseEntity<List<popeye.popeyebackend.content.dto.response.ContentListRes>> getPurchasedContents(
            @AuthenticationPrincipal PrincipalDetails details) {
        List<popeye.popeyebackend.content.dto.response.ContentListRes> contents = 
                userBookmarkService.getPurchasedContents(details.getUserId());
        return ResponseEntity.ok(contents);
    }
}