package popeye.popeyebackend.pay.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.repository.ContentRepository;
import popeye.popeyebackend.global.exception.ErrorCode;
import popeye.popeyebackend.pay.domain.Credit;
import popeye.popeyebackend.pay.domain.Order;
import popeye.popeyebackend.pay.enums.CreditType;
import popeye.popeyebackend.pay.enums.OrderStatus;
import popeye.popeyebackend.pay.enums.ReasonType;
import popeye.popeyebackend.global.exception.ApiException;
import popeye.popeyebackend.pay.repository.CreditRepository;
import popeye.popeyebackend.pay.repository.OrderRepository;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.service.UserService;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final ContentRepository contentRepository;
    private final CreditRepository creditRepository;
    private final OrderRepository orderRepository;
    private final CreditHistoryService creditHistoryService;
    private final UserService userService;

    @Transactional
    public Long purchase(Long userId, Long contentId){
        Content content = contentRepository.findById(contentId).orElseThrow(() -> new ApiException(ErrorCode.INVALID_REQUEST));

        User user = userService.getUser(userId);

        // 중복 구매 방지
        if (orderRepository.existsByUser_IdAndContent_Id(user.getId(), contentId)){
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }

        int priceCredits = calculatePriceCredits(content);

        if (priceCredits == 0){
            Long orderId = saveOrder(user, content, 0, 0, 0);
            return orderId;
        }

        //사용 가능한 credit 조회
        LocalDateTime now = LocalDateTime.now();
        List<Credit> usable = creditRepository.findUsableCredits(user.getId(), now);

        int total = usable.stream().mapToInt(Credit::getAmount).sum();
        if (total < priceCredits){
            throw new ApiException(ErrorCode.NOT_ENOUGH_CREDIT);
        }


        int remain = priceCredits;

        int usedFree = 0;
        int usedPaid = 0;

        // FREE -> PAID 순으로 차감
        List<Credit> freeCredits = usable.stream()
                .filter(c -> c.getCreditType() == CreditType.FREE)
                .sorted(Comparator.comparing(Credit::getExpiredAt, Comparator.naturalOrder()))
                .toList();

        for (Credit c : freeCredits){
            if (remain == 0) break;
            int use = Math.min(c.getAmount(), remain);
            c.deduct(use);
            remain -= use;
            usedFree += use;
        }

        if (remain > 0) {
            List<Credit> paidCredits = usable.stream()
                    .filter(c -> c.getCreditType() == CreditType.PAID)
                    .sorted(Comparator.comparing(Credit::getPaidAt))
                    .toList();

            for (Credit c : paidCredits){
                if (remain == 0) break;
                int use = Math.min(c.getAmount(), remain);
                c.deduct(use);
                remain -= use;
                usedPaid += use;
            }
        }
        if (remain != 0) {
            throw new ApiException(ErrorCode.NOT_ENOUGH_CREDIT);
        }

        Long orderId = saveOrder(user, content, priceCredits, usedFree, usedPaid);

        if (usedFree > 0){
            creditHistoryService.record(
                    user,
                    CreditType.FREE,
                    ReasonType.PURCHASE,
                    -usedFree,
                    orderId,
                    null
            );
        }
        if (usedPaid > 0){
            creditHistoryService.record(
                    user,
                    CreditType.PAID,
                    ReasonType.PURCHASE,
                    -usedPaid,
                    orderId,
                    null
            );
        }
        if (usedFree > 0) user.decreaseFreeCredit(usedFree);
        if (usedPaid > 0) user.decreasePaidCredit(usedPaid);


        return orderId;
    }



    private Long saveOrder(User user, Content content, int totalUsed, int usedFree, int usedPaid){
        try{
            Order order = Order.builder()
                    .user(user)
                    .content(content)
                    .totalCreditUsed(totalUsed)
                    .usedFreeCredit(usedFree)
                    .usedPaidCredit(usedPaid)
                    .orderStatus(OrderStatus.COMPLETED)
                    .quantity(1)
                    .build();
            orderRepository.save(order);
            return order.getId();
        }catch (DataIntegrityViolationException e){
            throw new ApiException(ErrorCode.INVALID_REQUEST);
        }
    }

    // 추후 확장 예정(할인률 정책)
    private int calculatePriceCredits(Content content){
        if (content.isFree()) return 0;
        return content.getPrice();
    }
}
