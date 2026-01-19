"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldX, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { userApi, isSuccess } from '@/app/lib/api';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        setLoading(true);
        const response = await userApi.getMe();
        
        if (isSuccess(response) && response.data) {
          // role이 ADMIN인지 확인
          if (response.data.role === 'ADMIN') {
            setAuthorized(true);
          } else {
            setAuthorized(false);
          }
        } else {
          // 로그인되지 않은 경우
          setError('로그인이 필요합니다.');
          setAuthorized(false);
        }
      } catch (err) {
        console.error('Admin auth check error:', err);
        setError('인증 확인에 실패했습니다.');
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, []);

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 권한 없음
  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <ShieldX className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-2">권한이 없습니다</h1>
              <p className="text-muted-foreground mb-6">
                {error || '이 페이지는 관리자만 접근할 수 있습니다.'}
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  메인으로 돌아가기
                </Button>
                {error === '로그인이 필요합니다.' && (
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/login')}
                    className="w-full"
                  >
                    로그인하기
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 권한 있음 - 자식 컴포넌트 렌더링
  return children;
}
