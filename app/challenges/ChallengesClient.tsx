'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  Star,
  Sparkles,
  ShieldCheck,
  Calendar,
  DollarSign,
  Clock,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Copy,
  Check,
  Layers,
  Percent,
} from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { MOCK_CHALLENGES } from '@/lib/data/challenges-data';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { Challenge, Review } from '@/lib/types';
import { getChallenges, getFirms, getReviews } from '@/lib/firebase/services';
import { calculateFirmMetrics } from '@/lib/utils/rating-calculator';

// Map firm IDs to authentic uploaded local logo assets in /logos/
const FIRM_LOGOS: Record<string, string> = {
  'nys-capital': '/logos/nys.png',
  'nys': '/logos/nys.png',
  'ck-capital': '/logos/ck-capital.avif',
  'alpha-capital': '/logos/alpha-capital.png',
  'shark-funded': '/logos/shark-funded.webp',
  'pipstone': '/logos/pipstone.png',
  'gtf': '/logos/gtf.svg',
  'goat-funded': '/logos/gtf.svg',
  'goat-funded-trader': '/logos/gtf.svg',
  'sure-leverage': '/logos/sure-leverage.jpg',
  'sure-leverage-funding': '/logos/sure-leverage.jpg',
  'my-funded-fx': '/logos/mff.svg',
  'ftmo': '/logos/ftmo.svg',
  'the-5ers': '/logos/5ers.svg',
  'the5ers': '/logos/5ers.svg',
  'funding-pips': '/logos/fundingpips.svg',
  'topstep': '/logos/topstep.svg',
  'apex': '/logos/apex.svg',
  'apex-trader-funding': '/logos/apex.svg',
  'fundednext': '/logos/fundednext.svg',
};

