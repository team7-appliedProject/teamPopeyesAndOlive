package popeye.popeyebackend.pay.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.pay.dto.credit.CreditHistoryItemResponseDto;
import popeye.popeyebackend.pay.repository.CreditHistoryRepository;

@Service
@RequiredArgsConstructor
public class CreditHistoryQueryService {

    private final CreditHistoryRepository creditHistoryRepository;

    @Transactional(readOnly = true)
    public Page<CreditHistoryItemResponseDto> getMyHistory(Long userId, Pageable pageable) {
        return creditHistoryRepository
                .findByUser_IdOrderByChangedAtDesc(userId, pageable)
                .map(h -> new CreditHistoryItemResponseDto(
                        h.getId(),
                        h.getCreditType(),
                        h.getReasonType(),
                        h.getDelta(),
                        h.getChangedAt(),
                        h.getOrderId(),
                        h.getPaymentId()
                ));
    }
}
