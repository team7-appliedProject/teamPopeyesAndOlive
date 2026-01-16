'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AdminHeader from '../../components/AdminHeader';
import { getBannedUsers, unbanUser, unbanContent } from '../../lib/api';
import type { BanUser } from '../../types/admin';

interface BannedContent {
  contentId: number;
  reason: string;
  bannedAt: string;
}

export default function BansPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'users' | 'contents'>(
    (searchParams.get('tab') as 'users' | 'contents') || 'users'
  );
  const [bannedUsers, setBannedUsers] = useState<BanUser[]>([]);
  const [bannedContents, setBannedContents] = useState<BannedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const data = await getBannedUsers(20, page);
        setBannedUsers(data);
      } else {
        setBannedContents([]);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setBannedUsers([]);
      setBannedContents([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUnbanUser = async (userId: number) => {
    setProcessing(userId);
    try {
      await unbanUser(userId);
      await fetchData();
    } catch (error) {
      console.error('유저 밴 해제 실패:', error);
      setBannedUsers((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setProcessing(null);
    }
  };

  const handleUnbanContent = async (contentId: number) => {
    setProcessing(contentId);
    try {
      await unbanContent(contentId);
      await fetchData();
    } catch (error) {
      console.error('게시글 차단 해제 실패:', error);
      setBannedContents((prev) => prev.filter((c) => c.contentId !== contentId));
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDaysRemaining = (unbannedAt: string | null) => {
    if (!unbannedAt) return '영구 밴';
    const today = new Date();
    const unbanDate = new Date(unbannedAt);
    const diff = Math.ceil((unbanDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return '해제 예정';
    return `${diff}일 남음`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--foreground-muted)]">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminHeader />
      <main className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-4">
            <Link href="/admin" className="hover:text-[var(--accent-primary)]">대시보드</Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--foreground)]">차단 관리</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-red-500 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">차단 관리</h1>
              <p className="text-sm text-[var(--foreground-muted)]">차단된 유저 및 게시글 관리</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => { setActiveTab('users'); setPage(0); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-white text-[var(--foreground-muted)] border border-[var(--border)] hover:bg-[var(--background)]'}`}>
            밴 유저 목록
          </button>
          <button onClick={() => { setActiveTab('contents'); setPage(0); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'contents' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-white text-[var(--foreground-muted)] border border-[var(--border)] hover:bg-[var(--background)]'}`}>
            밴 게시글 목록
          </button>
        </div>

        <div className="card overflow-hidden animate-fade-in">
          {activeTab === 'users' ? (
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--background)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">유저 ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">밴 날짜</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">해제 예정일</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--foreground-muted)]">밴 기간</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--foreground-muted)]">남은 기간</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">사유</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--foreground-muted)]">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {bannedUsers.length > 0 ? bannedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--background)]">
                    <td className="px-5 py-3 text-sm font-mono text-[var(--accent-primary)]">#{user.id}</td>
                    <td className="px-5 py-3 text-sm">{formatDate(user.bannedAt)}</td>
                    <td className="px-5 py-3 text-sm">{user.unbannedAt ? formatDate(user.unbannedAt) : '-'}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`badge ${user.banDays === null ? 'badge-danger' : 'badge-warning'}`}>
                        {user.banDays === null ? '영구' : `${user.banDays}일`}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-sm">{getDaysRemaining(user.unbannedAt)}</td>
                    <td className="px-5 py-3 text-sm max-w-xs truncate">{user.reason}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => handleUnbanUser(user.id)} disabled={processing === user.id}
                        className="px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50">
                        {processing === user.id ? '처리중...' : '차단 해제'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-[var(--foreground-muted)]">차단된 유저가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--background)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">게시글 ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">차단 날짜</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">차단 사유</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--foreground-muted)]">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {bannedContents.length > 0 ? bannedContents.map((content) => (
                  <tr key={content.contentId} className="hover:bg-[var(--background)]">
                    <td className="px-5 py-3 text-sm font-mono">#{content.contentId}</td>
                    <td className="px-5 py-3 text-sm">{formatDate(content.bannedAt)}</td>
                    <td className="px-5 py-3 text-sm">{content.reason}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => handleUnbanContent(content.contentId)} disabled={processing === content.contentId}
                        className="px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50">
                        {processing === content.contentId ? '처리중...' : '차단 해제'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-[var(--foreground-muted)]">차단된 게시글이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-sm disabled:opacity-50 hover:bg-[var(--background)]">이전</button>
          <span className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium">{page + 1}</span>
          <button onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-white border border-[var(--border)] text-sm hover:bg-[var(--background)]">다음</button>
        </div>
      </main>
    </div>
  );
}
