'use client';

import React from 'react';

interface ProfitSplitGaugeProps {
  percentage: number; // e.g. 80, 90, 95, 100
  size?: number;
}

export function ProfitSplitGauge({ percentage, size = 44 }: ProfitSplitGaugeProps) {
  // 5 segments, each represents 20%
  const totalSegments = 5;
  const activeSegments = Math.round((percentage / 100) * totalSegments);
  
  // Calculate arc segments
  // We distribute 5 segments over a 260-degree arc from 140deg to 400deg (bottom open)
  const segments = Array.from({ length: totalSegments }, (_, i) => i < activeSegments);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 48 48" className="transform -rotate-90">
          {segments.map((isActive, index) => {
            const angleStep = 48; // degrees per segment
            const startAngle = 30 + index * (angleStep + 6);
            const strokeDasharray = '18 60';
            const strokeDashoffset = -index * 22;

            return (
              <circle
                key={index}
                cx="24"
                cy="24"
                r="18"
                fill="transparent"
                stroke={isActive ? '#22C55E' : '#26293A'}
                strokeWidth="3.5"
                strokeDasharray="18 100"
                strokeDashoffset={-index * 20.5}
                strokeLinecap="round"
                className={`transition-all duration-500 ${isActive ? 'drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]' : ''}`}
              />
            );
          })}
        </svg>
        <span className="absolute text-[10px] font-bold font-mono text-emerald-400">
          {percentage}%
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">
        Split
      </span>
    </div>
  );
}
