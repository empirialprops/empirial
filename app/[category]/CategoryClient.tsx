'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Trophy, ArrowRight } from 'lucide-react';
import { MOCK_CHALLENGES } from '@/lib/data/challenges-data';
import { MOCK_DEALS } from '@/lib/data/deals-data';
import { ProfitSplitGauge } from '@/components/ui/profit-split-gauge';
import { StrikePrice } from '@/components/ui/strike-price';
import { CopyButton } from '@/components/ui/copy-button';
import { getChallenges, getDeals } from '@/lib/firebase/services';
import { Challenge, Deal } from '@/lib/types';

interface CategoryClientProps {
  initialCategory?: string;
}

export function CategoryClient({ initialCategory }: CategoryClientProps) {
  const params = useParams();
  const category = (initialCategory || (params?.category as string) || 'forex').toLowerCase();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [challsData, dealsData] = await Promise.all([getChallenges(), getDeals()]);
        setChallenges(challsData.length > 0 ? challsData : MOCK_CHALLENGES);
        setDeals(dealsData.length > 0 ? dealsData : MOCK_DEALS);
      } catch (err) {
        console.error('Failed to load category dynamic data:', err);
        setChallenges(MOCK_CHALLENGES);
        setDeals(MOCK_DEALS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categoryTitles: { [key: string]: { title: string; subtitle: string } } = {
    forex: {
      title: 'Forex Prop Trading Intelligence',
      subtitle: 'Audited forex evaluations from FTMO, The5ers, Funding Pips with raw cTrader and MT5 execution.',
    },
    futures: {
      title: 'Futures Prop Trading & Combines',
      subtitle: 'Top CME & CBOT exchange execution from Topstep, Apex Trader Funding with daily payouts.',
    },
    crypto: {
      title: 'Crypto Prop Challenges',
      subtitle: '24/7 weekend crypto prop trading evaluations across Bitcoin, Ethereum, and altcoin futures.',
    },
    'instant-funding': {
      title: 'Instant Funding Prop Programs (No Evaluation)',
      subtitle: 'Immediate live funded accounts with no challenge steps, scaling plans up to $4M, and bi-weekly payouts.',
    },
  };

  const currentInfo = categoryTitles[category] || {
    title: `${category.toUpperCase()} Prop Intelligence`,
    subtitle: 'Comprehensive audited prop firms, challenges, and exclusive promo codes.',
  };

  const filteredChallenges = challenges.filter(c => c.category === category || category === 'all');
  const filteredDeals = deals.filter(d => d.category === category || category === 'all');

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-foreground rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-mono">Loading category dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Category Hero */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground text-xs font-bold">
          <Trophy className="w-3.5 h-3.5" />
          <span>{category.toUpperCase()} PROP SECTOR</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          {currentInfo.title}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          {currentInfo.subtitle}
        </p>

        {/* Quick Nav Category Hubs */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href={`/${category}/challenges`}
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-foreground border border-zinc-200 dark:border-zinc-800 text-xs font-bold transition-colors"
          >
            {category.toUpperCase()} Challenges Table
          </Link>
          <Link
            href={`/${category}/deals`}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-colors"
          >
            {category.toUpperCase()} Discount Codes
          </Link>
        </div>
      </div>

      {/* Challenges Matrix */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Top Audited {category.toUpperCase()} Challenges</h2>
          <Link href={`/${category}/challenges`} className="text-xs text-foreground hover:underline font-bold flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.slice(0, 6).map((ch) => (
            <div key={ch.id} className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-muted-foreground">{ch.firm_name}</span>
                  <h3 className="text-sm font-bold text-foreground leading-snug">{ch.name}</h3>
                </div>
                <span className="text-xs font-mono font-bold text-foreground px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  ${(ch.account_size / 1000).toFixed(0)}k
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 text-center items-center">
                <ProfitSplitGauge percentage={ch.profit_split_pct} size={38} />
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase">Max Loss</span>
                  <div className="font-mono font-bold text-rose-500 text-xs">{ch.max_loss_limit_pct}%</div>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase">Target</span>
                  <div className="font-mono font-bold text-emerald-500 text-xs">{ch.profit_target_pct}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <StrikePrice price={ch.price} originalPrice={ch.original_price} size="sm" />
                <a
                  href={ch.buy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs transition-colors"
                >
                  Buy Challenge
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deals Matrix */}
      {filteredDeals.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-foreground">Active {category.toUpperCase()} Promo Coupons</h2>
            <Link href={`/${category}/deals`} className="text-xs text-foreground hover:underline font-bold flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{deal.firm_name}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    -{deal.discount_pct}% OFF
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{deal.discount_label}</h3>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-foreground">{deal.code}</span>
                  <CopyButton textToCopy={deal.code} label="COPY" size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
