"use client";

import { Suspense } from 'react'; // 👈 Suspense 추가
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react'; // Loader2 추가
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// 1. 에러 메시지를 읽고 화면을 그리는 내부 컴포넌트
function FailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorMessage = searchParams.get('message') || '결제가 취소되었거나 실패했습니다.';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <XCircle className="h-6 w-6" />
          결제 실패
        </CardTitle>
        <CardDescription>{errorMessage}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            결제를 다시 시도하시거나 다른 결제 수단을 선택해주세요.
          </p>
          <Button 
            onClick={() => router.push('/payment/charge')}
            className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
          >
            다시 시도
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 2. 메인 페이지 (Suspense 적용)
export default function PaymentFailPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      }>
        <FailContent />
      </Suspense>
    </div>
  );
}