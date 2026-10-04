'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Search,
  Plus,
  X,
  ShieldCheck,
  Star,
  Check,
  Copy,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  Building2,
  Trophy,
  BarChart3,
  Calendar,
  Clock,
  Zap,
} from 'lucide-react';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { MOCK_CHALLENGES } from '@/lib/data/challenges-data';
import { Firm, Challenge, Review } from '@/lib/types';
import { getFirms, getChallenges, getReviews } from '@/lib/firebase/services';
import { getStoredFirms, saveStoredFirms } from '@/lib/utils/firms-store';
import { getStoredChallenges, saveStoredChallenges } from '@/lib/utils/challenges-store';
import { getStoredReviews, saveStoredReviews } from '@/lib/utils/reviews-store';
import { calculateFirmMetrics } from '@/lib/utils/rating-calculator';
import {
  calculateFirmComparisonScores,
  calculateChallengeComparisonScores,
  parseConsistencyRule,
  parseMinTradingDays,
  ComparisonMetricScore,
} from '@/lib/utils/comparison-calc';
import { getStoredPlatforms, PlatformItem } from '@/lib/utils/platforms-store';
import { RadarChart } from '@/components/ui/radar-chart';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// The 4 distinct indicator colors strictly for chart line identification
const SLOT_COLORS = ['#06b6d4', '#a855f7', '#10b981', '#f59e0b'];

// Platform icons & names mapping from public/platforms/
const PLATFORM_DATA: Record<string, { name: string; icon: string }> = {
  mt5: { name: 'MetaTrader 5', icon: '/platforms/mt5.png' },
  mt4: { name: 'MetaTrader 4', icon: '/platforms/mt5.png' },
  ctrader: { name: 'cTrader', icon: '/platforms/ctrader.svg' },
  tradelocker: { name: 'TradeLocker', icon: '/platforms/tradelocker.jpeg' },
  'match-trader': { name: 'Match-Trader', icon: '/platforms/match-trader.svg' },
  tradingview: { name: 'TradingView', icon: '/platforms/tradingview.png' },
  tradovate: { name: 'Tradovate', icon: '/platforms/tradovate.png' },
  ninjatrader: { name: 'NinjaTrader', icon: '/platforms/ninjatrader.svg' },
  bookmap: { name: 'Bookmap', icon: '/platforms/bookmap.jpeg' },
  atas: { name: 'ATAS', icon: '/platforms/atas.jpeg' },
  multicharts: { name: 'MultiCharts', icon: '/platforms/multicharts.svg' },
  deepcharts: { name: 'DeepCharts', icon: '/platforms/deepcharts.jpeg' },
};

