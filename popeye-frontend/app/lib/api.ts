"use client";

/**
 * 공통 API 유틸리티
 * (설정 및 주석 생략 - 기존과 동일)
 */
const API_BASE_URL = "";

export interface ErrorResponse {
  code: string;
  message: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly errorResponse: ErrorResponse;

  constructor(status: number, errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.name = "ApiError";
    this.status = status;
    this.code = errorResponse.code;
    this.errorResponse = errorResponse;
  }

  toErrorResponse(): ErrorResponse {
    return this.errorResponse;
  }
}

// 공통 응답 타입
export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
}

// 공통 fetch 옵션
interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/** 성공 여부 판단 (안전한 버전으로 교체) */
export function isSuccess<T>(response: any): boolean {
  if (!response) return false;
  // 1. 표준 ApiResponse 형식인 경우
  if (response.status === "success") return true;
  // 2. 데이터만 온 경우에도 성공으로 인정 (호환성)
  if (response.data || (response.id && !response.error)) return true;
  return false;
}

/** 공통 fetch 함수 */
async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;

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

  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorResponse: ErrorResponse = {
      code: "UNKNOWN_ERROR",
      message: "API 요청 실패",
    };
    try {
      const errorData = await response.json();
      errorResponse = {
        code: errorData.code || errorResponse.code,
        message: errorData.message || errorResponse.message,
      };
    } catch {
      /* ignore */
    }
    throw new ApiError(response.status, errorResponse);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text || text.length === 0) {
    return undefined as T;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text as T;
  }
}

// ============================================
// Auth API
// ============================================
export const authApi = {
  login: (data: LoginRequest) =>
    fetchApi<ApiResponse<TokenResponse>>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  signup: (data: SignupRequest) =>
    fetchApi<ApiResponse<number>>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  sendSms: (phoneNumber: string) =>
    fetchApi<ApiResponse<void>>("/api/auth/sms/send", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    }),
  verifySms: (phoneNumber: string, code: string) =>
    fetchApi<ApiResponse<void>>("/api/auth/sms/verify", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, code }),
    }),
  logout: () =>
    fetchApi<ApiResponse<void>>("/api/auth/logout", {
      method: "POST",
    }),
};

// ============================================
// Main API
// ============================================
export const mainApi = {
  getMain: () => fetchApi<MainStats>("/api/main"),
};