export function ChallengesClient() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [firms, setFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const firmParam = searchParams.get('firm');
  const stepParam = searchParams.get('step');

  const parseStepValue = useCallback((param: string | null): number | null => {
    if (param === null || param === undefined || param === '') return null;
    const lower = param.toLowerCase().trim();
    if (lower === 'instant' || lower === '0') return 0;
    if (lower === '1' || lower === '1-step' || lower === '1step') return 1;
    if (lower === '2' || lower === '2-step' || lower === '2step') return 2;
    if (lower === '3' || lower === '3-step' || lower === '3step') return 3;
    const num = parseInt(lower, 10);
    return isNaN(num) ? null : num;
  }, []);

  const [query, setQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Multi-select state
  const [selectedFirms, setSelectedFirms] = useState<string[]>(() => {
    if (firmParam) {
      const matched = MOCK_FIRMS.find((f) => f.id === firmParam || f.slug === firmParam);
      return [matched ? matched.id : firmParam];
    }
    return [];
  });

  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<number[]>(() => {
    const stepNum = parseStepValue(stepParam);
    return stepNum !== null ? [stepNum] : [];
  });

  useEffect(() => {
    if (firmParam) {
      const list = firms.length > 0 ? firms : MOCK_FIRMS;
      const matched = list.find((f) => f.id === firmParam || f.slug === firmParam);
      const targetId = matched ? matched.id : firmParam;
      setSelectedFirms([targetId]);
    }
  }, [firmParam, firms]);

  useEffect(() => {
    const stepNum = parseStepValue(stepParam);
    if (stepNum !== null) {
      setSelectedSteps([stepNum]);
    }
  }, [stepParam, parseStepValue]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortMode, setSortMode] = useState<'all' | 'popular' | 'best-value' | 'price-low' | 'price-high' | 'size-high'>('all');

  // Hover & Expand states
  const [hoveredChallengeId, setHoveredChallengeId] = useState<string | null>(null);
  const [expandedChallengeId, setExpandedChallengeId] = useState<string | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Copy Code & Shaking Vibration & Warning states
  const [hasCopiedCodes, setHasCopiedCodes] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [shakingChallengeId, setShakingChallengeId] = useState<string | null>(null);
  const [warningChallengeId, setWarningChallengeId] = useState<string | null>(null);

  const [allReviews, setAllReviews] = useState<Review[]>([]);

  const handleMouseEnterChallenge = (id: string) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredChallengeId(id);
  };

  const handleMouseLeaveChallenge = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = setTimeout(() => {
      setHoveredChallengeId(null);
    }, 300); // 300ms smooth stay duration after removing mouse pointer
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [challsData, firmsData, revsData] = await Promise.all([
          getChallenges(),
          getFirms(),
          getReviews()
        ]);
        if (challsData && challsData.length > 0) {
          const map = new Map<string, Challenge>();
          challsData.forEach((c) => {
            if (c.id) map.set(c.id, c);
          });
          MOCK_CHALLENGES.forEach((c) => {
            if (c.id && !map.has(c.id)) map.set(c.id, c);
          });
          setChallenges(Array.from(map.values()));
        } else {
          setChallenges(MOCK_CHALLENGES);
        }
        if (firmsData && firmsData.length > 0) {
          const map = new Map<string, any>();
          firmsData.forEach((f) => {
            const key = f.id || f.slug;
            if (key) map.set(key, f);
          });
          MOCK_FIRMS.forEach((f) => {
            const key = f.id || f.slug;
            if (key && !map.has(key)) map.set(key, f);
          });
          setFirms(Array.from(map.values()));
        } else {
          setFirms(MOCK_FIRMS);
        }
        if (revsData && revsData.length > 0) {
          setAllReviews(revsData);
        }
      } catch (err) {
        console.error('Failed to load challenges data:', err);
        setChallenges(MOCK_CHALLENGES);
        setFirms(MOCK_FIRMS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter options
  const firmOptions = useMemo(() => (firms.length > 0 ? firms : MOCK_FIRMS), [firms]);
  const sizeOptions = [50000, 80000, 100000, 150000, 200000];
  const stepOptions = [
    { label: '1-Step', val: 1 },
    { label: '2-Step', val: 2 },
    { label: '3-Step', val: 3 },
    { label: 'Instant Funding (0-Step)', val: 0 }
  ];

  const toggleMultiSelect = <T,>(item: T, list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedFirms([]);
    setSelectedSizes([]);
    setSelectedSteps([]);
    setSelectedCategory('all');
    setSortMode('all');
  };

  const handleCopyCode = (code: string, challengeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(code);
      setHasCopiedCodes((prev) => ({ ...prev, [challengeId]: true }));
      setCopiedCode(challengeId);
      setWarningChallengeId(null);

      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([40, 60, 40]);
        } catch (_) {}
      }

      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleBuyChallenge = (e: React.MouseEvent, ch: Challenge) => {
    e.stopPropagation();
    if (!hasCopiedCodes[ch.id]) {
      e.preventDefault();
      // Trigger vibrating shake animation on copy button and show warning alert
      setShakingChallengeId(ch.id);
      setWarningChallengeId(ch.id);

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 50, 60, 50, 80]);
        } catch (_) {}
      }

      setTimeout(() => setShakingChallengeId(null), 650);
      setTimeout(() => setWarningChallengeId(null), 4000);
      return;
    }

    // Code copied: open buy url
    if (typeof window !== 'undefined') {
      window.open(ch.buy_url || 'https://discord.gg/ww4dkeeZdp', '_blank', 'noopener,noreferrer');
    }
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedFirms.length +
    selectedSizes.length +
    selectedSteps.length +
    (query ? 1 : 0);

  // Process & Filter Challenges
  const processedChallenges = useMemo(() => {
    let list = challenges.filter((ch) => {
      // Search Query
      if (query) {
        const q = query.toLowerCase();
        const match =
          ch.name.toLowerCase().includes(q) ||
          ch.firm_name.toLowerCase().includes(q) ||
          (ch.coupon_code && ch.coupon_code.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Market Category
      if (selectedCategory !== 'all' && (ch.category || 'forex').toLowerCase() !== selectedCategory.toLowerCase()) return false;

      // Firms Multi-Select
      if (
        selectedFirms.length > 0 &&
        !selectedFirms.includes(ch.firm_id) &&
        (!ch.firm_slug || !selectedFirms.includes(ch.firm_slug)) &&
        (!ch.firm_name || !selectedFirms.some((sf) => sf.toLowerCase() === ch.firm_name.toLowerCase()))
      )
        return false;

      // Sizes Multi-Select
      if (selectedSizes.length > 0 && !selectedSizes.includes(ch.account_size)) return false;

      // Steps Multi-Select
      if (selectedSteps.length > 0 && !selectedSteps.includes(ch.steps)) return false;

      return true;
    });

    // Sorting Modes
    if (sortMode === 'popular') {
      list.sort((a, b) => (b.profit_split_pct || 0) - (a.profit_split_pct || 0));
    } else if (sortMode === 'best-value') {
      list.sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
    } else if (sortMode === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortMode === 'size-high') {
      list.sort((a, b) => b.account_size - a.account_size);
    }

    return list;
  }, [challenges, query, selectedCategory, selectedFirms, selectedSizes, selectedSteps, sortMode]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4 min-h-screen flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Loading challenges matrix...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 overflow-x-clip">
      {/* Continuous Atmospheric Tilted Red Light Beam (Exact diagonal beam like home page in Red) */}
      <div className="absolute top-0 inset-x-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="relative w-full max-w-5xl mx-auto h-full flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.1, ease: "easeOut" }}
            className="absolute -top-12 sm:-top-20 right-0 sm:right-6 md:right-12 w-24 sm:w-32 md:w-40 h-[2400px] sm:h-[3200px] lg:h-[4000px] bg-gradient-to-b from-[#ef4444] from-0% via-[#dc2626]/65 via-35% to-transparent to-85% blur-[75px] sm:blur-[90px] rounded-full rotate-[28deg] sm:rotate-[32deg] origin-top will-change-transform opacity-80 dark:opacity-65"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header - Strictly following RULE:BW typography */}
        <div className="text-center py-6 border-b border-zinc-200/80 dark:border-zinc-800 space-y-2">
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Prop Firm Challenges Comparison
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Compare verified evaluation challenge programs side-by-side with real-time specs, drawdown rules, discount codes, and buy links.
          </p>
        </div>

        {/* Controls Bar (Translucent in white theme for atmospheric glow) */}
        <div className="bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            {/* ≡ Filters Button */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer shadow-xs shrink-0 ${
                isFilterDrawerOpen || activeFilterCount > 0
                  ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-semibold'
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
                placeholder="Search verified challenges, firms..."
                className="w-full bg-zinc-50/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
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
              { label: 'All Markets', val: 'all' },
              { label: 'Forex', val: 'forex' },
              { label: 'Futures', val: 'futures' },
              { label: 'Crypto', val: 'crypto' },
            ].map((cat) => (
              <button
                key={cat.val}
                onClick={() => setSelectedCategory(cat.val)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.val
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                    : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/80 hover:text-foreground dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-foreground border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right: Quick Sort Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800 flex-wrap">
            <button
              type="button"
              onClick={() => setSortMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                sortMode === 'all'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                  : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/80 hover:text-foreground dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-foreground border border-transparent'
              }`}
            >
              ALL
            </button>

            <button
              type="button"
              onClick={() => setSortMode('popular')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                sortMode === 'popular'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                  : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/80 hover:text-foreground dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-foreground border border-transparent'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Popular Challenge</span>
            </button>

            <button
              type="button"
              onClick={() => setSortMode('best-value')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                sortMode === 'best-value'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                  : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/80 hover:text-foreground dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-foreground border border-transparent'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Best Value</span>
            </button>

            <button
              type="button"
              onClick={() => setSortMode(sortMode === 'price-low' ? 'price-high' : 'price-low')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                sortMode === 'price-low' || sortMode === 'price-high'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                  : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/80 hover:text-foreground dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-foreground border border-transparent'
              }`}
            >
              <span>{sortMode === 'price-high' ? 'Price: High to Low' : 'Price: Low to High'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Filter Drawer (Translucent in white theme) */}
        <AnimatePresence>
          {isFilterDrawerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden bg-white/80 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-foreground" />
                  <span className="text-xs sm:text-sm font-semibold text-foreground">Advanced Evaluation Filters</span>
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
                {/* 1. Prop Firms Filter */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Prop Firm
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {firmOptions.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleMultiSelect(f.id, selectedFirms, setSelectedFirms)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                          selectedFirms.includes(f.id)
                            ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                            : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Account Sizes Filter */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Account Size
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleMultiSelect(size, selectedSizes, setSelectedSizes)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                          selectedSizes.includes(size)
                            ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                            : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                        }`}
                      >
                        ${size.toLocaleString('en-US')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Steps Filter */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Evaluation Model
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {stepOptions.map((st) => (
                      <button
                        key={st.val}
                        type="button"
                        onClick={() => toggleMultiSelect(st.val, selectedSteps, setSelectedSteps)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                          selectedSteps.includes(st.val)
                            ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                            : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Challenges Rows Matrix */}
        <div className="space-y-4">
          {/* Table Column Headers (Desktop) */}
          <div className="hidden lg:grid grid-cols-12 gap-3 px-6 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider items-center">
            <div className="col-span-3">FIRM & REVIEWS</div>
            <div className="col-span-1 text-center">ACCOUNT SIZE</div>
            <div className="col-span-1 text-center">STEPS</div>
            <div className="col-span-2 text-center">PROFIT TARGET</div>
            <div className="col-span-1 text-center">DAILY / MAX DD</div>
            <div className="col-span-1 text-center">PROFIT SPLIT</div>
            <div className="col-span-3 text-right">CODE & BUY</div>
          </div>

          {/* Rows List with Smooth Framer Motion layout & translucent white theme styling */}
          <TooltipProvider>
            <div className="space-y-3.5">
              <AnimatePresence mode="popLayout">
                {processedChallenges.length > 0 ? (
                  processedChallenges.map((ch) => {
                    const isHovered = hoveredChallengeId === ch.id;
                    const isExpanded = expandedChallengeId === ch.id || isHovered;
                    const hasCopied = hasCopiedCodes[ch.id];
                    const isCopiedNow = copiedCode === ch.id;
                    const isShaking = shakingChallengeId === ch.id;
                    const hasWarning = warningChallengeId === ch.id;

                    const codeText = ch.coupon_code || 'EMPIRE';
                    const effectiveDiscountedPrice =
                      ch.discounted_price !== undefined
                        ? ch.discounted_price
                        : ch.discount_pct && ch.discount_pct > 0
                        ? Math.round(ch.price * (1 - ch.discount_pct / 100))
                        : ch.price;
                    const originalPrice =
                      effectiveDiscountedPrice < ch.price
                        ? ch.price
                        : ch.original_price || Math.round(ch.price * 1.25);
                    const targetStr = (ch.steps === 2 && ch.phase_2_target_pct && ch.phase_2_target_pct > 0)
                      ? `${ch.profit_target_pct ?? 0}% | ${ch.phase_2_target_pct}%`
                      : ch.steps === 0
                      ? 'None (Instant)'
                      : `${ch.profit_target_pct ?? 0}%`;
                    const ddStr = `${(ch.daily_loss_limit_pct === 0 || !ch.daily_loss_limit_pct) ? 'None' : ch.daily_loss_limit_pct + '%'} | ${ch.max_loss_limit_pct ?? 10}%`;

                    // Authentically resolved firm logo path and live ratings
                    const matchedFirm = firmOptions.find(
                      (f) =>
                        f.id === ch.firm_id ||
                        f.slug === ch.firm_slug ||
                        (f.name || '').toLowerCase() === (ch.firm_name || '').toLowerCase()
                    ) || MOCK_FIRMS.find(
                      (f) =>
                        f.id === ch.firm_id ||
                        f.slug === ch.firm_slug ||
                        (f.name || '').toLowerCase() === (ch.firm_name || '').toLowerCase()
                    ) || {
                      id: ch.firm_id,
                      name: ch.firm_name,
                      slug: ch.firm_slug,
                      rating: ch.rating || 4.8,
                      review_count: ch.review_count || 125,
                    };
                    const firmMetrics = calculateFirmMetrics(matchedFirm as any, allReviews);
                    const firmLogoSrc = FIRM_LOGOS[ch.firm_id] || ch.firm_logo || '/logos/nys.png';
                    const ratingVal = firmMetrics.rating;
                    const reviewCountVal = firmMetrics.reviewCount;

                    return (
                      <motion.div
                        layout="position"
                        key={ch.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        onMouseEnter={() => handleMouseEnterChallenge(ch.id)}
                        onMouseLeave={handleMouseLeaveChallenge}
                        onClick={() => setExpandedChallengeId(expandedChallengeId === ch.id ? null : ch.id)}
                        className={`relative rounded-2xl transition-all duration-500 ease-in-out border cursor-pointer ${
                          isExpanded
                            ? 'border-black dark:border-white shadow-[0_0_20px_rgba(0,0,0,0.12)] dark:shadow-[0_0_25px_rgba(255,255,255,0.16)] bg-white/65 dark:bg-card backdrop-blur-md'
                            : 'border-zinc-200/80 dark:border-border hover:border-black dark:hover:border-white hover:shadow-[0_0_18px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_0_22px_rgba(255,255,255,0.14)] bg-white/60 dark:bg-card backdrop-blur-md'
                        }`}
                      >
                        {/* Main Row Content */}
                        <div className="p-4 sm:p-5">
                          {/* Desktop View */}
                          <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
                            
                            {/* 1. Firm Logo & Name with Likes/Reviews Tab below */}
                            <div className="col-span-3 flex items-center gap-3">
                              <div className="shrink-0 w-11 h-11 rounded-lg bg-white/60 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center p-1 overflow-hidden">
                                <img
                                  src={firmLogoSrc}
                                  alt={ch.firm_name}
                                  className="h-8 w-auto max-w-[40px] object-contain rounded-md"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h2 className="text-sm sm:text-base font-bold text-foreground hover:underline truncate">
                                    {ch.firm_name}
                                  </h2>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs font-semibold bg-card border border-border text-foreground">
                                      Verified Institutional Prop Firm
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                
                                {/* Downside of Name: Likes Tab with Number of Reviews */}
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 dark:border-emerald-600/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                    <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                                    <span>{ratingVal.toFixed(1)}</span>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground font-medium">
                                    ({reviewCountVal.toLocaleString('en-US')} reviews)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* 2. Account Size */}
                            <div className="col-span-1 text-center">
                              <div className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
                                ${ch.account_size.toLocaleString('en-US')}
                              </div>
                            </div>

                            {/* 3. Steps */}
                            <div className="col-span-1 text-center">
                              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-100/80 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
                                {ch.steps === 0 ? 'Instant' : `${ch.steps}-Step`}
                              </span>
                            </div>

                            {/* 4. Profit Target ( X | X ) */}
                            <div className="col-span-2 text-center">
                              <div className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight">
                                {targetStr}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium block">
                                {ch.steps === 2 ? 'Phase 1 | Phase 2' : 'Target'}
                              </span>
                            </div>

                            {/* 5. Daily & Max DD ( X | X ) */}
                            <div className="col-span-1 text-center">
                              <div className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight">
                                {ddStr}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium block">
                                Daily | Max DD
                              </span>
                            </div>

                            {/* 6. Profit Split */}
                            <div className="col-span-1 text-center">
                              <div className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight">
                                Up to {ch.profit_split_pct}%
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium block">
                                Split
                              </span>
                            </div>

                            {/* 7. Code EMPIRE with Price & BUY Button */}
                            <div className="col-span-3 flex items-center justify-end gap-2.5">
                              {/* Price Display (Offered Price Upward + Cut Price Downside) */}
                              <div className="text-right shrink-0">
                                <div className="text-sm sm:text-base font-extrabold text-foreground tracking-tight leading-tight">
                                  ${effectiveDiscountedPrice.toLocaleString('en-US')}
                                </div>
                                <div className="text-[11px] line-through text-muted-foreground font-medium">
                                  ${originalPrice.toLocaleString('en-US')}
                                </div>
                              </div>

                              {/* Promo Code Copy Button with Shake Animation */}
                              <motion.button
                                type="button"
                                animate={isShaking ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                onClick={(e) => handleCopyCode(codeText, ch.id, e)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap ${
                                  hasCopied
                                    ? 'border-black dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-black font-bold'
                                    : 'border-zinc-200/80 bg-white/80 text-zinc-900 hover:bg-white dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800'
                                }`}
                              >
                                {isCopiedNow ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : hasCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{ch.discount_pct ? `${ch.discount_pct}% OFF` : '20% OFF'}</span>
                                  </>
                                )}
                              </motion.button>

                              {/* Buy Challenge Button (Locks until copied with shake vibration warning) */}
                              <button
                                type="button"
                                onClick={(e) => handleBuyChallenge(e, ch)}
                                className="px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                BUY
                              </button>

                              {/* Layer Details Toggle */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedChallengeId(expandedChallengeId === ch.id ? null : ch.id);
                                }}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <Layers className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Mobile View */}
                          <div className="lg:hidden flex flex-col space-y-3.5">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/60 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center p-1">
                                  <img
                                    src={firmLogoSrc}
                                    alt={ch.firm_name}
                                    className="h-7 w-auto object-contain rounded-md"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h2 className="text-sm font-bold text-foreground">
                                      {ch.firm_name}
                                    </h2>
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                      <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                                      <span>{ratingVal.toFixed(1)}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                      ({reviewCountVal.toLocaleString('en-US')} reviews)
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-extrabold text-foreground tracking-tight">
                                  ${effectiveDiscountedPrice.toLocaleString('en-US')}
                                </div>
                                <span className="text-[10px] text-muted-foreground line-through">
                                  ${originalPrice.toLocaleString('en-US')}
                                </span>
                              </div>
                            </div>

                            {/* Mobile Specs Summary */}
                            <div className="grid grid-cols-3 gap-2 py-1.5 px-2.5 rounded-xl bg-white/50 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/60 text-center text-xs">
                              <div>
                                <span className="text-[10px] text-muted-foreground block font-medium">Size & Model</span>
                                <span className="font-extrabold text-foreground tracking-tight">${ch.account_size.toLocaleString('en-US')}</span>
                                <span className="text-[10px] text-muted-foreground block">{ch.steps === 0 ? 'Instant' : `${ch.steps}-Step`}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block font-medium">Target & DD</span>
                                <span className="font-extrabold text-foreground tracking-tight">{targetStr}</span>
                                <span className="text-[10px] text-muted-foreground block">DD: {ddStr}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block font-medium">Profit Split</span>
                                <span className="font-extrabold text-foreground tracking-tight">{ch.profit_split_pct}%</span>
                                <span className="text-[10px] text-muted-foreground block">Split</span>
                              </div>
                            </div>

                            {/* Mobile Actions */}
                            <div className="flex items-center gap-2 pt-1">
                              <motion.button
                                type="button"
                                animate={isShaking ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                onClick={(e) => handleCopyCode(codeText, ch.id, e)}
                                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs ${
                                  hasCopied
                                    ? 'border-black dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-black font-bold'
                                    : 'border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-card dark:text-foreground'
                                }`}
                              >
                                {isCopiedNow ? 'Copied!' : hasCopied ? 'Code Copied ✓' : `${ch.discount_pct || 20}% OFF`}
                              </motion.button>

                              <button
                                type="button"
                                onClick={(e) => handleBuyChallenge(e, ch)}
                                className="flex-1 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer shadow-xs text-center"
                              >
                                BUY
                              </button>
                            </div>
                          </div>

                          {/* Warning Notification Toast when tapping Buy before copying */}
                          <AnimatePresence>
                            {hasWarning && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="w-full text-center text-[11px] sm:text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-md flex items-center justify-center gap-1 mt-3"
                              >
                                <span>⚠️ Kindly Copy code for Max Discount</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Smooth Accordion / Dropdown Details Expansion on Hover */}
                        <AnimatePresence>
                          {(isHovered || isExpanded) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden border-t border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 backdrop-blur-sm rounded-b-2xl"
                            >
                              <div className="p-4 sm:p-6 space-y-4">
                                {/* Expanded 8 Detail Parameters Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {/* 1. Payout Cycle */}
                                  <div className="p-3 rounded-xl bg-white/60 dark:bg-card backdrop-blur-sm border border-zinc-200/80 dark:border-border flex items-start gap-2.5">
                                    <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                                        Payout Cycle
                                      </span>
                                      <span className="text-xs font-bold text-foreground">
                                        {ch.payout_frequency || 'Bi-Weekly / 14 Days'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 2. Average Payout */}
                                  <div className="p-3 rounded-xl bg-white/60 dark:bg-card backdrop-blur-sm border border-zinc-200/80 dark:border-border flex items-start gap-2.5">
                                    <DollarSign className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                                        Average Payout
                                      </span>
                                      <span className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight">
                                        {ch.avg_payout || '$5,400'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 3. Consistency */}
                                  <div className="p-3 rounded-xl bg-white/60 dark:bg-card backdrop-blur-sm border border-zinc-200/80 dark:border-border flex items-start gap-2.5">
                                    <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                                        Consistency
                                      </span>
                                      <span className="text-xs font-bold text-foreground">
                                        {ch.consistency_rule || 'No Consistency Rule'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 4. Minimum Days */}
                                  <div className="p-3 rounded-xl bg-white/60 dark:bg-card backdrop-blur-sm border border-zinc-200/80 dark:border-border flex items-start gap-2.5">
                                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                                        Minimum Days
                                      </span>
                                      <span className="text-xs font-bold text-foreground">
                                        {ch.min_trading_days ? `${ch.min_trading_days} Days` : '0 Days (No Min)'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Rules Row (News Trading, Overnight & Weekend, Loss Type, EA & Algo Trading) */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-muted-foreground font-semibold text-[11px]">Rules:</span>
                                    <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-100/80 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
                                      News Trading: <span className="font-bold">{ch.news_trading || 'YES / Allowed'}</span>
                                    </span>
                                    <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-100/80 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
                                      Overnight & Weekend: <span className="font-bold">{ch.overnight_weekend || 'YES | YES'}</span>
                                    </span>
                                    <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-100/80 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
                                      Loss Type: <span className="font-bold">{ch.loss_type || 'Static'}</span>
                                    </span>
                                    <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-100/80 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
                                      EA & Algo Trading: <span className="font-bold">{ch.ea_algo_trading || 'YES | YES'}</span>
                                    </span>
                                  </div>

                                  <Link
                                    href={`/firms/${ch.firm_slug}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground hover:underline"
                                  >
                                    <span>View Firm Profile</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </div>
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
                    className="bg-white/80 dark:bg-card backdrop-blur-md border border-zinc-200 dark:border-border rounded-2xl p-12 text-center space-y-3"
                  >
                    <p className="text-base font-semibold text-foreground">No evaluation challenges match your filters.</p>
                    <p className="text-xs text-muted-foreground">Try adjusting your search criteria or step selections.</p>
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

