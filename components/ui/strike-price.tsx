import React from 'react';
import { formatCurrency } from '@/lib/utils/utils';

interface StrikePriceProps {
  price: number;
  originalPrice: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StrikePrice({ price, originalPrice, size = 'md' }: StrikePriceProps) {
  const isDiscounted = originalPrice > price;

  const sizeClasses = {
    sm: { price: 'text-sm font-semibold', original: 'text-[11px]' },
    md: { price: 'text-base font-bold', original: 'text-xs' },
    lg: { price: 'text-xl font-black', original: 'text-sm' },
  }[size];

  return (
    <div className="flex flex-col items-start leading-tight">
      <span className={`${sizeClasses.price} font-mono text-white tracking-tight`}>
        {formatCurrency(price)}
      </span>
      {isDiscounted && (
        <span className={`${sizeClasses.original} font-mono text-slate-500 line-through decoration-slate-600 decoration-1`}>
          {formatCurrency(originalPrice)}
        </span>
      )}
    </div>
  );
}
