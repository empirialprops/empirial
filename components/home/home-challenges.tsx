'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { MOCK_CHALLENGES } from '@/lib/data/challenges-data';
import { ProfitSplitGauge } from '@/components/ui/profit-split-gauge';
import { StrikePrice } from '@/components/ui/strike-price';
import { CopyButton } from '@/components/ui/copy-button';

export function HomeChallenges() {
  const featuredChallenges = MOCK_CHALLENGES.filter(c => c.is_featured).slice(0, 6);

  return (
    <section className="py-20 bg-[#0B0C10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>TOP AUDITED EVALUATIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured Prop Challenges Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Audited 1-step, 2-step, and instant funding programs with live profit split gauges and coupon discounts.
            </p>
          </div>

          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All 500+ Challenges in 13-Col Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-elevation-surface border border-white/10 hover:border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl hover:shadow-cyan-950/20 group"
            >
              {/* Card Header: Firm & Name */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-elevation-card border border-white/10 flex items-center justify-center text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                    {(challenge.firm_name || challenge.firm_slug || 'FRM').substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      {challenge.firm_name || 'PROP FIRM'}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">
                      {challenge.name}
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                  ${(challenge.account_size / 1000).toFixed(0)}k Size
                </span>
              </div>

              {/* Middle Metrics: Profit Split Gauge + Loss Limits */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-elevation-card border border-white/5 items-center text-center">
                {/* 5-Segment Profit Split Gauge */}
                <div className="border-r border-white/5 pr-2">
                  <ProfitSplitGauge percentage={challenge.profit_split_pct} size={42} />
                </div>

                {/* Drawdown Limits */}
                <div className="border-r border-white/5 pr-2 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Max Loss</span>
                  <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                    {challenge.max_loss_limit_pct}%
                  </div>
                  <span className="text-[9px] text-slate-500">
                    Daily: {challenge.daily_loss_limit_pct}%
                  </span>
                </div>

                {/* Steps & Target */}
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Target</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    {challenge.profit_target_pct}%
                  </div>
                  <span className="text-[9px] text-slate-400">
                    {challenge.steps === 0 ? 'Instant' : `${challenge.steps}-Step`}
                  </span>
                </div>
              </div>

              {/* Footer: Strikethrough Pricing + Coupon Copy + Buy Button */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <StrikePrice
                  price={challenge.price}
                  originalPrice={challenge.original_price}
                  size="md"
                />

                <div className="flex items-center gap-2">
                  <CopyButton
                    textToCopy={challenge.coupon_code}
                    label={`-${challenge.discount_pct}%`}
                    size="sm"
                  />
                  <a
                    href={challenge.buy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-black font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Get Deal</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
