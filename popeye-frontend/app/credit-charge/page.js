"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Leaf, AlertCircle, CreditCard, RotateCcw, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditBadge } from '@/components/CreditBadge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const chargePackages = [
  { id: '1', amount: 50000, price: 5000, bonus: 0 }, // 5,000원 = 50,000 크레딧 (1:10)
  { id: '2', amount: 100000, price: 10000, bonus: 10000, isPopular: true }, // 10,000원 = 100,000 크레딧 + 10,000 보너스
  { id: '3', amount: 500000, price: 50000, bonus: 100000 }, // 50,000원 = 500,000 크레딧 + 100,000 보너스
  { id: '4', amount: 1000000, price: 100000, bonus: 250000 }, // 100,000원 = 1,000,000 크레딧 + 250,000 보너스
];

export default function CreditChargePage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  // Mock current balance
  const spinachBalance = 1500;
  const spinachExpiry = '2026-02-09';
  const starCandyBalance = 8420;

  const handleCharge = () => {
    // 실제 결제 페이지로 이동
    router.push('/payment/charge');
  };

  const handleRefund = () => {
    // 환불 요청 페이지로 이동
    router.push('/payment/refund');
  };

  const handleCancel = () => {
    // 결제 취소 확인 페이지로 이동
    router.push('/payment/cancel');
  };

  const selectedPkg = selectedPackage ? chargePackages.find(p => p.id === selectedPackage) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">크레딧 충전</h1>
            <p className="text-muted-foreground">
              별사탕을 충전하여 프리미엄 글을 구매하세요
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              💰 크레딧 : 실제 돈 = 1 : 10 (5,000원 = 50,000 크레딧)
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
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
                  <div className="rounded-lg border border-[#fbbf24]/20 bg-[#fbbf24]/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-[#fbbf24] fill-current" />
                        <span className="font-semibold">별사탕</span>
                      </div>
                      <Badge variant="outline" className="text-[#fbbf24] border-[#fbbf24]">
                        유료
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-[#fbbf24]">
                      {starCandyBalance.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      만료일 없음
                    </div>
                  </div>

                  <Separator />

                  {/* Usage Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">크레딧 사용 정책</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• 글 구매 시 시금치가 먼저 차감됩니다</li>
                      <li>• 시금치 부족 시 별사탕이 차감됩니다</li>
                      <li>• 시금치는 유효기간 1주일이 있습니다</li>
                      <li>• 별사탕은 만료일이 없습니다</li>
                      <li>• 크레딧 : 실제 돈 = 1 : 10</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charge Packages */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>별사탕 충전 상품</CardTitle>
                  <CardDescription>
                    충전할 상품을 선택하세요 (5,000원 / 10,000원 단위)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {chargePackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`
                          relative rounded-lg border-2 p-4 cursor-pointer transition-all
                          ${selectedPackage === pkg.id
                            ? 'border-[#5b21b6] bg-[#5b21b6]/5'
                            : 'border-border hover:border-[#5b21b6]/50'
                          }
                        `}
                        onClick={() => setSelectedPackage(pkg.id)}
                      >
                        {pkg.isPopular && (
                          <div className="absolute -top-2 left-4">
                            <Badge className="bg-[#5b21b6]">인기</Badge>
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <CreditBadge 
                              type="starCandy" 
                              amount={pkg.amount} 
                              size="lg"
                              showLabel 
                            />
                            {pkg.bonus > 0 && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  +{pkg.bonus.toLocaleString()} 보너스
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            ₩{pkg.price.toLocaleString()}
                          </div>
                          {pkg.bonus > 0 && (
                            <div className="text-xs text-muted-foreground">
                              총 {(pkg.amount + pkg.bonus).toLocaleString()}개
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  {/* Payment Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>결제 수단: 토스페이먼츠 (카드, 계좌이체, 간편결제)</span>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                      onClick={handleCharge}
                    >
                      크레딧 충전
                    </Button>

                    <Separator />

                    {/* Additional Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={handleRefund}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        환불 요청
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={handleCancel}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        결제 취소 확인
                      </Button>
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

