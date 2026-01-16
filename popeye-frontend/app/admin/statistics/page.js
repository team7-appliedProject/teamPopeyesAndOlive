"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { adminApi } from '@/app/lib/api';

// 차트 데이터 키 설정
const dataKeys = [
  { key: 'dailyPaymentAmount', label: '일별 매출', color: '#5b21b6', unit: '₩' },
  { key: 'dailySettlementAmount', label: '일별 정산', color: '#ec4899', unit: '₩' },
  { key: 'dailyNetRevenue', label: '일별 순수익', color: '#22c55e', unit: '₩' },
  { key: 'dailyNewUserCount', label: '신규 가입자', color: '#3b82f6', unit: '명' },
  { key: 'dailySpinachIssued', label: '시금치 발행', color: '#10b981', unit: '' },
  { key: 'dailySpinachUsed', label: '시금치 사용', color: '#f59e0b', unit: '' },
  { key: 'totalSpinachIssued', label: '총 시금치 발행', color: '#06b6d4', unit: '' },
  { key: 'totalStarcandy', label: '총 별사탕', color: '#fbbf24', unit: '' },
];

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(['dailyPaymentAmount', 'dailyNewUserCount']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getStatistics(7);
        setStatistics(data);
      } catch (err) {
        setError(err.message || '데이터를 불러오는데 실패했습니다.');
        console.error('Statistics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 최근 7일 날짜 생성 (데이터가 없을 때 사용)
  const generateLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      days.push({
        date: `${month}-${day}`,
        localDate: `${year}-${month}-${day}`,
        dailyPaymentAmount: 0,
        dailySettlementAmount: 0,
        dailyNetRevenue: 0,
        dailyNewUserCount: 0,
        dailySpinachIssued: 0,
        dailySpinachUsed: 0,
        totalSpinachIssued: 0,
        totalStarcandy: 0,
      });
    }
    return days;
  };

  // 차트용 데이터 포맷 (데이터가 없으면 최근 7일을 0으로 표시)
  const chartData = statistics.length > 0 
    ? statistics.map((stat) => ({
        date: stat.localDate?.slice(5) || '', // "2024-01-03" -> "01-03"
        ...stat,
      }))
    : generateLast7Days();

  // 선택된 키 토글
  const toggleKey = (key) => {
    setSelectedKeys((prev) => {
      if (prev.includes(key)) {
        // 최소 1개는 선택되어 있어야 함
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  // 선택된 키들의 설정 가져오기
  const selectedDataKeys = dataKeys.filter((dk) => selectedKeys.includes(dk.key));

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => {
            const config = dataKeys.find((dk) => dk.key === entry.dataKey);
            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {config?.label}: {config?.unit === '₩' ? `₩${entry.value?.toLocaleString()}` : `${entry.value?.toLocaleString()}${config?.unit || ''}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">통계 상세</h1>
              <p className="text-muted-foreground">최근 7일간 플랫폼 통계</p>
            </div>
          </div>

          {/* Chart Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>통계 차트</CardTitle>
              <CardDescription>아래에서 보고 싶은 항목을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    {selectedDataKeys.map((dk) => (
                      <linearGradient key={dk.key} id={`color-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={dk.color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={dk.color} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {selectedDataKeys.map((dk) => (
                    <Area
                      key={dk.key}
                      type="monotone"
                      dataKey={dk.key}
                      stroke={dk.color}
                      strokeWidth={2}
                      fill={`url(#color-${dk.key})`}
                      dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                      activeDot={{ r: 6, strokeWidth: 2, fill: 'white' }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Data Selector */}
          <Card>
            <CardHeader>
              <CardTitle>표시할 데이터 선택</CardTitle>
              <CardDescription>차트에 표시할 항목을 클릭하세요 (여러 개 선택 가능)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {dataKeys.map((dk) => {
                  const isSelected = selectedKeys.includes(dk.key);
                  return (
                    <button
                      key={dk.key}
                      onClick={() => toggleKey(dk.key)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all
                        ${isSelected 
                          ? 'border-transparent text-white shadow-md' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }
                      `}
                      style={isSelected ? { backgroundColor: dk.color } : {}}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                      <span
                        className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white/30' : ''}`}
                        style={!isSelected ? { backgroundColor: dk.color } : {}}
                      />
                      <span className="text-sm font-medium">{dk.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>상세 데이터</CardTitle>
              <CardDescription>일별 통계 데이터 테이블</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">날짜</th>
                      {dataKeys.map((dk) => (
                        <th key={dk.key} className="text-right py-3 px-4 font-medium text-muted-foreground">
                          {dk.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.map((stat, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{stat.localDate}</td>
                        {dataKeys.map((dk) => (
                          <td key={dk.key} className="text-right py-3 px-4">
                            {dk.unit === '₩' 
                              ? `₩${stat[dk.key]?.toLocaleString() || 0}`
                              : `${stat[dk.key]?.toLocaleString() || 0}${dk.unit}`
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
