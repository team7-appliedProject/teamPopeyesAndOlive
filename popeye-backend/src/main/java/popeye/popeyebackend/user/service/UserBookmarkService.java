package popeye.popeyebackend.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.content.domain.Content;
import popeye.popeyebackend.content.dto.response.ContentListRes;
import popeye.popeyebackend.content.repository.ContentBookmarkRepository;
import popeye.popeyebackend.content.repository.ContentLikeRepository;
import popeye.popeyebackend.pay.domain.Order;
import popeye.popeyebackend.pay.enums.OrderStatus;
import popeye.popeyebackend.pay.repository.OrderRepository;
import popeye.popeyebackend.user.domain.User;
import popeye.popeyebackend.user.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserBookmarkService {

    private final ContentBookmarkRepository bookmarkRepository;
    private final ContentLikeRepository likeRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public List<ContentListRes> getBookmarkedContents(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Content> bookmarkedContents = bookmarkRepository.findAllByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(bookmark -> bookmark.getContent())
                .filter(content -> content.isActive())
                .collect(Collectors.toList());

        return bookmarkedContents.stream().map(content -> {
            boolean liked = likeRepository.existsByUserAndContent(user, content);
            boolean bookmarked = true; // 북마크 목록이므로 항상 true
            boolean purchased = orderRepository.findByUserIdAndContentId(userId, content.getId())
                    .map(order -> order.getOrderStatus().equals(OrderStatus.COMPLETED))
                    .orElse(false);

            return ContentListRes.from(content, liked, bookmarked, purchased);
        }).collect(Collectors.toList());
    }

    public List<ContentListRes> getPurchasedContents(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Order> completedOrders = orderRepository.findByUser_IdAndOrderStatus(userId, OrderStatus.COMPLETED)
                .stream()
                .filter(order -> order.getContent().isActive())
                .collect(Collectors.toList());

        List<Content> purchasedContents = completedOrders.stream()
                .map(Order::getContent)
                .distinct()
                .collect(Collectors.toList());

        return purchasedContents.stream().map(content -> {
            boolean liked = likeRepository.existsByUserAndContent(user, content);
            boolean bookmarked = bookmarkRepository.existsByUserAndContent(user, content);
            boolean purchased = true; // 구매 목록이므로 항상 true

            return ContentListRes.from(content, liked, bookmarked, purchased);
        }).collect(Collectors.toList());
    }
}

