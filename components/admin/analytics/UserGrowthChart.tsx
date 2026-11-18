'use client';

import React, { useState, useId } from 'react';
import { UserGrowthDataPoint } from '@/lib/utils/analytics-store';
import { TrendingUp, Users, UserPlus, Eye } from 'lucide-react';

interface Props {
  data: UserGrowthDataPoint[];
}

export function UserGrowthChart({ data }: Props) {
  const gradientId = useId();
  const [activeSeries, setActiveSeries] = useState<'both' | 'registered' | 'active'>('both');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  // Chart Dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Max calculations
  const maxRegistered = Math.max(...data.map((d) => d.registeredUsers));
  const minRegistered = Math.min(...data.map((d) => d.registeredUsers)) * 0.95;
  const maxActive = Math.max(...data.map((d) => d.activeTraders));

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getYRegistered = (val: number) =>
    padding.top + chartHeight - ((val - minRegistered) / (maxRegistered - minRegistered || 1)) * chartHeight;
  const getYActive = (val: number) =>
    padding.top + chartHeight - (val / (maxActive * 1.15 || 1)) * chartHeight;

  // Build SVG path strings
  const registeredPoints = data.map((d, i) => `${getX(i)},${getYRegistered(d.registeredUsers)}`).join(' ');
  const registeredArea = `${getX(0)},${padding.top + chartHeight} ${registeredPoints} ${getX(data.length - 1)},${padding.top + chartHeight}`;

  const activePoints = data.map((d, i) => `${getX(i)},${getYActive(d.activeTraders)}`).join(' ');

  const currentHovered = hoveredIndex !== null ? data[hoveredIndex] : data[data.length - 1];

  return (
    <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 sm:p-6 space-y-5 transition-all">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground border border-zinc-200 dark:border-zinc-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Registered Users & Active Traders Growth
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Historical registration trajectory, daily active traders, and platform adoption.
          </p>
        </div>

        {/* Series Filter Controls */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            onClick={() => setActiveSeries('both')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSeries === 'both'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Series
          </button>
          <button
            onClick={() => setActiveSeries('registered')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSeries === 'registered'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Registered
          </button>
          <button
            onClick={() => setActiveSeries('active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSeries === 'active'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active DAU
          </button>
        </div>
      </div>

      {/* Snapshot Values Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
        <div>
          <span className="text-muted-foreground block text-[11px]">Selected Date</span>
          <span className="font-bold text-foreground text-sm tracking-tight">{currentHovered.label}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px]">Total Registered</span>
          <span className="font-extrabold text-foreground text-sm tracking-tight">
            {currentHovered.registeredUsers.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px]">Active Traders</span>
          <span className="font-extrabold text-foreground text-sm tracking-tight">
            {currentHovered.activeTraders.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px]">New Signups</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm tracking-tight">
            +{currentHovered.newSignups.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Interactive Responsive SVG Area Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[650px] relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 overflow-visible select-none">
            <defs>
              <linearGradient id={`${gradientId}-registered`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" className="text-zinc-900 dark:text-white" stopOpacity="0.25" />
                <stop offset="100%" stopColor="currentColor" className="text-zinc-900 dark:text-white" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
              const y = padding.top + chartHeight * p;
              const val = Math.round(maxRegistered - p * (maxRegistered - minRegistered));
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    className="stroke-zinc-200 dark:stroke-zinc-800"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px] font-mono"
                  >
                    {(val / 1000).toFixed(0)}k
                  </text>
                </g>
              );
            })}

            {/* Registered Users Area & Line */}
            {(activeSeries === 'both' || activeSeries === 'registered') && (
              <>
                <polygon points={registeredArea} fill={`url(#${gradientId}-registered)`} />
                <polyline
                  points={registeredPoints}
                  fill="none"
                  className="stroke-zinc-900 dark:stroke-white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Active Traders Line */}
            {(activeSeries === 'both' || activeSeries === 'active') && (
              <polyline
                points={activePoints}
                fill="none"
                className="stroke-zinc-500 dark:stroke-zinc-400"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Hover Vertical Guide Line */}
            {hoveredIndex !== null && (
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={padding.top + chartHeight}
                className="stroke-zinc-900 dark:stroke-zinc-100"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            )}

            {/* Data Point Markers & Hover Targets */}
            {data.map((d, i) => {
              const x = getX(i);
              const yReg = getYRegistered(d.registeredUsers);
              const yAct = getYActive(d.activeTraders);
              const isHovered = hoveredIndex === i;

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer"
                >
                  {/* Invisible Hit Area */}
                  <rect
                    x={x - 20}
                    y={padding.top}
                    width={40}
                    height={chartHeight}
                    fill="transparent"
                  />

                  {/* Registered Marker */}
                  {(activeSeries === 'both' || activeSeries === 'registered') && (
                    <circle
                      cx={x}
                      cy={yReg}
                      r={isHovered ? 5.5 : 3.5}
                      className="fill-white dark:fill-zinc-950 stroke-zinc-900 dark:stroke-white transition-all duration-150"
                      strokeWidth={isHovered ? '2.5' : '2'}
                    />
                  )}

                  {/* Active Marker */}
                  {(activeSeries === 'both' || activeSeries === 'active') && (
                    <circle
                      cx={x}
                      cy={yAct}
                      r={isHovered ? 4.5 : 2.5}
                      className="fill-zinc-500 dark:fill-zinc-400"
                    />
                  )}

                  {/* X Axis Label */}
                  <text
                    x={x}
                    y={height - 12}
                    textAnchor="middle"
                    className={`text-[10px] font-mono transition-colors ${
                      isHovered ? 'fill-foreground font-bold' : 'fill-muted-foreground'
                    }`}
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-zinc-900 dark:bg-white rounded-full" />
            <span>Total Registered Users</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 border-t border-dashed border-zinc-500 dark:border-zinc-400" />
            <span>Daily Active Traders (DAU)</span>
          </div>
        </div>
        <div className="font-mono text-[11px]">
          Sample interval: Last 30 Days (Rolling)
        </div>
      </div>
    </div>
  );
}
