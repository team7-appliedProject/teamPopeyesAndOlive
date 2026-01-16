/**
 * 공통 API 유틸리티
 * 
 * nginx 프록시 설정 (nginx/default.conf):
 * - /api/*       → backend (8080)
 * - /oauth2/*    → backend
 * - /login/oauth2/* → backend
 * - /            → frontend (3000)
 * 
 * 개발 환경:
 * 1. local-docker-compose.yml로 nginx, db, redis 실행
 * 2. 백엔드: localhost:8080에서 실행
 * 3. 프론트엔드: localhost:3000에서 실행 (npm run dev)
 * 4. 브라우저: http://localhost (nginx 80포트)로 접속
 * 
 * nginx가 프록시 처리하므로 API_BASE_URL은 빈 문자열
 */
const API_BASE_URL = '';

/**
 * 백엔드 에러 응답 타입
 * 서버에서 에러 발생 시 반환하는 응답 형태
 */
export interface ErrorResponse {
  code: string;
  message: string;
}

/**
 * 프론트엔드 API 에러 클래스
 * HTTP 상태 코드와 백엔드 ErrorResponse를 포함
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly errorResponse: ErrorResponse;

  constructor(status: number, errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = errorResponse.code;
    this.errorResponse = errorResponse;
  }

  /** ErrorResponse 형태로 반환 */
  toErrorResponse(): ErrorResponse {
    return this.errorResponse;
  }
}

// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 공통 fetch 옵션
interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * 공통 fetch 함수
 * - 자동으로 JSON 직렬화/역직렬화
 * - 에러 핸들링
 * - 쿼리 파라미터 처리
 */
