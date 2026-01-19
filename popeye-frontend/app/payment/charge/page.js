"use client";

import { useState, useEffect } from 'react';
import { Star, Leaf, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditBadge } from '@/components/CreditBadge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { paymentApi } from '@/app/lib/api';
import { ApiError } from '@/app/lib/api';

const WON_PER_CREDIT = 10;

export default function PaymentChargePage() {
  const [creditAmount, setCreditAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Mock current balance (실제로는 API에서 가져와야 함)
  const spinachBalance = 1500;
  const spinachExpiry = '2026-02-09';
  const starCandyBalance = 8420;

  const totalAmount = creditAmount ? parseInt(creditAmount) * WON_PER_CREDIT : 0;
  const isValidAmount = creditAmount && parseInt(creditAmount) >= 1;

  // Toss Payments 스크립트 로드
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.TossPayments) {
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1/payment';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleCharge = async () => {
    if (!isValidAmount || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. 결제 준비 API 호출
      const prepareResponse = await paymentApi.prepare({
        creditAmount: parseInt(creditAmount),
        pgProvider: 'TOSS',
      });

      const { pgOrderId, paymentId } = prepareResponse;
      const amount = totalAmount;
      const orderName = '크레딧 충전';

      // 2. Toss 결제창 호출
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      
      if (!clientKey) {
        throw new Error('Toss Client Key가 설정되지 않았습니다.');
      }

      // Toss Payments 스크립트가 로드될 때까지 대기
      const waitForTossPayments = () => {
        return new Promise((resolve, reject) => {
          if (window.TossPayments) {
            resolve(window.TossPayments(clientKey));
            return;
          }

          let attempts = 0;
          const maxAttempts = 50; // 5초 대기
          const interval = setInterval(() => {
            attempts++;
            if (window.TossPayments) {
              clearInterval(interval);
              resolve(window.TossPayments(clientKey));
            } else if (attempts >= maxAttempts) {
              clearInterval(interval);
              reject(new Error('Toss Payments 스크립트 로드 실패'));
            }
          }, 100);
        });
      };

      const tossPayments = await waitForTossPayments();
      
      // 결제창 열기 (redirect 방식)
      // Toss Payments는 successUrl로 리다이렉트할 때 paymentKey와 orderId를 쿼리 파라미터로 전달합니다
      // amount는 추가 파라미터로 포함시켜 전달합니다
      const successUrl = new URL(`${window.location.origin}/payment/charge/success`);
      successUrl.searchParams.set('orderId', pgOrderId);
      successUrl.searchParams.set('amount', amount.toString());
      
      tossPayments.requestPayment('카드', {
        amount: amount,
        orderId: pgOrderId,
        orderName: orderName,
        successUrl: successUrl.toString(),
        failUrl: `${window.location.origin}/payment/charge/fail`,
      });
    } catch (err) {
      console.error('결제 준비 실패:', err);
      if (err instanceof ApiError) {
        setError(err.errorResponse.message || '결제 준비에 실패했습니다.');
      } else {
        setError(err.message || '결제 준비에 실패했습니다.');
      }
      setIsLoading(false);
    }
  };


  const selectedPkg = creditAmount ? {
    amount: parseInt(creditAmount),
    price: totalAmount,
  } : null;

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
              💰 크레딧 : 실제 돈 = 1 : 10 (1 크레딧 = 10원)
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

          {success && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">결제가 성공적으로 완료되었습니다!</span>
              </div>
            </div>
          )}

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

            {/* Charge Input */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>별사탕 충전</CardTitle>
                  <CardDescription>
                    충전할 크레딧 양을 입력하세요 (최소 1 크레딧)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Credit Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="creditAmount">충전할 크레딧 (개)</Label>
                      <Input
                        id="creditAmount"
                        type="number"
                        min="1"
                        placeholder="예: 10000"
                        value={creditAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 1000000)) {
                            setCreditAmount(value);
                            setError(null);
                          }
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
                        disabled={isLoading}
                        className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                      {creditAmount && (
                        <p className="text-sm text-muted-foreground">
                          총 결제 금액: <span className="font-semibold">₩{totalAmount.toLocaleString()}</span>
                        </p>
                      )}
                      {creditAmount && parseInt(creditAmount) < 1 && (
                        <p className="text-sm text-destructive">
                          최소 1 크레딧 이상 입력해주세요.
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Payment Summary */}
                    {selectedPkg && (
                      <div className="rounded-lg bg-muted p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">충전 크레딧</span>
                          <CreditBadge 
                            type="starCandy" 
                            amount={selectedPkg.amount} 
                            showLabel
                          />
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-semibold">
                          <span>결제 금액</span>
                          <span className="text-lg">₩{selectedPkg.price.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span>결제 수단: 토스페이먼츠 (카드, 계좌이체, 간편결제)</span>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="lg" 
                            className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                            disabled={!isValidAmount || isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                결제 진행 중...
                              </>
                            ) : (
                              '충전하기'
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>별사탕 충전</AlertDialogTitle>
                            <AlertDialogDescription>
                              {selectedPkg && (
                                <div className="space-y-3 text-left">
                                  <p>선택한 크레딧을 충전하시겠습니까?</p>
                                  <div className="rounded-lg bg-muted p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">충전 크레딧</span>
                                      <CreditBadge 
                                        type="starCandy" 
                                        amount={selectedPkg.amount} 
                                        showLabel
                                      />
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between items-center font-semibold">
                                      <span>결제 금액</span>
                                      <span className="text-lg">₩{selectedPkg.price.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    토스페이먼츠 결제 페이지로 이동합니다.
                                  </p>
                                </div>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleCharge}
                              className="bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  진행 중...
                                </>
                              ) : (
                                '결제하기'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

