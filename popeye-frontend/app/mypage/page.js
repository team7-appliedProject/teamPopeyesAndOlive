"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
  Calendar,
  Loader2,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreditBadge } from '@/components/CreditBadge';
import { userApi,creditApi, isSuccess } from '@/app/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function MyPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [creditHistory, setCreditHistory] = useState([]);
  const [purchasedContents, setPurchasedContents] = useState([]);
  const [bookmarkedContents, setBookmarkedContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotingToCreator, setPromotingToCreator] = useState(false);
  const [showSettlementDialog, setShowSettlementDialog] = useState(false);
  const [settlementInfo, setSettlementInfo] = useState({
    realName: '',
    bank_name: '',
    account: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await userApi.getMe();
        console.log("[MyPage] User response:", response);

        if (isSuccess(response) && response.data) {
          setUserInfo(response.data);
        }

        // 크레딧 사용 내역 가져오기
        try {
          const historyData = await 
          .getHistory(0, 20);
          setCreditHistory(historyData?.content || []);
        } catch (err) {
          console.error("Failed to fetch credit history:", err);
          setCreditHistory([]);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 크리에이터 전환 요청
  const handlePromoteToCreator = async () => {
    // 이미 크리에이터인 경우 크리에이터 페이지로 이동
    if (userInfo?.role === "CREATOR" || userInfo?.role === "ROLE_CREATOR") {
      router.push("/creator");
      return;
    }

    // 정산 정보 입력 다이얼로그 표시
    setShowSettlementDialog(true);
  };

  // 정산 정보 입력 후 크리에이터 전환 및 정산 정보 저장
  const handleSettlementSubmit = async () => {
    // 유효성 검사
    if (!settlementInfo.realName || !settlementInfo.bank_name || !settlementInfo.account) {
      alert('모든 정산 정보를 입력해주세요.');
      return;
    }

    try {
      setPromotingToCreator(true);
      
      // 1. 크리에이터 전환
      const promoteResponse = await userApi.promoteToCreator();
      console.log('[MyPage] Promote to creator response:', promoteResponse);
      
      if (!isSuccess(promoteResponse)) {
        alert(promoteResponse.message || '크리에이터 전환에 실패했습니다.');
        return;
      }

      // 2. 정산 정보 저장
      const settlementResponse = await userApi.updateSettlementInfo(settlementInfo);
      console.log('[MyPage] Settlement info response:', settlementResponse);
      
      if (isSuccess(settlementResponse)) {
        alert('크리에이터로 전환되었고 정산 정보가 등록되었습니다!');
        setShowSettlementDialog(false);
        
        // 유저 정보 새로고침
        const userResponse = await userApi.getMe();
        if (isSuccess(userResponse) && userResponse.data) {
          setUserInfo(userResponse.data);
        }
        router.push("/creator");
      } else {
        alert(settlementResponse.message || '정산 정보 저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to promote to creator:', err);
      const errorMessage = err.errorResponse?.message || err.message || '크리에이터 전환에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setPromotingToCreator(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
            <p className="text-muted-foreground">내 정보 및 활동 관리</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>프로필</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center">
                    {userInfo?.profileImageUrl ? (
                      <img
                        src={userInfo.profileImageUrl}
                        alt="프로필"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#5b21b6] to-[#7c3aed] flex items-center justify-center text-4xl">
                        👤
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {userInfo?.nickname || "-"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {userInfo?.email || "-"}
                    </p>
                    {userInfo?.role && (
                      <Badge className="mt-2 bg-[#5b21b6]">
                        {userInfo.role}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">시금치</span>
                      <span className="text-[#22c55e] font-medium">
                        {userInfo?.totalSpinach?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">별사탕</span>
                      <span className="text-[#f59e0b] font-medium">
                        {userInfo?.totalStarcandy?.toLocaleString() || 0}
                      </span>
                    </div>
                    {userInfo?.referralCode && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            추천 코드
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                userInfo.referralCode,
                              )
                            }
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            복사
                          </Button>
                        </div>
                        <div className="rounded-lg bg-muted p-2 text-center font-mono">
                          {userInfo.referralCode}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button
                      className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                      onClick={() => router.push("/payment/charge")}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      크레딧 충전
                    </Button>
                    {userInfo?.role === "CREATOR" ||
                    userInfo?.role === "ROLE_CREATOR" ? (
                      <Button
                        className="w-full bg-[#22c55e] hover:bg-[#22c55e]/90"
                        onClick={() => router.push("/creator")}
                      >
                        크리에이터 페이지로 이동
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                        onClick={handlePromoteToCreator}
                        disabled={promotingToCreator}
                      >
                        {promotingToCreator ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            전환 중...
                          </>
                        ) : (
                          "올리브로 전환하기"
                        )}
                      </Button>
                    )}
                    <Button
                      className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                      onClick={() => router.push("/credits/refund")}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      크레딧 환불
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="credits" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="credits">크레딧 내역</TabsTrigger>
                  <TabsTrigger value="purchased">구매한 글</TabsTrigger>
                  <TabsTrigger value="bookmarked">찜한 글</TabsTrigger>
                </TabsList>

                {/* Credit History */}
                <TabsContent value="credits" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>크레딧 사용 내역</CardTitle>
                      <CardDescription>
                        충전, 사용, 소멸 내역을 확인하세요
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {creditHistory.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>일시</TableHead>
                              <TableHead>구분</TableHead>
                              <TableHead>내용</TableHead>
                              <TableHead className="text-right">금액</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {creditHistory.map((item) => {
                              // 날짜 포맷팅
                              const formatDate = (dateString) => {
                                if (!dateString) return "-";
                                const date = new Date(dateString);
                                return date.toLocaleString("ko-KR", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                              };

                              // 타입 변환
                              const getTypeLabel = (reasonType) => {
                                switch (reasonType) {
                                  case 'CHARGE': return 'charge';
                                  case 'PURCHASE': return 'use';
                                  case 'REFUND': return 'refund';
                                  case 'EXPIRE': return 'expire';
                                  default: return 'use';
                                }
                              };

                              const getDescription = (reasonType, creditType) => {
                                switch (reasonType) {
                                  case 'CHARGE': return '크레딧 충전';
                                  case 'PURCHASE': return '콘텐츠 구매';
                                  case 'REFUND': return '환불';
                                  case 'EXPIRE': return '크레딧 소멸';
                                  default: return '크레딧 사용';
                                }
                              };

                              const type = getTypeLabel(item.reasonType);
                              const description = getDescription(item.reasonType, item.creditType);

                              return (
                                <TableRow key={item.creditHistoryId}>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(item.changedAt)}
                                  </TableCell>
                                  <TableCell>
                                    {type === "charge" && (
                                      <Badge className="bg-blue-500">
                                        충전
                                      </Badge>
                                    )}
                                    {type === "use" && (
                                      <Badge variant="secondary">사용</Badge>
                                    )}
                                    {type === "expire" && (
                                      <Badge variant="destructive">소멸</Badge>
                                    )}
                                    {type === "refund" && (
                                      <Badge className="bg-orange-500">
                                        환불
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {description}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {type === "charge" ? (
                                        <ArrowUpRight className="h-4 w-4 text-[#22c55e]" />
                                      ) : type === "expire" ? (
                                        <XCircle className="h-4 w-4 text-destructive" />
                                      ) : (
                                        <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <CreditBadge
                                        type={item.creditType === "PAID" ? "starCandy" : "spinach"}
                                        amount={Math.abs(item.delta)}
                                        size="sm"
                                      />
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          크레딧 사용 내역이 없습니다.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Purchased Contents */}
                <TabsContent value="purchased" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>구매한 글</CardTitle>
                      <CardDescription>
                        총 {purchasedContents.length}개의 글을 구매했어요
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {purchasedContents.length > 0 ? (
                        <div className="space-y-4">
                          {purchasedContents.map((content) => (
                            <div
                              key={content.id}
                              className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                router.push(`/content/${content.id}`)
                              }
                            >
                              <img
                                src={content.thumbnail}
                                alt={content.title}
                                className="w-32 h-24 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">
                                  {content.title}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{content.purchaseDate} 구매</span>
                                </div>
                                <CreditBadge
                                  type="starCandy"
                                  amount={content.price}
                                  size="sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          구매한 글이 없습니다.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Bookmarked Contents */}
                <TabsContent value="bookmarked" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>찜한 글</CardTitle>
                      <CardDescription>
                        관심 있는 글을 모아보세요
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {bookmarkedContents.length > 0 ? (
                        <div className="space-y-4">
                          {bookmarkedContents.map((content) => (
                            <div
                              key={content.id}
                              className="flex gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() =>
                                router.push(`/content/${content.id}`)
                              }
                            >
                              <img
                                src={content.thumbnail}
                                alt={content.title}
                                className="w-32 h-24 rounded-lg object-cover"
                              />
                              <div className="flex-1 flex items-center justify-between">
                                <h4 className="font-semibold">
                                  {content.title}
                                </h4>
                                <CreditBadge
                                  type="starCandy"
                                  amount={content.price}
                                  size="sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          찜한 글이 없습니다.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* 정산 정보 입력 다이얼로그 */}
      <Dialog open={showSettlementDialog} onOpenChange={setShowSettlementDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>올리브 전환 및 정산 정보 입력</DialogTitle>
            <DialogDescription>
              올리브로 전환하기 위해 정산 정보를 입력해주세요.
              계좌번호는 안전하게 암호화되어 저장됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="realName">예금주명 <span className="text-red-500">*</span></Label>
              <Input
                id="realName"
                placeholder="홍길동"
                value={settlementInfo.realName}
                onChange={(e) => setSettlementInfo({ ...settlementInfo, realName: e.target.value })}
                disabled={promotingToCreator}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name">은행명 <span className="text-red-500">*</span></Label>
              <Select
                value={settlementInfo.bank_name}
                onValueChange={(value) => setSettlementInfo({ ...settlementInfo, bank_name: value })}
                disabled={promotingToCreator}
              >
                <SelectTrigger>
                  <SelectValue placeholder="은행을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KB국민은행">KB국민은행</SelectItem>
                  <SelectItem value="신한은행">신한은행</SelectItem>
                  <SelectItem value="우리은행">우리은행</SelectItem>
                  <SelectItem value="하나은행">하나은행</SelectItem>
                  <SelectItem value="NH농협은행">NH농협은행</SelectItem>
                  <SelectItem value="카카오뱅크">카카오뱅크</SelectItem>
                  <SelectItem value="토스뱅크">토스뱅크</SelectItem>
                  <SelectItem value="IBK기업은행">IBK기업은행</SelectItem>
                  <SelectItem value="SC제일은행">SC제일은행</SelectItem>
                  <SelectItem value="한국씨티은행">한국씨티은행</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">계좌번호 <span className="text-red-500">*</span></Label>
              <Input
                id="account"
                placeholder="110-123-456789"
                value={settlementInfo.account}
                onChange={(e) => setSettlementInfo({ ...settlementInfo, account: e.target.value })}
                disabled={promotingToCreator}
              />
              <p className="text-xs text-muted-foreground">
                하이픈(-) 포함하여 입력해주세요
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSettlementDialog(false);
                setSettlementInfo({ realName: '', bank_name: '', account: '' });
              }}
              disabled={promotingToCreator}
            >
              취소
            </Button>
            <Button
              className="bg-[#5b21b6] hover:bg-[#5b21b6]/90"
              onClick={handleSettlementSubmit}
              disabled={promotingToCreator}
            >
              {promotingToCreator ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                '전환하기'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
