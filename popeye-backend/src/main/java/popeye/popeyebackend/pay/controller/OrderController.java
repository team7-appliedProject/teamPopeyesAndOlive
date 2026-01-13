package popeye.popeyebackend.pay.controller;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import popeye.popeyebackend.pay.domain.Order;
import popeye.popeyebackend.pay.dto.order.PurchaseResponseDto;
import popeye.popeyebackend.pay.exception.ApiException;
import popeye.popeyebackend.pay.exception.ErrorCode;
import popeye.popeyebackend.pay.repository.OrderRepository;
import popeye.popeyebackend.pay.service.OrderService;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.UserRepository;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    //콘텐츠 구매
    @PostMapping("/contents/{contentId}")
    public ResponseEntity<PurchaseResponseDto> purchase(@PathVariable @NotNull Long contentId){
        // 임시 사용자
        User user = userRepository.findById(1L).orElseThrow();

        Long orderId = orderService.purchase(user, contentId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_REQUEST));

        PurchaseResponseDto response = new PurchaseResponseDto(
                order.getId(),
                order.getTotalCreditUsed(),
                order.getUsedFreeCredit(),
                order.getUsedPaidCredit()
        );

        return ResponseEntity.ok(response);
    }
}
