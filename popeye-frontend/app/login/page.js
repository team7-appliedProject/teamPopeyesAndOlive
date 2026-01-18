"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authApi, isSuccess } from "@/app/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await authApi.login({ email, password });
      console.log("[Login] Response:", response);

      if (isSuccess(response) && response.data) {
        // 토큰을 localStorage에 저장
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("tokenType", response.data.tokenType);

        // 메인 페이지로 이동
        router.push("/");
        router.refresh(); // 헤더 상태 갱신
      } else {
        setError(response.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error("[Login] Error:", err);
      setError(
        err.message ||
          "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."
      );
    } finally {
      setLoading(false);
    }
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
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>StarP에 오신 것을 환영합니다</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 에러 메시지 */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 이메일 입력 */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
                disabled={loading}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
                disabled={loading}
              />
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#5b21b6] hover:bg-[#5b21b6]/90 text-base font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          {/* 비밀번호 찾기 & 회원가입 */}
          <div className="flex flex-col items-center gap-2 pt-4">
            <Button
              variant="link"
              className="text-sm text-muted-foreground hover:text-[#5b21b6]"
            >
              비밀번호를 잊으셨나요?
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                아직 계정이 없으신가요?
              </span>
              <Link
                href="/signup"
                className="font-medium text-[#5b21b6] hover:underline"
              >
                회원가입 하기
              </Link>
            </div>
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
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 계속하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
