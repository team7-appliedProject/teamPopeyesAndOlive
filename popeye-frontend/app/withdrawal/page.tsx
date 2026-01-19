"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, ArrowUpRight, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useApi, useLazyApi } from '@/app/lib/hooks';
import { withdrawalApi, settlementApi } from '@/app/lib/api';

// TODO: 실제 creatorId는 인증 정보에서 가져와야 함
const CREATOR_ID = 1;

export default function WithdrawalPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  // 정산 가능 잔액 조회
  const {
    data: availableBalance,
    loading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useApi(() => settlementApi.getAvailableBalance(CREATOR_ID));

  // 출금 내역 조회
  const {
    data: withdrawals,
    loading: withdrawalsLoading,
    error: withdrawalsError,
    refetch: refetchWithdrawals,
  } = useApi(() => withdrawalApi.getWithdrawals(CREATOR_ID));

  // 출금 신청
  const {
    execute: requestWithdrawal,
    loading: requestLoading,
    error: requestError,
  } = useLazyApi(withdrawalApi.requestWithdrawal);

  // 출금 신청 핸들러
  const handleWithdrawalRequest = async () => {
    setWithdrawalError(null);
    const withdrawalAmount = Number(amount);

    // 입력 검증
    if (!amount || isNaN(withdrawalAmount) || withdrawalAmount < 1) {
      setWithdrawalError('출금 금액은 1원 이상이어야 합니다.');
      return;
    }

    if (availableBalance && withdrawalAmount > availableBalance.available) {
      setWithdrawalError(`출금 가능 금액(${formatAmount(availableBalance.available)})을 초과할 수 없습니다.`);
      return;
    }

    try {
      await requestWithdrawal(CREATOR_ID, { amount: withdrawalAmount });
      setAmount('');
      setShowConfirmDialog(false);
      // 출금 내역과 잔액 재조회
      refetchWithdrawals();
      refetchBalance();
    } catch (err) {
      // 에러는 useLazyApi에서 이미 처리됨
      setWithdrawalError(err instanceof Error ? err.message : '출금 신청에 실패했습니다.');
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  // 날짜 시간 포맷팅
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 상태 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQ':
        return <Badge variant="outline">신청</Badge>;
      case 'SUC':
        return <Badge className="bg-[#22c55e]">완료</Badge>;
      case 'REJ':
        return <Badge variant="destructive">거절</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // 최대 출금 가능 금액
  const maxAmount = availableBalance?.available || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="h-8 w-8 text-[#5b21b6]" />
              <h1 className="text-3xl font-bold">출금 관리</h1>
            </div>
            <p className="text-muted-foreground">
              정산 금액을 출금 신청하고 내역을 확인하세요
            </p>
          </div>

          {/* 출금 가능 잔액 카드 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>출금 가능 잔액</CardTitle>
              <CardDescription>현재 출금 신청 가능한 금액입니다</CardDescription>
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
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-2">출금 가능 금액</p>
                    <p className="text-4xl font-bold text-[#22c55e]">
                      {formatAmount(availableBalance.available)}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">총 정산 금액</p>
                      <p className="font-semibold">{formatAmount(availableBalance.settlementSum)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">출금 완료 금액</p>
                      <p className="font-semibold">{formatAmount(availableBalance.withdrawnSum)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground py-4">데이터가 없습니다</p>
              )}
            </CardContent>
          </Card>

          {/* 출금 신청 폼 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>출금 신청</CardTitle>
              <CardDescription>출금할 금액을 입력하고 신청하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">출금 금액 (원)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="출금할 금액을 입력하세요"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setWithdrawalError(null);
                    }}
                    min="1"
                    max={maxAmount}
                    disabled={requestLoading || maxAmount === 0}
                  />
                  <p className="text-xs text-muted-foreground">
                    최대 출금 가능 금액: {formatAmount(maxAmount)}
                  </p>
                </div>

                {(withdrawalError || requestError) && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{withdrawalError || requestError?.message || '출금 신청에 실패했습니다.'}</span>
                  </div>
                )}

                <Button
                  className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                  onClick={() => {
                    const withdrawalAmount = Number(amount);
                    if (!amount || isNaN(withdrawalAmount) || withdrawalAmount < 1) {
                      setWithdrawalError('출금 금액은 1원 이상이어야 합니다.');
                      return;
                    }
                    if (withdrawalAmount > maxAmount) {
                      setWithdrawalError(`출금 가능 금액(${formatAmount(maxAmount)})을 초과할 수 없습니다.`);
                      return;
                    }
                    setShowConfirmDialog(true);
                  }}
                  disabled={requestLoading || !amount || maxAmount === 0}
                >
                  {requestLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      출금 신청
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 출금 내역 */}
          <Card>
            <CardHeader>
              <CardTitle>출금 내역</CardTitle>
              <CardDescription>출금 신청 및 처리 내역입니다</CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : withdrawalsError ? (
                <div className="flex items-center gap-2 text-destructive py-4">
                  <AlertCircle className="h-5 w-5" />
                  <span>{withdrawalsError.message}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchWithdrawals()}
                    className="ml-auto"
                  >
                    다시 시도
                  </Button>
                </div>
              ) : withdrawals && withdrawals.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>신청일시</TableHead>
                      <TableHead className="text-right">금액</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>처리일시</TableHead>
                      <TableHead>사유</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell>{formatDateTime(withdrawal.requestedAt)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(withdrawal.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                        <TableCell>
                          {withdrawal.processedAt
                            ? formatDateTime(withdrawal.processedAt)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {withdrawal.failureReason ? (
                            <span className="text-destructive text-sm">
                              {withdrawal.failureReason}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  출금 내역이 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          {/* 확인 다이얼로그 */}
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>출금 신청 확인</AlertDialogTitle>
                <AlertDialogDescription>
                  출금 금액 <span className="font-bold text-lg">{formatAmount(Number(amount))}</span>을(를)
                  신청하시겠습니까?
                  <br />
                  <br />
                  출금 신청 후 즉시 처리되며, 처리 결과는 출금 내역에서 확인할 수 있습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleWithdrawalRequest}
                  disabled={requestLoading}
                >
                  {requestLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    '신청하기'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

