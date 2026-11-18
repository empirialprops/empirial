'use client';

import React from 'react';
import { ComparisonMetricScore } from '@/lib/utils/comparison-calc';

interface RadarChartProps {
  data: {
    firmName: string;
    color: string;
    metrics: ComparisonMetricScore[];
  }[];
  size?: number;
}

export function RadarChart({ data, size = 320 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 48;
  const numSides = data[0]?.metrics?.length || 5;

  // Grid concentric rings (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / numSides) * index - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y };
  };

  const metricLabels = data[0]?.metrics?.map(m => m.subject) || [
    'Profit Split',
    'Max Drawdown Limit',
    'Consistency',
    'Min. Trading Days',
    'Payout Frequency',
  ];

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid Rings */}
        {levels.map((level, lvlIdx) => {
          const points = Array.from({ length: numSides }, (_, i) => {
            const { x, y } = getCoordinates(i, level);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={lvlIdx}
              points={points}
              fill="transparent"
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeWidth="1"
              strokeDasharray={lvlIdx === levels.length - 1 ? 'none' : '2 3'}
            />
          );
        })}

        {/* Axis Lines */}
        {Array.from({ length: numSides }, (_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeWidth="1"
            />
          );
        })}

        {/* Firm Polygons */}
        {data.map((firm, firmIdx) => {
          const points = firm.metrics.map((m, idx) => {
            const ratio = Math.max(0.12, Math.min(1.0, m.score / 100));
            const { x, y } = getCoordinates(idx, ratio);
            return `${x},${y}`;
          }).join(' ');

          return (
            <g key={firmIdx}>
              <polygon
                points={points}
                fill={firm.color}
                fillOpacity={0.16}
                stroke={firm.color}
                strokeWidth="2"
                className="transition-all duration-300 hover:fill-opacity-35"
              />
              {/* Data points */}
              {firm.metrics.map((m, idx) => {
                const ratio = Math.max(0.12, Math.min(1.0, m.score / 100));
                const { x, y } = getCoordinates(idx, ratio);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill={firm.color}
                    className="stroke-background"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
          );
        })}

        {/* Metric Text Labels */}
        {metricLabels.map((label, i) => {
          const { x, y } = getCoordinates(i, 1.25);
          return (
            <text
              key={i}
              x={x}
              y={y}
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-zinc-600 dark:fill-zinc-400 font-sans select-none"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        {data.map((firm, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: firm.color }} />
            <span className="text-foreground">{firm.firmName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
