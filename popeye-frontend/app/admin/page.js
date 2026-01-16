"use client";

import { Shield, Users, DollarSign, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

// Mock data
const dailyStats = [
  { date: '01/03', revenue: 245000, users: 12, credits: 150000 },
  { date: '01/04', revenue: 312000, users: 18, credits: 200000 },
  { date: '01/05', revenue: 289000, users: 15, credits: 180000 },
  { date: '01/06', revenue: 425000, users: 24, credits: 280000 },
  { date: '01/07', revenue: 378000, users: 21, credits: 240000 },
  { date: '01/08', revenue: 456000, users: 28, credits: 320000 },
  { date: '01/09', revenue: 512000, users: 32, credits: 380000 },
];

const reportedUsers = [
  {
    id: '1',
    nickname: '악성유저123',
    email: 'bad@example.com',
    reportCount: 15,
    status: 'blocked',
    reason: '스팸 글 반복 게시',
  },
  {
    id: '2',
    nickname: '문제유저456',
    email: 'problem@example.com',
    reportCount: 8,
    status: 'warning',
    reason: '부적절한 댓글 작성',
  },
  {
    id: '3',
    nickname: '의심유저789',
    email: 'suspect@example.com',
    reportCount: 5,
    status: 'monitoring',
    reason: '저작권 침해 의심',
  },
];

const reportedContents = [
  {
    id: '1',
    title: '의심스러운 글 제목',
    creator: '악성올리브',
    reportCount: 23,
    status: 'blocked',
    reason: '저작권 침해',
  },
  {
    id: '2',
    title: '부적절한 내용 포함 글',
    creator: '문제올리브',
    reportCount: 12,
    status: 'reviewing',
    reason: '부적절한 내용',
  },
];

export default function AdminPage() {
  const overviewStats = {
    totalRevenue: 2617000,
    totalUsers: 150,
    totalCredits: 1750000,
    activeCreators: 45,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">관리자 대시보드</h1>
              <p className="text-muted-foreground">StarP 플랫폼 전체 관리</p>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>일주일 매출</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#22c55e]" />
                  <span className="text-2xl font-bold">
                    ₩{overviewStats.totalRevenue.toLocaleString()}
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
                    {overviewStats.totalUsers.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>크레딧 유통량</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#fbbf24]" />
                  <span className="text-2xl font-bold">
                    {overviewStats.totalCredits.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>활동 올리브</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#5b21b6]" />
                  <span className="text-2xl font-bold">
                    {overviewStats.activeCreators.toLocaleString()}
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
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#5b21b6" />
                  </BarChart>
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
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">신고된 사용자</TabsTrigger>
              <TabsTrigger value="contents">신고된 글</TabsTrigger>
            </TabsList>

            {/* Reported Users */}
            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    신고된 사용자
                  </CardTitle>
                  <CardDescription>
                    신고 누적 유저 관리 및 제재
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>닉네임</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>신고 횟수</TableHead>
                        <TableHead>사유</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.nickname}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {user.reportCount}회
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {user.reason}
                          </TableCell>
                          <TableCell>
                            {user.status === 'blocked' && (
                              <Badge className="bg-red-500">차단됨</Badge>
                            )}
                            {user.status === 'warning' && (
                              <Badge className="bg-orange-500">경고</Badge>
                            )}
                            {user.status === 'monitoring' && (
                              <Badge className="bg-yellow-500">모니터링</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {user.status === 'blocked' ? (
                                <Button size="sm" variant="outline">
                                  차단 해제
                                </Button>
                              ) : (
                                <Button size="sm" variant="destructive">
                                  차단
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reported Contents */}
            <TabsContent value="contents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-destructive" />
                    신고된 글
                  </CardTitle>
                  <CardDescription>
                    부적절한 글 검토 및 관리
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>올리브</TableHead>
                        <TableHead>신고 횟수</TableHead>
                        <TableHead>사유</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportedContents.map((content) => (
                        <TableRow key={content.id}>
                          <TableCell className="font-medium">
                            {content.title}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {content.creator}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {content.reportCount}회
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {content.reason}
                          </TableCell>
                          <TableCell>
                            {content.status === 'blocked' && (
                              <Badge className="bg-red-500">비활성화</Badge>
                            )}
                            {content.status === 'reviewing' && (
                              <Badge className="bg-orange-500">검토중</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline">
                                보기
                              </Button>
                              {content.status === 'blocked' ? (
                                <Button size="sm" variant="outline">
                                  복구
                                </Button>
                              ) : (
                                <Button size="sm" variant="destructive">
                                  비활성화
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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

