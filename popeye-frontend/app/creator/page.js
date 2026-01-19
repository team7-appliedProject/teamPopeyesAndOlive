"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApi } from '@/app/lib/hooks';
import { settlementApi } from '@/app/lib/api';

// TODO: 실제 creatorId는 인증 정보에서 가져와야 함
const CREATOR_ID = 1;

export default function CreatorPage() {
  const router = useRouter();
  const [isCreator, setIsCreator] = useState(true);

  // 정산 관련 상태
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // 정산 가능 잔액 조회
  const {
    data: availableBalance,
    loading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useApi(() => settlementApi.getAvailableBalance(CREATOR_ID));

  // 컨텐츠별 정산 요약 조회
  const {
    data: contentSummaries,
    loading: summariesLoading,
    error: summariesError,
    refetch: refetchSummaries,
  } = useApi(() => settlementApi.getContentSettlementSummaries(CREATOR_ID));

  // 선택된 컨텐츠의 월별 상세 정산 조회
  const {
    data: monthlySettlement,
    loading: monthlyLoading,
    error: monthlyError,
    refetch: refetchMonthly,
  } = useApi(
    () => {
      if (!selectedContentId) return Promise.resolve(null);
      return settlementApi.getMonthlyContentSettlement(
        CREATOR_ID,
        Number(selectedContentId),
        selectedMonth
      );
    },
    [selectedContentId, selectedMonth]
  );

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return `₩${amount.toLocaleString()}`;
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 날짜 시간 포맷팅
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#5b21b6] to-[#7c3aed] flex items-center justify-center text-3xl">
                🫒
              </div>
            </div>
            <CardTitle>올리브로 전환하기</CardTitle>
            <CardDescription>
              작가가 되어 글을 판매하고 수익을 얻으세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <p>✨ 올리브 혜택:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 글 판매 수익의 90% 정산</li>
                <li>• 무제한 글 업로드</li>
                <li>• 정산 내역 조회</li>
                <li>• 출금 신청</li>
              </ul>
            </div>
            <Button 
              className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
              onClick={() => setIsCreator(true)}
            >
              올리브로 전환
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">올리브 대시보드</h1>
              <p className="text-muted-foreground">글 관리 및 정산 확인</p>
            </div>
            <Button 
              className="bg-[#5b21b6] hover:bg-[#5b21b6]/90"
              onClick={() => router.push('/creator/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              글 등록
            </Button>
          </div>

          {/* 정산 가능 잔액 카드 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>정산 가능 잔액</CardTitle>
              <CardDescription>출금 가능한 정산 금액입니다</CardDescription>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : balanceError ? (
                <div className="flex items-center gap-2 text-destructive py-4">
                  <AlertCircle className="h-5 w-5" />
                  <span>{balanceError.message}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchBalance()}
                    className="ml-auto"
                  >
                    다시 시도
                  </Button>
                </div>
              ) : availableBalance ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">총 정산 금액</p>
                      <p className="text-2xl font-bold">{formatAmount(availableBalance.settlementSum)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">출금 완료 금액</p>
                      <p className="text-2xl font-bold text-muted-foreground">
                        {formatAmount(availableBalance.withdrawnSum)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">출금 가능 금액</p>
                      <p className="text-2xl font-bold text-[#22c55e]">
                        {formatAmount(availableBalance.available)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button
                      className="bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                      onClick={() => router.push('/withdrawal')}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      출금 신청
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground py-4">데이터가 없습니다</p>
              )}
            </CardContent>
          </Card>

          {/* 컨텐츠별 정산 요약 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>컨텐츠별 정산 요약</CardTitle>
              <CardDescription>각 컨텐츠별 누적 정산 내역입니다</CardDescription>
            </CardHeader>
            <CardContent>
              {summariesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : summariesError ? (
                <div className="flex items-center gap-2 text-destructive py-4">
                  <AlertCircle className="h-5 w-5" />
                  <span>{summariesError.message}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchSummaries()}
                    className="ml-auto"
                  >
                    다시 시도
                  </Button>
                </div>
              ) : contentSummaries && contentSummaries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>컨텐츠 제목</TableHead>
                      <TableHead className="text-right">총 매출</TableHead>
                      <TableHead className="text-right">플랫폼 수수료</TableHead>
                      <TableHead className="text-right">총 정산 금액</TableHead>
                      <TableHead className="text-right">정산 횟수</TableHead>
                      <TableHead>최근 정산일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentSummaries.map((summary) => (
                      <TableRow key={summary.contentId}>
                        <TableCell className="font-medium">{summary.title}</TableCell>
                        <TableCell className="text-right">
                          {formatAmount(summary.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          -{formatAmount(summary.platformFee)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(summary.totalPayout)}
                        </TableCell>
                        <TableCell className="text-right">
                          {summary.settlementCount}회
                        </TableCell>
                        <TableCell>
                          {summary.lastSettledAt
                            ? formatDateTime(summary.lastSettledAt)
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground py-4">정산 내역이 없습니다</p>
              )}
            </CardContent>
          </Card>

          {/* 월별 상세 정산 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>월별 상세 정산</CardTitle>
              <CardDescription>특정 컨텐츠의 월별 일일 정산 내역을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Select
                  value={selectedContentId ? String(selectedContentId) : ''}
                  onValueChange={(value) => setSelectedContentId(value ? Number(value) : null)}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="컨텐츠를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentSummaries?.map((summary) => (
                      <SelectItem
                        key={summary.contentId}
                        value={String(summary.contentId)}
                      >
                        {summary.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const months = [];
                      const now = new Date();
                      for (let i = 0; i < 12; i++) {
                        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        months.push(
                          <SelectItem key={monthStr} value={monthStr}>
                            {date.toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                            })}
                          </SelectItem>
                        );
                      }
                      return months;
                    })()}
                  </SelectContent>
                </Select>
              </div>

              {!selectedContentId ? (
                <p className="text-muted-foreground py-8 text-center">
                  컨텐츠를 선택하면 상세 정산 내역을 확인할 수 있습니다
                </p>
              ) : monthlyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : monthlyError ? (
                <div className="flex items-center gap-2 text-destructive py-4">
                  <AlertCircle className="h-5 w-5" />
                  <span>{monthlyError.message}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchMonthly()}
                    className="ml-auto"
                  >
                    다시 시도
                  </Button>
                </div>
              ) : monthlySettlement && monthlySettlement.items.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    기간: {formatDate(monthlySettlement.from)} ~ {formatDate(monthlySettlement.to)}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>기간</TableHead>
                        <TableHead className="text-right">주문 수</TableHead>
                        <TableHead className="text-right">총 매출</TableHead>
                        <TableHead className="text-right">플랫폼 수수료</TableHead>
                        <TableHead className="text-right">정산 금액</TableHead>
                        <TableHead>정산 일시</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlySettlement.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {formatDateTime(item.periodStart)} ~ {formatDateTime(item.periodEnd)}
                          </TableCell>
                          <TableCell className="text-right">{item.orderCount}건</TableCell>
                          <TableCell className="text-right">
                            {formatAmount(item.totalRevenue)}
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            -{formatAmount(item.totalPlatformFee)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatAmount(item.totalPayout)}
                          </TableCell>
                          <TableCell>
                            {item.latestSettledAt
                              ? formatDateTime(item.latestSettledAt)
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  해당 기간의 정산 내역이 없습니다
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
