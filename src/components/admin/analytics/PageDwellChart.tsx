
import React, { useState } from 'react';
import { PageDwellMetric } from '@/lib/utils/analytics-store';
import { Clock, BarChart3, ArrowUpDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Props {
  metrics: PageDwellMetric[];
}

export function PageDwellChart({ metrics }: Props) {
  const [sortBy, setSortBy] = useState<'dwell' | 'visits'>('dwell');

  if (!metrics || metrics.length === 0) return null;

  const sorted = [...metrics].sort((a, b) =>
    sortBy === 'dwell' ? b.avgDwellSeconds - a.avgDwellSeconds : b.totalVisits - a.totalVisits
  );

  const maxDwell = Math.max(...metrics.map((m) => m.avgDwellSeconds));
  const maxVisits = Math.max(...metrics.map((m) => m.totalVisits));

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 sm:p-6 space-y-5 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground border border-zinc-200 dark:border-zinc-700">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Time in Pages & User Dwell Telemetry
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Average time traders spend on each section, engagement depth, and page visits.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            onClick={() => setSortBy('dwell')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'dwell'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sort by Dwell Time
          </button>
          <button
            onClick={() => setSortBy('visits')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'visits'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sort by Visits
          </button>
        </div>
      </div>

      {/* Bars List */}
      <div className="space-y-3.5">
        {sorted.map((item, index) => {
          const dwellPct = (item.avgDwellSeconds / maxDwell) * 100;
          const visitPct = (item.totalVisits / maxVisits) * 100;

          return (
            <div
              key={item.path}
              className="group p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors border border-transparent hover:border-zinc-200/80 dark:hover:border-zinc-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-[11px] font-mono text-muted-foreground">{index + 1}.</span>
                  <Link
                    href={item.path}
                    target="_blank"
                    className="text-xs sm:text-sm font-semibold text-foreground hover:underline flex items-center gap-1"
                  >
                    <span>{item.pageName}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">({item.path})</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-muted-foreground text-[10px] block">Avg Dwell</span>
                    <span className="font-bold text-foreground">{formatDuration(item.avgDwellSeconds)}</span>
                  </div>
                  <div className="text-right pl-3 border-l border-zinc-200 dark:border-zinc-800">
                    <span className="text-muted-foreground text-[10px] block">Visits</span>
                    <span className="font-bold text-foreground">{(item.totalVisits / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="text-right pl-3 border-l border-zinc-200 dark:border-zinc-800">
                    <span className="text-muted-foreground text-[10px] block">Bounce</span>
                    <span className="font-bold text-foreground">{item.bounceRatePct}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar with Dual Indicator */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full h-2.5 overflow-hidden flex">
                <div
                  className="bg-zinc-900 dark:bg-white h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${dwellPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-zinc-900 dark:bg-white rounded-xs" />
          <span>Average dwell relative to peak page (/challenges at 8m 15s)</span>
        </div>
        <span className="font-mono text-[11px]">Real-time Telemetry Active</span>
      </div>
    </div>
  );
}