// ============================================
// Admin API
// ============================================
export const adminApi = {
  getStatistics: (days: number) =>
    fetchApi<AdminDailyData[]>("/api/admin/statistics", {
      params: { days },
    }),
  getDevilUsers: (page = 0) =>
    fetchApi<DevilUser[]>("/api/admin/devil-users", {
      params: { page },
    }),
  banUser: (data: BanUserRequest) =>
    fetchApi<void>("/api/admin/devil-users", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  unbanUser: (userId: number) =>
    fetchApi<void>(`/api/admin/devil-users/${userId}`, {
      method: "PATCH",
    }),
  banContent: (data: InactiveContentRequest) =>
    fetchApi<void>("/api/admin/illegal-contents", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  unbanContent: (contentId: number) =>
    fetchApi<void>(`/api/admin/illegal-contents/${contentId}`, {
      method: "PATCH",
    }),
  getReports: (page = 0, size = 10) =>
    fetchApi<ReportProcess[]>("/api/admin/reports", {
      params: { page, size },
    }),
  processReport: (reportId: number, data: ReportProcessRequest) =>
    fetchApi<void>(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ============================================
// User API
// ============================================
export const userApi = {
  getMyProfile: () => fetchApi<ApiResponse<UserProfile>>("/api/users/me"),
  getMe: () => fetchApi<ApiResponse<UserProfile>>("/api/users/me"),
  updateProfile: (data: UpdateProfileRequest) =>
    fetchApi<ApiResponse<void>>("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  promoteToCreator: () =>
    fetchApi<ApiResponse<void>>("/api/users/me/creator", {
      method: "PATCH",
    }),
  updateProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${API_BASE_URL}/api/users/me/profile_photo`, {
      method: "PATCH",
      body: formData,
      credentials: "include",
    }).then(async (res) => {
      if (!res.ok) {
        let errorResponse: ErrorResponse = {
          code: "UPLOAD_FAILED",
          message: "사진 업로드 실패",
        };
        try {
          const errorData = await res.json();
          errorResponse = {
            code: errorData.code || errorResponse.code,
            message: errorData.message || errorResponse.message,
          };
        } catch {
          /* ignore */
        }
        throw new ApiError(res.status, errorResponse);
      }
      return res.json() as Promise<ProfilePhotoResponse>;
    });
  },
  getBannedUsers: (page = 0, size = 10) =>
    fetchApi<BanUserRes[]>("/api/users/ban-user", {
      params: { page, size },
    }),
};

// ============================================
// Content API
// ============================================
export const contentApi = {
  getAll: (page = 0, size = 20) =>
    fetchApi<ContentListItem[]>("/api/contents", { params: { page, size } }),
  getFree: (page = 0, size = 20) =>
    fetchApi<ContentListItem[]>("/api/contents/free", {
      params: { page, size },
    }),
  getPaid: (page = 0, size = 20) =>
    fetchApi<ContentListItem[]>("/api/contents/paid", {
      params: { page, size },
    }),
  getById: (contentId: number) =>
    fetchApi<ContentDetail>(`/api/contents/${contentId}`),
  create: (data: ContentCreateRequest) =>
    fetchApi<number>("/api/contents", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (contentId: number) =>
    fetchApi<void>(`/api/contents/${contentId}`, {
      method: "DELETE",
    }),
  getBannedContents: (page = 0, size = 10) =>
    fetchApi<BannedContentRes[]>("/api/contents/banlist", {
      params: { page, size },
    }),
};

// ============================================
// Report API
// ============================================
export const reportApi = {
  create: (data: ReportRequest) =>
    fetchApi<ReportResponse>("/api/report", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ============================================
// Payment API
// ============================================
export const paymentApi = {
  prepare: (data: ChargeRequest) =>
    fetchApi<PreparePaymentResponse>("/api/payments/prepare", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  confirm: (data: ConfirmPaymentRequest) =>
    fetchApi<void>("/api/payments/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  refund: (paymentId: number, cancelReason: string) =>
    fetchApi<void>(`/api/payments/${paymentId}/refund`, {
      method: "POST",
      body: JSON.stringify({ cancelReason }),
    }),
};

// ============================================
// Order API
// ============================================
export const orderApi = {
  purchase: (contentId: number) =>
    fetchApi<PurchaseResponse>(`/api/orders/contents/${contentId}`, {
      method: "POST",
    }),
};

// ============================================
// Notification API (수정: Header 호환성 추가)
// ============================================
export const notificationApi = {
  /** 알림 전체 조회 (신버전) */
  getAll: () => fetchApi<NotificationRes[]>("/api/notification"),

  /** 내 알림 목록 조회 (Header.jsx 호환용) */
  getList: (page = 0, size = 10) =>
    fetchApi<any[]>("/api/notification", { params: { page, size } }),

  /** 알림 읽음 처리 (신버전) */
  markAsRead: (notiId: number) =>
    fetchApi<NotiReadRes>(`/api/notification/${notiId}`, {
      method: "PATCH",
    }),

  /** 알림 읽음 처리 (Header.jsx 호환용) */
  read: (notificationId: number) =>
    fetchApi<void>(`/api/notification/${notificationId}/read`, {
      method: "PATCH",
    }).catch(() => {}),

  /** 안 읽은 알림 개수 (Header.jsx 호환용) */
  getUnreadCount: () =>
    fetchApi<number>("/api/notifications/unread-count").catch(() => 0),
};

// ============================================
// Credit API
// ============================================
export const creditApi = {
  getBalance: () => fetchApi<CreditBalance>("/api/credits/balance"),
  getHistory: (page = 0, size = 20) =>
    fetchApi<CreditHistoryItem[]>("/api/credits/history", {
      params: { page, size },
    }),
};

// ============================================
// Settlement API (정산)
// ============================================
export const settlementApi = {
  getAvailableBalance: (creatorId: number) =>
    fetchApi<AvailableBalanceResponse>(
      `/api/creators/${creatorId}/settlements/available-balance`,
    ),
  getContentSettlementSummaries: (creatorId: number) =>
    fetchApi<ContentSettlementSummaryResponse[]>(
      `/api/creators/${creatorId}/settlements/by-content`,
    ),
  getMonthlyContentSettlement: (
    creatorId: number,
    contentId: number,
    month: string,
  ) =>
    fetchApi<DailyContentSettlementResponse>(
      `/api/creators/${creatorId}/settlements/contents/${contentId}`,
      {
        params: { month },
      },
    ),
};

// ============================================
// Withdrawal API (출금)
// ============================================
export const withdrawalApi = {
  requestWithdrawal: (creatorId: number, data: WithdrawalRequest) =>
    fetchApi<WithdrawalResponse>(`/api/creators/${creatorId}/withdrawals`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getWithdrawals: (creatorId: number) =>
    fetchApi<WithdrawalResponse[]>(`/api/creators/${creatorId}/withdrawals`),
};

// ============================================
// Event API
// ============================================
export const eventApi = {
  grantFreeCredits: (amount: number) =>
    fetchApi<number>("/api/events/free-credits", {
      method: "POST",
      params: { amount },
    }),
};

// ============================================
// Type Definitions
// ============================================

export interface MainStats {
  totalContents: number;
  totalOlive: number;
  totalPopeye: number;
}

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
  userId: number; // (수정: 프론트엔드 호환성을 위해 userId로 변경)
  reason: string;
  banDays?: number | null;
}

export interface InactiveContentRequest {
  contentId: number;
  reason: string;
}

export interface ReportProcess {
  reportId: number;
  targetId: number;
  targetType: "USER" | "CONTENT" | "COMMENT";
  reason: string;
  state: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export interface ReportProcessRequest {
  state: "ACCEPTED" | "REJECTED" | "TRUE" | "FALSE";
}

export interface UserProfile {
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  role: string;
  referralCode: string | null;
  totalSpinach: number;
  totalStarcandy: number;
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

export interface ContentListItem {
  id?: string;
  contentId?: number;
  title: string;
  creatorName?: string;
  creatorNickname?: string;
  creatorAvatar?: string;
  thumbnail?: string;
  price?: number;
  originalPrice?: number;
  free?: boolean;
  isFree?: boolean;
  likes?: number;
  isLiked?: boolean;
  isBookmarked: boolean;
}

export interface ContentDetail {
  id: number;
  title: string;
  content?: string;
  preview?: string;
  price?: number | null;
  free: boolean;
  status?: string;
  creatorName?: string;
  discountRate?: number;
  viewCount?: number;
  likeCount?: number;
}

export interface ContentCreateRequest {
  title: string;
  content: string;
  price: number;
  discountRate: number;
  free: boolean;
}

export interface BannedContentRes {
  id: number;
  reason: string;
  date: string;
  title: string;
  content: string;
}

export interface ReportRequest {
  targetId: number;
  type: "CONTENT";
  reason: string;
}

export interface ReportResponse {
  reportId: number;
  reason: string;
  state: "REQUESTED" | "APPROVED" | "REJECTED";
  reportAt: string;
}

export interface ChargeRequest {
  creditAmount: number;
  pgProvider: "TOSS";
}

export interface PreparePaymentResponse {
  paymentId: number;
  pgOrderId: string;
}

export interface ConfirmPaymentRequest {
  pgOrderId: string;
  paymentKey: string;
  amount: number;
}

export interface PurchaseResponse {
  orderId: number;
  totalCreditUsed: number;
  usedFreeCredit: number;
  usedPaidCredit: number;
}

export interface NotificationRes {
  id: number;
  msg: string;
  date: string;
  isRead?: boolean;
}

export interface NotiReadRes {
  notiId: number;
  isRead: boolean;
}

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

export interface WithdrawalRequest {
  amount: number;
}

export interface WithdrawalResponse {
  id: number;
  creatorId: number;
  amount: number;
  status: "REQ" | "SUC" | "REJ";
  requestedAt: string;
  processedAt: string | null;
  failureReason: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  phoneNumber: string;
  referralCode?: string;
  phoneNumberCollectionConsent: boolean;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
}

export interface CreditBalance {
  spinach: number;
  spinachExpiry: string | null;
  starCandy: number;
}

export interface CreditHistoryItem {
  id: string;
  type: "charge" | "use" | "reward" | "expire" | "refund";
  amount: number;
  creditType: "spinach" | "starCandy";
  description: string;
  date: string;
  status: "pending" | "completed";
}

// ============================================
// Legacy & Compatibility (맨 아래 추가 필수!)
// ============================================
export const charge = paymentApi.prepare;
