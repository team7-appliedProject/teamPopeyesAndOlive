'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AdminHeader from '../../components/AdminHeader';
import { getReports, processReport } from '../../lib/api';
import type { ReportProcess, ReportState } from '../../types/admin';

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<ReportState | 'ALL'>('ALL');
  const [selectedReport, setSelectedReport] = useState<ReportProcess | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReports(page, 20);
      setReports(data);
    } catch (error) {
      console.error('신고 목록 로딩 실패:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleProcess = async (reportId: number, state: ReportState) => {
    if (!selectedReport) return;
    setProcessing(true);
    try {
      await processReport(reportId, { ...selectedReport, state });
      await fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('신고 처리 실패:', error);
      setReports((prev) =>
        prev.map((r) => (r.targetId === reportId ? { ...r, state } : r))
      );
      setSelectedReport(null);
    } finally {
      setProcessing(false);
    }
  };

  const filteredReports = filter === 'ALL' ? reports : reports.filter((r) => r.state === filter);

  const getStateBadge = (state: ReportState) => {
    switch (state) {
      case 'PENDING':
        return <span className="badge badge-warning">대기중</span>;
      case 'ACCEPTED':
        return <span className="badge badge-success">승인됨</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">거부됨</span>;
      default:
        return <span className="badge badge-info">{state}</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      CONTENT: 'badge-info',
      PICTURE: 'badge-success',
      VIDEO: 'badge-warning',
    };
    return <span className={`badge ${colors[type] || 'badge-info'}`}>{type}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--foreground-muted)]">신고 목록을 불러오는 중...</p>
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
            <span className="text-[var(--foreground)]">신고 관리</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">신고 관리</h1>
                <p className="text-sm text-[var(--foreground-muted)]">유저 신고 접수 및 처리</p>
              </div>
            </div>

            {/* 통계 요약 */}
            <div className="flex gap-4">
              <div className="card px-5 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm text-[var(--foreground-muted)]">대기</span>
                <span className="font-bold">{reports.filter((r) => r.state === 'PENDING').length}</span>
              </div>
              <div className="card px-5 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-[var(--foreground-muted)]">승인</span>
                <span className="font-bold">{reports.filter((r) => r.state === 'ACCEPTED').length}</span>
              </div>
              <div className="card px-5 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-[var(--foreground-muted)]">거부</span>
                <span className="font-bold">{reports.filter((r) => r.state === 'REJECTED').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 mb-6">
          {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-white text-[var(--foreground-muted)] hover:bg-[var(--background-elevated)] border border-[var(--border)]'
              }`}
            >
              {f === 'ALL' ? '전체' : f === 'PENDING' ? '대기중' : f === 'ACCEPTED' ? '승인됨' : '거부됨'}
            </button>
          ))}
        </div>

        {/* 신고 목록 테이블 */}
        <div className="card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--background)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">대상 ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">유형</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">신고 사유</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">상태</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--foreground-muted)]">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report, index) => (
                    <tr key={index} className="hover:bg-[var(--background)] transition-colors">
                      <td className="px-5 py-3 text-sm font-mono">{report.targetId}</td>
                      <td className="px-5 py-3">{getTypeBadge(report.targetType)}</td>
                      <td className="px-5 py-3 text-sm max-w-md truncate">{report.reason}</td>
                      <td className="px-5 py-3">{getStateBadge(report.state)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-2">
                          {report.state === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleProcess(report.targetId, 'ACCEPTED')}
                                className="px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleProcess(report.targetId, 'REJECTED')}
                                className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                거부
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              상세
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-[var(--foreground-muted)]">
                      신고 내역이 없습니다.
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

        {/* 상세 모달 */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="card p-6 w-full max-w-md animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--foreground)]">신고 상세</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--foreground-muted)]">대상 ID</label>
                  <p className="font-mono">{selectedReport.targetId}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--foreground-muted)]">유형</label>
                  <p>{getTypeBadge(selectedReport.targetType)}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--foreground-muted)]">신고 사유</label>
                  <p className="text-sm">{selectedReport.reason}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--foreground-muted)]">상태</label>
                  <p>{getStateBadge(selectedReport.state)}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 btn-secondary"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
