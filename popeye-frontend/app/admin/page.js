"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, DollarSign, FileText, AlertTriangle, Star, Leaf } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { adminApi, userApi, contentApi } from '@/app/lib/api';
import { Ban } from 'lucide-react';

export default function AdminPage() {
  const [statistics, setStatistics] = useState([]);
  const [reports, setReports] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [bannedContents, setBannedContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 통계 데이터 가져오기
        const statsData = await adminApi.getStatistics(7).catch(() => []);
        setStatistics(statsData);
        
        // 신고 목록 가져오기
        const reportsData = await adminApi.getReports(0, 10).catch(() => []);
        setReports(reportsData);
        
        // 밴 유저 목록 가져오기
        const bannedUsersData = await userApi.getBannedUsers(0, 10).catch(() => []);
        setBannedUsers(bannedUsersData);
        
        // 밴 컨텐츠 목록 가져오기
        const bannedContentsData = await contentApi.getBannedContents(0, 10).catch(() => []);
        setBannedContents(bannedContentsData);
        
      } catch (err) {
        setError(err.message || '데이터를 불러오는데 실패했습니다.');
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 신고 타입별 필터링
  const userReports = reports.filter(r => r.targetType === 'USER');
  const contentReports = reports.filter(r => r.targetType === 'CONTENT' || r.targetType === 'COMMENT');

  // 상태 배지 스타일
  const getStateBadge = (state) => {
    switch (state) {
      case 'PENDING':
      case 'REQUESTED':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">대기중</span>;
      case 'TRUE':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">승인됨</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">거절됨</span>;
      case 'FALSE':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">악성신고</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{state}</span>;
    }
  };

  // 최근 7일 날짜 생성 (데이터가 없을 때 사용)
  const generateLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      days.push({
        date: `${month}-${day}`,
        revenue: 0,
        users: 0,
      });
    }
    return days;
  };

  // 가장 최신 데이터 (배열의 마지막)
  const latestStats = statistics.length > 0 ? statistics[statistics.length - 1] : null;

  // 차트용 데이터 포맷 (데이터가 없으면 최근 7일을 0으로 표시)
  const chartData = statistics.length > 0 
    ? statistics.map((stat) => ({
        date: stat.localDate?.slice(5) || '', // "2024-01-03" -> "01-03"
        revenue: stat.dailyPaymentAmount || 0,
        users: stat.dailyNewUserCount || 0,
      }))
    : generateLast7Days();

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
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-bold">관리자 페이지</h1>
              <nav className="flex items-center gap-4">
                <Link 
                  href="/admin" 
                  className="text-sm font-medium text-primary border-b-2 border-primary pb-1"
                >
                  대시보드
                </Link>
                <Link 
                  href="/admin/reports" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  신고 관리
                </Link>
                <Link 
                  href="/admin/devil-users" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  유저 관리
                </Link>
                <Link 
                  href="/admin/users" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  밴 유저 관리
                </Link>
                <Link 
                  href="/admin/bans" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  밴 게시글 관리
                </Link>
              </nav>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>전날 매출</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#22c55e]" />
                  <span className="text-2xl font-bold">
                    ₩{latestStats?.dailyPaymentAmount?.toLocaleString() ?? '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>신규 가입자</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">
                    {latestStats?.dailyNewUserCount?.toLocaleString() ?? '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>총 별사탕</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#fbbf24]" />
                  <span className="text-2xl font-bold">
                    {latestStats?.totalStarcandy?.toLocaleString() ?? '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>시금치 발행량</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-[#22c55e]" />
                  <span className="text-2xl font-bold">
                    {latestStats?.totalSpinachIssued?.toLocaleString() ?? '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>일별 매출</CardTitle>
                <CardDescription>최근 7일간 매출 추이</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5b21b6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#5b21b6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₩${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value) => [`₩${value.toLocaleString()}`, '매출']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#5b21b6" 
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>신규 가입자 추이</CardTitle>
                <CardDescription>최근 7일간 가입자 수</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      formatter={(value) => [`${value}명`, '신규 가입자']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      fill="url(#colorUsers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="reportedUsers" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reportedUsers">신고된 사용자</TabsTrigger>
              <TabsTrigger value="reportedContents">신고된 글</TabsTrigger>
              <TabsTrigger value="bannedUsers">밴 유저</TabsTrigger>
              <TabsTrigger value="bannedContents">밴 컨텐츠</TabsTrigger>
            </TabsList>

            {/* Reported Users */}
            <TabsContent value="reportedUsers" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      신고된 사용자
                    </CardTitle>
                    <CardDescription>
                      신고 누적 유저 관리 및 제재
                    </CardDescription>
                  </div>
                  <Link href="/admin/reports">
                    <Button variant="outline" size="sm">전체 보기</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">사유</TableHead>
                        <TableHead className="w-[20%]">상태</TableHead>
                        <TableHead className="w-[30%]">신고일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userReports.length > 0 ? (
                        userReports.slice(0, 5).map((report, index) => (
                          <TableRow key={report.reportId || `user-${index}`}>
                            <TableCell className="max-w-[300px]">
                              <p className="truncate" title={report.reason}>
                                {report.reason || '-'}
                              </p>
                            </TableCell>
                            <TableCell>{getStateBadge(report.state)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {report.createdAt ? new Date(report.createdAt).toLocaleDateString('ko-KR') : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            신고된 사용자가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reported Contents */}
            <TabsContent value="reportedContents" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-destructive" />
                      신고된 글
                    </CardTitle>
                    <CardDescription>
                      부적절한 글 검토 및 관리
                    </CardDescription>
                  </div>
                  <Link href="/admin/reports?tab=contents">
                    <Button variant="outline" size="sm">전체 보기</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[15%]">타입</TableHead>
                        <TableHead className="w-[40%]">사유</TableHead>
                        <TableHead className="w-[20%]">상태</TableHead>
                        <TableHead className="w-[25%]">신고일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contentReports.length > 0 ? (
                        contentReports.slice(0, 5).map((report, index) => (
                          <TableRow key={report.reportId || `content-${index}`}>
                            <TableCell>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {report.targetType === 'CONTENT' ? '게시글' : '댓글'}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[250px]">
                              <p className="truncate" title={report.reason}>
                                {report.reason || '-'}
                              </p>
                            </TableCell>
                            <TableCell>{getStateBadge(report.state)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {report.createdAt ? new Date(report.createdAt).toLocaleDateString('ko-KR') : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            신고된 글이 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Banned Users */}
            <TabsContent value="bannedUsers" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5 text-destructive" />
                    밴 유저
                  </CardTitle>
                  <CardDescription>
                    제재된 유저 목록 관리
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>유저 ID</TableHead>
                        <TableHead>밴 시작일</TableHead>
                        <TableHead>밴 해제일</TableHead>
                        <TableHead>밴 기간</TableHead>
                        <TableHead>사유</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bannedUsers.length > 0 ? (
                        bannedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.id}</TableCell>
                            <TableCell>{user.bannedAt || '-'}</TableCell>
                            <TableCell>{user.unbannedAt || '영구'}</TableCell>
                            <TableCell>{user.banDays ? `${user.banDays}일` : '영구'}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{user.reason || '-'}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm">
                                해제
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            밴된 유저가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Banned Contents */}
            <TabsContent value="bannedContents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5 text-destructive" />
                    밴 컨텐츠
                  </CardTitle>
                  <CardDescription>
                    차단된 게시글 목록 관리
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead>내용</TableHead>
                        <TableHead>차단일</TableHead>
                        <TableHead>사유</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bannedContents.length > 0 ? (
                        bannedContents.map((content) => (
                          <TableRow key={content.id}>
                            <TableCell className="font-medium">{content.id}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{content.title || '-'}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{content.content || '-'}</TableCell>
                            <TableCell>{content.date ? new Date(content.date).toLocaleDateString() : '-'}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{content.reason || '-'}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm">
                                해제
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            밴된 컨텐츠가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
