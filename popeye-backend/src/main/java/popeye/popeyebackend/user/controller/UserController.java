package popeye.popeyebackend.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import popeye.popeyebackend.global.common.ApiResponse;
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
}