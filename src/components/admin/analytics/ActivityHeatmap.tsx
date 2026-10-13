
import React, { useState } from 'react';
import { Calendar, Flame } from 'lucide-react';

export function ActivityHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: number; count: number } | null>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate realistic peak activity patterns (US/London market open peaks around 8am - 11am and 1pm - 4pm EST)
  const getActivityLevel = (dayIndex: number, hour: number) => {
    // Weekends slightly lower
    const isWeekend = dayIndex >= 5;
    const base = isWeekend ? 30 : 50;

    // London Open (8 - 12 UTC) and NY Open (13 - 17 UTC)
    let marketMultiplier = 1;
    if (hour >= 8 && hour <= 12) marketMultiplier = 2.4;
    else if (hour >= 13 && hour <= 18) marketMultiplier = 2.8;
    else if (hour >= 19 && hour <= 23) marketMultiplier = 1.6;
    else marketMultiplier = 0.6;

    const pseudoSeed = (dayIndex * 24 + hour * 7) % 19;
    const count = Math.round(base * marketMultiplier + pseudoSeed * 4);
    return Math.min(250, count);
  };

  const getIntensityClass = (count: number) => {
    if (count > 200) return 'bg-zinc-950 dark:bg-white text-white dark:text-black';
    if (count > 150) return 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black';
    if (count > 100) return 'bg-zinc-600 dark:bg-zinc-400 text-white dark:text-black';
    if (count > 60) return 'bg-zinc-400 dark:bg-zinc-600 text-white dark:text-black';
    if (count > 30) return 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200';
    return 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500';
  };

  return (
    <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 sm:p-6 space-y-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground border border-zinc-200 dark:border-zinc-700">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Platform Peak Hours & Session Heatmap
            </h2>
            <p className="text-xs text-muted-foreground">
              Concurrent traders browsing, comparing, and claiming deals across time slots
            </p>
          </div>
        </div>

        {/* Hover info pill */}
        {hoveredCell ? (
          <div className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <span className="font-bold text-foreground">
              {hoveredCell.day} {hoveredCell.hour.toString().padStart(2, '0')}:00
            </span>
            <span className="text-muted-foreground ml-2">— {hoveredCell.count} concurrent sessions</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground font-mono">Hover over any time slot</span>
        )}
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px] space-y-1.5 select-none">
          {/* Hour labels */}
          <div className="flex items-center pl-10 text-[9px] font-mono text-muted-foreground">
            {hours.map((h) => (
              <span key={h} className="flex-1 text-center">
                {h % 3 === 0 ? `${h}h` : ''}
              </span>
            ))}
          </div>

          {/* Days rows */}
          {days.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-1.5">
              <span className="w-8 text-[11px] font-mono text-muted-foreground font-semibold">{day}</span>
              <div className="flex-1 flex gap-1">
                {hours.map((hour) => {
                  const count = getActivityLevel(dayIdx, hour);
                  return (
                    <div
                      key={hour}
                      onMouseEnter={() => setHoveredCell({ day, hour, count })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`flex-1 h-5 rounded-xs cursor-pointer transition-all hover:scale-110 ${getIntensityClass(
                        count
                      )}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-[11px] font-mono">UTC Standardized Timezone</span>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span>Low</span>
          <div className="w-3 h-3 rounded-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
          <div className="w-3 h-3 rounded-xs bg-zinc-300 dark:bg-zinc-700" />
          <div className="w-3 h-3 rounded-xs bg-zinc-600 dark:bg-zinc-400" />
          <div className="w-3 h-3 rounded-xs bg-zinc-950 dark:bg-white" />
          <span>High (Peak)</span>
        </div>
      </div>
    </div>
  );
}
