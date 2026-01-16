'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminHeader from '../../components/AdminHeader';
import StatCard from '../../components/StatCard';
import { BarChart, LineChart } from '../../components/Charts';
import { getStatistics } from '../../lib/api';
import type { AdminDailyData } from '../../types/admin';

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<AdminDailyData[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchStatistics(days);
  }, [days]);

  const fetchStatistics = async (numDays: number) => {
    setLoading(true);
    try {
      const data = await getStatistics(numDays);
      setStatistics(data);
    } catch (error) {
      console.error('통계 데이터 로딩 실패:', error);
      setStatistics([]);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 범위로 필터링
  const filteredStats = statistics.filter((stat) => {
    if (!startDate && !endDate) return true;
    const date = new Date(stat.localDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  });

  // 합계 계산
  const totals = filteredStats.reduce(
    (acc, stat) => ({
      payment: acc.payment + stat.dailyPaymentAmount,
      settlement: acc.settlement + stat.dailySettlementAmount,
      netRevenue: acc.netRevenue + stat.dailyNetRevenue,
      newUsers: acc.newUsers + stat.dailyNewUserCount,
      spinachIssued: acc.spinachIssued + stat.dailySpinachIssued,
      spinachUsed: acc.spinachUsed + stat.dailySpinachUsed,
    }),
    { payment: 0, settlement: 0, netRevenue: 0, newUsers: 0, spinachIssued: 0, spinachUsed: 0 }
  );

  // 차트 데이터
  const revenueChartData = filteredStats.map((s) => ({
    label: s.localDate.slice(5),
    value: s.dailyNetRevenue,
  }));

  const userChartData = filteredStats.map((s) => ({
    label: s.localDate.slice(5),
    value: s.dailyNewUserCount,
  }));

  const paymentChartData = filteredStats.map((s) => ({
    label: s.localDate.slice(5),
    value: s.dailyPaymentAmount,
  }));

  const spinachChartData = filteredStats.map((s) => ({
    label: s.localDate.slice(5),
    value: s.dailySpinachIssued,
  }));

  const latestStats = filteredStats.length > 0 ? filteredStats[filteredStats.length - 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--foreground-muted)]">통계 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminHeader
        stats={{
          spinach: latestStats?.totalSpinachIssued ?? null,
          starcandy: latestStats?.totalStarcandy ?? null,
        }}
      />

      <main className="max-w-[1400px] mx-auto px-8 py-8">
        {/* 브레드크럼 & 타이틀 */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-4">
            <Link href="/admin" className="hover:text-[var(--accent-primary)]">대시보드</Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--foreground)]">통계 상세</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">통계 상세</h1>
                <p className="text-sm text-[var(--foreground-muted)]">기간별 플랫폼 통계 데이터</p>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 영역 */}
        <div className="card p-5 mb-6 animate-fade-in">
          <h3 className="text-sm font-semibold mb-4 text-[var(--foreground)]">기간 설정</h3>
          <div className="flex flex-wrap items-end gap-4">
            {/* 빠른 선택 버튼 */}
            <div className="flex gap-2">
              {[7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDays(d);
                    setStartDate('');
                    setEndDate('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    days === d && !startDate && !endDate
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'bg-[var(--background)] text-[var(--foreground-muted)] hover:bg-[var(--background-elevated)] border border-[var(--border)]'
                  }`}
                >
                  {d}일
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-[var(--border)]" />

            {/* 날짜 직접 선택 */}
            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs text-[var(--foreground-muted)] block mb-1">시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
              <span className="text-[var(--foreground-muted)] mt-5">~</span>
              <div>
                <label className="text-xs text-[var(--foreground-muted)] block mb-1">종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard title="총 매출" value={filteredStats.length > 0 ? `₩${totals.payment.toLocaleString()}` : null} color="purple" />
          <StatCard title="총 정산" value={filteredStats.length > 0 ? `₩${totals.settlement.toLocaleString()}` : null} color="blue" />
          <StatCard title="총 순수익" value={filteredStats.length > 0 ? `₩${totals.netRevenue.toLocaleString()}` : null} color="green" />
          <StatCard title="총 신규가입" value={filteredStats.length > 0 ? `${totals.newUsers}명` : null} color="pink" />
          <StatCard title="시금치 발행" value={filteredStats.length > 0 ? totals.spinachIssued : null} color="orange" />
          <StatCard title="시금치 사용" value={filteredStats.length > 0 ? totals.spinachUsed : null} color="purple" />
        </div>

        {/* 차트 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <BarChart
            data={revenueChartData}
            title="일별 순수익"
            subtitle="기간 내 일별 순수익 추이"
            color="#7c5cff"
            height={300}
          />
          <LineChart
            data={userChartData}
            title="신규 가입자 추이"
            subtitle="기간 내 일별 가입자 수"
            color="#10b981"
            height={300}
          />
          <BarChart
            data={paymentChartData}
            title="일별 매출"
            subtitle="기간 내 일별 결제 금액"
            color="#f472b6"
            height={300}
          />
          <LineChart
            data={spinachChartData}
            title="시금치 발행량"
            subtitle="기간 내 일별 무료 재화 발행"
            color="#f59e0b"
            height={300}
          />
        </div>

        {/* 상세 테이블 */}
        <div className="card overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-[var(--border)]">
            <h3 className="text-base font-bold text-[var(--foreground)]">일별 상세 데이터</h3>
            <p className="text-xs text-[var(--foreground-muted)]">전체 통계 데이터 테이블</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--background)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)]">날짜</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--foreground-muted)]">매출</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--foreground-muted)]">정산</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--foreground-muted)]">순수익</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--foreground-muted)]">신규가입</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--foreground-muted)]">시금치 발행</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--foreground-muted)]">시금치 사용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredStats.length > 0 ? (
                  filteredStats.map((stat, index) => (
                    <tr key={index} className="hover:bg-[var(--background)] transition-colors">
                      <td className="px-5 py-3 text-sm font-medium">{stat.localDate}</td>
                      <td className="px-5 py-3 text-sm text-right text-purple-600">₩{stat.dailyPaymentAmount.toLocaleString()}</td>
                      <td className="px-5 py-3 text-sm text-right text-blue-600">₩{stat.dailySettlementAmount.toLocaleString()}</td>
                      <td className="px-5 py-3 text-sm text-right text-emerald-600">₩{stat.dailyNetRevenue.toLocaleString()}</td>
                      <td className="px-5 py-3 text-sm text-right">{stat.dailyNewUserCount}명</td>
                      <td className="px-5 py-3 text-sm text-right text-orange-500">{stat.dailySpinachIssued.toLocaleString()}</td>
                      <td className="px-5 py-3 text-sm text-right text-pink-500">{stat.dailySpinachUsed.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-[var(--foreground-muted)]">
                      통계 데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
