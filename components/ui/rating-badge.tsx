import React from 'react';
import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  showStars?: boolean;
  showReviewsText?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function RatingBadge({
  rating,
  reviewCount,
  showStars = true,
  showReviewsText = true,
  size = 'sm',
  className = '',
}: RatingBadgeProps) {
  const formattedRating = rating !== undefined && rating !== null ? Number(rating).toFixed(1) : '0.0';
  const formattedCount = reviewCount !== undefined && reviewCount !== null ? reviewCount.toLocaleString('en-US') : null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 dark:border-emerald-600/30 px-2.5 py-0.5 rounded-full text-emerald-600 dark:text-emerald-400 font-medium ${className}`}
    >
      {showStars && <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500 shrink-0" />}
      <span className={size === 'sm' ? 'text-xs font-bold' : 'text-sm font-bold'}>
        {formattedRating}
      </span>
      {formattedCount !== null && (
        <span className="text-[10px] text-muted-foreground font-normal">
          ({formattedCount}{showReviewsText ? ' reviews' : ''})
        </span>
      )}
    </div>
  );
}

