'use client';

import React, { useState } from 'react';
import { ClickHotspot } from '@/lib/utils/analytics-store';
import { MousePointerClick, Tag, Layers, Filter, Search, ArrowUpRight, Copy } from 'lucide-react';

interface Props {
  hotspots: ClickHotspot[];
  totalClicks: number;
}

export function ClickHotspotsChart({ hotspots, totalClicks }: Props) {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!hotspots || hotspots.length === 0) return null;

  const filtered = hotspots.filter((h) => filterCategory === 'all' || h.category === filterCategory);

  const getCategoryBadge = (category: ClickHotspot['category']) => {
    switch (category) {
      case 'coupon_copy':
        return { label: 'Coupon Copy', icon: Copy, bg: 'bg-zinc-100 dark:bg-zinc-800 text-foreground' };
      case 'cta':
        return { label: 'Primary CTA', icon: MousePointerClick, bg: 'bg-zinc-900 text-white dark:bg-white dark:text-black' };
      case 'firm_deal':
        return { label: 'Affiliate Link', icon: ArrowUpRight, bg: 'bg-zinc-200 dark:bg-zinc-700 text-foreground' };
      case 'filter':
        return { label: 'Filter Rule', icon: Filter, bg: 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground' };
      case 'search':
        return { label: 'Search Query', icon: Search, bg: 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground' };
      default:
        return { label: 'Navigation', icon: Layers, bg: 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground' };
    }
  };

  return (
    <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 sm:p-6 space-y-5 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground border border-zinc-200 dark:border-zinc-700">
              <MousePointerClick className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Where Users Clicked the Most (Click Hotspots)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time element engagement, highest-converting CTAs, and coupon copy distributions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Clicks' },
            { id: 'coupon_copy', label: 'Coupons' },
            { id: 'cta', label: 'CTAs' },
            { id: 'firm_deal', label: 'Affiliates' },
            { id: 'filter', label: 'Filters' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterCategory === tab.id
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hotspots Ranking List */}
      <div className="space-y-3">
        {filtered.map((hotspot, idx) => {
          const badge = getCategoryBadge(hotspot.category);
          const Icon = badge.icon;
          const maxClicks = hotspots[0]?.totalClicks || 1;
          const barPct = (hotspot.totalClicks / maxClicks) * 100;

          return (
            <div
              key={hotspot.id}
              className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-bold text-foreground flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
                      {hotspot.elementName}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${badge.bg}`}
                  >
                    <Icon className="w-2.5 h-2.5" />
                    <span>{badge.label}</span>
                  </span>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-foreground">
                      {hotspot.totalClicks.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1">({hotspot.pctOfTotal}%)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                    {hotspot.trend}
                  </span>
                </div>
              </div>

              {/* Progress Relative to #1 Hotspot */}
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-zinc-900 dark:bg-white h-full rounded-full transition-all duration-300"
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
        <span>Aggregated across {hotspots.length} interactive elements</span>
        <span className="font-mono text-[11px] font-bold text-foreground">
          Total Recorded Clicks: {totalClicks.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
