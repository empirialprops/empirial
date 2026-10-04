'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Star,
  Globe,
  Tag,
  Trophy,
  DollarSign,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Calendar,
  Clock,
  Layers,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
  HelpCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Firm, Challenge, Deal, Review, Payout } from '@/lib/types';
import { calculateFirmMetrics } from '@/lib/utils/rating-calculator';
import { getStoredChallenges } from '@/lib/utils/challenges-store';
import { getStoredReviews } from '@/lib/utils/reviews-store';
import { getStoredFirms } from '@/lib/utils/firms-store';
import { getStoredPlatforms, PlatformItem } from '@/lib/utils/platforms-store';
import { parseConsistencyRule, parseMinTradingDays } from '@/lib/utils/comparison-calc';

// Platform Logo Dictionary from downloaded assets
const PLATFORM_DATA: Record<string, { name: string; logo: string; type: 'forex' | 'futures' }> = {
  mt5: { name: 'MetaTrader 5', logo: '/platforms/mt5.png', type: 'forex' },
  ctrader: { name: 'cTrader', logo: '/platforms/ctrader.svg', type: 'forex' },
  'match-trader': { name: 'Match-Trader', logo: '/platforms/match-trader.svg', type: 'forex' },
  tradelocker: { name: 'TradeLocker', logo: '/platforms/tradelocker.jpeg', type: 'forex' },
  ninjatrader: { name: 'NinjaTrader', logo: '/platforms/ninjatrader.svg', type: 'futures' },
  tradovate: { name: 'Tradovate', logo: '/platforms/tradovate.png', type: 'futures' },
  tradingview: { name: 'TradingView', logo: '/platforms/tradingview.png', type: 'futures' },
  bookmap: { name: 'Bookmap', logo: '/platforms/bookmap.jpeg', type: 'futures' },
  atas: { name: 'ATAS', logo: '/platforms/atas.jpeg', type: 'futures' },
  deepcharts: { name: 'Deepcharts', logo: '/platforms/deepcharts.jpeg', type: 'futures' },
  multicharts: { name: 'MultiCharts', logo: '/platforms/multicharts.svg', type: 'futures' },
};

interface FirmProfileClientProps {
  firm: Firm;
  firmChallenges: Challenge[];
  firmDeals: Deal[];
  firmReviews: Review[];
  firmPayouts: Payout[];
}

