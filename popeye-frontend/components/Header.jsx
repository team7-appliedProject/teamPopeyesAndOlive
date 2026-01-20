"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  Bell,
  Check,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CreditBadge } from "./CreditBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  notificationApi,
  creditApi,
  userApi,
  authApi,
  isSuccess,
} from "@/app/lib/api";

export function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [spinachBalance, setSpinachBalance] = useState(0);
  const [starCandyBalance, setStarCandyBalance] = useState(0);

  // 로그인 여부 확인 및 잔액 가져오기
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        console.log("[Header] Checking auth...");
        const response = await userApi.getMe();
        console.log("[Header] User response:", response);
        // ApiResponse 형태: { status: "success", data: { ... } }
        if (response && isSuccess(response) && response.data) {
          setIsLoggedIn(true);
          setUserInfo(response.data);
          // 잔액 정보도 userInfo에 포함되어 있음
          // 백엔드 필드명: totalSpinach, totalStarcandy
          setSpinachBalance(response.data.totalSpinach ?? 0);
          setStarCandyBalance(response.data.totalStarcandy ?? 0);
        } else {
          setIsLoggedIn(false);
          setUserInfo(null);
          setSpinachBalance(0);
          setStarCandyBalance(0);
        }
      } catch (err) {
        // 401 또는 에러 시 비로그인 상태
        console.log("[Header] Auth check failed:", err);
        setIsLoggedIn(false);
        setUserInfo(null);
        setSpinachBalance(0);
        setStarCandyBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    // 💡 [추가] 'update-credits' 이벤트를 감지하면 다시 checkAuth를 실행합니다.
  window.addEventListener("update-credits", checkAuth);
  
  return () => {
    window.removeEventListener("update-credits", checkAuth);
  };
  }, []);

  // 알림 목록 가져오기 (로그인 시에만)
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchNotifications = async () => {
      try {
        const data = await notificationApi.getAll();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, [isLoggedIn]);

  // 안 읽은 알림 개수
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  // 알림 읽음 처리
  const handleMarkAsRead = async (notiId, e) => {
    e.stopPropagation();

    if (readIds.has(notiId)) return;

    try {
      await notificationApi.markAsRead(notiId);
      setReadIds((prev) => new Set([...prev, notiId]));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // 시간 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString();
  };

  // 로그아웃 처리
  // 클라이언트 토큰 삭제로 처리
  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청 (실패해도 로그아웃은 진행)
      await authApi.logout().catch(() => {
        // API 호출 실패해도 무시하고 로그아웃 진행
      });
    } catch (err) {
      // 에러 무시하고 로그아웃 진행
      console.log(
        "[Header] Logout API call failed, but continuing logout:",
        err,
      );
    } finally {
      // 저장된 JWT 토큰 삭제
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenType");

      // 인증 상태 초기화
      setIsLoggedIn(false);
      setUserInfo(null);
      setNotifications([]);
      setReadIds(new Set());
      setSpinachBalance(0);
      setStarCandyBalance(0);

      // 로그인 페이지로 이동
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center gap-4 px-4 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5b21b6] to-[#7c3aed]">
            <span className="text-xl">⭐</span>
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-[#5b21b6] to-[#7c3aed] bg-clip-text text-transparent">
            StarP
          </span>
        </Link>

        {/* Search - 가운데 검색창, 최대 너비 제한 */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="글 검색..." className="pl-10 bg-muted/50" />
          </div>
        </div>

        {/* Right Side - 항상 오른쪽에 위치 */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
          {isLoading ? (
            // 로딩 중 스켈레톤
            <div className="flex items-center gap-3">
              <div className="h-8 w-16 bg-muted animate-pulse rounded-md" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded-md" />
            </div>
          ) : isLoggedIn ? (
            // 로그인 상태: 크레딧, 알림, 프로필
            <>
              {/* Credit Balance - 클릭 시 /credits로 이동 */}
              <Link
                href="/mypage"
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <CreditBadge type="spinach" amount={spinachBalance} />
                <CreditBadge type="starCandy" amount={starCandyBalance} />
              </Link>

              {/* Notifications */}
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full relative"
                  >
                    <Bell className="h-5 w-5" />
                    {/* 안 읽은 알림이 있으면 빨간 점 표시 */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 max-h-[400px] overflow-y-auto"
                >
                  <div className="px-3 py-2 border-b">
                    <h3 className="font-semibold">알림</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        읽지 않은 알림 {unreadCount}개
                      </p>
                    )}
                  </div>

                  {notifications.length > 0 ? (
                    notifications.map((noti) => {
                      const isRead = readIds.has(noti.id);
                      return (
                        <DropdownMenuItem
                          key={noti.id}
                          className={`flex items-start gap-3 p-3 cursor-pointer ${!isRead ? "bg-blue-50/50" : ""}`}
                          onSelect={(e) => e.preventDefault()}
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${!isRead ? "font-medium" : "text-muted-foreground"}`}
                            >
                              {noti.msg}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(noti.date)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleMarkAsRead(noti.id, e)}
                            className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                              isRead
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                            }`}
                            title={isRead ? "읽음" : "읽음으로 표시"}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuItem>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">알림이 없습니다</p>
                    </div>
                  )}

                  {notifications.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-center text-sm text-primary cursor-pointer justify-center"
                        onClick={() => {
                          setIsOpen(false);
                          router.push("/notifications");
                        }}
                      >
                        모든 알림 보기
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Icon - 드롭다운 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {userInfo?.role === "ADMIN" ? (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin")}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      관리자 페이지
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => router.push("/mypage")}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      마이페이지
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // 비로그인 상태: 로그인, 회원가입 버튼
            <>
              <Link href="/login">
                <Button variant="ghost" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  로그인
                </Button>
              </Link>
              <Link href="/login">
                <Button className="gap-2 bg-[#5b21b6] hover:bg-[#5b21b6]/90">
                  <UserPlus className="h-4 w-4" />
                  회원가입
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
