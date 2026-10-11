'use client';

import React from 'react';
import { Users, Clock, MousePointerClick, Tag, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { AnalyticsSummary } from '@/lib/utils/analytics-store';

interface Props {
  data: AnalyticsSummary;
}

export function KPICards({ data }: Props) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const cards = [
    {
      title: 'Total Registered Users',
      value: data.totalRegisteredUsers.toLocaleString(),
      subtext: `+${data.newUsersThisWeek.toLocaleString()} this week`,
      metricLabel: data.verifiedTraders >= 1000 ? `${(data.verifiedTraders / 1000).toFixed(1)}k verified` : `${data.verifiedTraders} verified`,
      icon: Users,
      trend: `+${data.userGrowthPct}%`,
    },
    {
      title: 'Avg Session Duration',
      value: formatDuration(data.avgSessionDurationSeconds),
      subtext: `${data.avgPagesPerSession} pages / session`,
      metricLabel: '42.8% retention',
      icon: Clock,
      trend: '+14.2%',
    },
    {
      title: 'Total Platform Clicks',
      value: data.totalClicks >= 1000 ? (data.totalClicks / 1000).toFixed(1) + 'k' : data.totalClicks.toLocaleString(),
      subtext: `${data.clickHotspots.length} active hotspots`,
      metricLabel: '18.4% avg CTR',
      icon: MousePointerClick,
      trend: '+22.6%',
    },
    {
      title: 'Coupons & Outbound Clicks',
      value: data.totalCouponCopies >= 1000 ? (data.totalCouponCopies / 1000).toFixed(1) + 'k' : data.totalCouponCopies.toLocaleString(),
      subtext: data.totalOutboundClicks >= 1000 ? `${(data.totalOutboundClicks / 1000).toFixed(1)}k affiliate clicks` : `${data.totalOutboundClicks} outbound clicks`,
      metricLabel: 'High conversion',
      icon: Tag,
      trend: '+28.9%',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 flex flex-col justify-between space-y-3 transition-all hover:border-foreground group shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-foreground flex items-center justify-center border border-zinc-200/80 dark:border-zinc-700">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/40">
                {card.trend}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground block">{card.title}</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground mt-0.5 tracking-tight font-mono">
                {card.value}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-muted-foreground font-mono text-[11px]">
              <span>{card.subtext}</span>
              <span className="font-semibold text-foreground">{card.metricLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
