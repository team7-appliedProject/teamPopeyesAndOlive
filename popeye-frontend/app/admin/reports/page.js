"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, FileText, AlertTriangle } from 'lucide-react';
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
import { adminApi } from '@/app/lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getReports(0, 20).catch(() => []);
        setReports(data);
      } catch (err) {
        setError(err.message || '데이터를 불러오는데 실패했습니다.');
        console.error('Reports fetch error:', err);
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
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">대기중</span>;
      case 'ACCEPTED':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">승인됨</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">거절됨</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{state}</span>;
    }
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
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-bold">관리자 페이지</h1>
              <nav className="flex items-center gap-4">
                <Link 
                  href="/admin" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  대시보드
                </Link>
                <Link 
                  href="/admin/reports" 
                  className="text-sm font-medium text-primary border-b-2 border-primary pb-1"
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

          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold">신고 관리</h2>
            <p className="text-muted-foreground mt-1">신고된 사용자 및 게시글을 관리합니다.</p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                신고된 사용자 ({userReports.length})
              </TabsTrigger>
              <TabsTrigger value="contents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                신고된 글 ({contentReports.length})
              </TabsTrigger>
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
                        <TableHead>신고 ID</TableHead>
                        <TableHead>대상 ID</TableHead>
                        <TableHead>사유</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>신고일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userReports.length > 0 ? (
                        userReports.map((report) => (
                          <TableRow key={report.reportId}>
                            <TableCell className="font-medium">{report.reportId}</TableCell>
                            <TableCell>{report.targetId}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{report.reason || '-'}</TableCell>
                            <TableCell>{getStateBadge(report.state)}</TableCell>
                            <TableCell>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '-'}</TableCell>
                            <TableCell className="text-right">
                              {report.state === 'PENDING' && (
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                                    승인
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    거절
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                        <TableHead>신고 ID</TableHead>
                        <TableHead>대상 ID</TableHead>
                        <TableHead>타입</TableHead>
                        <TableHead>사유</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>신고일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contentReports.length > 0 ? (
                        contentReports.map((report) => (
                          <TableRow key={report.reportId}>
                            <TableCell className="font-medium">{report.reportId}</TableCell>
                            <TableCell>{report.targetId}</TableCell>
                            <TableCell>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {report.targetType === 'CONTENT' ? '게시글' : '댓글'}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{report.reason || '-'}</TableCell>
                            <TableCell>{getStateBadge(report.state)}</TableCell>
                            <TableCell>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '-'}</TableCell>
                            <TableCell className="text-right">
                              {report.state === 'PENDING' && (
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                                    승인
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    거절
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            신고된 글이 없습니다.
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