export function CompareClient() {
  const searchParams = useSearchParams();
  const initialFirmsParam = searchParams?.get('firms')?.split(',') || ['nys-capital', 'ck-capital'];

  // Comparison Mode: 'firms' (Prop Firms Rules) or 'challenges' (Challenge Accounts)
  const [compareMode, setCompareMode] = useState<'firms' | 'challenges'>('firms');

  // Selected Slugs / IDs (Up to 4)
  const [selectedFirmSlugs, setSelectedFirmSlugs] = useState<string[]>(initialFirmsParam);
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<string[]>([
    'ch-nys-100k',
    'ch-ck-100k',
  ]);

  // Search filter inside comparator selector
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Db States initialized synchronously from local storage cache to eliminate flash of old data
  const [dbFirms, setDbFirms] = useState<Firm[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredFirms();
      if (stored && stored.length > 0) return stored;
    }
    return MOCK_FIRMS;
  });
  const [dbChallenges, setDbChallenges] = useState<Challenge[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredChallenges();
      if (stored && stored.length > 0) return stored;
    }
    return MOCK_CHALLENGES;
  });
  const [dbReviews, setDbReviews] = useState<Review[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = getStoredReviews();
      if (stored && stored.length > 0) return stored;
    }
    return [];
  });

  const [storedPlatforms, setStoredPlatforms] = useState<PlatformItem[]>(() => {
    if (typeof window !== 'undefined') {
      return getStoredPlatforms();
    }
    return [];
  });

  useEffect(() => {
    async function loadCompareData() {
      try {
        const [fData, cData, rData] = await Promise.all([
          getFirms(),
          getChallenges(),
          getReviews()
        ]);
        const reviewsList = rData && rData.length > 0 ? rData : getStoredReviews();
        setDbReviews(reviewsList);
        saveStoredReviews(reviewsList);

        if (fData && fData.length > 0) {
          const syncedFirms = fData.map((f) => calculateFirmMetrics(f, reviewsList).firm);
          setDbFirms(syncedFirms);
          saveStoredFirms(syncedFirms);
        }

        if (cData && cData.length > 0) {
          setDbChallenges(cData);
          saveStoredChallenges(cData);
        }
      } catch (err) {
        console.error('Failed to load dynamic compare data:', err);
      }
    }
    loadCompareData();

    function handlePlatformsChanged(e: any) {
      if (e.detail) {
        setStoredPlatforms(e.detail);
      } else {
        setStoredPlatforms(getStoredPlatforms());
      }
    }
    function handleFirmsChanged(e: any) {
      if (e.detail) {
        setDbFirms(e.detail);
      } else {
        setDbFirms(getStoredFirms());
      }
    }

    window.addEventListener('empirial_platforms_changed', handlePlatformsChanged);
    window.addEventListener('empirial_firms_changed', handleFirmsChanged);

    return () => {
      window.removeEventListener('empirial_platforms_changed', handlePlatformsChanged);
      window.removeEventListener('empirial_firms_changed', handleFirmsChanged);
    };
  }, []);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Copy & Vibration States
  const [hasCopiedCodes, setHasCopiedCodes] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [warningId, setWarningId] = useState<string | null>(null);

  // Resolve selected Firms
  const selectedFirms = useMemo(() => {
    const list = dbFirms.length > 0 ? dbFirms : MOCK_FIRMS;
    return selectedFirmSlugs
      .map((slug) => list.find((f) => f.slug === slug || f.id === slug))
      .filter(Boolean) as Firm[];
  }, [selectedFirmSlugs, dbFirms]);

  // Resolve selected Challenges
  const selectedChallenges = useMemo(() => {
    const list = dbChallenges.length > 0 ? dbChallenges : MOCK_CHALLENGES;
    return selectedChallengeIds
      .map((id) => list.find((ch) => ch.id === id || ch.firm_slug === id))
      .filter(Boolean) as Challenge[];
  }, [selectedChallengeIds, dbChallenges]);

  // Handle Add / Remove
  const handleAddFirm = (slug: string) => {
    if (selectedFirmSlugs.length < 4 && !selectedFirmSlugs.includes(slug)) {
      setSelectedFirmSlugs([...selectedFirmSlugs, slug]);
      setSearchQuery('');
      setIsDropdownOpen(false);
    }
  };

  const handleRemoveFirm = (slug: string) => {
    if (selectedFirmSlugs.length > 1) {
      setSelectedFirmSlugs(selectedFirmSlugs.filter((s) => s !== slug));
    }
  };

  const handleAddChallenge = (id: string) => {
    if (selectedChallengeIds.length < 4 && !selectedChallengeIds.includes(id)) {
      setSelectedChallengeIds([...selectedChallengeIds, id]);
      setSearchQuery('');
      setIsDropdownOpen(false);
    }
  };

  const handleRemoveChallenge = (id: string) => {
    if (selectedChallengeIds.length > 1) {
      setSelectedChallengeIds(selectedChallengeIds.filter((s) => s !== id));
    }
  };

  // Copy Promo Code with vibration shake
  const handleCopyCode = (code: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(id);
    setHasCopiedCodes((prev) => ({ ...prev, [id]: true }));
    setWarningId(null);

    // Vibration API if supported
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch (_) {}
    }

    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Buy Action with safety lock & enhanced vibration shake
  const handleBuy = (buyUrl: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasCopiedCodes[id]) {
      setShakingId(id);
      setWarningId(id);

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 50, 60, 50, 80]);
        } catch (_) {}
      }

      setTimeout(() => setShakingId(null), 650);
      setTimeout(() => setWarningId(null), 4000);
      return;
    }

    window.open(buyUrl || 'https://discord.gg/ww4dkeeZdp', '_blank', 'noopener,noreferrer');
  };

  // Compute Radar and Stats Data
  const radarData = useMemo(() => {
    if (compareMode === 'firms') {
      return selectedFirms.map((firm, idx) => ({
        firmName: firm.name,
        color: SLOT_COLORS[idx % SLOT_COLORS.length],
        metrics: calculateFirmComparisonScores(firm),
      }));
    } else {
      return selectedChallenges.map((ch, idx) => ({
        firmName: `${ch.firm_name || 'Firm'} [${ch.steps === 0 ? 'Instant' : `${ch.steps || 2}-Step`}] $${ch.account_size >= 1000 ? `${(ch.account_size / 1000).toLocaleString('en-US')}K` : ch.account_size}`,
        color: SLOT_COLORS[idx % SLOT_COLORS.length],
        metrics: calculateChallengeComparisonScores(ch),
      }));
    }
  }, [compareMode, selectedFirms, selectedChallenges]);

  // Filter available items for addition
  const availableFirms = useMemo(() => {
    const list = dbFirms.length > 0 ? dbFirms : MOCK_FIRMS;
    const q = (searchQuery || '').toLowerCase().trim();
    return list.filter(
      (f) =>
        f &&
        (f.slug || f.id) &&
        !selectedFirmSlugs.includes(f.slug) &&
        !selectedFirmSlugs.includes(f.id) &&
        (f.name || '').toLowerCase().includes(q)
    );
  }, [selectedFirmSlugs, searchQuery, dbFirms]);

  const availableChallenges = useMemo(() => {
    const list = dbChallenges.length > 0 ? dbChallenges : MOCK_CHALLENGES;
    const q = (searchQuery || '').toLowerCase().trim();
    return list.filter(
      (ch) =>
        ch &&
        ch.id &&
        !selectedChallengeIds.includes(ch.id) &&
        ((ch.firm_name || ch.name || '').toLowerCase().includes(q) ||
          (ch.name || '').toLowerCase().includes(q) ||
          `$${ch.account_size || ''}`.includes(q))
    );
  }, [selectedChallengeIds, searchQuery, dbChallenges]);

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 overflow-x-clip">
      {/* Continuous Atmospheric Tilted Red Light Beam */}
      <div className="absolute top-0 inset-x-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="relative w-full max-w-5xl mx-auto h-full flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.1, ease: 'easeOut' }}
            className="absolute -top-12 sm:-top-20 right-0 sm:right-6 md:right-12 w-24 sm:w-32 md:w-40 h-[2400px] sm:h-[3200px] lg:h-[4000px] bg-gradient-to-b from-[#ef4444] from-0% via-[#dc2626]/65 via-35% to-transparent to-85% blur-[75px] sm:blur-[90px] rounded-full rotate-[28deg] sm:rotate-[32deg] origin-top will-change-transform opacity-80 dark:opacity-65"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* 1. Header (Centered, strictly following RULE:BW) */}
        <div className="text-center py-6 border-b border-zinc-200/80 dark:border-zinc-800 space-y-2 max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold sm:text-2xl lg:text-3xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Prop Firm & Account Side-by-Side Comparator
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Compare evaluation models, profit split ceilings, drawdown rules, trading platforms, and consistency policies side-by-side with interactive statistical benchmarking.
          </p>
        </div>

        {/* 2. Compare Bar & Selection Controls (Translucent in white theme, Black & White Theme) */}
        <div className="relative z-40 bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Mode Switcher Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 self-start">
              <button
                type="button"
                onClick={() => setCompareMode('firms')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  compareMode === 'firms'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Prop Firms Comparison</span>
              </button>
              <button
                type="button"
                onClick={() => setCompareMode('challenges')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  compareMode === 'challenges'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Challenges / Accounts Comparison</span>
              </button>
            </div>

            <div className="text-xs font-semibold text-muted-foreground">
              Comparing ({compareMode === 'firms' ? selectedFirms.length : selectedChallenges.length}/4 selected)
            </div>
          </div>

          {/* Selector Bar with Search & Selected Firm Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Selected Pills */}
            {compareMode === 'firms' ? (
              selectedFirms.map((firm, idx) => {
                const slotColor = SLOT_COLORS[idx % SLOT_COLORS.length];
                return (
                  <div
                    key={firm.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-xs font-bold text-foreground shadow-2xs"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slotColor }} />
                    <img src={firm.logo_url} alt={firm.name} className="w-4 h-4 object-contain rounded" />
                    <span className="truncate max-w-[120px] sm:max-w-[160px]">{firm.name}</span>
                    {selectedFirms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFirm(firm.slug)}
                        className="p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Remove from comparison"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              selectedChallenges.map((ch, idx) => {
                const slotColor = SLOT_COLORS[idx % SLOT_COLORS.length];
                const modelBadge = ch.steps === 0 ? 'Instant' : `${ch.steps || 2}-Step`;
                const sizeLabel = ch.account_size >= 1000 ? `$${(ch.account_size / 1000).toLocaleString('en-US')}K` : `$${ch.account_size}`;
                return (
                  <div
                    key={ch.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 text-xs font-bold text-foreground shadow-2xs"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slotColor }} />
                    <img src={ch.firm_logo || '/logos/nys.png'} alt={ch.firm_name} className="w-4 h-4 object-contain rounded" />
                    <div className="flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-[260px]">
                      <span className="truncate font-extrabold text-foreground">{ch.firm_name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-tight bg-black text-white dark:bg-white dark:text-black shrink-0">
                        {modelBadge}
                      </span>
                      <span className="font-mono text-muted-foreground font-semibold shrink-0">
                        {sizeLabel}
                      </span>
                    </div>
                    {selectedChallenges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChallenge(ch.id)}
                        className="p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Remove from comparison"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}

            {/* Add More Searchable Dropdown Button */}
            {((compareMode === 'firms' && selectedFirms.length < 4) ||
              (compareMode === 'challenges' && selectedChallenges.length < 4)) && (
              <div ref={dropdownRef} className="relative z-50">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white bg-zinc-50 dark:bg-zinc-900/60 text-xs font-semibold text-foreground transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add {compareMode === 'firms' ? 'Firm' : 'Account'} to Compare</span>
                </button>

                {/* Dropdown Popover */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-full mt-2 w-72 sm:w-84 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 space-y-2"
                    >
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={`Search ${compareMode === 'firms' ? 'firms' : 'challenges'}...`}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                        {compareMode === 'firms' ? (
                          availableFirms.length > 0 ? (
                            availableFirms.map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => handleAddFirm(f.slug)}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <img src={f.logo_url} alt={f.name} className="w-5 h-5 object-contain rounded" />
                                  <span className="font-semibold text-foreground truncate">{f.name}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono">{f.max_allocation}</span>
                              </button>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-4">No matching firms found.</p>
                          )
                        ) : availableChallenges.length > 0 ? (
                          availableChallenges.map((ch) => {
                            const modelLabel = ch.steps === 0 ? 'Instant Funding' : `${ch.steps || 2}-Step Evaluation`;
                            const sizeLabel = ch.account_size >= 1000 ? `$${(ch.account_size / 1000).toLocaleString('en-US')}K` : `$${ch.account_size}`;
                            return (
                              <button
                                key={ch.id}
                                type="button"
                                onClick={() => handleAddChallenge(ch.id)}
                                className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer border-b border-zinc-100 dark:border-zinc-800/60 last:border-b-0"
                              >
                                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 mr-2">
                                  <img
                                    src={ch.firm_logo || '/logos/nys.png'}
                                    alt={ch.firm_name}
                                    className="w-6 h-6 object-contain rounded-md shrink-0 border border-zinc-200 dark:border-zinc-800 p-0.5 bg-white dark:bg-zinc-900"
                                  />
                                  <div className="truncate flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-extrabold text-foreground truncate">{ch.firm_name}</span>
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-tight bg-black text-white dark:bg-white dark:text-black shrink-0">
                                        {ch.steps === 0 ? 'Instant' : `${ch.steps || 2}-Step`}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5 truncate">
                                      <span className="truncate">{ch.name || modelLabel}</span>
                                      <span>•</span>
                                      <span className="font-mono font-extrabold text-foreground">{sizeLabel}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs font-extrabold text-foreground font-mono shrink-0">${ch.price}</span>
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-4">No matching challenges found.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* 3. Statistics Chart & Comparative Score Matrix (Point 5) */}
        {radarData.length > 0 && (
          <div className="bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left: SVG Radar Chart */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-zinc-200/80 dark:border-zinc-800/80 pb-6 lg:pb-0 lg:pr-6">
                <div className="text-center mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Comparative Polygon Spectrum
                  </span>
                </div>
                <RadarChart data={radarData} size={330} />
              </div>

              {/* Right: Metric Score Breakdown with Specific Values */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground tracking-tight">
                      Statistical Benchmark & Parameter Scores
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {compareMode === 'firms'
                        ? 'Normalized 0–100 scores for Max Allocation, Profit Split, Drawdowns, Consistency, and Min Trading Days.'
                        : 'Normalized 0–100 scores for Profit Split, Drawdowns, Consistency, Min Trading Days, and Payout Frequency.'}
                    </p>
                  </div>
                </div>

                {/* Score Rows */}
                <div className="space-y-3">
                  {radarData[0]?.metrics.map((metric, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-foreground text-sm tracking-tight">{metric.subject}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {metric.subject === 'Consistency'
                            ? '0 or No Rule = 100 (Best)'
                            : metric.subject === 'Min. Trading Days'
                            ? '0 Days = 100 (Best)'
                            : 'Higher is Better'}
                        </span>
                      </div>

                      {/* Firm comparison bars for this metric */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        {radarData.map((d, dIdx) => {
                          const firmMetric = d.metrics[mIdx] || metric;
                          return (
                            <div
                              key={dIdx}
                              className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs shadow-2xs"
                            >
                              <div className="flex items-center gap-2 truncate mr-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                <span className="font-bold text-foreground truncate max-w-[120px]">
                                  {d.firmName}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-extrabold text-foreground text-sm tracking-tight block">
                                  {firmMetric.displayValue}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-semibold block">
                                  Score: <strong className="text-foreground">{firmMetric.score}</strong>/100
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Side-by-Side Detailed Specification Matrix (Point 6 & 7) */}
        <TooltipProvider>
          <div className="bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                
                {/* Table Header: Firm Names, Logos, Rating Pills */}
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60">
                    <th className="p-4 sm:p-5 w-48 sm:w-60 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Specification
                    </th>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item, idx) => {
                      const slotColor = SLOT_COLORS[idx % SLOT_COLORS.length];
                      const firmName = (item as any).name || (item as any).firm_name || 'Prop Firm';
                      const safeFirmNameLower = firmName.toLowerCase();
                      const firmLogo = (item as any).logo_url || (item as any).firm_logo || '/logos/nys.png';

                      const matchedFirm = (dbFirms.length > 0 ? dbFirms : MOCK_FIRMS).find(
                        (f: Firm) =>
                          f.id === (item as any).firm_id ||
                          f.id === item.id ||
                          f.slug === (item as any).firm_slug ||
                          f.slug === (item as any).slug ||
                          (f.name || '').toLowerCase() === safeFirmNameLower
                      ) || MOCK_FIRMS.find(
                        (f: Firm) =>
                          f.id === (item as any).firm_id ||
                          f.id === item.id ||
                          f.slug === (item as any).firm_slug ||
                          f.slug === (item as any).slug ||
                          (f.name || '').toLowerCase() === safeFirmNameLower
                      ) || {
                        id: item.id,
                        name: firmName,
                        slug: (item as any).slug || 'firm',
                        rating: item.rating || 4.8,
                        review_count: item.review_count || 125,
                      };

                      const metrics = calculateFirmMetrics(matchedFirm as any, dbReviews);
                      const rating = metrics.rating;
                      const reviewCount = metrics.reviewCount;

                      return (
                        <th key={item.id} className="p-4 sm:p-5 min-w-[240px] sm:min-w-[280px]">
                          <div className="space-y-2">
                            {/* Color indicator top bar */}
                            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: slotColor }} />

                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                                <img src={firmLogo} alt={firmName} className="h-7 w-auto max-w-[36px] object-contain rounded-md" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-extrabold text-foreground">{firmName}</span>
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                </div>
                                {compareMode === 'challenges' && 'steps' in item && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-tight bg-black text-white dark:bg-white dark:text-black">
                                      {(item as Challenge).steps === 0 ? 'Instant' : `${(item as Challenge).steps || 2}-Step`}
                                    </span>
                                    <span className="text-[10px] font-bold text-foreground font-mono">
                                      ${(item as Challenge).account_size.toLocaleString('en-US')}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                    <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                                    <span>{rating.toFixed(1)}</span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground font-medium">
                                    ({reviewCount.toLocaleString('en-US')} reviews)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Table Body Specifications Rows */}
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-foreground">
                  
                  {/* Option 1: Max Allocation (ONLY in Firms mode) */}
                  {compareMode === 'firms' && (
                    <tr>
                      <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                        Max Allocation
                      </td>
                      {selectedFirms.map((f) => (
                        <td key={f.id} className="p-4 sm:p-5">
                          <span className="text-sm font-extrabold text-foreground tracking-tight">
                            {f.max_allocation}
                          </span>
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* Option 2: Account Size & Steps (ONLY in Challenges mode) */}
                  {compareMode === 'challenges' && (
                    <tr>
                      <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                        Account Size & Model
                      </td>
                      {selectedChallenges.map((ch) => (
                        <td key={ch.id} className="p-4 sm:p-5">
                          <div className="text-sm font-extrabold text-foreground tracking-tight">
                            ${ch.account_size.toLocaleString('en-US')}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-tight bg-black text-white dark:bg-white dark:text-black">
                              {ch.steps === 0 ? 'Instant Funding' : `${ch.steps || 2}-Step Evaluation`}
                            </span>
                            {ch.name && (
                              <span className="text-[11px] font-bold text-foreground">
                                {ch.name}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* Option 3: Profit Split */}
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                      Profit Split
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      const splitText =
                        'profit_split_custom' in item
                          ? (item as Firm).profit_split_custom
                          : `Up to ${(item as Challenge).profit_split_pct}%`;
                      return (
                        <td key={item.id} className="p-4 sm:p-5">
                          <span className="text-sm font-extrabold text-foreground tracking-tight">
                            {splitText}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Option 4: Daily Loss & Max Loss with Loss Type */}
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                      Daily Loss & Max Loss
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      const dailyLoss =
                        'daily_loss_pct' in item
                          ? (item as Firm).daily_loss_pct
                          : (item as Challenge).daily_loss_limit_pct;
                      const maxLoss =
                        'max_loss_pct' in item
                          ? (item as Firm).max_loss_pct
                          : (item as Challenge).max_loss_limit_pct;
                      const lossType =
                        'loss_type' in item && (item as Challenge).loss_type
                          ? (item as Challenge).loss_type
                          : 'Static';

                      return (
                        <td key={item.id} className="p-4 sm:p-5">
                          <div className="font-extrabold text-foreground tracking-tight text-xs sm:text-sm">
                            {dailyLoss ? `${dailyLoss}% Daily` : 'None'} | {maxLoss}% Max
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-foreground">
                            {lossType} Loss Model
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Option 5: Payout Frequency */}
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                      Payout Frequency
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      const payoutText =
                        'payout_custom' in item
                          ? (item as Firm).payout_custom
                          : (item as Challenge).payout_frequency;
                      return (
                        <td key={item.id} className="p-4 sm:p-5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span>{payoutText || 'Bi-Weekly / 14 Days'}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Option 6: Platforms (Dynamic lookup with tooltips) */}
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                      Platforms
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      // Get platform list
                      let platformIds: string[] = [];
                      if ('platform_ids' in item && item.platform_ids && item.platform_ids.length > 0) {
                        platformIds = item.platform_ids;
                      } else if ('platforms' in item && typeof item.platforms === 'string') {
                        platformIds = (item.platforms as string)
                          .toLowerCase()
                          .split(/[,\s/]+/)
                          .map((p) => p.trim())
                          .filter(Boolean);
                      } else {
                        platformIds = ['mt5', 'ctrader'];
                      }

                      return (
                        <td key={item.id} className="p-4 sm:p-5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {platformIds.map((pid, pIdx) => {
                              const dynamicPlat = storedPlatforms.find(
                                (p) => p.id === pid || p.id === pid.toLowerCase() || p.name.toLowerCase() === pid.toLowerCase()
                              );
                              const pInfo = dynamicPlat
                                ? { name: dynamicPlat.name, icon: dynamicPlat.logo || dynamicPlat.logo_url || '/platforms/mt5.png' }
                                : PLATFORM_DATA[pid] ||
                                  Object.entries(PLATFORM_DATA).find(([k]) => pid.includes(k))?.[1] || {
                                    name: pid.toUpperCase(),
                                    icon: '/platforms/mt5.png',
                                  };

                              return (
                                <Tooltip key={pIdx}>
                                  <TooltipTrigger asChild>
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-1 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-2xs">
                                      <img
                                        src={pInfo.icon}
                                        alt={pInfo.name}
                                        className="w-5 h-5 object-contain rounded"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-xs font-semibold bg-black text-white dark:bg-white dark:text-black">
                                    {pInfo.name}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Option 7: Consistency & Min Days (Side-by-side with step-specific scenarios & minimal article links) */}
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                      Consistency & Min Days
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      // 1. Resolve raw consistency text
                      const rawConsistency =
                        'consistency_rule' in item && (item as any).consistency_rule
                          ? (item as any).consistency_rule
                          : 'consistency_rules_content' in item && (item as any).consistency_rules_content
                          ? (item as any).consistency_rules_content
                          : '';
                      const targetStep = 'steps' in item ? (item as Challenge).steps : undefined;
                      const parsedConsistency = parseConsistencyRule(rawConsistency, targetStep);

                      // 2. Resolve raw min trading days
                      const rawMinDays =
                        'min_trading_days' in item && (item as any).min_trading_days !== undefined
                          ? (item as any).min_trading_days
                          : 'firm_rules_content' in item && (item as Firm).firm_rules_content?.toLowerCase().includes('no minimum')
                          ? 0
                          : undefined;
                      const parsedMinDays = parseMinTradingDays(rawMinDays);

                      // 3. Optional minimal rule articles
                      const consistencyArticleUrl = 'consistency_rule_article_url' in item ? (item as Firm).consistency_rule_article_url : undefined;
                      const consistencyArticleTitle = 'consistency_rule_article_title' in item ? (item as Firm).consistency_rule_article_title : undefined;
                      const minDaysArticleUrl = 'firm_rules_article_url' in item ? (item as Firm).firm_rules_article_url : undefined;
                      const minDaysArticleTitle = 'firm_rules_article_title' in item ? (item as Firm).firm_rules_article_title : undefined;

                      return (
                        <td key={item.id} className="p-4 sm:p-5 space-y-2">
                          <div>
                            <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-foreground">
                              <span className="text-muted-foreground">Consistency:</span>
                              <span className="font-extrabold text-foreground">{parsedConsistency.displayValue}</span>
                            </div>
                            {/* If multi-step scenario is detected, render separate step badges */}
                            {parsedConsistency.stepNumbers && Object.keys(parsedConsistency.stepNumbers).length > 1 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(parsedConsistency.stepNumbers).map(([st, val]) => (
                                  <span
                                    key={st}
                                    className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono font-bold text-foreground"
                                  >
                                    {st}-Step: {val}%
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* Minimal article link if provided */}
                            {consistencyArticleUrl && (
                              <a
                                href={consistencyArticleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 mt-0.5 cursor-pointer"
                              >
                                <span>{consistencyArticleTitle || 'Rule article'}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>

                          <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
                            <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-foreground">
                              <span className="text-muted-foreground">Min Days:</span>
                              <span className="font-extrabold text-foreground">{parsedMinDays.displayValue}</span>
                            </div>
                            {minDaysArticleUrl && (
                              <a
                                href={minDaysArticleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 mt-0.5 cursor-pointer"
                              >
                                <span>{minDaysArticleTitle || 'Min days article'}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Option 8: News Trading */}
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                      News Trading
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      const news = 'news_trading' in item ? (item as Challenge).news_trading : 'YES / Allowed';
                      return (
                        <td key={item.id} className="p-4 sm:p-5">
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
                            {news || 'YES / Allowed'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Option 9: Overnight & Weekend Holding */}
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                      Overnight & Weekend Holding
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      const hold =
                        'overnight_weekend' in item
                          ? (item as Challenge).overnight_weekend
                          : 'YES | YES (Allowed)';
                      return (
                        <td key={item.id} className="p-4 sm:p-5">
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
                            {hold || 'YES | YES'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Option 10: EA Trading & Algo Trading */}
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                      EA Trading & Algo Trading
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      const eaAlgo =
                        'ea_algo_trading' in item
                          ? (item as Challenge).ea_algo_trading
                          : 'YES | YES (Supported)';
                      return (
                        <td key={item.id} className="p-4 sm:p-5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
                              EA: YES
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
                              Algo: YES
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Option 11: Risk Management (Max Risk & Inactivity) */}
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                      Risk & Inactivity Rules
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      const maxRisk = (item as any).max_risk_per_trade;
                      const inactivity = (item as any).inactivity_period;
                      return (
                        <td key={item.id} className="p-4 sm:p-5 space-y-1">
                          <div className="text-[11px] font-semibold text-foreground">
                            Max Risk/Trade: <span className="font-extrabold text-foreground">{maxRisk || 'No Limit'}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-foreground">
                            Inactivity: <span className="font-extrabold text-foreground">{inactivity || '30 Days'}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Option 12: Dedicated Crypto Settings */}
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                      Crypto Parameters
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      const cryptoLev = (item as any).crypto_max_leverage || '1:5';
                      const cryptoPos = (item as any).crypto_max_open_positions || 'No Limit';
                      const cryptoExp = (item as any).crypto_total_notional_exposure || 'Standard';
                      return (
                        <td key={item.id} className="p-4 sm:p-5 space-y-1">
                          <div className="text-[11px] font-semibold text-foreground">
                            Max Leverage: <span className="font-extrabold text-foreground">{cryptoLev}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-foreground">
                            Max Open: <span className="font-bold text-foreground">{cryptoPos}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-foreground">
                            Exposure: <span className="font-bold text-foreground">{cryptoExp}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Option 13: Trading Leverage */}
                  <tr>
                    <td className="p-4 sm:p-5 font-bold text-foreground bg-zinc-50/40 dark:bg-zinc-900/30">
                      Trading Leverage
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      const lev = (item as any).leverage || '1:100';
                      return (
                        <td key={item.id} className="p-4 sm:p-5">
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
                            {lev}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Bottom Action Row (Point 7: Reviews, Copy Promo Code, BUY) */}
                  <tr className="bg-zinc-50/90 dark:bg-zinc-900/80 border-t-2 border-zinc-200 dark:border-zinc-800">
                    <td className="p-4 sm:p-5 font-bold text-foreground">
                      Actions & Offers
                    </td>
                    {(compareMode === 'firms' ? selectedFirms : selectedChallenges).map((item) => {
                      const id = item.id;
                      const slug = 'slug' in item ? (item as Firm).slug : (item as Challenge).firm_slug;
                      const codeText =
                        'coupon_code_custom' in item
                          ? (item as Firm).coupon_code_custom
                          : (item as Challenge).coupon_code || 'EMPIRE';
                      const buyUrl = item.buy_url || 'https://discord.gg/ww4dkeeZdp';
                      const hasCopied = hasCopiedCodes[id];
                      const isCopiedNow = copiedCode === id;
                      const isShaking = shakingId === id;
                      const hasWarning = warningId === id;

                      return (
                        <td key={id} className="p-4 sm:p-5 space-y-2.5">
                          {/* 1. View Reviews & Feedback Button */}
                          <Link
                            href={`/firms/${slug}`}
                            className="w-full py-2 px-3 rounded-xl border border-zinc-200/80 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>View Reviews & Feedback</span>
                          </Link>

                          {/* 2. MAX Discount : Empire & BUY with Shake and Warning Alert */}
                          <div className="flex items-center gap-2">
                            {/* Copy Button */}
                            <motion.button
                              type="button"
                              animate={isShaking ? { x: [-8, 8, -8, 8, -5, 5, -2, 2, 0], scale: [1, 1.04, 0.97, 1.03, 1] } : {}}
                              transition={{ duration: 0.45, ease: "easeInOut" }}
                              onClick={(e) => handleCopyCode(codeText, id, e)}
                              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap ${
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
                                  <span>Code Copied ✓</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>MAX Discount : {codeText}</span>
                                </>
                              )}
                            </motion.button>

                            {/* BUY Button */}
                            <button
                              type="button"
                              onClick={(e) => handleBuy(buyUrl, id, e)}
                              className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                            >
                              BUY
                            </button>
                          </div>

                          {/* Warning Alert if Buy clicked before copy */}
                          <AnimatePresence>
                            {hasWarning && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2 }}
                                className="w-full text-center text-[10px] font-semibold py-1.5 px-2 rounded-lg border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-md flex items-center justify-center gap-1"
                              >
                                <span>⚠️ Kindly Copy code for Max Discount</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TooltipProvider>

      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Comparator Terminal...</div>}>
      <CompareClient />
    </React.Suspense>
  );
}
