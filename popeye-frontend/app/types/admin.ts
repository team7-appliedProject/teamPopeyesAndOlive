// 일일 통계 데이터 타입
export interface AdminDailyData {
  localDate: string;
  dailyPaymentAmount: number;
  dailySettlementAmount: number;
  dailyNetRevenue: number;
  dailyNewUserCount: number;
  dailySpinachIssued: number;
  totalSpinachIssued: number;
  dailySpinachUsed: number;
  totalStarcandy: number;
}

// 악성 유저 정보 타입
export interface DevilUser {
  userId: number;
  nickname: string;
  email: string;
  devilCount: number;
  blockedDays: number;
}

// 신고 정보 타입
export type TargetType = 'CONTENT' | 'PICTURE' | 'VIDEO';
export type ReportState = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface ReportProcess {
  targetId: number;
  targetType: TargetType;
  reason: string;
  state: ReportState;
}

// 밴 유저 정보 타입
export interface BanUser {
  id: number;
  bannedAt: string;
  unbannedAt: string | null;
  banDays: number | null;
  reason: string;
}

// 밴 유저 요청 타입
export interface BanUserRequest {
  banUserId: number;
  reason: string;
  banDays: number | null;
}

// 게시글 차단 요청 타입
export interface InactiveContentRequest {
  contentId: number;
  reason: string;
}