async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // 쿼리 파라미터 처리
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // 기본 헤더 설정
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include', // 쿠키 포함 (인증용)
  });

  // 에러 응답 처리
  if (!response.ok) {
    let errorResponse: ErrorResponse = {
      code: 'UNKNOWN_ERROR',
      message: 'API 요청 실패',
    };
    
    try {
      const errorData = await response.json();
      errorResponse = {
        code: errorData.code || errorResponse.code,
        message: errorData.message || errorResponse.message,
      };
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }
    
    throw new ApiError(response.status, errorResponse);
  }

  // 204 No Content 처리
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ============================================
// Admin API
// ============================================
export const adminApi = {
  /** 일일 통계 조회 */
  getStatistics: (days: number) =>
    fetchApi<AdminDailyData[]>('/api/admin/statistics', {
      params: { days },
    }),

  /** 악성 유저 목록 조회 */
  getDevilUsers: (page = 0) =>
    fetchApi<DevilUser[]>('/api/admin/devil-users', {
      params: { page },
    }),

  /** 유저 밴 */
  banUser: (data: BanUserRequest) =>
    fetchApi<void>('/api/admin/devil-users', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /** 유저 밴 해제 */
  unbanUser: (userId: number) =>
    fetchApi<void>(`/api/admin/devil-users/${userId}`, {
      method: 'PATCH',
    }),

  /** 게시글 차단 */
  banContent: (data: InactiveContentRequest) =>
    fetchApi<void>('/api/admin/illegal-contents', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /** 게시글 차단 해제 */
  unbanContent: (contentId: number) =>
    fetchApi<void>(`/api/admin/illegal-contents/${contentId}`, {
      method: 'PATCH',
    }),

  /** 신고 목록 조회 */
  getReports: (page = 0, size = 10) =>
    fetchApi<ReportProcess[]>('/api/admin/reports', {
      params: { page, size },
    }),

  /** 신고 처리 */
  processReport: (reportId: number, data: ReportProcessRequest) =>
    fetchApi<void>(`/api/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ============================================
// User API
// ============================================
export const userApi = {
  /** 내 프로필 조회 */
  getMyProfile: () =>
    fetchApi<ApiResponse<UserProfile>>('/api/users/me'),

  /** 프로필 수정 */
  updateProfile: (data: UpdateProfileRequest) =>
    fetchApi<ApiResponse<void>>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  /** 크리에이터 권한 신청 */
  promoteToCreator: () =>
    fetchApi<ApiResponse<void>>('/api/users/me/creator', {
      method: 'PATCH',
    }),

  /** 프로필 사진 변경 */
  updateProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE_URL}/api/users/me/profile_photo`, {
      method: 'PATCH',
      body: formData,
      credentials: 'include',
    }).then(async res => {
      if (!res.ok) {
        let errorResponse: ErrorResponse = { code: 'UPLOAD_FAILED', message: '사진 업로드 실패' };
        try {
          const errorData = await res.json();
          errorResponse = { code: errorData.code || errorResponse.code, message: errorData.message || errorResponse.message };
        } catch { /* ignore */ }
        throw new ApiError(res.status, errorResponse);
      }
      return res.json() as Promise<ProfilePhotoResponse>;
    });
  },

  /** 밴 유저 목록 조회 (관리자 전용) */
  getBannedUsers: (page = 0, size = 10) =>
    fetchApi<BanUserRes[]>('/api/users/ban-user', {
      params: { page, size },
    }),
};

// ============================================
// Content API
// ============================================
export const contentApi = {
  /** 콘텐츠 생성 */
  create: (data: ContentCreateRequest) =>
    fetchApi<number>('/api/contents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 콘텐츠 삭제 */
  delete: (contentId: number) =>
    fetchApi<void>(`/api/contents/${contentId}`, {
      method: 'DELETE',
    }),

  /** 밴 컨텐츠 목록 조회 (관리자 전용) */
  getBannedContents: (page = 0, size = 10) =>
    fetchApi<BannedContentRes[]>('/api/contents/banlist', {
      params: { page, size },
    }),
};

// ============================================
// Report API
// ============================================
export const reportApi = {
  /** 신고하기 */
  create: (data: ReportRequest) =>
    fetchApi<ReportResponse>('/api/report', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================
// Payment API
// ============================================
export const paymentApi = {
  /** 결제 준비 */
  prepare: (data: ChargeRequest) =>
    fetchApi<PreparePaymentResponse>('/api/payments/prepare', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 결제 승인 */
  confirm: (data: ConfirmPaymentRequest) =>
    fetchApi<void>('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 환불 */
  refund: (paymentId: number, cancelReason: string) =>
    fetchApi<void>(`/api/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ cancelReason }),
    }),
};

// ============================================
// Order API
// ============================================
export const orderApi = {
  /** 콘텐츠 구매 */
  purchase: (contentId: number) =>
    fetchApi<PurchaseResponse>(`/api/orders/contents/${contentId}`, {
      method: 'POST',
    }),
};

// ============================================
// Notification API
// ============================================
export const notificationApi = {
  /** 알림 전체 조회 */
  getAll: () =>
    fetchApi<NotificationRes[]>('/api/notification'),

  /** 알림 읽음 처리 */
  markAsRead: (notiId: number) =>
    fetchApi<NotiReadRes>(`/api/notification/${notiId}`, {
      method: 'PATCH',
    }),
// Settlement API
// ============================================
export const settlementApi = {
  /** 정산 가능 잔액 조회 */
  getAvailableBalance: (creatorId: number) =>
    fetchApi<AvailableBalanceResponse>(
      `/api/creators/${creatorId}/settlements/available-balance`
    ),

  /** 컨텐츠별 누적 정산 요약 조회 */
  getContentSettlementSummaries: (creatorId: number) =>
    fetchApi<ContentSettlementSummaryResponse[]>(
      `/api/creators/${creatorId}/settlements/by-content`
    ),

  /** 컨텐츠 월 단위 상세 정산(일별 리스트) 조회 */
  getMonthlyContentSettlement: (
    creatorId: number,
    contentId: number,
    month: string
  ) =>
    fetchApi<DailyContentSettlementResponse>(
      `/api/creators/${creatorId}/settlements/contents/${contentId}`,
      {
        params: { month },
      }
    ),
};

// ============================================
// Withdrawal API
// ============================================
export const withdrawalApi = {
  /** 출금 신청 */
  requestWithdrawal: (creatorId: number, data: WithdrawalRequest) =>
    fetchApi<WithdrawalResponse>(`/api/creators/${creatorId}/withdrawals`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 출금 내역 조회 */
  getWithdrawals: (creatorId: number) =>
    fetchApi<WithdrawalResponse[]>(`/api/creators/${creatorId}/withdrawals`),
};

// ============================================
// Type Definitions
// ============================================

// Admin Types
export interface AdminDailyData {
  localDate: string;
  dailyPaymentAmount: number;
  dailySettlementAmount: number;
  dailyNetRevenue: number;
  dailyNewUserCount: number;
  dailySpinachIssued: number;
  dailySpinachUsed: number;
  totalSpinachIssued: number;
  totalStarcandy: number;
}

export interface DevilUser {
  userId: number;
  nickname: string;
  email: string;
  devilCount: number;
  blockedDays: number;
}

export interface BanUserRequest {
  userId: number;
  reason: string;
  banDays?: number; // 영구 밴이면 생략
}

export interface InactiveContentRequest {
  contentId: number;
  reason: string;
}

export interface ReportProcess {
  reportId: number;
  targetId: number;
  targetType: 'USER' | 'CONTENT' | 'COMMENT';
  reason: string;
  state: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface ReportProcessRequest {
  state: 'ACCEPTED' | 'REJECTED';
}

// User Types
export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  profilePhotoUrl: string | null;
  role: 'USER' | 'CREATOR' | 'ADMIN';
  freeCredit: number;
  paidCredit: number;
}

export interface UpdateProfileRequest {
  nickname?: string;
  bio?: string;
}

export interface ProfilePhotoResponse {
  profilePhotoUrl: string;
}

export interface BanUserRes {
  id: number;
  bannedAt: string;
  unbannedAt: string;
  banDays: number;
  reason: string;
}

// Content Types
export interface ContentCreateRequest {
  title: string;
  body: string;
  price: number;
  thumbnailUrl?: string;
  mediaUrls?: string[];
}

export interface BannedContentRes {
  id: number;
  reason: string;
  date: string;
  title: string;
  content: string;
}

// Report Types
export interface ReportRequest {
  targetId: number;
  targetType: 'USER' | 'CONTENT' | 'COMMENT';
  reason: string;
}

export interface ReportResponse {
  reportId: number;
  createdAt: string;
}

// Payment Types
export interface ChargeRequest {
  creditAmount: number;
  pgProvider: 'TOSS' | 'KAKAO';
}

export interface PreparePaymentResponse {
  pgOrderId: string;
  amount: number;
  orderName: string;
}

export interface ConfirmPaymentRequest {
  pgOrderId: string;
  paymentKey: string;
  amount: number;
}

// Order Types
export interface PurchaseResponse {
  orderId: number;
  totalCreditUsed: number;
  usedFreeCredit: number;
  usedPaidCredit: number;
}

// Notification Types
export interface NotificationRes {
  id: number;
  msg: string;
  date: string;
  isRead?: boolean; // 프론트에서 로컬 관리
}

export interface NotiReadRes {
  notiId: number;
  isRead: boolean;
// Settlement Types
export interface AvailableBalanceResponse {
  settlementSum: number;
  withdrawnSum: number;
  available: number;
}

export interface ContentSettlementSummaryResponse {
  contentId: number;
  title: string;
  totalRevenue: number;
  platformFee: number;
  totalPayout: number;
  lastSettledAt: string;
  settlementCount: number;
}

export interface ContentSettlementPeriodItem {
  periodStart: string;
  periodEnd: string;
  orderCount: number;
  totalRevenue: number;
  totalPlatformFee: number;
  totalPayout: number;
  latestSettledAt: string | null;
}

export interface DailyContentSettlementResponse {
  contentId: number;
  from: string;
  to: string;
  items: ContentSettlementPeriodItem[];
}

// Withdrawal Types
export interface WithdrawalRequest {
  amount: number;
}

export interface WithdrawalResponse {
  id: number;
  creatorId: number;
  amount: number;
  status: 'REQ' | 'SUC' | 'REJ';
  requestedAt: string;
  processedAt: string | null;
  failureReason: string | null;
}
