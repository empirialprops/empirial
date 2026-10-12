'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Layers,
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronDown,
  Globe,
  Calendar,
  DollarSign,
  Clock,
  ArrowRight,
  Sparkles,
  Check,
  Copy,
  Menu,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { MOCK_REVIEWS } from '@/lib/data/reviews-data';
import { Firm, Review, Challenge, Deal } from '@/lib/types';
import { getFirms, getReviews, getChallenges, getDeals } from '@/lib/firebase/services';
import { getStoredFirms } from '@/lib/utils/firms-store';
import { getStoredChallenges } from '@/lib/utils/challenges-store';
import { getStoredDeals } from '@/lib/utils/deals-store';
import { calculateFirmMetrics } from '@/lib/utils/rating-calculator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

type SortMode = 'all' | 'popular' | 'best-value';

// Helper to derive active discount percentage and label dynamically from firm, deals, challenges, and custom fields
function resolveFirmDiscount(
  firm: Firm,
  allChallenges: Challenge[] = [],
  allDeals: Deal[] = []
): { discountPct: number | null; discountLabel: string; couponCode: string } {
  const firmDeals = allDeals.filter((d) => d.firm_id === firm.id || d.firm_slug === firm.slug);
  const firmChallenges = allChallenges.filter((c) => c.firm_id === firm.id || c.firm_slug === firm.slug);
  const couponCode = firm.coupon_code_custom || firmDeals[0]?.code || firmChallenges[0]?.coupon_code || 'EMPIRE';

  // 1. Explicit firm discount_pct (from admin input or firm config)
  if (firm.discount_pct !== undefined && firm.discount_pct !== null && firm.discount_pct > 0) {
    const label = firm.discount_label_custom && !firm.discount_label_custom.includes('20% OFF')
      ? firm.discount_label_custom
      : `${firm.discount_pct}% OFF`;
    return { discountPct: firm.discount_pct, discountLabel: label, couponCode };
  }

  // 2. Matching Deal discount
  if (firmDeals.length > 0 && firmDeals[0]?.discount_pct && firmDeals[0].discount_pct > 0) {
    const pct = firmDeals[0].discount_pct;
    return { discountPct: pct, discountLabel: `${pct}% OFF`, couponCode };
  }

  // 3. Matching Challenge discount
  const chWithDisc = firmChallenges.find((c) => c.discount_pct && c.discount_pct > 0);
  if (chWithDisc?.discount_pct) {
    return { discountPct: chWithDisc.discount_pct, discountLabel: `${chWithDisc.discount_pct}% OFF`, couponCode };
  }

  // 4. Parse from discount_label_custom if present
  if (firm.discount_label_custom) {
    const match = firm.discount_label_custom.match(/(\d+)%/);
    if (match) {
      const pct = parseInt(match[1], 10);
      return { discountPct: pct, discountLabel: firm.discount_label_custom, couponCode };
    }
    return { discountPct: null, discountLabel: firm.discount_label_custom, couponCode };
  }

  // 5. No discount input (0% or missing)
  return {
    discountPct: null,
    discountLabel: couponCode ? `CODE: ${couponCode}` : 'CLAIM',
    couponCode,
  };
}

