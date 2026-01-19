"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Bookmark, ShoppingCart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CreditBadge } from './CreditBadge';
import { orderApi, contentApi, ApiError } from '@/app/lib/api';

export function ContentCard({ content, onLike, onBookmark, onPurchase }) {
  const router = useRouter();
  const [purchasing, setPurchasing] = useState(false);
  
  // 백엔드 응답에 맞게 필드 매핑 (contentId -> id)
  const contentId = content.contentId || content.id;
  const creatorName = content.creatorNickname || content.creatorName || '작성자';
  // 백엔드에서 boolean isFree -> JSON "free"로 직렬화됨
  const isFree = content.free ?? content.isFree ?? (content.price === 0 || content.price === undefined);
  const price = content.price || 0;
  const originalPrice = content.originalPrice;
  const likes = content.likes || content.likeCount || 0;
  const isPurchased = content.isPurchased ?? false; // 구매 여부 (상세 페이지에서 확인)
  
  const discount = originalPrice 
    ? Math.round((1 - price / originalPrice) * 100)
    : (content.discountRate || 0);

  const handleClick = () => {
    router.push(`/content/${contentId}`);
  };

  const handlePurchaseClick = async (e) => {
    e.stopPropagation();
    
    // 구매 여부 확인을 위해 상세 정보 가져오기
    try {
      setPurchasing(true);
      const detail = await contentApi.getById(Number(contentId));
      
      // 이미 구매했거나 무료인 경우
      if (detail.free || detail.content) {
        router.push(`/content/${contentId}`);
        return;
      }
      
      // 구매 API 호출
      const purchaseResponse = await orderApi.purchase(Number(contentId));
      
      // 구매 성공 메시지
      const creditInfo = [];
      if (purchaseResponse.usedFreeCredit > 0) {
        creditInfo.push(`시금치 ${purchaseResponse.usedFreeCredit}개`);
      }
      if (purchaseResponse.usedPaidCredit > 0) {
        creditInfo.push(`별사탕 ${purchaseResponse.usedPaidCredit}개`);
      }
      
      const message = creditInfo.length > 0
        ? `구매가 완료되었습니다!\n사용된 크레딧: ${creditInfo.join(', ')}`
        : '구매가 완료되었습니다!';
      
      alert(message);
      
      // 상세 페이지로 이동
      router.push(`/content/${contentId}`);
      
      // 부모 컴포넌트에 구매 완료 알림
      if (onPurchase) {
        onPurchase(contentId);
      }
    } catch (err) {
      console.error('Purchase error:', err);
      
      let errorMessage = '구매에 실패했습니다.';
      
      if (err instanceof ApiError) {
        if (err.code === 'NOT_ENOUGH_CREDIT') {
          errorMessage = '크레딧이 부족합니다. 크레딧을 충전한 후 다시 시도해주세요.';
        } else if (err.code === 'INVALID_REQUEST') {
          errorMessage = '이미 구매한 콘텐츠이거나 구매할 수 없는 콘텐츠입니다.';
        } else {
          errorMessage = err.errorResponse.message || errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          {isFree ? (
            <Badge className="bg-[#22c55e] hover:bg-[#22c55e]/90">
              무료
            </Badge>
          ) : (
            <Badge variant="secondary">
              유료
            </Badge>
          )}
        {discount > 0 && (
            <Badge variant="destructive">
              {discount}% 할인
            </Badge>
        )}
      </div>

        {/* Title */}
        <h3 className="font-semibold line-clamp-2 mb-3 group-hover:text-[#5b21b6] transition-colors">
          {content.title}
        </h3>
        
        {/* Creator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#5b21b6] to-[#7c3aed] flex items-center justify-center text-xs text-white">
            {creatorName.charAt(0)}
          </div>
          <span className="text-sm text-muted-foreground">
            {creatorName}
          </span>
        </div>

        {/* Price - 무료 콘텐츠는 가격 영역 숨김 */}
        {!isFree && price > 0 && (
          <div className="flex items-center gap-2">
            <CreditBadge type="starCandy" amount={price} size="sm" />
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-muted-foreground line-through">
                {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        {/* 구매 버튼 - 유료이고 구매하지 않은 경우에만 표시 */}
        {!isFree && price > 0 && !isPurchased && (
          <Button
            className="w-full bg-[#5b21b6] hover:bg-[#5b21b6]/90"
            onClick={handlePurchaseClick}
            disabled={purchasing}
          >
            {purchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                구매 중...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                구매하기
              </>
            )}
          </Button>
        )}
        
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Heart className="h-4 w-4" />
            <span>{likes.toLocaleString()}</span>
          </div>
          
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${content.isLiked ? 'text-red-500' : ''}`}
              onClick={() => onLike?.(contentId)}
            >
              <Heart className={`h-4 w-4 ${content.isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${content.isBookmarked ? 'text-[#fbbf24]' : ''}`}
              onClick={() => onBookmark?.(contentId)}
            >
              <Bookmark className={`h-4 w-4 ${content.isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

