"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const handleSignup = () => {
    // TODO: 실제 회원가입 로직
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5b21b6]/5 via-background to-[#7c3aed]/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* 뒤로가기 버튼 */}
          <div className="absolute left-4 top-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b21b6] to-[#7c3aed]">
              <span className="text-3xl">⭐</span>
            </div>
          </div>
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>
            StarP의 멤버가 되어보세요
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 이메일 입력 */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일 <span className="text-red-500">*</span></Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호 <span className="text-red-500">*</span></Label>
            <Input 
              id="password" 
              type="password"
              placeholder="8자 이상 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">비밀번호 확인 <span className="text-red-500">*</span></Label>
            <Input 
              id="passwordConfirm" 
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
            />
          </div>

          {/* 닉네임 입력 */}
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임 <span className="text-red-500">*</span></Label>
            <Input 
              id="nickname" 
              type="text"
              placeholder="사용할 닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
            />
          </div>

          {/* 추천인 코드 (선택) */}
          <div className="space-y-2">
            <Label htmlFor="referral">추천인 코드 <span className="text-muted-foreground text-xs">(선택)</span></Label>
            <Input 
              id="referral" 
              type="text"
              placeholder="추천인 코드가 있다면 입력하세요"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
            />
          </div>

          {/* 가입 혜택 안내 */}
          <div className="rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 p-3">
            <p className="text-sm text-[#22c55e] text-center font-medium">
              🎁 회원가입 시 시금치 1,000개를 드려요!
            </p>
            <p className="text-xs text-[#22c55e]/80 text-center mt-1">
              유효기간: 1주일
            </p>
          </div>

          {/* 회원가입 버튼 */}
          <Button 
            className="w-full h-11 bg-[#5b21b6] hover:bg-[#5b21b6]/90 text-base font-medium" 
            onClick={handleSignup}
          >
            회원가입
          </Button>

          {/* 로그인 링크 */}
          <div className="flex items-center justify-center gap-2 text-sm pt-2">
            <span className="text-muted-foreground">이미 계정이 있으신가요?</span>
            <Link href="/login" className="font-medium text-[#5b21b6] hover:underline">
              로그인 하기
            </Link>
          </div>
          
          {/* 소셜 로그인 */}
          <div className="pt-4">
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-muted-foreground">
                또는
              </span>
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full h-11 border-2">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 가입하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