export function FirmsClient() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('all');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [minAllocation, setMinAllocation] = useState<number>(0);

  const [hoveredFirmId, setHoveredFirmId] = useState<string | null>(null);
  const [expandedFirmId, setExpandedFirmId] = useState<string | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Discount code copying & validation states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [hasCopiedCodes, setHasCopiedCodes] = useState<Record<string, boolean>>({});
  const [shakingFirmId, setShakingFirmId] = useState<string | null>(null);
  const [warningFirmId, setWarningFirmId] = useState<string | null>(null);

  const handleMouseEnterFirm = (id: string) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredFirmId(id);
  };

  const handleMouseLeaveFirm = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = setTimeout(() => {
      setHoveredFirmId(null);
    }, 300); // 300ms smooth stay duration after removing mouse pointer
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [firmsData, reviewsData, challsData, dealsData] = await Promise.all([
          getFirms(),
          getReviews(),
          getChallenges(),
          getDeals(),
        ]);
        if (firmsData && firmsData.length > 0) {
          const uniqueFirms = Array.from(new Map(firmsData.map((f) => [f.id || f.slug, f])).values());
          setFirms(uniqueFirms);
        } else {
          setFirms(getStoredFirms());
        }
        if (reviewsData && reviewsData.length > 0) {
          setAllReviews(reviewsData);
        } else {
          setAllReviews(MOCK_REVIEWS);
        }
        if (challsData && challsData.length > 0) {
          setChallenges(challsData);
        } else {
          setChallenges(getStoredChallenges());
        }
        if (dealsData && dealsData.length > 0) {
          setDeals(dealsData);
        } else {
          setDeals(getStoredDeals());
        }
      } catch (err) {
        console.error('Failed to fetch data from Firestore:', err);
        setFirms(getStoredFirms());
        setAllReviews(MOCK_REVIEWS);
        setChallenges(getStoredChallenges());
        setDeals(getStoredDeals());
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Listen for real-time firm, challenge, and deal updates from admin edits
  useEffect(() => {
    const handleFirmsChanged = (e: any) => {
      const list = e.detail || getStoredFirms();
      if (list && list.length > 0) {
        const unique = Array.from(new Map(list.map((f: Firm) => [f.id || f.slug, f])).values()) as Firm[];
        setFirms(unique);
      }
    };
    const handleChallengesChanged = (e: any) => {
      const list = e.detail || getStoredChallenges();
      if (list) setChallenges(list);
    };
    const handleDealsChanged = (e: any) => {
      const list = e.detail || getStoredDeals();
      if (list) setDeals(list);
    };

    window.addEventListener('empirial_firms_changed', handleFirmsChanged);
    window.addEventListener('empirial_challenges_changed', handleChallengesChanged);
    window.addEventListener('empirial_deals_changed', handleDealsChanged);

    return () => {
      window.removeEventListener('empirial_firms_changed', handleFirmsChanged);
      window.removeEventListener('empirial_challenges_changed', handleChallengesChanged);
      window.removeEventListener('empirial_deals_changed', handleDealsChanged);
    };
  }, []);

  // Compute live review aggregates and real discounts for each firm
  const syncedFirms = useMemo(() => {
    return firms.map((firm) => {
      const metrics = calculateFirmMetrics(firm, allReviews);
      const discountInfo = resolveFirmDiscount(metrics.firm, challenges, deals);
      return {
        ...metrics.firm,
        discount_pct: discountInfo.discountPct ?? metrics.firm.discount_pct,
        discount_label_custom: discountInfo.discountLabel,
        coupon_code_custom: discountInfo.couponCode,
      };
    });
  }, [firms, allReviews, challenges, deals]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedPlatform !== 'all') count++;
    if (selectedModel !== 'all') count++;
    if (minAllocation > 0) count++;
    return count;
  }, [selectedPlatform, selectedModel, minAllocation]);

  const handleResetFilters = () => {
    setSelectedPlatform('all');
    setSelectedModel('all');
    setMinAllocation(0);
    setQuery('');
  };

  const handleCopyCode = (code: string, firmId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(code);
      setHasCopiedCodes((prev) => ({ ...prev, [firmId]: true }));
      setCopiedCode(firmId);
      setWarningFirmId(null);

      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([40, 60, 40]);
        } catch (_) { }
      }

      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const getFirmBuyUrl = (firm: Firm): string => {
    if (firm.buy_url && firm.buy_url.startsWith('http')) {
      return firm.buy_url;
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
    return slugToUrlMap[firm.id] || slugToUrlMap[firm.slug] || `https://${firm.slug}.com?ref=empirial`;
  };

  const handleBuyChallenge = (e: React.MouseEvent, firm: Firm) => {
    e.stopPropagation();
    if (!hasCopiedCodes[firm.id]) {
      e.preventDefault();
      // Trigger vibrating shake animation and show warning alert
      setShakingFirmId(firm.id);
      setWarningFirmId(firm.id);

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 50, 60, 50, 80]);
        } catch (_) { }
      }

      setTimeout(() => setShakingFirmId(null), 650);
      setTimeout(() => setWarningFirmId(null), 4000);
      return;
    }

    // Code copied: redirect user to main official Firm site in new tab
    if (typeof window !== 'undefined') {
      const targetUrl = getFirmBuyUrl(firm);
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Filter and Sort Firms
  const processedFirms = useMemo(() => {
    const list = syncedFirms.filter((f) => {
      // 1. Search Query
      if (query) {
        const q = query.toLowerCase();
        const matchName = f.name.toLowerCase().includes(q);
        const matchPlatforms = f.platforms?.toLowerCase().includes(q);
        const matchCategory = f.category?.toLowerCase().includes(q);
        const matchHq = f.headquarters?.toLowerCase().includes(q);
        if (!matchName && !matchPlatforms && !matchCategory && !matchHq) {
          return false;
        }
      }

      // 2. Category Tab
      if (selectedCategory !== 'all' && f.category !== selectedCategory) {
        return false;
      }

      // 3. Platform Filter
      if (selectedPlatform !== 'all') {
        const platformIds = f.platform_ids || [];
        if (!platformIds.includes(selectedPlatform)) {
          return false;
        }
      }

      // 4. Model Filter
      if (selectedModel !== 'all') {
        const models = f.models || [];
        const hasModel = models.some((m) => m.toLowerCase().includes(selectedModel.toLowerCase()));
        if (!hasModel) return false;
      }

      // 5. Min Allocation Filter
      if (minAllocation > 0) {
        const allocNum = parseInt(f.max_allocation.replace(/[^0-9]/g, ''), 10) || 0;
        if (allocNum < minAllocation) return false;
      }

      return true;
    });

    // Sort order
    if (sortMode === 'popular') {
      // Highest reviews & ratings first
      list.sort((a, b) => b.review_count - a.review_count || b.rating - a.rating);
    } else if (sortMode === 'best-value') {
      // Highest discount percentage first
      list.sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
    }

    return list;
  }, [syncedFirms, query, selectedCategory, selectedPlatform, selectedModel, minAllocation, sortMode]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4 min-h-screen flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Loading audited firms matrix...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background w-full text-foreground transition-colors duration-200 overflow-x-clip">
      {/* Continuous Atmospheric Tilted Greenish Sky-Blue Light Beam */}
      <div className="absolute top-0 inset-x-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="relative w-full max-w-5xl mx-auto h-full flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.1, ease: "easeOut" }}
            className="absolute -top-12 sm:-top-20 right-0 sm:right-6 md:right-12 w-20 sm:w-28 md:w-36 h-[2400px] sm:h-[3200px] lg:h-[4000px] bg-gradient-to-b from-[#00e5c9] from-0% via-[#06b6d4]/65 via-35% to-transparent to-85% blur-[75px] sm:blur-[90px] rounded-full rotate-[28deg] sm:rotate-[32deg] origin-top will-change-transform opacity-75 dark:opacity-65"
          />
        </div>
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Header (Black & White Theme - Strict RULE:BW) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
              LIST OF ALL VERIFIED FIRMS
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/compare"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800 text-xs sm:text-sm font-medium transition-all shadow-xs"
            >
              <Layers className="w-4 h-4" />
              <span>Compare Firms</span>
            </Link>
          </div>
        </div>

        {/* Main Filter & Search Control Bar (Translucent in white theme) */}
        <div className="space-y-3">
          <div className="bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-2xl p-3.5 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 shadow-xs">
            {/* Left: Search Input & Hamburger Filter Button */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto">
              {/* Filter Toggle Button with Hamburger Icon */}
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer shadow-xs shrink-0 ${isFilterDrawerOpen || activeFilterCount > 0
                    ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold'
                    : 'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800'
                  }`}
              >
                <Menu className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Search Input */}
              <div className="relative flex-1 sm:w-72 lg:w-80">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search verified firms, platforms..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Middle: Asset Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {[
                { label: 'All Firms', val: 'all' },
                { label: 'Forex', val: 'forex' },
                { label: 'Futures', val: 'futures' },
                { label: 'Crypto', val: 'crypto' },
              ].map((cat) => (
                <button
                  key={cat.val}
                  onClick={() => setSelectedCategory(cat.val)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${selectedCategory === cat.val
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-foreground dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-foreground border border-transparent'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Right: Quick Sort Filter Buttons (ALL, Popular Firm, Best Value Firm) */}
            <div className="flex items-center gap-1.5 sm:gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800 flex-wrap">
              {/* ALL (Normal List) */}
              <button
                type="button"
                onClick={() => setSortMode('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${sortMode === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-foreground dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-foreground border border-transparent'
                  }`}
              >
                ALL
              </button>

              {/* Popular Firm */}
              <button
                type="button"
                onClick={() => setSortMode('popular')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${sortMode === 'popular'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-foreground dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-foreground border border-transparent'
                  }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Popular Firm</span>
              </button>

              {/* Best Value Firm (Max Discount) */}
              <button
                type="button"
                onClick={() => setSortMode('best-value')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${sortMode === 'best-value'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-foreground dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-foreground border border-transparent'
                  }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Best Value Firm</span>
              </button>
            </div>
          </div>

          {/* Expandable Filter Drawer (Hamburger Menu Details) */}
          <AnimatePresence>
            {isFilterDrawerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-foreground" />
                    <span className="text-xs sm:text-sm font-bold text-foreground">Advanced Directory Filters</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                </div>

                {/* Filter Grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* 1. Platforms Filter */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Platform
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'All Platforms' },
                        { id: 'mt5', label: 'MetaTrader 5' },
                        { id: 'ctrader', label: 'cTrader' },
                        { id: 'match-trader', label: 'Match-Trader' },
                        { id: 'tradelocker', label: 'TradeLocker' },
                        { id: 'ninjatrader', label: 'NinjaTrader' },
                        { id: 'tradovate', label: 'Tradovate' },
                        { id: 'tradingview', label: 'TradingView' },
                        { id: 'bookmap', label: 'Bookmap' },
                        { id: 'atas', label: 'ATAS' },
                        { id: 'multicharts', label: 'MultiCharts' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPlatform(p.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${selectedPlatform === p.id
                              ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                            }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Evaluation Model Filter */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Evaluation Model
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: 'All Models' },
                        { id: '1-step', label: '1-Step Challenge' },
                        { id: '2-step', label: '2-Step Evaluation' },
                        { id: 'instant', label: 'Instant Funding' },
                        { id: 'combine', label: 'Futures Combine' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedModel(m.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${selectedModel === m.id
                              ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                            }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Minimum Allocation Filter */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Max Capital Allocation
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { val: 0, label: 'Any Allocation' },
                        { val: 1000000, label: '$1,000,000+' },
                        { val: 2000000, label: '$2,000,000+' },
                        { val: 4000000, label: '$4,000,000+' },
                        { val: 6000000, label: '$6,000,000+' },
                      ].map((alloc) => (
                        <button
                          key={alloc.val}
                          type="button"
                          onClick={() => setMinAllocation(alloc.val)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${minAllocation === alloc.val
                              ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                            }`}
                        >
                          {alloc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Firms Ranking Rows (Table / Columns and Rows System with Fluid Filtering Animation) */}
        <div className="space-y-4">
          {/* Table Column Headers (Desktop) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-3">Firm</div>
            <div className="col-span-2">Rank / Reviews</div>
            <div className="col-span-1 text-center">Assets</div>
            <div className="col-span-2 text-center">Platforms</div>
            <div className="col-span-2 text-center">Max Allocation</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Rows List with Smooth Framer Motion layout & stagger animation */}
          <TooltipProvider>
            <div className="space-y-3.5">
              <AnimatePresence mode="popLayout">
                {processedFirms.length > 0 ? (
                  processedFirms.map((firm) => {
                    const isHovered = hoveredFirmId === firm.id;
                    const isExpanded = expandedFirmId === firm.id;
                    const hasCopied = hasCopiedCodes[firm.id];
                    const isCopiedNow = copiedCode === firm.id;
                    const isShaking = shakingFirmId === firm.id;
                    const hasWarning = warningFirmId === firm.id;

                    // Robust resolution of platform keys from both platform_ids and platforms text string
                    const resolvedPlatformKeys = (() => {
                      const keysSet = new Set<string>();
                      if (firm.platform_ids && firm.platform_ids.length > 0) {
                        firm.platform_ids.forEach((id) => {
                          const clean = id.toLowerCase().trim();
                          if (PLATFORM_DATA[clean]) keysSet.add(clean);
                        });
                      }
                      if (firm.platforms) {
                        const parts = firm.platforms.split(/[,/&]+/);
                        parts.forEach((part) => {
                          const p = part.toLowerCase().trim();
                          if (p.includes('mt5') || p.includes('metatrader 5')) keysSet.add('mt5');
                          else if (p.includes('mt4') || p.includes('metatrader 4')) keysSet.add('mt5');
                          else if (p.includes('ctrader')) keysSet.add('ctrader');
                          else if (p.includes('match')) keysSet.add('match-trader');
                          else if (p.includes('tradelocker')) keysSet.add('tradelocker');
                          else if (p.includes('ninjatrader')) keysSet.add('ninjatrader');
                          else if (p.includes('tradovate')) keysSet.add('tradovate');
                          else if (p.includes('tradingview')) keysSet.add('tradingview');
                          else if (p.includes('bookmap')) keysSet.add('bookmap');
                          else if (p.includes('atas')) keysSet.add('atas');
                          else if (p.includes('deepcharts')) keysSet.add('deepcharts');
                          else if (p.includes('multicharts')) keysSet.add('multicharts');
                        });
                      }
                      if (keysSet.size === 0) {
                        keysSet.add('mt5');
                        keysSet.add('ctrader');
                      }
                      return Array.from(keysSet);
                    })();

                    return (
                      <motion.div
                        layout="position"
                        key={firm.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        onMouseEnter={() => handleMouseEnterFirm(firm.id)}
                        onMouseLeave={handleMouseLeaveFirm}
                        className={`relative rounded-2xl transition-all duration-500 ease-in-out border ${
                          isExpanded || isHovered
                            ? 'border-black dark:border-white shadow-[0_0_20px_rgba(0,0,0,0.14)] dark:shadow-[0_0_25px_rgba(255,255,255,0.18)] bg-white/70 dark:bg-card backdrop-blur-md'
                            : 'border-zinc-200 dark:border-border hover:border-black dark:hover:border-white hover:shadow-[0_0_18px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_0_22px_rgba(255,255,255,0.16)] bg-white/60 dark:bg-card backdrop-blur-md'
                        }`}
                      >
                        {/* Main Card Content */}
                        <div className="p-4 sm:p-5 space-y-4">
                          {/* Top Header Row (Desktop View matching Image 1) */}
                          <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                            {/* 1. Firm Logo & Name */}
                            <div className="col-span-3 flex items-center gap-3.5">
                              <div className="shrink-0 w-11 h-11 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-1 overflow-hidden">
                                {firm.logo_url ? (
                                  <img
                                    src={firm.logo_url}
                                    alt={firm.name}
                                    className="h-8 w-auto max-w-[40px] object-contain rounded-md"
                                  />
                                ) : (
                                  <span className="font-extrabold text-sm text-foreground">
                                    {firm.name.substring(0, 3).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <Link href={`/firms/${firm.slug}`}>
                                    <h2 className="text-sm sm:text-base font-bold text-foreground hover:underline">
                                      {firm.name}
                                    </h2>
                                  </Link>
                                  {firm.is_verified && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs font-semibold bg-black text-white dark:bg-white dark:text-black">
                                        Verified Institutional Prop Firm
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <span className="text-[11px] text-muted-foreground">
                                  {firm.headquarters || 'Global'}
                                </span>
                              </div>
                            </div>

                            {/* 2. Rank / Reviews (Green Star Design) */}
                            <div className="col-span-2 flex items-center gap-2">
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 dark:border-emerald-600/30 text-emerald-600 dark:text-emerald-400">
                                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                                <span className="text-xs font-bold">{firm.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                ({firm.review_count.toLocaleString('en-US')} reviews)
                              </span>
                            </div>

                            {/* 3. Assets / Category */}
                            <div className="col-span-1 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
                                {firm.category}
                              </span>
                            </div>

                            {/* Platform Logos: Round edged (rounded-full/rounded-lg) with hover zoom scale-125 & top tooltip */}
                            <div className="col-span-2 flex items-center justify-center gap-2 flex-wrap">
                              {resolvedPlatformKeys.map((pid) => {
                                const p = PLATFORM_DATA[pid] || { name: pid, logo: '/platforms/mt5.png' };
                                return (
                                  <Tooltip key={pid}>
                                    <TooltipTrigger asChild>
                                      <motion.div
                                        whileHover={{ scale: 1.25 }}
                                        transition={{ duration: 0.18 }}
                                        className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-1 shadow-2xs cursor-pointer hover:z-30 relative"
                                      >
                                        <img
                                          src={p.logo}
                                          alt={p.name}
                                          className="h-4 w-4 object-contain rounded-full"
                                        />
                                      </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[11px] font-bold bg-black text-white dark:bg-white dark:text-black shadow-lg">
                                      {p.name}
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>

                            {/* 5. Max Allocation */}
                            <div className="col-span-2 text-center">
                              <div className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
                                {firm.max_allocation}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium block">
                                Split {firm.profit_split_custom}
                              </span>
                            </div>

                            {/* 6. Action Buttons */}
                            <div className="col-span-2 flex items-center justify-end gap-2">
                              {/* Coupon Code Button */}
                              <motion.button
                                type="button"
                                animate={isShaking ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                onClick={(e) => handleCopyCode(firm.coupon_code_custom || 'EMPIRE', firm.id, e)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap ${hasCopied
                                    ? 'border-black dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-black font-bold'
                                    : 'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800'
                                  }`}
                              >
                                {isCopiedNow ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : hasCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Code Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>{firm.discount_label_custom || (firm.discount_pct ? `${firm.discount_pct}% OFF` : 'CLAIM')}</span>
                                  </>
                                )}
                              </motion.button>

                              {/* Buy Challenge Button */}
                              <button
                                type="button"
                                onClick={(e) => handleBuyChallenge(e, firm)}
                                className="px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                Buy
                              </button>

                              {/* Compare Link */}
                              <Link
                                href={`/compare?firms=${firm.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                title="Compare this firm"
                              >
                                <Layers className="w-4 h-4" />
                              </Link>

                              {/* Accordion Expand / Collapse Indicator */}
                              <button
                                type="button"
                                onClick={() => setExpandedFirmId(isExpanded ? null : firm.id)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                title={isExpanded ? 'Collapse details' : 'Expand full specs'}
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded || isHovered ? 'rotate-180 text-foreground' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Mobile Header View */}
                          <div className="lg:hidden flex flex-col space-y-3.5">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-1">
                                  {firm.logo_url ? (
                                    <img
                                      src={firm.logo_url}
                                      alt={firm.name}
                                      className="h-7 w-auto max-w-[36px] object-contain rounded-md"
                                    />
                                  ) : (
                                    <span className="font-extrabold text-xs text-foreground">
                                      {firm.name.substring(0, 3)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h2 className="text-sm font-bold text-foreground">{firm.name}</h2>
                                    {firm.is_verified && (
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    )}
                                  </div>
                                  <span className="text-[11px] text-muted-foreground">{(firm.category || '').toUpperCase()}</span>
                                </div>
                              </div>

                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 text-emerald-600 dark:text-emerald-400">
                                <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                                <span className="text-xs font-bold">{firm.rating.toFixed(1)}</span>
                                <span className="text-[10px] text-muted-foreground font-normal ml-0.5">
                                  ({firm.review_count.toLocaleString('en-US')})
                                </span>
                              </div>
                            </div>

                            {/* Mobile Platform Logos with Zoom (Round edged) */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-muted-foreground mr-1">Platforms:</span>
                              {resolvedPlatformKeys.map((pid) => {
                                const p = PLATFORM_DATA[pid] || { name: pid, logo: '/platforms/mt5.png' };
                                return (
                                  <Tooltip key={pid}>
                                    <TooltipTrigger asChild>
                                      <motion.div
                                        whileHover={{ scale: 1.25 }}
                                        className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-0.5 cursor-pointer"
                                      >
                                        <img src={p.logo} alt={p.name} className="h-3.5 w-3.5 object-contain rounded-full" />
                                      </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black">
                                      {p.name}
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>

                            {/* Mobile Action Buttons */}
                            <div className="flex items-center gap-2 pt-1">
                              <motion.button
                                type="button"
                                animate={isShaking ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                onClick={(e) => handleCopyCode(firm.coupon_code_custom || 'EMPIRE', firm.id, e)}
                                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs ${hasCopied
                                    ? 'border-black dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-black font-bold'
                                    : 'border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-card dark:text-foreground'
                                  }`}
                              >
                                {isCopiedNow ? 'Copied!' : hasCopied ? 'Code Copied ✓' : (firm.discount_label_custom || (firm.discount_pct ? `${firm.discount_pct}% OFF` : 'CLAIM'))}
                              </motion.button>

                              <button
                                type="button"
                                onClick={(e) => handleBuyChallenge(e, firm)}
                                className="flex-1 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer shadow-xs text-center"
                              >
                                Buy
                              </button>

                              <Link
                                href={`/compare?firms=${firm.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card text-foreground"
                              >
                                <Layers className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Smooth Accordion Dropdown Menu (Triggered when user hovers over card OR clicks expand) */}
                        <AnimatePresence>
                          {(isHovered || isExpanded) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-b-2xl pt-2 pb-1"
                            >
                              <div className="p-4 sm:p-5 space-y-4">
                                {/* Middle Row (4 Stat Cards - Exact Image Design) */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                  {/* 1. Headquarters */}
                                  <div className="p-3 rounded-xl bg-white dark:bg-card border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 shadow-2xs">
                                    <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                                        HEADQUARTERS
                                      </span>
                                      <span className="text-xs font-extrabold text-foreground">
                                        {firm.headquarters || 'Dubai, UAE'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 2. Experience */}
                                  <div className="p-3 rounded-xl bg-white dark:bg-card border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 shadow-2xs">
                                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                                        EXPERIENCE
                                      </span>
                                      <span className="text-xs font-extrabold text-foreground">
                                        {firm.years_working || `Est. ${firm.founded_year || '2024'}`}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 3. Total Payouts */}
                                  <div className="p-3 rounded-xl bg-white dark:bg-card border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 shadow-2xs">
                                    <DollarSign className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                                        TOTAL PAYOUTS
                                      </span>
                                      <span className="text-xs font-extrabold text-foreground">
                                        {firm.total_payouts || '$15,000,000+'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 4. Avg Payout SLA */}
                                  <div className="p-3 rounded-xl bg-white dark:bg-card border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 shadow-2xs">
                                    <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                                        AVG PAYOUT SLA
                                      </span>
                                      <span className="text-xs font-extrabold text-foreground">
                                        {firm.avg_payout_time || '8-24 Hours'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Bottom Row (Evaluation Models Pills & View Full Profile Link) */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                                  {/* Models */}
                                  <div className="flex items-center gap-2 flex-wrap text-xs">
                                    <span className="text-muted-foreground font-semibold">Evaluation Models:</span>
                                    {(firm.models || ['1-Step Challenge', '2-Step Evaluation', 'Instant Model']).map((model) => (
                                      <span
                                        key={model}
                                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-card text-foreground border border-zinc-200 dark:border-zinc-800 shadow-2xs"
                                      >
                                        {model}
                                      </span>
                                    ))}
                                  </div>

                                  {/* View Full Profile */}
                                  <div className="flex items-center gap-3">
                                    <Link
                                      href={`/firms/${firm.slug}`}
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:underline group"
                                    >
                                      <span>View Full Profile</span>
                                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Warning Notification Toast */}
                        <AnimatePresence>
                          {hasWarning && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.2 }}
                              className="w-full text-center text-[11px] sm:text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-md flex items-center justify-center gap-1 mt-2"
                            >
                              <span>⚠️ Kindly Copy code for Max Discount</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-12 text-center space-y-3"
                  >
                    <p className="text-base font-semibold text-foreground">No verified firms match your filters.</p>
                    <p className="text-xs text-muted-foreground">Try adjusting your search criteria, platform selection, or category.</p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All Filters</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
