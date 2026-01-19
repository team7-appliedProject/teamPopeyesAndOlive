package popeye.popeyebackend.pay.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import popeye.popeyebackend.pay.dto.payment.PaymentListItemResponseDto;
import popeye.popeyebackend.pay.repository.PaymentRepository;

@Service
@RequiredArgsConstructor
public class PaymentQueryService {

    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public Page<PaymentListItemResponseDto> getMyPayments(Long userId, Pageable pageable) {
        return paymentRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable)
                .map(p -> new PaymentListItemResponseDto(
                        p.getId(),
                        p.getPgOrderId(),
                        p.getPaymentType(),
                        p.getAmount(),
                        p.getCreditAmount(),
                        p.getPgProvider(),
                        p.getCreatedAt(),
                        p.getApprovedAt(),
                        p.getCanceledAt(),
                        p.getReceipt(),
                        p.getFailureReason()
                ));
    }
}