export function FirmProfileClient({
  firm,
  firmChallenges,
  firmDeals,
  firmReviews,
  firmPayouts,
}: FirmProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'offers' | 'reviews'>('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<number | 'all'>('all');
  const [selectedStepFilter, setSelectedStepFilter] = useState<number | 'all'>('all');

  const isSlf =
    ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(firm.id.toLowerCase()) ||
    ['sure-leverage', 'sure-leverage-funding', 'slf'].includes((firm.slug || '').toLowerCase()) ||
    firm.name.toLowerCase().includes('sure leverage') ||
    firm.name.toLowerCase().includes('slf');

  // Dynamic effective firm synced from localStorage & custom events
  const [effectiveFirm, setEffectiveFirm] = useState<Firm>(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredFirms();
      const found = stored.find((f) => f.id === firm.id || f.slug === firm.slug || (isSlf && ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(f.slug.toLowerCase())));
      if (found) return found;
    }
    return firm;
  });

  // Dynamic platforms lookup
  const [platformDict, setPlatformDict] = useState<Record<string, { name: string; logo: string; type: 'forex' | 'futures' }>>(() => {
    const dict = { ...PLATFORM_DATA };
    if (typeof window !== 'undefined') {
      const stored = getStoredPlatforms();
      stored.forEach((p) => {
        dict[p.id] = { name: p.name, logo: p.logo, type: p.type === 'futures' ? 'futures' : 'forex' };
      });
    }
    return dict;
  });

  const [effectiveChallenges, setEffectiveChallenges] = useState<Challenge[]>(firmChallenges);
  const [effectiveReviews, setEffectiveReviews] = useState<Review[]>(firmReviews);

  useEffect(() => {
    // 1. Sync firm itself
    const storedF = getStoredFirms();
    const matchedF = storedF.find((f) => f.id === firm.id || f.slug === firm.slug || (isSlf && ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(f.slug.toLowerCase())));
    if (matchedF) {
      setEffectiveFirm(matchedF);
    }

    // 2. Sync stored challenges for this firm
    const storedCh = getStoredChallenges();
    const matchingStoredCh = storedCh.filter((c) => {
      if (c.firm_id === firm.id || c.firm_slug === firm.slug) return true;
      if (isSlf) {
        const cFId = (c.firm_id || '').toLowerCase();
        const cSlug = (c.firm_slug || '').toLowerCase();
        return ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(cFId) || ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(cSlug);
      }
      return false;
    });

    if (matchingStoredCh.length > 0) {
      const chMap = new Map<string, Challenge>();
      firmChallenges.forEach((c) => chMap.set(c.id, c));
      matchingStoredCh.forEach((c) => chMap.set(c.id, c));
      setEffectiveChallenges(Array.from(chMap.values()));
    } else {
      setEffectiveChallenges(firmChallenges);
    }

    // 3. Sync stored reviews (especially SLF reviews)
    const storedRev = getStoredReviews();
    const matchingStoredRev = storedRev.filter((r) => {
      const rId = (r.firm_id || '').toLowerCase();
      const rName = (r.firm_name || '').toLowerCase();
      if (rId === firm.id.toLowerCase() || rId === (firm.slug || '').toLowerCase()) return true;
      if (isSlf) {
        return (
          ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(rId) ||
          rName.includes('sure leverage') ||
          rName.includes('slf')
        );
      }
      return false;
    });

    if (matchingStoredRev.length > 0) {
      const revMap = new Map<string, Review>();
      firmReviews.forEach((r) => revMap.set(r.id, r));
      matchingStoredRev.forEach((r) => revMap.set(r.id, r));
      setEffectiveReviews(Array.from(revMap.values()));
    } else {
      setEffectiveReviews(firmReviews);
    }

    // 4. Listen to firms & platforms change events
    const handleFirmsChanged = (e: CustomEvent) => {
      const list: Firm[] = e.detail || getStoredFirms();
      const found = list.find((f) => f.id === firm.id || f.slug === firm.slug || (isSlf && ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(f.slug.toLowerCase())));
      if (found) setEffectiveFirm(found);
    };

    const handlePlatformsChanged = (e: CustomEvent) => {
      const stored: PlatformItem[] = e.detail || getStoredPlatforms();
      const dict = { ...PLATFORM_DATA };
      stored.forEach((p) => {
        dict[p.id] = { name: p.name, logo: p.logo, type: p.type === 'futures' ? 'futures' : 'forex' };
      });
      setPlatformDict(dict);
    };

    window.addEventListener('empirial_firms_changed' as any, handleFirmsChanged);
    window.addEventListener('empirial_platforms_changed' as any, handlePlatformsChanged);

    return () => {
      window.removeEventListener('empirial_firms_changed' as any, handleFirmsChanged);
      window.removeEventListener('empirial_platforms_changed' as any, handlePlatformsChanged);
    };
  }, [firm.id, firm.slug, isSlf, firmChallenges, firmReviews]);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Genuine Synced Rating metrics calculations
  const metrics = calculateFirmMetrics(effectiveFirm, effectiveReviews);
  const totalReviewsCount = metrics.reviewCount;
  const computedRating = metrics.rating;

  // Consistency & Min Trading Days calculation
  const consistencyInfo = parseConsistencyRule(effectiveFirm.consistency_rule || effectiveFirm.consistency_rules_content);
  const minDaysInfo = parseMinTradingDays(effectiveFirm.min_trading_days ?? effectiveFirm.firm_rules_content);

  // Platforms lookup
  const platformKeys = (effectiveFirm.platform_ids || []).filter((pid) => platformDict[pid]);

  const getFirmBuyUrl = (f: Firm): string => {
    if (f.buy_url && f.buy_url.startsWith('http')) {
      return f.buy_url;
    }
    const slugToUrlMap: Record<string, string> = {
      'nys': 'https://nyscapital.com?ref=empirial',
      'nys-capital': 'https://nyscapital.com?ref=empirial',
      'ck-capital': 'https://ckcapital.com?ref=empirial',
      'alpha-capital': 'https://alphacapitalgroup.uk?ref=empirial',
      'gtf': 'https://goatfundedtrader.com?ref=empirial',
      'pipstone': 'https://pipstone.com?ref=empirial',
      'shark-funded': 'https://sharkfunded.com?ref=empirial',
      'sure-leverage': 'https://sureleveragefunding.com?ref=empirial',
      'ftmo': 'https://ftmo.com?ref=empirial',
      'funding-pips': 'https://fundingpips.com?ref=empirial',
    };
    return slugToUrlMap[f.id] || slugToUrlMap[f.slug] || `https://${f.slug}.com?ref=empirial`;
  };

  const officialSiteUrl = getFirmBuyUrl(effectiveFirm);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
          
          {/* Main Top Profile Banner (Strict RULE:BW Compliance) */}
          <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Top Identity Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Firm Brand & Basic Specs */}
              <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-2 overflow-hidden shadow-xs">
                  {effectiveFirm.logo_url ? (
                    <img
                      src={effectiveFirm.logo_url}
                      alt={effectiveFirm.name}
                      className="h-12 w-auto max-w-[56px] object-contain rounded-md"
                    />
                  ) : (
                    <span className="font-black text-xl sm:text-2xl text-foreground">
                      {effectiveFirm.name.substring(0, 3).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {effectiveFirm.name}
                    </h1>
                    {effectiveFirm.is_verified && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-600/30 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Audited
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                      <span>{computedRating.toFixed(1)}</span>
                      <span className="text-muted-foreground font-medium">({totalReviewsCount})</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                    {effectiveFirm.description || 'Audited proprietary trading platform featuring institutional funding models.'}
                  </p>

                  {/* Platforms list with zoom hover */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
                    <span className="text-muted-foreground font-semibold">Platforms:</span>
                    {platformKeys.length > 0 ? (
                      platformKeys.map((pid) => {
                        const p = platformDict[pid] || { name: pid.toUpperCase(), logo: '/platforms/mt5.png', type: 'forex' };
                        return (
                          <Tooltip key={pid}>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.25 }}
                                className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-0.5 cursor-pointer"
                              >
                                <img src={p.logo} alt={p.name} className="h-4 w-4 object-contain rounded" />
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[11px] font-bold bg-black text-white dark:bg-white dark:text-black">
                              {p.name}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })
                    ) : (
                      <span className="font-bold text-foreground">{effectiveFirm.platforms || 'MT5, cTrader'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                {/* Discount Code Button */}
                <button
                  type="button"
                  onClick={() => handleCopyCode(effectiveFirm.coupon_code_custom || 'EMPIRE')}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-foreground text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{effectiveFirm.discount_label_custom || effectiveFirm.coupon_code_custom || '20% OFF'}</span>
                    </>
                  )}
                </button>

                {/* Compare Link */}
                <Link
                  href={`/compare?firms=${effectiveFirm.slug}`}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
                >
                  <Layers className="w-4 h-4" />
                  <span>Compare</span>
                </Link>

                {/* Visit Official Site Button */}
                <a
                  href={officialSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>Visit Official Site</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 4 Main Image 1 Stat Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              {/* 1. Headquarters */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    HEADQUARTERS
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-foreground">
                    {effectiveFirm.headquarters || 'Dubai, UAE'}
                  </span>
                </div>
              </div>

              {/* 2. Experience */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    EXPERIENCE
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-foreground">
                    {effectiveFirm.years_working || `Est. ${effectiveFirm.founded_year || '2024'}`}
                  </span>
                </div>
              </div>

              {/* 3. Total Payouts */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    TOTAL PAYOUTS
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-foreground">
                    {effectiveFirm.total_payouts || '$15,000,000+'}
                  </span>
                </div>
              </div>

              {/* 4. Avg Payout SLA */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-3">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    AVG PAYOUT SLA
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-foreground">
                    {effectiveFirm.avg_payout_time || '8-24 Hours'}
                  </span>
                </div>
              </div>
            </div>

            {/* Evaluation Models & Firm Types Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-muted-foreground font-semibold">Models:</span>
                {(effectiveFirm.models || ['1-Step Challenge', '2-Step Evaluation', 'Instant Model']).map((model) => (
                  <span
                    key={model}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200 dark:border-zinc-800"
                  >
                    {model}
                  </span>
                ))}

                {(effectiveFirm.firm_types && effectiveFirm.firm_types.length > 0) && (
                  <>
                    <span className="text-muted-foreground font-semibold ml-2">Types:</span>
                    {effectiveFirm.firm_types.map((ft) => (
                      <span
                        key={ft}
                        className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black"
                      >
                        {ft}
                      </span>
                    ))}
                  </>
                )}
              </div>

              <div className="text-xs text-muted-foreground font-medium flex items-center gap-3">
                <span>Max Alloc: <strong className="text-foreground font-bold">{effectiveFirm.max_allocation}</strong></span>
                <span>Split: <strong className="text-foreground font-bold">{effectiveFirm.payout_split_pct ? `${effectiveFirm.payout_split_pct}%` : effectiveFirm.profit_split_custom}</strong></span>
                <span>Lev: <strong className="text-foreground font-bold">{effectiveFirm.leverage || '1:100'}</strong></span>
              </div>
            </div>

            {/* Firm Specs Bar */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span>Consistency Rule:</span>
                <strong className="text-foreground font-semibold">
                  {effectiveFirm.consistency_rule || effectiveFirm.consistency_rules_content || 'No strict consistency rule'}
                </strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Min Trading Days:</span>
                <strong className="text-foreground font-semibold">
                  {minDaysInfo.displayValue}
                </strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Payout Cycle:</span>
                <strong className="text-foreground font-semibold">
                  {effectiveFirm.payout_cycle || effectiveFirm.payout_custom || 'Bi-Weekly / 14 Days'}
                </strong>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs (Black & White Theme Tabs) */}
          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Rules & Specs Overview' },
              { id: 'challenges', label: `Challenges (${effectiveChallenges.length})` },
              { id: 'offers', label: `Promo Deals (${firmDeals.length})` },
              { id: 'reviews', label: `Verified Reviews (${effectiveReviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-foreground dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rules & Policies Left Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Risk Policies */}
                <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-foreground font-bold text-base">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h2>Risk & Consistency Rules</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {effectiveFirm.consistency_rules_content || effectiveFirm.consistency_rule || 'No strict lot size consistency required. Hedging allowed across open accounts. Weekend holding permitted on Swing accounts.'}
                  </p>
                  {/* Article Link for Consistency Rule (Point 3 - Minimal rules link) */}
                  {effectiveFirm.consistency_rule_article_url && (
                    <div className="pt-2">
                      <a
                        href={effectiveFirm.consistency_rule_article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors"
                      >
                        <span>{effectiveFirm.consistency_rule_article_title || 'Read Official Consistency Rule Article'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Drawdown Rules */}
                <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-foreground font-bold text-base">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <h2>Evaluation & Maximum Drawdown Rules</h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {effectiveFirm.firm_rules_content || 'Maximum daily drawdown calculated based on previous day balance or equity at 00:00 CE(S)T. Hard breach results in immediate account closure.'}
                  </p>
                  {/* Article Link for Drawdown Rules (Point 3 - Minimal rules link) */}
                  {effectiveFirm.firm_rules_article_url && (
                    <div className="pt-2">
                      <a
                        href={effectiveFirm.firm_rules_article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors"
                      >
                        <span>{effectiveFirm.firm_rules_article_title || 'Read Official Drawdown Policy'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Extra Rule Articles (Point 3 - Minimal & Convenient) */}
                {effectiveFirm.rule_articles && effectiveFirm.rule_articles.length > 0 && (
                  <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2 text-foreground font-bold text-base">
                      <Tag className="w-5 h-5 text-purple-500" />
                      <h2>Official Rule Articles & Documentation</h2>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Deep dive into verified firm policies, special allowances, and rule FAQs:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {effectiveFirm.rule_articles.map((art, aIdx) => (
                        <a
                          key={aIdx}
                          href={art.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:underline bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors"
                        >
                          <span>{art.title}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payout Schedule */}
                {effectiveFirm.payout_programs && effectiveFirm.payout_programs.length > 0 && (
                  <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-4 shadow-xs">
                    <h2 className="text-foreground font-bold text-base">Payout Tiers & Scaling Model</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-muted-foreground uppercase tracking-wider text-[10px] border-b border-zinc-200 dark:border-zinc-800 pb-2">
                            <th className="pb-2 font-bold">Model</th>
                            <th className="pb-2 font-bold">Payout Schedule</th>
                            <th className="pb-2 font-bold">Profit Split</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {effectiveFirm.payout_programs.map((prog, idx) => (
                            <tr key={idx} className="text-foreground">
                              <td className="py-2.5 font-bold">{prog.name}</td>
                              <td className="py-2.5 font-mono text-muted-foreground">{prog.schedule}</td>
                              <td className="py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{prog.split}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Restricted Countries */}
                <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <Globe className="w-4 h-4 text-rose-500" />
                    <h3>Restricted Jurisdictions</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Traders residing in the following jurisdictions are prohibited:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {((effectiveFirm.restricted_jurisdictions && effectiveFirm.restricted_jurisdictions.length > 0)
                      ? effectiveFirm.restricted_jurisdictions
                      : (effectiveFirm.restricted_countries && effectiveFirm.restricted_countries.length > 0)
                      ? effectiveFirm.restricted_countries
                      : ['United States', 'Iran', 'North Korea', 'Syria', 'Cuba']
                    ).map((country) => (
                      <span
                        key={country}
                        className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Active Promo Deal */}
                {(firmDeals.length > 0 || effectiveFirm.coupon_code_custom) && (
                  <div className="bg-white dark:bg-card border-2 border-black dark:border-white rounded-2xl p-6 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">ACTIVE PROMO</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        -{firmDeals[0]?.discount_pct || effectiveFirm.discount_pct || 20}% OFF
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      {firmDeals[0]?.discount_label || effectiveFirm.discount_label_custom || 'EXCLUSIVE DISCOUNT'}
                    </h3>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-foreground">
                        {firmDeals[0]?.code || effectiveFirm.coupon_code_custom || 'EMPIRE'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(firmDeals[0]?.code || effectiveFirm.coupon_code_custom || 'EMPIRE')}
                        className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        {copiedCode ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Challenges (Full Detailed Table View matching Challenges directory) */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">Size:</span>
                  {[
                    { label: 'All', val: 'all' },
                    { label: '$5K', val: 5000 },
                    { label: '$10K', val: 10000 },
                    { label: '$25K', val: 25000 },
                    { label: '$50K', val: 50000 },
                    { label: '$100K', val: 100000 },
                    { label: '$200K', val: 200000 },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setSelectedSizeFilter(s.val as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedSizeFilter === s.val
                          ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-muted-foreground dark:bg-zinc-900 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">Steps:</span>
                  {[
                    { label: 'All', val: 'all' },
                    { label: 'Instant', val: 0 },
                    { label: '1-Step', val: 1 },
                    { label: '2-Step', val: 2 },
                  ].map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setSelectedStepFilter(m.val as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedStepFilter === m.val
                          ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-muted-foreground dark:bg-zinc-900 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Header (Desktop) */}
              <div className="hidden lg:grid grid-cols-12 gap-3 px-6 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider items-center">
                <div className="col-span-3">CHALLENGE & MODEL</div>
                <div className="col-span-2 text-center">ACCOUNT SIZE</div>
                <div className="col-span-2 text-center">PROFIT TARGET</div>
                <div className="col-span-1 text-center">DAILY / MAX DD</div>
                <div className="col-span-1 text-center">PROFIT SPLIT</div>
                <div className="col-span-3 text-right">PRICE & BUY</div>
              </div>

              {/* Rows List */}
              <div className="space-y-3">
                {effectiveChallenges
                  .filter((ch) => {
                    const matchSize = selectedSizeFilter === 'all' || ch.account_size === selectedSizeFilter;
                    const matchStep = selectedStepFilter === 'all' || ch.steps === selectedStepFilter;
                    return matchSize && matchStep;
                  })
                  .map((ch) => {
                    const isExpanded = expandedChallengeId === ch.id;
                    const originalPrice = ch.original_price || Math.round(ch.price * 1.25);
                    const targetStr =
                      ch.steps === 2 && ch.phase_2_target_pct && ch.phase_2_target_pct > 0
                        ? `${ch.profit_target_pct ?? 0}% | ${ch.phase_2_target_pct}%`
                        : ch.steps === 0
                        ? 'None (Instant)'
                        : `${ch.profit_target_pct ?? 0}%`;
                    const ddStr = `${ch.daily_loss_limit_pct ? ch.daily_loss_limit_pct + '%' : 'None'} | ${ch.max_loss_limit_pct ?? 10}%`;

                    return (
                      <div
                        key={ch.id}
                        className={`rounded-2xl transition-all duration-200 border bg-white dark:bg-card overflow-hidden shadow-xs ${
                          isExpanded
                            ? 'border-black dark:border-white shadow-md'
                            : 'border-zinc-200 dark:border-border hover:border-zinc-400 dark:hover:border-zinc-700'
                        }`}
                      >
                        {/* Main Row */}
                        <div
                          onClick={() => setExpandedChallengeId(isExpanded ? null : ch.id)}
                          className="p-4 sm:p-5 cursor-pointer"
                        >
                          {/* Desktop Grid */}
                          <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-3">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-foreground hover:underline">
                                  {ch.name}
                                </span>
                                {ch.is_best_seller && (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-black text-white dark:bg-white dark:text-black">
                                    BEST SELLER
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span className="font-semibold text-foreground">
                                  {ch.steps === 0 ? 'Instant Funding' : `${ch.steps}-Step Evaluation`}
                                </span>
                                <span>•</span>
                                <span className="capitalize">{ch.category || 'Forex'}</span>
                              </div>
                            </div>

                            <div className="col-span-2 text-center">
                              <span className="font-mono font-extrabold text-base text-foreground">
                                ${ch.account_size.toLocaleString('en-US')}
                              </span>
                            </div>

                            <div className="col-span-2 text-center">
                              <span className="font-mono font-bold text-sm text-foreground">{targetStr}</span>
                            </div>

                            <div className="col-span-1 text-center">
                              <span className="font-mono font-bold text-sm text-foreground">{ddStr}</span>
                            </div>

                            <div className="col-span-1 text-center">
                              <span className="font-mono font-extrabold text-sm text-foreground">
                                {ch.profit_split_pct}%
                              </span>
                            </div>

                            <div className="col-span-3 flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                              <div className="text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <span className="font-mono font-extrabold text-base text-foreground">
                                    ${ch.price}
                                  </span>
                                  {originalPrice > ch.price && (
                                    <span className="text-[11px] font-mono text-muted-foreground line-through">
                                      ${originalPrice}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground">
                                  Code: <span className="font-mono text-foreground font-extrabold">{ch.coupon_code || 'EMPIRE'}</span>
                                </span>
                              </div>

                              <a
                                href={ch.buy_url || firm.buy_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
                              >
                                Buy Challenge
                              </a>

                              <button
                                type="button"
                                onClick={() => setExpandedChallengeId(isExpanded ? null : ch.id)}
                                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Mobile View */}
                          <div className="lg:hidden space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-xs font-bold text-muted-foreground block">
                                  ${(ch.account_size / 1000).toFixed(0)}K Account
                                </span>
                                <h3 className="font-bold text-foreground text-sm">{ch.name}</h3>
                              </div>
                              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-xs font-mono font-bold text-foreground">
                                {ch.steps === 0 ? 'Instant' : `${ch.steps}-Step`}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-center text-xs">
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Target</span>
                                <span className="font-bold text-foreground">{targetStr}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Max DD</span>
                                <span className="font-bold text-foreground">{ch.max_loss_limit_pct}%</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Split</span>
                                <span className="font-bold text-foreground">{ch.profit_split_pct}%</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                              <div>
                                <span className="text-base font-extrabold text-foreground">${ch.price}</span>
                                {originalPrice > ch.price && (
                                  <span className="text-xs text-muted-foreground line-through ml-1">${originalPrice}</span>
                                )}
                              </div>
                              <a
                                href={ch.buy_url || firm.buy_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black text-xs font-semibold"
                              >
                                Buy Challenge
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Rules Drawer */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs space-y-4 animate-in fade-in duration-150">
                            <div>
                              <h4 className="font-bold text-foreground text-xs uppercase tracking-tight mb-2">
                                Account Rules & Trading Parameters
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-muted-foreground">
                                <div>
                                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Consistency Rule</span>
                                  <strong className="text-foreground">{ch.consistency_rule || 'No Consistency Rule'}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Max Risk / Trade</span>
                                  <strong className="text-foreground font-mono">{ch.max_risk_per_trade || '2% / Trade'}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Inactivity Period</span>
                                  <strong className="text-foreground font-mono">{ch.inactivity_period || '30 Days'}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Leverage</span>
                                  <strong className="text-foreground font-mono">{ch.leverage || '1:100'}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">News Trading</span>
                                  <strong className="text-foreground">{ch.news_trading || 'YES / Allowed'}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Overnight & Weekend</span>
                                  <strong className="text-foreground">{ch.overnight_weekend || 'YES | YES'}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">EA & Algo</span>
                                  <strong className="text-foreground">{ch.ea_algo_trading || 'YES | YES'}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Drawdown Model</span>
                                  <strong className="text-foreground">{ch.loss_type || 'Static'}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Dedicated Crypto Parameters if Applicable */}
                            {ch.category === 'crypto' && (
                              <div className="p-3 rounded-xl bg-white dark:bg-card border border-zinc-200 dark:border-border space-y-1.5">
                                <span className="font-bold text-[11px] text-foreground uppercase tracking-tight flex items-center gap-1.5">
                                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold">
                                    ₿
                                  </span>
                                  Dedicated Crypto Challenge Parameters
                                </span>
                                <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                                  <div>
                                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">MAX Leverage</span>
                                    <strong className="text-foreground font-mono">{ch.crypto_max_leverage || '1:5'}</strong>
                                  </div>
                                  <div>
                                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Max Open Positions</span>
                                    <strong className="text-foreground font-mono">{ch.crypto_max_open_positions || '5 Positions'}</strong>
                                  </div>
                                  <div>
                                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Total Notional Exposure</span>
                                    <strong className="text-foreground font-mono">{ch.crypto_total_notional_exposure || '$250,000'}</strong>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Tab 3: Offers */}
          {activeTab === 'offers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {firmDeals.map((deal) => (
                <div key={deal.id} className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-extrabold text-foreground">{deal.discount_label}</h3>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-300/40">
                      -{deal.discount_pct}% OFF
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{deal.description}</p>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-foreground">{deal.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(deal.code)}
                      className="px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {effectiveReviews.map((rev) => (
                  <div key={rev.id} className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: rev.overall_rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">{rev.created_at}</span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{rev.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">"{rev.body}"</p>
                    <div className="text-xs text-muted-foreground font-medium pt-1">
                      By <strong className="text-foreground">{rev.full_name}</strong> {rev.is_verified_trader && <span className="text-emerald-600 dark:text-emerald-400 font-bold">(Verified Trader)</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </TooltipProvider>
  );
}
