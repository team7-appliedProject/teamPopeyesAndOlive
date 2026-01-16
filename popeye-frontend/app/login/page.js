"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const router = useRouter();
  const [referralCode, setReferralCode] = useState('');

  const handleLogin = () => {
    // TODO: 실제 로그인 로직
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5b21b6]/5 via-background to-[#7c3aed]/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b21b6] to-[#7c3aed]">
              <span className="text-3xl">⭐</span>
            </div>
          </div>
          <CardTitle>StarP에 오신 것을 환영합니다</CardTitle>
          <CardDescription>
            유료 블로그 글 구매 플랫폼
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input id="password" type="password" />
              </div>
              <Button 
                className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90" 
                onClick={handleLogin}
              >
                로그인
              </Button>
              <Button variant="link" className="w-full text-sm">
                비밀번호를 잊으셨나요?
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">이메일</Label>
                <Input id="signup-email" type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">비밀번호</Label>
                <Input id="signup-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input id="nickname" placeholder="뽀빠이" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral">추천인 코드 (선택)</Label>
                <Input 
                  id="referral" 
                  placeholder="추천인 코드 입력"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                />
              </div>
              <div className="rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 p-3">
                <p className="text-sm text-[#22c55e] text-center">
                  🎁 회원가입 시 시금치 1,000개를 드려요! (유효기간: 1주일)
                </p>
              </div>
              <Button 
                className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                onClick={handleLogin}
              >
                회원가입
              </Button>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <Separator className="mb-6" />
            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 계속하기
              </Button>
              <Button variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#FEE500" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Kakao로 계속하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

