"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Bookmark, Flag, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditBadge } from '@/components/CreditBadge';
import { Separator } from '@/components/ui/separator';
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

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params.id;
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock data - TODO: 실제 API로 교체
  const content = {
    id: contentId,
    title: '프로 디자이너가 알려주는 Figma 고급 테크닉 30가지',
    creatorName: '디자인올리브',
    creatorAvatar: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1738676524296-364cf18900a8?w=800&h=600&fit=crop',
    price: 4500,
    originalPrice: 6000,
    isFree: false,
    likes: 1243,
    views: 5678,
    description: `이 글에서는 Figma의 고급 기능들을 활용하여 더욱 효율적이고 전문적인 디자인 작업을 할 수 있는 방법들을 알려드립니다.

📚 글 내용:
• Auto Layout 완전 정복
• Component 시스템 구축하기
• Variables와 Modes 활용법
• 프로토타이핑 고급 기법
• 플러그인 추천 및 활용법

✨ 이런 분들께 추천합니다:
- Figma 기초는 알지만 더 깊이 배우고 싶은 분
- 디자인 시스템을 구축하고 싶은 분
- 작업 효율을 높이고 싶은 분

🎯 읽은 후 얻을 수 있는 것:
- 전문가 수준의 Figma 활용 능력
- 체계적인 디자인 시스템 구축 능력
- 실무에서 바로 적용 가능한 테크닉`,
    content: `[프리미엄 콘텐츠]

Part 1: Auto Layout 마스터하기
- Auto Layout의 핵심 개념
- 실전 예제 10가지
- 반응형 디자인 구현

Part 2: Component 시스템
- Variant 활용하기
- Instance swap 최적화
- 디자인 토큰 관리

Part 3: Variables & Modes
- Color 변수 설정
- 다크모드 구현
- 반응형 변수 활용

... 그 외 27가지 고급 테크닉

이 글을 구매하시면 전체 내용을 확인하실 수 있습니다.`,
  };

  const discount = content.originalPrice 
    ? Math.round((1 - content.price / content.originalPrice) * 100)
    : 0;

  const handlePurchase = () => {
    // TODO: 실제 결제 처리 로직
    setIsPurchased(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Creator Info */}
          <div className="flex items-center gap-3 mb-6">
            <img 
              src={content.creatorAvatar} 
              alt={content.creatorName}
              className="h-12 w-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold">{content.creatorName}</h3>
            </div>
          </div>

          {/* Main Content */}
          <Card>
            <CardContent className="p-0">
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                <img 
                  src={content.thumbnail} 
                  alt={content.title}
                  className="h-full w-full object-cover"
                />
                {!isPurchased && !content.isFree && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-white">
                      <Lock className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg font-semibold">
                        이 글을 구매하면 전체 내용을 볼 수 있어요
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Title & Badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {content.isFree ? (
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
                    <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span>조회 {content.views.toLocaleString()}</span>
                  <span>좋아요 {content.likes.toLocaleString()}</span>
                </div>

                <Separator className="my-6" />

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">글 소개</h2>
                  <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                    {content.description}
                  </p>
                </div>

                <Separator className="my-6" />

                {/* Content Body */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">본문</h2>
                  {isPurchased || content.isFree ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                        {content.content}
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="blur-sm select-none pointer-events-none">
                        <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                          {content.content.substring(0, 200)}...
                        </p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            구매 후 전체 내용을 확인하실 수 있습니다
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    onClick={() => setIsLiked(!isLiked)}
                    className={isLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    좋아요
                  </Button>
                  <Button
                    variant={isBookmarked ? "default" : "outline"}
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    찜하기
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="text-destructive">
                        <Flag className="h-4 w-4 mr-2" />
                        신고
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>글 신고</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 글을 신고하시겠습니까? 신고가 누적되면 해당 글은 검토됩니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive">
                          신고하기
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Section */}
          {!isPurchased && !content.isFree && (
            <Card className="mt-6 border-2 border-[#5b21b6]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-2">이 글 구매하기</h3>
                    <div className="flex items-center gap-3">
                      <CreditBadge type="starCandy" amount={content.price} size="lg" />
                      {content.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {content.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 시금치 우선 차감 후 별사탕이 차감됩니다
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="lg" className="bg-[#5b21b6] hover:bg-[#5b21b6]/90">
                        크레딧으로 구매
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

