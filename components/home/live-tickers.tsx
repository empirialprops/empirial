'use client';

import React from 'react';
import { MOCK_TICKERS } from '@/lib/data/site-data';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function LiveTickers() {
  return (
    <div className="w-full bg-[#0E1017] border-y border-white/5 py-2.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        {/* Fixed Title Tag */}
        <div className="flex items-center gap-2 pr-3 border-r border-white/10 shrink-0 text-xs font-bold text-slate-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">LIVE LIQUIDITY:</span>
        </div>

        {/* Ticker Ribbon */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {MOCK_TICKERS.map((ticker, index) => (
            <div key={index} className="flex items-center gap-2 shrink-0 font-mono">
              <span className="font-bold text-white">{ticker.symbol}</span>
              <span className="text-slate-300">{ticker.price}</span>
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.2 rounded ${
                  ticker.is_positive
                    ? 'text-emerald-400 bg-emerald-950/40'
                    : 'text-rose-400 bg-rose-950/40'
                }`}
              >
                {ticker.is_positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {ticker.change_24h}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
