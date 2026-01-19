"use client";

import { useRouter } from 'next/navigation';
import { Heart, Bookmark } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CreditBadge } from './CreditBadge';

export function ContentCard({ content, onLike, onBookmark }) {
  const router = useRouter();
  
  // 백엔드 응답에 맞게 필드 매핑 (contentId -> id)
  const contentId = content.contentId || content.id;
  const creatorName = content.creatorNickname || content.creatorName || '작성자';
  // 백엔드에서 boolean isFree -> JSON "free"로 직렬화됨
  const isFree = content.free ?? content.isFree ?? (content.price === 0 || content.price === undefined);
  const price = content.price || 0;
  const originalPrice = content.originalPrice;
  const likes = content.likes || content.likeCount || 0;
  
  const discount = originalPrice 
    ? Math.round((1 - price / originalPrice) * 100)
    : (content.discountRate || 0);

  const handleClick = () => {
    router.push(`/content/${contentId}`);
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

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
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
      </CardFooter>
    </Card>
  );
}

