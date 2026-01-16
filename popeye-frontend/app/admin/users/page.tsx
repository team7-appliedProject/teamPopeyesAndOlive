'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminHeader from '../../components/AdminHeader';
import { getDevilUsers, banUser } from '../../lib/api';
import type { DevilUser, BanUserRequest } from '../../types/admin';

export default function UsersPage() {
  const [devilUsers, setDevilUsers] = useState<DevilUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<DevilUser | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banForm, setBanForm] = useState<{ reason: string; banDays: number | null }>({
    reason: '',
    banDays: 7,
  });
  const [processing, setProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDevilUsers(page);
      setDevilUsers(data);
    } catch (error) {
      console.error('악성 유저 목록 로딩 실패:', error);
      setDevilUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBan = async () => {
    if (!selectedUser) return;
    setProcessing(true);
    try {
      const request: BanUserRequest = {
        banUserId: selectedUser.userId,
        reason: banForm.reason,
        banDays: banForm.banDays,
      };
      await banUser(request);
      await fetchUsers();
      setBanModalOpen(false);
      setSelectedUser(null);
      setBanForm({ reason: '', banDays: 7 });
    } catch (error) {
      console.error('유저 밴 처리 실패:', error);
      setBanModalOpen(false);
      setSelectedUser(null);
    } finally {
      setProcessing(false);
    }
  };

  const getSeverityBadge = (devilCount: number) => {
    if (devilCount >= 10) {
      return <span className="badge badge-danger">🔴 심각</span>;
    } else if (devilCount >= 5) {
      return <span className="badge badge-warning">🟡 경고</span>;
    } else {
      return <span className="badge badge-info">🔵 주의</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--foreground-muted)]">유저 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminHeader />

      <main className="max-w-[1400px] mx-auto px-8 py-8">
        {/* 브레드크럼 & 타이틀 */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-4">
            <Link href="/admin" className="hover:text-[var(--accent-primary)]">대시보드</Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--foreground)]">악성 유저 관리</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">악성 유저 관리</h1>
                <p className="text-sm text-[var(--foreground-muted)]">신고 누적 유저 조회 및 제재</p>
              </div>
            </div>

            {/* 요약 통계 */}
            <div className="flex gap-4">
              <div className="card px-5 py-3 flex items-center gap-3">
                <span className="text-xl">🔴</span>
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">심각</p>
                  <p className="font-bold">{devilUsers.filter((u) => u.devilCount >= 10).length}</p>
                </div>
              </div>
              <div className="card px-5 py-3 flex items-center gap-3">
                <span className="text-xl">🟡</span>
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">경고</p>
                  <p className="font-bold">{devilUsers.filter((u) => u.devilCount >= 5 && u.devilCount < 10).length}</p>
                </div>
              </div>
              <div className="card px-5 py-3 flex items-center gap-3">
                <span className="text-xl">🔵</span>
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">주의</p>
                  <p className="font-bold">{devilUsers.filter((u) => u.devilCount < 5).length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 유저 목록 */}
        <div className="card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--background)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">유저 ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">닉네임</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">이메일</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--foreground-muted)]">신고 횟수</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--foreground-muted)]">누적 밴 일수</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--foreground-muted)]">위험도</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--foreground-muted)]">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {devilUsers.length > 0 ? (
                  devilUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-[var(--background)] transition-colors">
                      <td className="px-5 py-3 text-sm font-mono text-[var(--accent-primary)]">#{user.userId}</td>
                      <td className="px-5 py-3 text-sm font-medium">{user.nickname}</td>
                      <td className="px-5 py-3 text-sm text-[var(--foreground-muted)]">{user.email}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="badge badge-danger">{user.devilCount}회</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={user.blockedDays > 0 ? 'text-amber-600 font-medium' : 'text-[var(--foreground-muted)]'}>
                          {user.blockedDays}일
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">{getSeverityBadge(user.devilCount)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            상세
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setBanModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            차단
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-[var(--foreground-muted)]">
                      악성 유저가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--background)] transition-colors"
          >
            이전
          </button>
          <span className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium">
            {page + 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-sm hover:bg-[var(--background)] transition-colors"
          >
            다음
          </button>
        </div>

        {/* 유저 상세 모달 */}
        {selectedUser && !banModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="card p-6 w-full max-w-md animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--foreground)]">유저 상세 정보</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-[var(--background)] rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                    {selectedUser.nickname[0]}
                  </div>
                  <div>
                    <p className="font-bold">{selectedUser.nickname}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">#{selectedUser.userId}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--foreground-muted)]">이메일</label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--foreground-muted)]">신고 횟수</label>
                    <p className="text-red-600 font-bold">{selectedUser.devilCount}회</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--foreground-muted)]">누적 밴 일수</label>
                    <p className="text-amber-600 font-bold">{selectedUser.blockedDays}일</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--foreground-muted)]">위험도</label>
                  <div className="mt-1">{getSeverityBadge(selectedUser.devilCount)}</div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 btn-secondary"
                >
                  닫기
                </button>
                <button
                  onClick={() => setBanModalOpen(true)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  차단하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 밴 모달 */}
        {banModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="card p-6 w-full max-w-md animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--foreground)]">유저 차단</h3>
                <button
                  onClick={() => {
                    setBanModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-xl mb-6">
                <p className="text-xs text-[var(--foreground-muted)]">차단 대상</p>
                <p className="font-bold">{selectedUser.nickname} (#{selectedUser.userId})</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--foreground-muted)] block mb-2">차단 사유</label>
                  <textarea
                    value={banForm.reason}
                    onChange={(e) => setBanForm((f) => ({ ...f, reason: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent-primary)] resize-none"
                    rows={3}
                    placeholder="차단 사유를 입력하세요..."
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--foreground-muted)] block mb-2">차단 기간</label>
                  <div className="flex gap-2">
                    {[3, 7, 14, 30].map((d) => (
                      <button
                        key={d}
                        onClick={() => setBanForm((f) => ({ ...f, banDays: d }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          banForm.banDays === d
                            ? 'bg-[var(--accent-primary)] text-white'
                            : 'bg-[var(--background)] text-[var(--foreground-muted)] hover:bg-[var(--background-elevated)] border border-[var(--border)]'
                        }`}
                      >
                        {d}일
                      </button>
                    ))}
                    <button
                      onClick={() => setBanForm((f) => ({ ...f, banDays: null }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        banForm.banDays === null
                          ? 'bg-red-500 text-white'
                          : 'bg-[var(--background)] text-[var(--foreground-muted)] hover:bg-[var(--background-elevated)] border border-[var(--border)]'
                      }`}
                    >
                      영구
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setBanModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 btn-secondary"
                  disabled={processing}
                >
                  취소
                </button>
                <button
                  onClick={handleBan}
                  disabled={!banForm.reason || processing}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? '처리 중...' : '차단하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
