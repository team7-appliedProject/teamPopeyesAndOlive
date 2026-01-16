"use client";

import { Leaf, Star } from 'lucide-react';

export function CreditBadge({ type, amount, size = 'md', showLabel = false }) {
  const isSpinach = type === 'spinach';
  
  const sizeClasses = {
    sm: 'px-2 py-1 gap-1 text-xs',
    md: 'px-3 py-1.5 gap-1.5 text-sm',
    lg: 'px-4 py-2 gap-2 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div 
      className={`
        inline-flex items-center rounded-full font-medium
        ${isSpinach 
          ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20' 
          : 'bg-[#1a1a2e]/80 backdrop-blur-sm text-white border border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.3)]'
        }
        ${sizeClasses[size]}
      `}
    >
      {isSpinach ? (
        <Leaf className={iconSizes[size]} />
      ) : (
        <div className="relative">
          <Star className={`${iconSizes[size]} text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] drop-shadow-[0_0_14px_rgba(255,255,255,0.6)] fill-white`} />
          {/* 작은 반짝이 효과 */}
          <span className="absolute -top-0.5 -right-0.5 text-[8px] animate-pulse">✨</span>
        </div>
      )}
      {showLabel && (
        <span className="mr-1">
          {isSpinach ? '시금치' : '별사탕'}
        </span>
      )}
      <span className="tabular-nums">
        {amount.toLocaleString()}
      </span>
    </div>
  );
}

