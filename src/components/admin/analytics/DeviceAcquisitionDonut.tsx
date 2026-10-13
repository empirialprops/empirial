
import React from 'react';
import { DeviceBreakdown, AcquisitionChannel } from '@/lib/utils/analytics-store';
import { Smartphone, Monitor, Tablet, Compass, Share2 } from 'lucide-react';

interface Props {
  devices: DeviceBreakdown[];
  channels: AcquisitionChannel[];
}

export function DeviceAcquisitionDonut({ devices, channels }: Props) {
  // SVG Donut calculation
  const radius = 60;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDashoffset for each slice
  let accumulatedPercent = 0;
  const deviceSlices = devices.map((d) => {
    const strokeDasharray = `${(d.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += d.percentage;
    return {
      ...d,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const getDeviceIcon = (dev: string) => {
    if (dev === 'Mobile') return Smartphone;
    if (dev === 'Tablet') return Tablet;
    return Monitor;
  };

  const getDeviceColorClass = (index: number) => {
    if (index === 0) return 'stroke-zinc-950 dark:stroke-white';
    if (index === 1) return 'stroke-zinc-600 dark:stroke-zinc-400';
    return 'stroke-zinc-400 dark:stroke-zinc-600';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* 1. Device Breakdown Donut */}
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 sm:p-6 space-y-5 transition-all">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground border border-zinc-200 dark:border-zinc-700">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">Trader Device Distribution</h2>
            <p className="text-xs text-muted-foreground">Operating systems and viewport classifications</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
          {/* SVG Donut */}
          <div className="relative w-40 h-40 flex items-center justify-center select-none">
            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 transform">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-zinc-100 dark:stroke-zinc-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Slices */}
              {deviceSlices.map((slice, i) => (
                <circle
                  key={slice.device}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  className={`${getDeviceColorClass(i)} transition-all duration-500`}
                  strokeWidth={strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {devices[0]?.percentage}%
              </span>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Desktop
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3 w-full sm:w-auto">
            {devices.map((d, i) => {
              const Icon = getDeviceIcon(d.device);
              return (
                <div key={d.device} className="flex items-center justify-between sm:justify-start gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-xs ${
                        i === 0
                          ? 'bg-zinc-950 dark:bg-white'
                          : i === 1
                          ? 'bg-zinc-600 dark:bg-zinc-400'
                          : 'bg-zinc-400 dark:bg-zinc-600'
                      }`}
                    />
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{d.device}</span>
                    </div>
                  </div>
                  <div className="font-mono text-right">
                    <span className="font-bold text-foreground">{d.percentage}%</span>
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({(d.count / 1000).toFixed(1)}k)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Acquisition Channels */}
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 sm:p-6 space-y-5 transition-all">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground border border-zinc-200 dark:border-zinc-700">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">Trader Acquisition Sources</h2>
            <p className="text-xs text-muted-foreground">Inbound traffic channels and conversion efficiency</p>
          </div>
        </div>

        <div className="space-y-3">
          {channels.map((ch, idx) => (
            <div key={ch.channel} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-4 text-[10px] font-mono text-muted-foreground">{idx + 1}.</span>
                  {ch.channel}
                </span>
                <div className="font-mono text-[11px] flex items-center gap-2">
                  <span className="text-muted-foreground">{(ch.visitors / 1000).toFixed(1)}k visits</span>
                  <span className="font-bold text-foreground">{ch.percentage}%</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                    {ch.conversionRatePct}% CVR
                  </span>
                </div>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-zinc-900 dark:bg-white h-full rounded-full transition-all duration-300"
                  style={{ width: `${ch.percentage * 2}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
