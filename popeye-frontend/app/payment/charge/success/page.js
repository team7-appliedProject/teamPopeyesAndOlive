"use client";

import { useEffect, useState, useRef, Suspense } from "react"; // 👈 Suspense 추가
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { paymentApi } from "@/app/lib/api";
import { ApiError } from "@/app/lib/api";

// 1. 실제 결제 처리 로직을 담은 내부 컴포넌트
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    if (hasProcessedRef.current) return;

    const processPayment = async () => {
      hasProcessedRef.current = true;

      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        setError("결제 정보가 올바르지 않습니다.");
        setIsProcessing(false);
        hasProcessedRef.current = false;
        return;
      }

      try {
        await paymentApi.confirm({
          pgOrderId: orderId,
          paymentKey: paymentKey,
          amount: parseInt(amount),
        });

        setSuccess(true);
        setIsProcessing(false);

        setTimeout(() => {
          window.location.href = "/payment/charge";
        }, 3000);
      } catch (err) {
        console.error("결제 승인 실패:", err);
        hasProcessedRef.current = false;
        if (err instanceof ApiError) {
          setError(err.errorResponse.message || "결제 승인에 실패했습니다.");
        } else {
          setError(err.message || "결제 승인에 실패했습니다.");
        }
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (isProcessing) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>결제 처리 중</CardTitle>
          <CardDescription>결제를 확인하고 있습니다...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-[#5b21b6] mb-4" />
          <p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">결제 실패</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push("/payment/charge")}
            className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
          >
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-6 w-6" />
            결제 완료
          </CardTitle>
          <CardDescription>크레딧 충전이 완료되었습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">잠시 후 이동합니다...</p>
            <Button
              onClick={() => (window.location.href = "/payment/charge")}
              className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
            >
              바로 이동
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// 2. 외부에서 불러오는 메인 페이지 (Suspense로 감싸기)
export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-[#5b21b6]" />
          </CardContent>
        </Card>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
