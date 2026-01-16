'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { BarChart, LineChart } from '../components/Charts';
import { getStatistics, getReports, getBannedUsers, getDevilUsers } from '../lib/api';
import type { AdminDailyData, ReportProcess, BanUser, DevilUser } from '../types/admin';

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState<AdminDailyData[]>([]);
  const [reports, setReports] = useState<ReportProcess[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BanUser[]>([]);
  const [devilUsers, setDevilUsers] = useState<DevilUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, reportsData, bannedData, devilData] = await Promise.all([
          getStatistics(7),
          getReports(0, 5),
          getBannedUsers(5, 0),
          getDevilUsers(0),
        ]);
        setStatistics(statsData);
        setReports(reportsData);
        setBannedUsers(bannedData);
        setDevilUsers(devilData.slice(0, 5));
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const latestStats = statistics.length > 0 ? statistics[statistics.length - 1] : null;
  const prevStats = statistics.length > 1 ? statistics[statistics.length - 2] : null;

  const calculateTrend = (current?: number, previous?: number) => {
    if (current == null || previous == null || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
  };

  const revenueChartData = statistics.map((s) => ({
    label: s.localDate.slice(5),
    value: s.dailyNetRevenue,
  }));

  const userChartData = statistics.map((s) => ({
    label: s.localDate.slice(5),
    value: s.dailyNewUserCount,
  }));

  const banUserColumns = [
    { key: 'id', header: '유저 ID', width: '15%' },
    {
      key: 'bannedAt',
      header: '밴 날짜',
      render: (item: Record<string, unknown>) => formatDate(item.bannedAt as string),
    },
    {
      key: 'unbannedAt',
      header: '해제 예정일',
      render: (item: Record<string, unknown>) => item.unbannedAt ? formatDate(item.unbannedAt as string) : '영구 밴',
    },
    { key: 'reason', header: '사유' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader
        stats={{
          spinach: latestStats?.totalSpinachIssued ?? null,
          starcandy: latestStats?.totalStarcandy ?? null,
        }}
      />

      <main className="max-w-[1200px] mx-auto px-10 py-8">
        {/* 페이지 타이틀 */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <span className="text-xl">👑</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-sm text-gray-500">StarP 플랫폼 전체 관리</p>
            </div>
          </div>
        </div>

        {/* 상단 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="전날 매출"
            value={latestStats?.dailyPaymentAmount != null ? `₩${latestStats.dailyPaymentAmount.toLocaleString()}` : null}
            color="green"
            trend={calculateTrend(latestStats?.dailyPaymentAmount, prevStats?.dailyPaymentAmount)}
            icon={<span className="text-lg">💰</span>}
          />
          <StatCard
            title="전날 무료 재화 발행량"
            value={latestStats?.dailySpinachIssued ?? null}
            color="blue"
            trend={calculateTrend(latestStats?.dailySpinachIssued, prevStats?.dailySpinachIssued)}
            icon={<span className="text-lg">🥬</span>}
          />
          <StatCard
            title="전날 무료 재화 사용량"
            value={latestStats?.dailySpinachUsed ?? null}
            color="pink"
            trend={calculateTrend(latestStats?.dailySpinachUsed, prevStats?.dailySpinachUsed)}
            icon={<span className="text-lg">📉</span>}
          />
          <StatCard
            title="총 재화 발행량"
            value={latestStats?.totalSpinachIssued ?? null}
            color="orange"
            icon={<span className="text-lg">📊</span>}
          />
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <div className="relative">
            <BarChart
              data={revenueChartData}
              title="일별 매출"
              subtitle="최근 7일간 매출 추이"
              color="#7c5cff"
              height={260}
            />
            <a href="/admin/statistics" className="absolute bottom-4 right-4 text-sm text-gray-400 hover:text-purple-500">
              자세히 보기 →
            </a>
          </div>
          <div className="relative">
            <LineChart
              data={userChartData}
              title="신규 가입자 추이"
              subtitle="최근 7일간 가입자 수"
              color="#10b981"
              height={260}
            />
            <a href="/admin/statistics" className="absolute bottom-4 right-4 text-sm text-gray-400 hover:text-purple-500">
              자세히 보기 →
            </a>
          </div>
        </div>

        {/* 신고 목록 & 유저 정보 탭 */}
        <div className="card mb-8">
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('reports')}
              className={`px-5 py-3 text-sm font-medium ${activeTab === 'reports' ? 'border-b-2 border-purple-500 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              신고 목록
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-5 py-3 text-sm font-medium ${activeTab === 'users' ? 'border-b-2 border-purple-500 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              유저 정보
            </button>
          </div>
          <div className="p-5">
            {activeTab === 'reports' ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-pink-500">⚠️</span>
                  <span className="font-medium text-gray-900">신고 목록</span>
                  <span className="text-sm text-gray-500">신고 접수 내역 관리</span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">대상 ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">유형</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">신고 사유</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">상태</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length > 0 ? (
                      reports.map((report, idx) => (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-mono text-gray-900">#{report.targetId}</td>
                          <td className="px-4 py-3"><span className="badge badge-info">{report.targetType}</span></td>
                          <td className="px-4 py-3 text-sm text-gray-600">{report.reason}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${getStateBadgeClass(report.state)}`}>
                              {getStateLabel(report.state)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {report.state === 'PENDING' && (
                              <button className="px-3 py-1 text-xs font-medium bg-purple-500 text-white rounded hover:bg-purple-600">
                                처리
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                          신고 내역이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="flex justify-end mt-4">
                  <a href="/admin/reports" className="text-sm text-gray-400 hover:text-purple-500">
                    자세히 보기 →
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-blue-500">👤</span>
                  <span className="font-medium text-gray-900">유저 정보</span>
                  <span className="text-sm text-gray-500">악성 유저 목록 조회</span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">닉네임</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">이메일</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">신고 횟수</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">누적 밴 일수</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devilUsers.length > 0 ? (
                      devilUsers.map((user) => (
                        <tr key={user.userId} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.nickname}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className="badge badge-danger">{user.devilCount}회</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.blockedDays}일</td>
                          <td className="px-4 py-3">
                            <button className="px-3 py-1 text-xs font-medium bg-red-100 text-red-600 rounded hover:bg-red-200">
                              차단
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                          악성 유저가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="flex justify-end mt-4">
                  <a href="/admin/users" className="text-sm text-gray-400 hover:text-purple-500">
                    자세히 보기 →
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 밴 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DataTable
            title="밴 유저 목록"
            subtitle="현재 차단된 유저 목록"
            columns={banUserColumns}
            data={bannedUsers as unknown as Record<string, unknown>[]}
            detailLink="/admin/bans"
            detailLinkText="자세히 보기"
            icon={<span className="text-sm">🚫</span>}
          />
          <DataTable
            title="밴 게시글 목록"
            subtitle="차단된 게시글 관리"
            columns={[
              { key: 'contentId', header: '게시글 ID' },
              { key: 'reason', header: '차단 사유' },
              { key: 'bannedAt', header: '차단 일시' },
            ]}
            data={[]}
            detailLink="/admin/bans?tab=contents"
            detailLinkText="자세히 보기"
            emptyMessage="차단된 게시글이 없습니다."
            icon={<span className="text-sm">📄</span>}
          />
        </div>
      </main>
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function getStateBadgeClass(state: string) {
  switch (state) {
    case 'PENDING': return 'badge-warning';
    case 'ACCEPTED': return 'badge-success';
    case 'REJECTED': return 'badge-danger';
    default: return 'badge-info';
  }
}

function getStateLabel(state: string) {
  switch (state) {
    case 'PENDING': return '대기중';
    case 'ACCEPTED': return '승인됨';
    case 'REJECTED': return '거부됨';
    default: return state;
  }
}
