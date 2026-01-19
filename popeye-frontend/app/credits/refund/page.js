"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditBadge } from '@/components/CreditBadge';
import { creditApi, paymentApi, ApiError } from '@/app/lib/api';

const refundReasons = [
  '콘텐츠 품질이 기대에 못 미침',
  '중복 구매',
  '실수로 구매함',
  '기타',
];

export default function RefundPage() {
  const router = useRouter();
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [refundableTransactions, setRefundableTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 환불 가능한 거래 내역 가져오기
  useEffect(() => {
    const fetchRefundableTransactions = async () => {
      try {
        setLoading(true);
        // 크레딧 사용 내역 가져오기
        const historyData = await creditApi.getHistory(0, 50);
        
        // 환불 가능한 항목만 필터링 (CHARGE 타입이고 paymentId가 있고 7일 이내인 것)
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const refundable = (historyData?.content || [])
          .filter(item => {
            // CHARGE 타입이고 paymentId가 있어야 환불 가능
            if (item.reasonType !== 'CHARGE' || !item.paymentId) return false;
            
            // 날짜 확인 (7일 이내)
            const itemDate = new Date(item.changedAt);
            return itemDate >= sevenDaysAgo;
          })
          .map(item => ({
            id: String(item.creditHistoryId),
            paymentId: item.paymentId,
            date: item.changedAt,
            description: '크레딧 충전',
            amount: Math.abs(item.delta),
            creditType: item.creditType === 'PAID' ? 'starCandy' : 'spinach',
            status: 'refundable',
          }));
        
        setRefundableTransactions(refundable);
      } catch (err) {
        console.error('Failed to fetch refundable transactions:', err);
        setError('거래 내역을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRefundableTransactions();
  }, []);

  const handleSubmit = async () => {
    if (!selectedTransaction || !refundReason) return;
    
    const selectedTx = refundableTransactions.find(tx => tx.id === selectedTransaction);
    if (!selectedTx || !selectedTx.paymentId) {
      setError('환불할 결제 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const reason = refundReason === '기타' ? customReason : refundReason;
      if (!reason || reason.trim() === '') {
        setError('환불 사유를 입력해주세요.');
        setSubmitting(false);
        return;
      }

      await paymentApi.refund(selectedTx.paymentId, reason);
      alert('환불 요청이 접수되었습니다.');
      router.push('/credits');
    } catch (err) {
      console.error('Refund failed:', err);
      if (err instanceof ApiError) {
        setError(err.errorResponse.message || '환불 요청에 실패했습니다.');
      } else {
        setError(err.message || '환불 요청에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTx = refundableTransactions.find(tx => tx.id === selectedTransaction);
  const isExpired = selectedTx?.status === 'expired';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="h-8 w-8 text-[#5b21b6]" />
              <h1 className="text-3xl font-bold">환불 요청</h1>
            </div>
            <p className="text-muted-foreground">
              구매한 글에 대한 환불을 요청하세요
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>환불 요청서</CardTitle>
                  <CardDescription>
                    환불할 구매 내역과 사유를 선택하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Transaction Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="transaction">환불할 구매 내역 선택</Label>
                    <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
                      <SelectTrigger id="transaction">
                        <SelectValue placeholder="구매 내역을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {refundableTransactions.length > 0 ? (
                          refundableTransactions.map((tx) => (
                            <SelectItem 
                              key={tx.id} 
                              value={tx.id}
                              disabled={tx.status === 'expired'}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="text-left">
                                  <div className="font-medium">{tx.description}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(tx.date).toLocaleString('ko-KR')}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CreditBadge type={tx.creditType} amount={tx.amount} size="sm" />
                                  {tx.status === 'expired' && (
                                    <Badge variant="destructive" className="text-xs">기간 만료</Badge>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            환불 가능한 거래 내역이 없습니다.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {selectedTransaction && selectedTx && (
                      <div className="rounded-lg bg-muted p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">환불 예상 금액</span>
                          <CreditBadge 
                            type={selectedTx.creditType} 
                            amount={selectedTx.amount} 
                            size="sm"
                          />
                        </div>
                        {isExpired && (
                          <div className="flex items-center gap-2 text-xs text-destructive mt-2">
                            <AlertTriangle className="h-3 w-3" />
                            <span>구매 후 7일이 경과하여 환불이 불가능합니다.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Refund Reason */}
                  <div className="space-y-2">
                    <Label htmlFor="reason">환불 사유</Label>
                    <Select value={refundReason} onValueChange={setRefundReason} disabled={!selectedTransaction || isExpired}>
                      <SelectTrigger id="reason">
                        <SelectValue placeholder="환불 사유를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {refundReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Reason */}
                  {refundReason === '기타' && (
                    <div className="space-y-2">
                      <Label htmlFor="customReason">상세 사유</Label>
                      <Textarea
                        id="customReason"
                        placeholder="환불 사유를 자세히 입력해주세요"
                        rows={4}
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                      />
                    </div>
                  )}

                  <Separator />

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push('/credits')}
                    >
                      취소
                    </Button>
                    <Button
                      className="flex-1 bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                      onClick={handleSubmit}
                      disabled={!selectedTransaction || !refundReason || isExpired || (refundReason === '기타' && !customReason) || submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        '환불 요청하기'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Policy Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    환불 정책 안내
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">환불 가능 기간</h4>
                      <p className="text-muted-foreground">
                        구매일로부터 7일 이내에만 환불이 가능합니다.
                      </p>
                    </div>
                    
                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">환불 처리</h4>
                      <ul className="text-muted-foreground space-y-1 text-xs">
                        <li>• 환불 요청 후 1~3영업일 내 처리됩니다</li>
                        <li>• 환불된 크레딧은 별사탕으로 환불됩니다</li>
                        <li>• 환불 금액은 구매 시 사용한 크레딧과 동일합니다</li>
                        <li>• 환불 후 해당 글은 더 이상 열람할 수 없습니다</li>
                      </ul>
                    </div>

                    <Separator />

                    <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                        <div className="text-xs text-orange-700 dark:text-orange-300">
                          <p className="font-semibold mb-1">주의사항</p>
                          <ul className="space-y-1">
                            <li>• 환불 요청 후 취소가 불가능합니다</li>
                            <li>• 부당한 환불 요청은 거절될 수 있습니다</li>
                            <li>• 환불 정책은 변경될 수 있습니다</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

