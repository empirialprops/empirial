
import React from 'react';
import { RecentTelemetryEvent } from '@/lib/utils/analytics-store';
import { Activity, Copy, MousePointerClick, UserPlus, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface Props {
  events: RecentTelemetryEvent[];
}

export function RecentActivityFeed({ events }: Props) {
  if (!events || events.length === 0) return null;

  const getEventIcon = (type: RecentTelemetryEvent['type']) => {
    switch (type) {
      case 'signup':
        return { icon: UserPlus, bg: 'bg-zinc-950 text-white dark:bg-white dark:text-black' };
      case 'coupon_copy':
        return { icon: Copy, bg: 'bg-zinc-200 dark:bg-zinc-800 text-foreground' };
      case 'dwell':
        return { icon: Clock, bg: 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground' };
      default:
        return { icon: MousePointerClick, bg: 'bg-zinc-100 dark:bg-zinc-800 text-foreground' };
    }
  };

  return (
    <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 sm:p-6 space-y-4 transition-all">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground border border-zinc-200 dark:border-zinc-700">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Live Real-Time Telemetry Stream
            </h2>
            <p className="text-xs text-muted-foreground">Recent visitor actions, coupon copies, and registrations</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Feed</span>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {events.map((ev) => {
          const config = getEventIcon(ev.type);
          const Icon = config.icon;

          return (
            <div key={ev.id} className="py-3 flex items-start gap-3 first:pt-1 last:pb-1">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-zinc-200/60 dark:border-zinc-700 ${config.bg}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-foreground truncate">{ev.description}</p>
                  <span className="text-[11px] font-mono text-muted-foreground shrink-0">{ev.timestamp}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded-xs bg-zinc-100 dark:bg-zinc-800 font-mono">
                    {ev.page}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-foreground">{ev.userType}</span>
                  {ev.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span>{ev.location}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
