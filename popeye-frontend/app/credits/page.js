"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Leaf, AlertCircle, CreditCard, ArrowRight, RefreshCw, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditBadge } from '@/components/CreditBadge';
import { Separator } from '@/components/ui/separator';

export default function CreditsPage() {
  const router = useRouter();
  
  // Mock data - TODO: 실제 API로 교체
  const spinachBalance = 1500;
  const spinachExpiry = '2026-02-09';
  const starCandyBalance = 8420;

  const recentTransactions = [
    {
      id: '1',
      type: 'charge',
      amount: 100000,
      creditType: 'starCandy',
      description: '별사탕 충전',
      date: '2026-01-09 14:30',
      status: 'completed',
    },
    {
      id: '2',
      type: 'use',
      amount: 4500,
      creditType: 'starCandy',
      description: 'Figma 고급 테크닉 30가지 글 구매',
      date: '2026-01-08 19:22',
      status: 'completed',
    },
    {
      id: '3',
      type: 'refund',
      amount: 8900,
      creditType: 'starCandy',
      description: '환불 요청',
      date: '2026-01-07 10:15',
      status: 'pending',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">크레딧 관리</h1>
            <p className="text-muted-foreground">
              보유 크레딧 확인 및 충전, 환불, 취소 관리
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Current Balance */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>현재 보유 크레딧</CardTitle>
                  <CardDescription>내 크레딧 잔액</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Spinach */}
                  <div className="rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-[#22c55e]" />
                        <span className="font-semibold">시금치</span>
                      </div>
                      <Badge variant="outline" className="text-[#22c55e] border-[#22c55e]">
                        무료
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-[#22c55e] mb-1">
                      {spinachBalance.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      <span>만료일: {spinachExpiry} (1주 유효)</span>
                    </div>
                  </div>

                  {/* Star Candy */}
                  <div className="rounded-lg border border-white/20 bg-[#1a1a2e]/50 backdrop-blur-sm p-4 shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Star className="h-5 w-5 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] drop-shadow-[0_0_14px_rgba(255,255,255,0.6)] fill-white" />
                          <span className="absolute -top-0.5 -right-0.5 text-[8px] animate-pulse">✨</span>
                        </div>
                        <span className="font-semibold text-white">별사탕</span>
                      </div>
                      <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                        유료
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {starCandyBalance.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/70 mt-1">
                      만료일 없음
                    </div>
                  </div>

                  <Separator />

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm mb-3">빠른 작업</h4>
                    <Link href="/credit-charge" className="block">
                      <Button className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90">
                        <CreditCard className="h-4 w-4 mr-2" />
                        크레딧 충전
                      </Button>
                    </Link>
                    <Link href="/credits/refund" className="block">
                      <Button variant="outline" className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        환불 요청
                      </Button>
                    </Link>
                    <Link href="/credits/cancel" className="block">
                      <Button variant="outline" className="w-full">
                        <XCircle className="h-4 w-4 mr-2" />
                        결제 취소 확인
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>최근 거래 내역</CardTitle>
                  <CardDescription>
                    크레딧 충전, 사용, 환불 내역을 확인하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`
                            h-10 w-10 rounded-full flex items-center justify-center
                            ${transaction.type === 'charge' ? 'bg-blue-500/10 text-blue-500' : ''}
                            ${transaction.type === 'use' ? 'bg-muted text-muted-foreground' : ''}
                            ${transaction.type === 'refund' ? 'bg-orange-500/10 text-orange-500' : ''}
                          `}>
                            {transaction.type === 'charge' && <CreditCard className="h-5 w-5" />}
                            {transaction.type === 'use' && <ArrowRight className="h-5 w-5" />}
                            {transaction.type === 'refund' && <RefreshCw className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">{transaction.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CreditBadge 
                            type={transaction.creditType} 
                            amount={transaction.amount}
                            size="sm"
                          />
                          {transaction.status === 'pending' && (
                            <Badge variant="secondary">대기중</Badge>
                          )}
                          {transaction.status === 'completed' && (
                            <Badge className="bg-[#22c55e]">완료</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                    <h4 className="font-semibold">크레딧 사용 정책</h4>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• 글 구매 시 시금치가 먼저 차감됩니다</li>
                      <li>• 시금치 부족 시 별사탕이 차감됩니다</li>
                      <li>• 시금치는 유효기간 1주일이 있습니다</li>
                      <li>• 별사탕은 만료일이 없습니다</li>
                      <li>• 크레딧 : 실제 돈 = 1 : 10</li>
                      <li>• 환불 및 취소는 구매 후 7일 이내 가능합니다</li>
                    </ul>
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

