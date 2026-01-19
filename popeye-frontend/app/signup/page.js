"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { authApi, isSuccess } from "@/app/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [phoneConsent, setPhoneConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // 인증번호 발송
  const handleSendCode = async () => {
    if (!phoneNumber) {
      setPhoneError("휴대폰 번호를 입력해주세요.");
      return;
    }

    // 전화번호 형식 검증 (숫자만)
    const cleanPhone = phoneNumber.replace(/-/g, "");
    if (!/^01[0-9]{8,9}$/.test(cleanPhone)) {
      setPhoneError("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }

    try {
      setSendingCode(true);
      setPhoneError("");

      const response = await authApi.sendSms(cleanPhone);

      // 발송 버튼 누르면 인증번호 입력란 표시
      setCodeSent(true);
      setIsPhoneVerified(false);

      if (isSuccess(response)) {
        alert("인증번호가 발송되었습니다. (3분 유효)");
      } else {
        setPhoneError(response.message || "인증번호 발송에 실패했습니다.");
      }
    } catch (err) {
      console.error("Send SMS error:", err);
      // 에러가 나도 인증번호 입력란은 표시
      setCodeSent(true);
      // ApiError 클래스인 경우 errorResponse.message 사용
      const errorMessage =
        err.errorResponse?.message ||
        err.message ||
        "인증번호 발송에 실패했습니다.";
      setPhoneError(errorMessage);
    } finally {
      setSendingCode(false);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setPhoneError("인증번호를 입력해주세요.");
      return;
    }

    const cleanPhone = phoneNumber.replace(/-/g, "");

    try {
      setVerifyingCode(true);
      setPhoneError("");

      const response = await authApi.verifySms(cleanPhone, verificationCode);

      console.log("[Verify SMS] Response:", response);

      // API 응답이 성공이면 인증 완료 처리
      if (isSuccess(response)) {
        setIsPhoneVerified(true);
        setPhoneError("");
        console.log("[Verify SMS] Phone verified successfully");
      } else {
        setPhoneError(response.message || "인증번호가 일치하지 않습니다.");
      }
    } catch (err) {
      console.error("Verify SMS error:", err);
      // ApiError 클래스인 경우 errorResponse.message 사용
      const errorMessage =
        err.errorResponse?.message || err.message || "인증에 실패했습니다.";
      setPhoneError(errorMessage);
    } finally {
      setVerifyingCode(false);
    }
  };

  // 회원가입
  const handleSignup = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!email || !password || !passwordConfirm || !nickname || !phoneNumber) {
      setError("모든 필수 항목을 입력해주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 정규식 검증 (8~16자, 영문 대소문자, 숫자, 특수문자)
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*\W)(?=\S+$).{8,16}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "비밀번호는 8~16자의 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.",
      );
      return;
    }

    if (!isPhoneVerified) {
      setError("휴대폰 인증을 완료해주세요.");
      return;
    }

    if (!phoneConsent) {
      setError("연락처 수집에 동의해주세요.");
      return;
    }

    const cleanPhone = phoneNumber.replace(/-/g, "");

    try {
      setLoading(true);
      setError("");

      const response = await authApi.signup({
        email,
        password,
        nickname,
        phoneNumber: cleanPhone,
        referralCode: referralCode || undefined,
        phoneNumberCollectionConsent: phoneConsent,
      });

      console.log("[Signup] Response:", response);

      if (isSuccess(response)) {
        alert("회원가입이 완료되었습니다!");
        router.push("/login");
      } else {
        setError(response.message || "회원가입에 실패했습니다.");
      }
    } catch (err) {
      console.error("[Signup] Error:", err);
      // ApiError 클래스인 경우 errorResponse.message 사용
      const errorMessage =
        err.errorResponse?.message || err.message || "회원가입에 실패했습니다.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#5b21b6]/5 via-background to-[#7c3aed]/5 p-4">
      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center">
          {/* 뒤로가기 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-4 top-4 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5b21b6] to-[#7c3aed]">
              <span className="text-3xl">⭐</span>
            </div>
          </div>
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>StarP의 멤버가 되어보세요</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {/* 에러 메시지 */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 이메일 입력 */}
            <div className="space-y-2">
              <Label htmlFor="email">
                이메일 <span className="text-red-500">*</span>
              </Label>
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
              <Label htmlFor="password">
                비밀번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="8~16자 영문, 숫자, 특수문자 포함"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
                disabled={loading}
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">
                비밀번호 확인 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
                disabled={loading}
              />
            </div>

            {/* 닉네임 입력 */}
            <div className="space-y-2">
              <Label htmlFor="nickname">
                닉네임 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nickname"
                type="text"
                placeholder="사용할 닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
                disabled={loading}
              />
            </div>

            {/* 휴대폰 번호 인증 */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                휴대폰 번호 <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01012345678"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setIsPhoneVerified(false);
                    setCodeSent(false);
                  }}
                  className="flex-1 h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
                  disabled={loading || isPhoneVerified}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={sendingCode || loading || isPhoneVerified}
                  className="h-11 px-4 whitespace-nowrap"
                >
                  {sendingCode ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : codeSent ? (
                    "재발송"
                  ) : (
                    "인증번호 발송"
                  )}
                </Button>
              </div>

              {/* 인증번호 입력 */}
              {codeSent && !isPhoneVerified && (
                <div className="flex gap-2 mt-2">
                  <Input
                    type="text"
                    placeholder="인증번호 6자리"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1 h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
                    maxLength={6}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifyingCode || loading}
                    className="h-11 px-4 bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                  >
                    {verifyingCode ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "확인"
                    )}
                  </Button>
                </div>
              )}

              {/* 인증 완료 표시 */}
              {isPhoneVerified && (
                <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>휴대폰 인증이 완료되었습니다.</span>
                </div>
              )}

              {/* 휴대폰 에러 메시지 */}
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
            </div>

            {/* 추천인 코드 (선택) */}
            <div className="space-y-2">
              <Label htmlFor="referral">
                추천인 코드{" "}
                <span className="text-muted-foreground text-xs">(선택)</span>
              </Label>
              <Input
                id="referral"
                type="text"
                placeholder="추천인 코드가 있다면 입력하세요"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="h-11 border-2 border-gray-200 focus:border-[#5b21b6] bg-gray-50/50"
                disabled={loading}
              />
            </div>

            {/* 연락처 수집 동의 */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="phoneConsent"
                checked={phoneConsent}
                onCheckedChange={setPhoneConsent}
                disabled={loading}
              />
              <label
                htmlFor="phoneConsent"
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                연락처 수집에 동의합니다.{" "}
                <span className="text-red-500">*</span>
                <br />
                <span className="text-xs">
                  (서비스 이용 중 문제 발생 시 연락 목적으로만 사용됩니다)
                </span>
              </label>
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
              type="submit"
              className="w-full h-11 bg-[#5b21b6] hover:bg-[#5b21b6]/90 text-base font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  가입 중...
                </>
              ) : (
                "회원가입"
              )}
            </Button>
          </form>

          {/* 로그인 링크 */}
          <div className="flex items-center justify-center gap-2 text-sm pt-4">
            <span className="text-muted-foreground">
              이미 계정이 있으신가요?
            </span>
            <Link
              href="/login"
              className="font-medium text-[#5b21b6] hover:underline"
            >
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
              <Button
                variant="outline"
                className="w-full h-11 border-2"
                onClick={() => {
                  //window.location.href = "/oauth2/authorization/google";
                  window.location.href =
                    "http://localhost:8080/oauth2/authorization/google";
                }}
                disabled={loading}
              >
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
                Google로 가입하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
