# Payment 프론트엔드 Toss 연동 트러블슈팅

이 문서는 Payment 프론트엔드에서 Toss Payments 연동 중 발생했던 오류들과 해결 방법을 정리한 것입니다.

## 1. 404 (Not Found) - API 요청 실패

### 증상
```
POST http://localhost:3000/api/payments/prepare 404 (Not Found)
```

### 원인
Next.js에서 `/api/*` 경로로 요청이 프록시되지 않아 백엔드(`http://localhost:8080`)로 전달되지 않음.

### 해결 방법
`next.config.js`에 rewrites 설정 추가:

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8080/api/:path*',
    },
  ];
}
```

### 관련 파일
- `popeye-frontend/next.config.js`

---

## 2. 403 (Forbidden) - 인증 오류

### 증상
```
POST http://localhost:3000/api/payments/prepare 403 (Forbidden)
```

### 원인
Spring Security에서 `/api/payments/**` 경로에 대한 인증이 필요했지만, 인증 시스템이 완성되지 않아 임시로 접근 허용이 필요했음.

### 해결 방법

#### 백엔드: SecurityConfig 수정
```java
.requestMatchers("/api/payments/**").permitAll()
.requestMatchers("/api/orders/**").permitAll()
.requestMatchers("/api/events/**").permitAll()
```

#### 프론트엔드: api.ts에 JWT 토큰 헤더 추가
```typescript
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token') 
    || localStorage.getItem('jwt') 
    || localStorage.getItem('accessToken')
    || localStorage.getItem('authToken');
  return token;
};

const token = getAuthToken();
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### 관련 파일
- `popeye-backend/src/main/java/popeye/popeyebackend/global/config/SecurityConfig.java`
- `popeye-frontend/app/lib/api.ts`

---

## 3. ChunkLoadError - Next.js 빌드 캐시 오류

### 증상
```
ChunkLoadError: Loading chunk app/layout failed. (timeout: http://localhost:3000/_next/static/chunks/app/layout.js)
```

### 원인
Next.js 빌드 캐시가 손상되었거나 불일치 상태.

### 해결 방법
`.next` 폴더 삭제 후 재시작:

```bash
# Windows PowerShell
Remove-Item -Recurse -Force .next
npm run dev
```

### 관련 파일
- `popeye-frontend/.next/` (삭제 대상)

---

## 4. 400 (Bad Request) - amount 검증 오류

### 증상
```
POST http://localhost:3000/api/payments/confirm 400 (Bad Request)
에러 메시지: "승인 금액은 10원 이상이어야 합니다."
```

### 원인
1. 프론트엔드에서 `amount`를 크레딧 단위로 전송 (예: 10000 크레딧)
2. 백엔드에서 원 단위로 검증 (최소 10원)
3. Toss Payments의 successUrl에서 `amount` 파라미터가 항상 전달되지 않음

### 해결 방법

#### 백엔드: amount를 optional로 변경
```java
// ConfirmPaymentRequestDto.java
private Integer amount; // @Min 제거, nullable로 변경

// PaymentController.java
if (confirmPaymentRequestDto.getAmount() != null && 
    confirmPaymentRequestDto.getAmount() < 10) {
  throw new ApiException(ErrorCode.INVALID_REQUEST);
}

// PaymentService.java
Integer finalAmount = amount != null 
  ? amount 
  : payment.getAmount(); // DB에서 조회
```

#### 프론트엔드: amount 전달하지 않음
```javascript
// success/page.js
// amount는 전달하지 않음 (서버에서 pgOrderId로 조회)
await paymentApi.confirm({
  pgOrderId: orderId,
  paymentKey: paymentKey,
  // amount 제거
});
```

### 중요 규칙
- **프론트엔드**: `amount = creditAmount * 10` (원 단위)
- **백엔드**: `amount`는 원 단위로 검증 및 저장
- **Toss API**: 원 단위로 전달

### 관련 파일
- `popeye-backend/src/main/java/popeye/popeyebackend/pay/dto/payment/ConfirmPaymentRequestDto.java`
- `popeye-backend/src/main/java/popeye/popeyebackend/pay/controller/PaymentController.java`
- `popeye-backend/src/main/java/popeye/popeyebackend/pay/service/PaymentService.java`
- `popeye-frontend/app/payment/charge/success/page.js`

---

## 5. 400 (Bad Request) - Toss 동시 처리 오류

### 증상
```
POST http://localhost:3000/api/payments/confirm 400 (Bad Request)
백엔드 로그: 
Toss 승인 API 실패: status=500 INTERNAL_SYSTEM_ERROR
body={"code":"FAILED_PAYMENT_INTERNAL_SYSTEM_PROCESSING","message":"[S008] 기존 요청을 처리중입니다."}
```

### 원인
1. React StrictMode로 인한 중복 API 호출
2. Toss Payments에서 동일한 결제에 대한 동시 요청 처리 불가
3. 결제는 이미 완료되었지만 confirm API가 중복 호출됨

### 해결 방법

#### 프론트엔드: 중복 요청 방지
```javascript
// success/page.js
const isProcessingRef = useRef(false);

useEffect(() => {
  const processPayment = async () => {
    if (isProcessingRef.current) {
      console.log('이미 처리 중인 요청이 있습니다.');
      return;
    }
    isProcessingRef.current = true;
    // ... 결제 처리 로직
  };
  processPayment();
}, []);
```

#### 백엔드: 재시도 메커니즘 추가
```java
// PaymentService.java
try {
  // Toss 승인 API 호출
} catch (ApiException e) {
  if (e.getErrorCode() == ErrorCode.TOSS_PAYMENT_ERROR && 
      e.getMessage().contains("FAILED_PAYMENT_INTERNAL_SYSTEM_PROCESSING")) {
    
    // 1초 대기 후 Payment 상태 재확인
    Thread.sleep(1000);
    Payment payment = paymentRepository.findByPgOrderId(pgOrderId)
      .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));
    
    // 이미 DONE 상태면 성공으로 처리 (idempotency)
    if (payment.getPaymentType() == PaymentType.DONE) {
      log.info("결제가 이미 완료되었습니다. pgOrderId={}", pgOrderId);
      return;
    }
  }
  throw e;
}
```

### 관련 파일
- `popeye-frontend/app/payment/charge/success/page.js`
- `popeye-backend/src/main/java/popeye/popeyebackend/pay/service/PaymentService.java`

---

## 6. 400 (Bad Request) - 이미 구매한 콘텐츠

### 증상
```
POST http://localhost:3000/api/orders/contents/5 400 (Bad Request)
에러 메시지: "잘못된 요청입니다."
백엔드 로그: "이미 구매한 콘텐츠: userId=1, contentId=5"
```

### 원인
사용자가 이미 구매한 콘텐츠를 다시 구매하려고 시도.

### 해결 방법

#### 프론트엔드: 에러 처리 개선
```javascript
// content/[id]/page.js
try {
  await orderApi.purchase(parseInt(contentId));
  setPurchaseSuccess(true);
} catch (error) {
  if (error.errorResponse?.code === 'P001' || 
      error.errorResponse?.code === 'INVALID_REQUEST') {
    const errorMsg = error.errorResponse?.message || '';
    
    // 이미 구매한 경우 콘텐츠 표시
    if (errorMsg.includes('이미 구매') || errorMsg.includes('중복')) {
      setIsPurchased(true);
      setPurchaseError('이미 구매한 글입니다. 콘텐츠를 확인해주세요.');
    } else {
      setPurchaseError(error.message);
    }
  } else if (error.errorResponse?.code === 'P004') {
    setPurchaseError('크레딧이 부족합니다. 충전 후 다시 시도해주세요.');
  } else {
    setPurchaseError(error.message);
  }
}
```

### 관련 파일
- `popeye-frontend/app/content/[id]/page.js`

---

## 주요 학습 사항

### 1. 금액 단위 통일
- **크레딧**: 사용자 입력 단위 (1 크레딧 = 10원)
- **원(KRW)**: 실제 결제 및 백엔드 저장 단위
- 프론트엔드에서 Toss API 호출 시 반드시 원 단위로 변환: `amount = creditAmount * 10`

### 2. Idempotency (멱등성) 처리
- 결제 API는 동일한 요청을 여러 번 호출해도 안전해야 함
- 중복 요청 방지: `useRef`로 플래그 관리
- 백엔드에서 상태 재확인으로 이미 완료된 결제는 성공으로 처리

### 3. Toss Payments 특성
- `amount` 파라미터가 successUrl에 항상 포함되지 않을 수 있음
- 서버에서 `pgOrderId`로 결제 정보를 조회하는 것이 안전
- 동시 요청 처리 시 "기존 요청을 처리중입니다" 오류 발생 가능

### 4. React StrictMode 주의사항
- 개발 모드에서 `useEffect`가 두 번 실행될 수 있음
- API 호출 시 `useRef`로 중복 방지 필수

---

## 참고 파일

### 프론트엔드
- `app/payment/charge/page.js` - 크레딧 충전 페이지
- `app/payment/charge/success/page.js` - 결제 성공 페이지
- `app/payment/charge/fail/page.js` - 결제 실패 페이지
- `app/lib/api.ts` - API 클라이언트
- `next.config.js` - Next.js 설정 (rewrites)

### 백엔드
- `popeye-backend/src/main/java/popeye/popeyebackend/pay/controller/PaymentController.java`
- `popeye-backend/src/main/java/popeye/popeyebackend/pay/service/PaymentService.java`
- `popeye-backend/src/main/java/popeye/popeyebackend/pay/dto/payment/ConfirmPaymentRequestDto.java`
- `popeye-backend/src/main/java/popeye/popeyebackend/global/config/SecurityConfig.java`
