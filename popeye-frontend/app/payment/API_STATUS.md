# API 연결 상태 확인 결과

## ✅ 연결 완료된 API

### 1. Payment API
**백엔드 컨트롤러**: `PaymentController.java`
- ✅ `POST /api/payments/prepare` - 결제 준비
- ✅ `POST /api/payments/confirm` - 결제 승인
- ✅ `POST /api/payments/{paymentId}/refund` - 환불

**프론트엔드**: `app/lib/api.ts`의 `paymentApi`
- ✅ `paymentApi.prepare()` - 구현 완료
- ✅ `paymentApi.confirm()` - 구현 완료
- ✅ `paymentApi.refund()` - 구현 완료

**타입 정의**: ✅ 일치
- 백엔드: `PreparePaymentResponseDto { paymentId, pgOrderId }`
- 프론트엔드: `PreparePaymentResponse { paymentId, pgOrderId }` ✅ 수정 완료

### 2. Order API
**백엔드 컨트롤러**: `OrderController.java`
- ✅ `POST /api/orders/contents/{contentId}` - 콘텐츠 구매

**프론트엔드**: `app/lib/api.ts`의 `orderApi`
- ✅ `orderApi.purchase()` - 구현 완료

**타입 정의**: ✅ 일치
- 백엔드: `PurchaseResponseDto { orderId, totalCreditUsed, usedFreeCredit, usedPaidCredit }`
- 프론트엔드: `PurchaseResponse { orderId, totalCreditUsed, usedFreeCredit, usedPaidCredit }`

### 3. Event API
**백엔드 컨트롤러**: `EventController.java`
- ✅ `POST /api/events/free-credits?amount={amount}` - 무료 크레딧 지급

**프론트엔드**: `app/lib/api.ts`의 `eventApi`
- ✅ `eventApi.grantFreeCredits()` - **방금 추가 완료**

**타입 정의**: ✅ 일치
- 백엔드: 반환 타입 `Long` (creditId)
- 프론트엔드: 반환 타입 `number` (creditId)

### 4. Toss Payments 연동
**백엔드**: `TossPaymentsClient.java`
- ✅ `confirm()` - Toss 결제 승인 API 호출
- ✅ `cancel()` - Toss 결제 취소 API 호출
- ✅ 설정: `TossPaymentsProperties` (secretKey, baseUrl)
- ✅ 환경변수: `TOSS_SECRET_KEY` (application.yml)

**연동 상태**: ✅ 완료
- 결제 승인 시 Toss API 호출
- 환불 시 Toss API 호출
- Basic Auth 헤더 자동 설정

## 📝 참고사항

1. **결제 준비 응답 타입 수정 완료**
   - 이전: `{ pgOrderId, amount, orderName }` (잘못된 타입)
   - 현재: `{ paymentId, pgOrderId }` (백엔드와 일치) ✅

2. **Event API 추가 완료**
   - `eventApi.grantFreeCredits(amount)` 함수 추가
   - 쿼리 파라미터로 `amount` 전달

3. **실제 사용 예시**
   - `app/credit-charge/page.js`에 TODO 주석 있음 (실제 연동 필요)
   - API는 준비되어 있으니 프론트엔드에서 호출만 하면 됨

## 🎯 다음 단계

1. `app/credit-charge/page.js`에서 실제 API 호출 구현
2. Toss Payments SDK 연동 (프론트엔드)
3. 결제 플로우 테스트

