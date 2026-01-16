"use client";

import { useRouter } from 'next/navigation';
import { Heart, Bookmark } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CreditBadge } from './CreditBadge';

export function ContentCard({ content, onLike, onBookmark }) {
  const router = useRouter();
  
  const discount = content.originalPrice 
    ? Math.round((1 - content.price / content.originalPrice) * 100)
    : 0;

  const handleClick = () => {
    router.push(`/content/${content.id}`);
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img 
          src={content.thumbnail} 
          alt={content.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {/* Free/Paid Badge */}
        <div className="absolute top-3 left-3">
          {content.isFree ? (
            <Badge className="bg-[#22c55e] hover:bg-[#22c55e]/90">
              무료
            </Badge>
          ) : (
            <Badge variant="secondary">
              유료
            </Badge>
          )}
        </div>
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3">
            <Badge variant="destructive">
              {discount}% 할인
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold line-clamp-2 mb-2">
          {content.title}
        </h3>
        
        {/* Creator */}
        <div className="flex items-center gap-2 mb-3">
          <img 
            src={content.creatorAvatar} 
            alt={content.creatorName}
            className="h-6 w-6 rounded-full"
          />
          <span className="text-sm text-muted-foreground">
            {content.creatorName}
          </span>
        </div>

        {/* Price - 무료 콘텐츠는 가격 영역 숨김 */}
        {!content.isFree && (
          <div className="flex items-center gap-2">
            <CreditBadge type="starCandy" amount={content.price} size="sm" />
            {content.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {content.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Heart className="h-4 w-4" />
          <span>{content.likes.toLocaleString()}</span>
        </div>
        
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${content.isLiked ? 'text-red-500' : ''}`}
            onClick={() => onLike?.(content.id)}
          >
            <Heart className={`h-4 w-4 ${content.isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${content.isBookmarked ? 'text-[#fbbf24]' : ''}`}
            onClick={() => onBookmark?.(content.id)}
          >
            <Bookmark className={`h-4 w-4 ${content.isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

