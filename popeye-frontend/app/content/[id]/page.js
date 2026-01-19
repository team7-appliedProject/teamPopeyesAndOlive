"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Bookmark, Flag, Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditBadge } from '@/components/CreditBadge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { contentApi, reportApi } from '@/app/lib/api';

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id;
  
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  // 신고 관련 상태
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // 콘텐츠 조회
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('[ContentDetail] Fetching content:', contentId);
        const data = await contentApi.getById(Number(contentId));
        console.log('[ContentDetail] Response:', data);
        
        setContent(data);
        
        // 전체 내용(content)이 있으면 구매된 것으로 처리
        if (data.content) {
          setIsPurchased(true);
        }
        
        // 좋아요/북마크 상태 설정
        if (data.isLiked !== undefined) {
          setIsLiked(data.isLiked);
        }
        if (data.isBookmarked !== undefined) {
          setIsBookmarked(data.isBookmarked);
        }
      } catch (err) {
        console.error('[ContentDetail] Error:', err);
        // 401 또는 403 에러인 경우 로그인 페이지로 리다이렉트
        if (err.status === 401 || err.status === 403) {
          router.push('/login');
          return;
        }
        setError(err.message || '콘텐츠를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchContent();
    }
  }, [contentId, router]);

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      // TODO: 실제 구매 API 호출
      // await purchaseApi.purchase(contentId);
      
      // 구매 후 콘텐츠 다시 조회
      const data = await contentApi.getById(Number(contentId));
      setContent(data);
      setIsPurchased(true);
      
      alert('구매가 완료되었습니다!');
    } catch (err) {
      console.error('[ContentDetail] Purchase error:', err);
      alert(err.message || '구매에 실패했습니다.');
    } finally {
      setPurchasing(false);
    }
  };

  // 신고하기
  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert('신고 사유를 입력해주세요.');
      return;
    }

    try {
      setReporting(true);
      
      await reportApi.create({
        targetId: Number(contentId),
        type: 'CONTENT',
        reason: reportReason.trim(),
      });
      
      setReportSuccess(true);
      setReportReason('');
      
      // 2초 후 모달 닫기
      setTimeout(() => {
        setReportDialogOpen(false);
        setReportSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('[ContentDetail] Report error:', err);
      alert(err.message || '신고 접수에 실패했습니다.');
    } finally {
      setReporting(false);
    }
  };

  // 신고 모달 닫기
  const handleReportDialogClose = () => {
    if (!reporting) {
      setReportDialogOpen(false);
      setReportReason('');
      setReportSuccess(false);
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-[#5b21b6]" />
          <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로가기
              </Button>
              <Button onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 콘텐츠가 없는 경우
  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">콘텐츠를 찾을 수 없습니다.</p>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 할인율 계산
  const discount = content.discountRate || 0;
  
  // 전체 내용을 볼 수 있는지 (무료거나 구매했거나 전체 content가 있는 경우)
  const canViewFull = content.free || isPurchased || !!content.content;
  
  // 표시할 본문 내용
  const displayContent = content.content || content.preview || '';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 뒤로가기 버튼 */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>

          {/* Main Content */}
          <Card>
            <CardContent className="p-6">
                {/* Title & Badges */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {content.free ? (
                        <Badge className="bg-[#22c55e] hover:bg-[#22c55e]/90">
                          무료
                        </Badge>
                      ) : (
                        <Badge variant="secondary">유료</Badge>
                      )}
                      {discount > 0 && (
                        <Badge variant="destructive">{discount}% 할인</Badge>
                      )}
                    </div>
                <h1 className="text-3xl font-bold">{content.title}</h1>
                </div>

                {/* Stats */}
              {(content.viewCount || content.likeCount) && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  {content.viewCount && <span>조회 {content.viewCount.toLocaleString()}</span>}
                  {content.likeCount && <span>좋아요 {content.likeCount.toLocaleString()}</span>}
                </div>
              )}

                <Separator className="my-6" />

                {/* Content Body */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">본문</h2>
                {canViewFull ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                      {displayContent}
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="blur-sm select-none pointer-events-none">
                        <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                        {displayContent}...
                        </p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center bg-background/80 rounded-lg p-6">
                          <Lock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            구매 후 전체 내용을 확인하실 수 있습니다
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              <Separator className="my-6" />

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    onClick={async () => {
                      try {
                        const response = await contentApi.toggleLike(Number(contentId));
                        // 서버 응답으로 상태 업데이트
                        setIsLiked(response.liked);
                        setContent({ ...content, isLiked: response.liked, likeCount: response.likeCount });
                      } catch (err) {
                        console.error('[ContentDetail] Like error:', err);
                        if (err.status === 401 || err.status === 403) {
                          router.push('/login');
                        } else {
                          alert('좋아요 처리에 실패했습니다.');
                        }
                      }
                    }}
                    className={isLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    좋아요
                  </Button>
                  <Button
                    variant={isBookmarked ? "default" : "outline"}
                    onClick={async () => {
                      try {
                        const response = await contentApi.toggleBookmark(Number(contentId));
                        // 서버 응답으로 상태 업데이트
                        setIsBookmarked(response.bookmarked);
                        setContent({ ...content, isBookmarked: response.bookmarked });
                      } catch (err) {
                        console.error('[ContentDetail] Bookmark error:', err);
                        if (err.status === 401 || err.status === 403) {
                          router.push('/login');
                        } else {
                          alert('북마크 처리에 실패했습니다.');
                        }
                      }
                    }}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    찜하기
                  </Button>
                <Button 
                  variant="ghost" 
                  className="text-destructive"
                  onClick={() => setReportDialogOpen(true)}
                >
                        <Flag className="h-4 w-4 mr-2" />
                        신고
                      </Button>
              </div>

              {/* 신고 모달 */}
              <Dialog open={reportDialogOpen} onOpenChange={handleReportDialogClose}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Flag className="h-5 w-5 text-destructive" />
                      글 신고
                    </DialogTitle>
                    <DialogDescription>
                          이 글을 신고하시겠습니까? 신고가 누적되면 해당 글은 검토됩니다.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {reportSuccess ? (
                    <div className="py-8 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium">신고가 접수되었습니다</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        신고 내용을 검토 후 조치하겠습니다.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 py-4">
                        <div className="rounded-lg bg-muted p-3">
                          <p className="text-sm font-medium">신고 대상</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {content?.title}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="report-reason">신고 사유 *</Label>
                          <Textarea
                            id="report-reason"
                            placeholder="신고 사유를 상세히 입력해주세요. (예: 불법 광고, 욕설/비방, 허위 정보 등)"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="min-h-[120px] resize-none"
                            disabled={reporting}
                          />
                          <p className="text-xs text-muted-foreground">
                            허위 신고 시 불이익이 있을 수 있습니다.
                          </p>
                </div>
              </div>
                      
                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                          variant="outline" 
                          onClick={handleReportDialogClose}
                          disabled={reporting}
                        >
                          취소
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={handleReport}
                          disabled={reporting || !reportReason.trim()}
                        >
                          {reporting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              처리 중...
                            </>
                          ) : (
                            '신고하기'
                          )}
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Purchase Section */}
          {!canViewFull && content.price && (
            <Card className="mt-6 border-2 border-[#5b21b6]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-2">이 글 구매하기</h3>
                    <div className="flex items-center gap-3">
                      <CreditBadge type="starCandy" amount={content.price} size="lg" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 시금치 우선 차감 후 별사탕이 차감됩니다
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="lg" 
                        className="bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                        disabled={purchasing}
                      >
                        {purchasing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            구매 중...
                          </>
                        ) : (
                          '크레딧으로 구매'
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>글 구매</AlertDialogTitle>
                        <AlertDialogDescription>
                          <div className="space-y-2 text-left">
                            <p>"{content.title}" 글을 구매하시겠습니까?</p>
                            <div className="rounded-lg bg-muted p-3 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>가격:</span>
                                <CreditBadge type="starCandy" amount={content.price} size="sm" />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                차감 순서: 시금치 → 별사탕
                              </div>
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handlePurchase}
                          className="bg-[#5b21b6] hover:bg-[#5b21b6]/90"
                        >
                          구매하기
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
