"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, Search, Clock, CheckCircle, X, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditBadge } from '@/components/CreditBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { paymentApi, creditApi, ApiError } from '@/app/lib/api';

export default function CancelPage() {
  const router = useRouter();
  const [searchId, setSearchId] = useState('');
  const [cancelRequests, setCancelRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 결제 취소 내역 가져오기
  useEffect(() => {
    const fetchCancelRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 결제 내역 가져오기
        const paymentsData = await paymentApi.getMyPayments(0, 50);
        
        // 크레딧 내역 가져오기 (환불 사유를 위해)
        const historyData = await creditApi.getHistory(0, 100);
        
        // CANCELED 타입만 필터링하고 환불 내역과 매칭
        const canceledPayments = (paymentsData?.content || [])
          .filter(payment => payment.paymentType === 'CANCELED')
          .map(payment => {
            // 환불 내역에서 해당 paymentId 찾기
            const refundHistory = (historyData?.content || []).find(
              h => h.paymentId === payment.paymentId && h.reasonType === 'REFUND'
            );
            
            return {
              id: `REF-${payment.paymentId}`,
              paymentId: payment.paymentId,
              date: payment.canceledAt || payment.approvedAt || payment.createdAt,
              originalDate: payment.approvedAt || payment.createdAt,
              description: `크레딧 충전 취소`,
              amount: payment.creditAmount,
              creditType: 'starCandy',
              status: 'completed', // CANCELED는 이미 완료된 상태
              reason: refundHistory ? '환불 요청' : '결제 취소',
            };
          });
        
        setCancelRequests(canceledPayments);
      } catch (err) {
        console.error('Failed to fetch cancel requests:', err);
        setError('결제 취소 내역을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCancelRequests();
  }, []);

  const filteredRequests = searchId
    ? cancelRequests.filter(req => req.id.toLowerCase().includes(searchId.toLowerCase()))
    : cancelRequests;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-500">처리 중</Badge>;
      case 'completed':
        return <Badge className="bg-[#22c55e]">완료</Badge>;
      case 'rejected':
        return <Badge variant="destructive">거절됨</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-[#22c55e]" />;
      case 'rejected':
        return <X className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-[#5b21b6]" />
          <p className="text-muted-foreground">결제 취소 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="h-8 w-8 text-[#5b21b6]" />
              <h1 className="text-3xl font-bold">결제 취소 및 환불 확인</h1>
            </div>
            <p className="text-muted-foreground">
              환불 요청 내역 및 처리 상태를 확인하세요
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="search">환불 번호 검색</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="환불 번호를 입력하세요 (예: REF-2026-001)"
                      className="pl-10"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setSearchId('')}
                    disabled={!searchId}
                  >
                    초기화
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancel Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>환불 요청 내역</CardTitle>
              <CardDescription>
                총 {filteredRequests.length}건의 환불 요청
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">환불 요청 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <Card key={request.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(request.status)}
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                환불 번호: {request.id}
                                {getStatusBadge(request.status)}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                요청일: {request.date}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">구매 내역</Label>
                            <p className="font-medium mt-1">{request.description}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              구매일: {request.originalDate}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">환불 금액</Label>
                            <div className="mt-1">
                              <CreditBadge 
                                type={request.creditType} 
                                amount={request.amount}
                                size="md"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <Label className="text-xs text-muted-foreground">환불 사유</Label>
                          <p className="text-sm mt-1">{request.reason}</p>
                        </div>

                        {request.status === 'rejected' && request.rejectReason && (
                          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-4">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                              <div className="text-sm">
                                <p className="font-semibold text-destructive mb-1">거절 사유</p>
                                <p className="text-destructive/90">{request.rejectReason}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {request.status === 'completed' && (
                          <div className="rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 p-3 mb-4">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-[#22c55e] mt-0.5 shrink-0" />
                              <div className="text-sm">
                                <p className="font-semibold text-[#22c55e] mb-1">환불 완료</p>
                                <p className="text-[#22c55e]/90">
                                  환불된 크레딧이 계정에 반영되었습니다.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {request.status === 'pending' && (
                          <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                              <div className="text-sm">
                                <p className="font-semibold text-orange-500 mb-1">처리 중</p>
                                <p className="text-orange-500/90">
                                  환불 요청이 검토 중입니다. 1~3영업일 내 처리됩니다.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/credits/refund?id=${request.id}`)}
                          >
                            상세 보기
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Policy Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>취소 및 환불 정책</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">환불 가능 기간</h4>
                  <p className="text-muted-foreground">
                    구매일로부터 7일 이내에만 환불이 가능합니다.
                  </p>
                </div>
                
                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">환불 처리 과정</h4>
                  <ol className="text-muted-foreground space-y-1 text-xs list-decimal list-inside">
                    <li>환불 요청 제출</li>
                    <li>1~3영업일 내 검토 및 처리</li>
                    <li>환불 승인 시 별사탕으로 환불</li>
                    <li>환불 거절 시 사유 안내</li>
                  </ol>
                </div>

                <Separator />

                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-semibold mb-2">환불 불가 사항</h4>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• 구매 후 7일이 경과한 경우</li>
                    <li>• 이미 환불 처리된 구매 내역</li>
                    <li>• 부당한 환불 요청의 경우</li>
                    <li>• 환불 정책에 위배되는 경우</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

