"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuth2LoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. URL에서 token과 tokenType을 추출합니다.
    const token = searchParams.get("token");
    const tokenType = searchParams.get("tokenType") || "Bearer";

    if (token) {
      // 2. 브라우저 로컬 스토리지에 저장 (앞으로 API 호출 시 사용됨)
      localStorage.setItem("accessToken", token);
      localStorage.setItem("tokenType", tokenType);

      console.log("✅ 소셜 로그인 성공! 토큰이 저장되었습니다.");

      // 3. 메인 페이지로 이동 (원하는 경로로 수정 가능)
      router.push("/");
    } else {
      console.error("❌ 토큰을 찾을 수 없습니다.");
      router.push("/login"); // 실패 시 로그인 페이지로
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg font-medium">로그인 처리 중입니다...</p>
      </div>
    </div>
  );
}
