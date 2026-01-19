package popeye.popeyebackend.pay.controller;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import popeye.popeyebackend.global.exception.ErrorCode;
import popeye.popeyebackend.global.security.details.PrincipalDetails;
import popeye.popeyebackend.pay.domain.Order;
import popeye.popeyebackend.pay.dto.order.PurchaseResponseDto;
import popeye.popeyebackend.global.exception.ApiException;
import popeye.popeyebackend.pay.repository.OrderRepository;
import popeye.popeyebackend.pay.service.OrderService;



@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    //콘텐츠 구매
    @PostMapping("/contents/{contentId}")
    public ResponseEntity<PurchaseResponseDto> purchase(
             @AuthenticationPrincipal PrincipalDetails principalDetails, // 추후 사용 예정
            @PathVariable @NotNull Long contentId){

        // 임시: 인증 시스템 완성 전까지 임시 userId 사용
         Long userId = principalDetails.getUserId();

        Long orderId = orderService.purchase(userId, contentId);

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
