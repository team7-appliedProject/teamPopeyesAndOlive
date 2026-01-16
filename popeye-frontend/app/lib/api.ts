import type {
  AdminDailyData,
  DevilUser,
  ReportProcess,
  BanUser,
  BanUserRequest,
  InactiveContentRequest,
} from '../types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 공통 fetch 함수
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ==================== 관리자 통계 API ====================

// 일일 통계 조회
export async function getStatistics(days: number): Promise<AdminDailyData[]> {
  return fetchApi<AdminDailyData[]>(`/api/admin/statistics?days=${days}`);
}

// ==================== 악성 유저 관리 API ====================

// 악성 유저 목록 조회
export async function getDevilUsers(page: number = 0): Promise<DevilUser[]> {
  return fetchApi<DevilUser[]>(`/api/admin/devil-users?page=${page}`);
}

// 유저 밴 처리
export async function banUser(banUserInfo: BanUserRequest): Promise<void> {
  await fetchApi<void>('/api/admin/devil-users', {
    method: 'PATCH',
    body: JSON.stringify(banUserInfo),
  });
}

// 유저 밴 해제
export async function unbanUser(userId: number): Promise<void> {
  await fetchApi<void>(`/api/admin/devil-users/${userId}`, {
    method: 'PATCH',
  });
}

// ==================== 신고 관리 API ====================

// 신고 목록 조회
export async function getReports(
  page: number = 0,
  size: number = 10
): Promise<ReportProcess[]> {
  return fetchApi<ReportProcess[]>(
    `/api/admin/reports?page=${page}&size=${size}`
  );
}

// 신고 처리
export async function processReport(
  reportId: number,
  reportData: ReportProcess
): Promise<void> {
  await fetchApi<void>(`/api/admin/reports/${reportId}`, {
    method: 'PATCH',
    body: JSON.stringify(reportData),
  });
}

// ==================== 게시글 차단 API ====================

// 악성 게시글 차단
export async function banContent(
  contentInfo: InactiveContentRequest
): Promise<void> {
  await fetchApi<void>('/api/admin/illegal-contents', {
    method: 'PATCH',
    body: JSON.stringify(contentInfo),
  });
}

// 게시글 차단 해제
export async function unbanContent(contentId: number): Promise<void> {
  await fetchApi<void>(`/api/admin/illegal-contents/${contentId}`, {
    method: 'PATCH',
  });
}

// ==================== 밴 유저 조회 API ====================

// 밴 유저 목록 조회
export async function getBannedUsers(
  size: number = 10,
  page: number = 0
): Promise<BanUser[]> {
  return fetchApi<BanUser[]>(`/api/users/ban-user?size=${size}&page=${page}`);
}

