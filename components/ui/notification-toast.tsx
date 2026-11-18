'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Tag, CheckCircle2, X } from 'lucide-react';

interface ToastData {
  id: string;
  type: 'payout' | 'deal';
  title: string;
  subtitle: string;
  timeAgo: string;
}

const SAMPLE_NOTIFICATIONS: ToastData[] = [
  {
    id: '1',
    type: 'payout',
    title: 'Verified Payout Approved',
    subtitle: 'Anuraj S. received $14,850 from FTMO',
    timeAgo: 'Just now',
  },
  {
    id: '2',
    type: 'deal',
    title: 'Discount Code Used',
    subtitle: 'Trader saved $108 with code PIPS20',
    timeAgo: '2m ago',
  },
  {
    id: '3',
    type: 'payout',
    title: '5-Day Payout Verified',
    subtitle: 'Marcus K. received $8,320 via USDT',
    timeAgo: '5m ago',
  },
  {
    id: '4',
    type: 'deal',
    title: 'Futures Flash Sale',
    subtitle: 'SAVENOW code applied for 80% discount',
    timeAgo: '8m ago',
  },
];

export function NotificationToast() {
  const [currentToast, setCurrentToast] = useState<ToastData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentToast(SAMPLE_NOTIFICATIONS[index % SAMPLE_NOTIFICATIONS.length]);
      setIsVisible(true);
      index++;

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  if (!currentToast || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3 bg-elevation-modal/95 border border-white/10 backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl shadow-cyan-950/40 max-w-sm">
        <div className={`p-2 rounded-lg ${currentToast.type === 'payout' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
          {currentToast.type === 'payout' ? (
            <DollarSign className="w-4 h-4" />
          ) : (
            <Tag className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-white tracking-tight truncate">
              {currentToast.title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {currentToast.timeAgo}
            </span>
          </div>
          <p className="text-xs text-slate-300 truncate mt-0.5">
            {currentToast.subtitle}
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
