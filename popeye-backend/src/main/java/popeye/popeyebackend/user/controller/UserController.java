package popeye.popeyebackend.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;
import popeye.popeyebackend.user.service.UserService;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;


}
