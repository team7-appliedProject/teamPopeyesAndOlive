package popeye.popeyebackend.pay.domain;

import jakarta.persistence.*;
import lombok.*;
import popeye.popeyebackend.pay.enums.WithdrawalStatus;
import popeye.popeyebackend.user.domain.Creator;

import java.time.LocalDateTime;

@Entity
@Table(name = "withdrawal")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Withdrawal {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "creator_id", nullable = false)
	private Creator creator;

	// 추가 컬럼: 출금 신청 금액
	@Column(nullable = false)
	private Long amount;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private WithdrawalStatus status;

	// 추가 컬럼: 요청 날짜
	@Column(name = "requested_at", nullable = false)
	private LocalDateTime requestedAt;

	// 추가 컬럼: 처리 날짜
	@Column(name = "processed_at")
	private LocalDateTime processedAt;

	// 실패 사유
	@Column(name = "failure_reason", length = 500)
	private String failureReason;

	public static Withdrawal request(Creator creator, long amount) {
		return Withdrawal.builder()
			.creator(creator)
			.amount(amount)
			.status(WithdrawalStatus.REQ)
			.requestedAt(LocalDateTime.now())
			.build();
	}

	public void markAsSuccess() {
		this.status = WithdrawalStatus.SUC;
		this.processedAt = LocalDateTime.now();
	}

	public void markAsRejected(String reason) {
		this.status = WithdrawalStatus.REJ;
		this.processedAt = LocalDateTime.now();
		this.failureReason = reason;
	}
}