"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorMessage = searchParams.get('message') || '결제가 취소되었거나 실패했습니다.';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
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
    </div>
  );
}

