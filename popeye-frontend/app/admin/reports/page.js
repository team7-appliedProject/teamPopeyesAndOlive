"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, FileText, AlertTriangle, Loader2, Check, X, Eye, AlertOctagon } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminApi, contentApi } from '@/app/lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null); // 작업 버튼 펼침 상태
  
  // 콘텐츠 모달 상태
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [contentModalData, setContentModalData] = useState(null);
  const [contentModalLoading, setContentModalLoading] = useState(false);

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

  // 신고 처리 함수
  const handleProcessReport = async (reportId, state) => {
    try {
      setProcessingId(reportId);
      await adminApi.processReport(reportId, { state });
      
      // 처리 후 목록 갱신
      setReports(prev => prev.map(report => 
        report.reportId === reportId 
          ? { ...report, state } 
          : report
      ));
      setActiveActionId(null); // 작업 버튼 닫기
    } catch (err) {
      console.error('Report process error:', err);
      alert(err.message || '신고 처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  // 콘텐츠 조회 함수
  const handleViewContent = async (targetId) => {
    try {
      setContentModalLoading(true);
      setContentModalOpen(true);
      const data = await contentApi.getById(targetId);
      setContentModalData(data);
    } catch (err) {
      console.error('Content fetch error:', err);
      setContentModalData({ error: err.message || '콘텐츠를 불러오는데 실패했습니다.' });
    } finally {
      setContentModalLoading(false);
    }
  };

  // 모달 닫기
  const handleCloseContentModal = () => {
    setContentModalOpen(false);
    setContentModalData(null);
  };

  // 상태 배지 스타일
  const getStateBadge = (state) => {
    switch (state) {
      case 'PENDING':
      case 'REQUESTED':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">대기중</span>;
      case 'ACCEPTED':
      case 'APPROVED':
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

  // 대기 상태 확인
  const isPending = (state) => state === 'PENDING' || state === 'REQUESTED';

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
                        <TableHead className="w-[40%]">사유</TableHead>
                        <TableHead className="w-[15%]">상태</TableHead>
                        <TableHead className="w-[20%]">신고일</TableHead>
                        <TableHead className="w-[25%] text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userReports.length > 0 ? (
                        userReports.map((report, index) => (
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
                            <TableCell className="text-right">
                              {isPending(report.state) ? (
                                activeActionId === report.reportId ? (
                                  // 펼쳐진 상태: 세 개의 버튼 + 취소 버튼 표시
                                  <div className="flex justify-end gap-1">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50 px-2"
                                      onClick={() => handleProcessReport(report.reportId, 'TRUE')}
                                      disabled={processingId === report.reportId}
                                    >
                                      {processingId === report.reportId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <Check className="h-4 w-4 mr-1" />
                                          승인
                                        </>
                                      )}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-2"
                                      onClick={() => handleProcessReport(report.reportId, 'REJECTED')}
                                      disabled={processingId === report.reportId}
                                    >
                                      {processingId === report.reportId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <X className="h-4 w-4 mr-1" />
                                          거절
                                        </>
                                      )}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2"
                                      onClick={() => handleProcessReport(report.reportId, 'FALSE')}
                                      disabled={processingId === report.reportId}
                                    >
                                      {processingId === report.reportId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <AlertOctagon className="h-4 w-4 mr-1" />
                                          악성
                                        </>
                                      )}
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="px-2"
                                      onClick={() => setActiveActionId(null)}
                                      disabled={processingId === report.reportId}
                                    >
                                      취소
                                    </Button>
                                  </div>
                                ) : (
                                  // 접힌 상태: 작업하기 버튼만 표시
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setActiveActionId(report.reportId)}
                                  >
                                    작업하기
                                  </Button>
                                )
                              ) : (
                                <span className="text-sm text-muted-foreground">처리 완료</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
                        <TableHead className="w-[12%]">타입</TableHead>
                        <TableHead className="w-[33%]">사유</TableHead>
                        <TableHead className="w-[12%]">상태</TableHead>
                        <TableHead className="w-[18%]">신고일</TableHead>
                        <TableHead className="w-[25%] text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contentReports.length > 0 ? (
                        contentReports.map((report, index) => (
                          <TableRow key={report.reportId || `content-${index}`}>
                            <TableCell>
                              <button
                                onClick={() => report.targetId && handleViewContent(report.targetId)}
                                className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                                title="클릭하여 콘텐츠 보기"
                              >
                                <Eye className="h-3 w-3" />
                                {report.targetType === 'CONTENT' ? '게시글' : '댓글'}
                              </button>
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
                            <TableCell className="text-right">
                              {isPending(report.state) ? (
                                activeActionId === report.reportId ? (
                                  // 펼쳐진 상태: 세 개의 버튼 + 취소 버튼 표시
                                  <div className="flex justify-end gap-1">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50 px-2"
                                      onClick={() => handleProcessReport(report.reportId, 'TRUE')}
                                      disabled={processingId === report.reportId}
                                    >
                                      {processingId === report.reportId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <Check className="h-4 w-4 mr-1" />
                                          승인
                                        </>
                                      )}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-2"
                                      onClick={() => handleProcessReport(report.reportId, 'REJECTED')}
                                      disabled={processingId === report.reportId}
                                    >
                                      {processingId === report.reportId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <X className="h-4 w-4 mr-1" />
                                          거절
                                        </>
                                      )}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2"
                                      onClick={() => handleProcessReport(report.reportId, 'FALSE')}
                                      disabled={processingId === report.reportId}
                                    >
                                      {processingId === report.reportId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <AlertOctagon className="h-4 w-4 mr-1" />
                                          악성
                                        </>
                                      )}
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="px-2"
                                      onClick={() => setActiveActionId(null)}
                                      disabled={processingId === report.reportId}
                                    >
                                      취소
                                    </Button>
                                  </div>
                                ) : (
                                  // 접힌 상태: 작업하기 버튼만 표시
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setActiveActionId(report.reportId)}
                                  >
                                    작업하기
                                  </Button>
                                )
                              ) : (
                                <span className="text-sm text-muted-foreground">처리 완료</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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

          {/* 콘텐츠 보기 모달 */}
          <Dialog open={contentModalOpen} onOpenChange={handleCloseContentModal}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  신고된 콘텐츠 보기
                </DialogTitle>
                <DialogDescription>
                  신고된 게시글의 내용을 확인합니다.
                </DialogDescription>
              </DialogHeader>
              
              {contentModalLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
                </div>
              ) : contentModalData?.error ? (
                <div className="py-12 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                  <p className="text-destructive">{contentModalData.error}</p>
                </div>
              ) : contentModalData ? (
                <div className="space-y-4 py-4">
                  {/* 제목 */}
                  <div>
                    <h3 className="text-lg font-semibold">{contentModalData.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {contentModalData.free ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">무료</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">유료</span>
                      )}
                      {contentModalData.price && (
                        <span className="text-sm text-muted-foreground">
                          가격: {contentModalData.price.toLocaleString()}원
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 본문 */}
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <p className="text-sm font-medium text-muted-foreground mb-2">본문 내용</p>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line text-foreground">
                        {contentModalData.content || contentModalData.preview || '내용 없음'}
                      </p>
                    </div>
                  </div>
                  
                  {/* 추가 정보 */}
                  {(contentModalData.viewCount || contentModalData.likeCount) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {contentModalData.viewCount && <span>조회 {contentModalData.viewCount.toLocaleString()}</span>}
                      {contentModalData.likeCount && <span>좋아요 {contentModalData.likeCount.toLocaleString()}</span>}
                    </div>
                  )}
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
