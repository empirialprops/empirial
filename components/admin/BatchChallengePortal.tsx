'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  Percent,
  Layers,
  ArrowRight,
  RotateCcw,
  Building2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Zap,
  Sliders,
  DollarSign,
  Calendar,
  HelpCircle,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Firm, Challenge } from '@/lib/types';
import { createChallengesBatch } from '@/lib/firebase/services';
import { logAdminAction } from '@/lib/utils/audit-log-store';

export interface BatchChallengeTier {
  id: string;
  size: number;
  name: string;
  originalPrice: number;
  discountPct: number;
  discountedPrice: number;
  isCustomPrice: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
}

interface BatchChallengePortalProps {
  firms: Firm[];
  onBatchCreated?: (newChallenges: Challenge[]) => void;
  onSwitchToSingleView?: () => void;
}

const COMMON_SIZE_PRESETS = [
  { label: '$5K', value: 5000 },
  { label: '$10K', value: 10000 },
  { label: '$15K', value: 15000 },
  { label: '$25K', value: 25000 },
  { label: '$50K', value: 50000 },
  { label: '$100K', value: 100000 },
  { label: '$200K', value: 200000 },
  { label: '$300K', value: 300000 },
  { label: '$500K', value: 500000 },
  { label: '$1M', value: 1000000 },
];

const STANDARD_BUNDLE_SIZES = [5000, 10000, 25000, 50000, 100000, 200000];
const MICRO_MID_SIZES = [5000, 10000, 15000, 25000, 50000];

function formatSizeAbbr(size: number): string {
  if (size >= 1000000) {
    const m = size / 1000000;
    return `$${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  if (size >= 1000) {
    const k = size / 1000;
    return `$${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  return `$${size}`;
}

export default function BatchChallengePortal({
  firms,
  onBatchCreated,
  onSwitchToSingleView,
}: BatchChallengePortalProps) {
  // 1. Program Identity
  const [selectedFirmId, setSelectedFirmId] = useState<string>(firms[0]?.id || '');
  const [customFirmName, setCustomFirmName] = useState('');
  const [customFirmLogo, setCustomFirmLogo] = useState('');
  const [mode, setMode] = useState<number>(2); // 1, 2, 3, or 0 (instant)
  const [category, setCategory] = useState<'forex' | 'futures' | 'crypto' | 'instant-funding'>('forex');
  const [seriesName, setSeriesName] = useState<string>('2-Step Stellar');
  const [nameFormatPattern, setNameFormatPattern] = useState<'size_series' | 'firm_size_series' | 'size_firm_series'>('size_series');
  const [affiliateUrl, setAffiliateUrl] = useState<string>('https://discord.gg/ww4dkeeZdp');
  const [couponCode, setCouponCode] = useState<string>('EMPIRE');

  // 2. Pricing & Discounts
  const [globalDiscountPct, setGlobalDiscountPct] = useState<number>(20);
  const [tiers, setTiers] = useState<BatchChallengeTier[]>([
    {
      id: 'tier-1',
      size: 5000,
      name: '$5K 2-Step Stellar',
      originalPrice: 49,
      discountPct: 20,
      discountedPrice: 39,
      isCustomPrice: false,
      isFeatured: false,
      isBestSeller: false,
    },
    {
      id: 'tier-2',
      size: 10000,
      name: '$10K 2-Step Stellar',
      originalPrice: 99,
      discountPct: 20,
      discountedPrice: 79,
      isCustomPrice: false,
      isFeatured: false,
      isBestSeller: false,
    },
    {
      id: 'tier-3',
      size: 25000,
      name: '$25K 2-Step Stellar',
      originalPrice: 199,
      discountPct: 20,
      discountedPrice: 159,
      isCustomPrice: false,
      isFeatured: false,
      isBestSeller: false,
    },
    {
      id: 'tier-4',
      size: 50000,
      name: '$50K 2-Step Stellar',
      originalPrice: 349,
      discountPct: 20,
      discountedPrice: 279,
      isCustomPrice: false,
      isFeatured: false,
      isBestSeller: false,
    },
    {
      id: 'tier-5',
      size: 100000,
      name: '$100K 2-Step Stellar',
      originalPrice: 599,
      discountPct: 20,
      discountedPrice: 479,
      isCustomPrice: false,
      isFeatured: true,
      isBestSeller: true,
    },
    {
      id: 'tier-6',
      size: 200000,
      name: '$200K 2-Step Stellar',
      originalPrice: 1099,
      discountPct: 20,
      discountedPrice: 879,
      isCustomPrice: false,
      isFeatured: true,
      isBestSeller: false,
    },
  ]);

  // 3. Common 1-Time Rules
  const [eaAllowed, setEaAllowed] = useState<boolean>(true);
  const [eaDetails, setEaDetails] = useState<string>('YES / Allowed');

  const [hasConsistencyRule, setHasConsistencyRule] = useState<boolean>(false);
  const [consistencyDetails, setConsistencyDetails] = useState<string>('No Consistency Rule');

  const [hasMinTradingDays, setHasMinTradingDays] = useState<boolean>(false);
  const [minTradingDaysCount, setMinTradingDaysCount] = useState<number>(0);
  const [maxTradingDays, setMaxTradingDays] = useState<string>('Unlimited');

  const [phase1TargetPct, setPhase1TargetPct] = useState<number>(8);
  const [phase2TargetPct, setPhase2TargetPct] = useState<number>(5);

  const [dailyLossLimitPct, setDailyLossLimitPct] = useState<number>(5);
  const [maxLossLimitPct, setMaxLossLimitPct] = useState<number>(10);
  const [lossType, setLossType] = useState<'Static' | 'Trailing'>('Static');

  const [profitSplitPct, setProfitSplitPct] = useState<number>(85);
  const [payoutFrequency, setPayoutFrequency] = useState<string>('Bi-Weekly / 14 Days');
  const [leverage, setLeverage] = useState<string>('1:100');
  const [newsTrading, setNewsTrading] = useState<string>('YES / Allowed');
  const [overnightWeekend, setOvernightWeekend] = useState<string>('YES | YES');
  const [refundableFee, setRefundableFee] = useState<boolean>(true);
  const [avgPayout, setAvgPayout] = useState<string>('$5,400');
  const [maxRiskPerTrade, setMaxRiskPerTrade] = useState<string>('2% / Trade');
  const [inactivityPeriod, setInactivityPeriod] = useState<string>('30 Days');
  const [cryptoMaxLeverage, setCryptoMaxLeverage] = useState<string>('1:5');
  const [cryptoMaxOpenPositions, setCryptoMaxOpenPositions] = useState<string>('5 Positions');
  const [cryptoTotalNotionalExposure, setCryptoTotalNotionalExposure] = useState<string>('$250,000');

  // Execution state
  const [customSizeInput, setCustomSizeInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedBatch, setSubmittedBatch] = useState<{ count: number; firmName: string; challenges: Challenge[] } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected Firm reference
  const currentFirm = useMemo(() => {
    return firms.find((f) => f.id === selectedFirmId);
  }, [firms, selectedFirmId]);

  // Sync firm details when firm changes
  useEffect(() => {
    if (currentFirm) {
      if (currentFirm.buy_url) {
        setAffiliateUrl(currentFirm.buy_url);
      }
      if (currentFirm.coupon_code_custom) {
        setCouponCode(currentFirm.coupon_code_custom);
      }
      if (currentFirm.discount_pct && currentFirm.discount_pct > 0) {
        setGlobalDiscountPct(currentFirm.discount_pct);
      }
    }
  }, [currentFirm]);

  // Helper to compute challenge name
  const generateTierName = (size: number, customSuffix?: string) => {
    const sName = customSuffix !== undefined ? customSuffix : seriesName;
    const sizeAbbr = formatSizeAbbr(size);
    const firmName = currentFirm?.name || customFirmName || 'Prop Firm';

    if (nameFormatPattern === 'firm_size_series') {
      return `${firmName} ${sizeAbbr} ${sName}`.trim();
    }
    if (nameFormatPattern === 'size_firm_series') {
      return `${sizeAbbr} ${firmName} ${sName}`.trim();
    }
    return `${sizeAbbr} ${sName}`.trim();
  };

  // Re-generate names when seriesName, nameFormatPattern, or selected firm changes
  const updateAllTierNames = (newSeriesName?: string, newPattern?: typeof nameFormatPattern) => {
    const effectiveSeries = newSeriesName !== undefined ? newSeriesName : seriesName;
    const effectivePattern = newPattern !== undefined ? newPattern : nameFormatPattern;

    setTiers((prev) =>
      prev.map((tier) => {
        const sizeAbbr = formatSizeAbbr(tier.size);
        const firmName = currentFirm?.name || customFirmName || 'Prop Firm';
        let newName = `${sizeAbbr} ${effectiveSeries}`.trim();

        if (effectivePattern === 'firm_size_series') {
          newName = `${firmName} ${sizeAbbr} ${effectiveSeries}`.trim();
        } else if (effectivePattern === 'size_firm_series') {
          newName = `${sizeAbbr} ${firmName} ${effectiveSeries}`.trim();
        }

        return {
          ...tier,
          name: newName,
        };
      })
    );
  };

  // When global discount % changes, update all tiers unless custom price flagged
  const handleGlobalDiscountChange = (newDiscount: number) => {
    setGlobalDiscountPct(newDiscount);
    setTiers((prev) =>
      prev.map((t) => {
        const disc = newDiscount;
        const calcPrice = Math.max(0, Math.round(t.originalPrice * (1 - disc / 100)));
        return {
          ...t,
          discountPct: disc,
          discountedPrice: calcPrice,
          isCustomPrice: false,
        };
      })
    );
  };

  // Add a size tier
  const addTier = (size: number, defaultOriginalPrice = 0) => {
    // avoid duplicate size
    if (tiers.some((t) => t.size === size)) {
      alert(`Challenge tier for ${formatSizeAbbr(size)} already exists in the list!`);
      return;
    }

    const priceEstimate = defaultOriginalPrice > 0 ? defaultOriginalPrice : estimatePriceForSize(size);
    const calculatedDiscounted = Math.max(0, Math.round(priceEstimate * (1 - globalDiscountPct / 100)));
    const newTier: BatchChallengeTier = {
      id: `tier-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      size,
      name: generateTierName(size),
      originalPrice: priceEstimate,
      discountPct: globalDiscountPct,
      discountedPrice: calculatedDiscounted,
      isCustomPrice: false,
      isFeatured: size === 100000,
      isBestSeller: size === 100000,
    };

    const newTiers = [...tiers, newTier].sort((a, b) => a.size - b.size);
    setTiers(newTiers);
  };

  const removeTier = (id: string) => {
    setTiers(tiers.filter((t) => t.id !== id));
  };

  const updateTier = (id: string, updates: Partial<BatchChallengeTier>) => {
    setTiers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates };

        // If originalPrice or discountPct changed, auto-calculate discounted price unless customPrice set
        if ('originalPrice' in updates || 'discountPct' in updates) {
          const orig = updates.originalPrice !== undefined ? updates.originalPrice : t.originalPrice;
          const disc = updates.discountPct !== undefined ? updates.discountPct : t.discountPct;
          if (!updates.isCustomPrice && !t.isCustomPrice) {
            updated.discountedPrice = Math.max(0, Math.round(orig * (1 - disc / 100)));
          }
        }

        return updated;
      })
    );
  };

  // Rough price heuristic based on typical prop firm industry standards
  function estimatePriceForSize(size: number): number {
    if (size <= 5000) return 49;
    if (size <= 10000) return 99;
    if (size <= 15000) return 139;
    if (size <= 25000) return 199;
    if (size <= 50000) return 349;
    if (size <= 100000) return 599;
    if (size <= 200000) return 1099;
    if (size <= 300000) return 1499;
    if (size <= 500000) return 2399;
    return Math.round(size * 0.005);
  }

  // Preset Bundles loader
  const loadPresetBundle = (sizeList: number[]) => {
    const newTiers: BatchChallengeTier[] = sizeList.map((size, idx) => {
      const orig = estimatePriceForSize(size);
      const discounted = Math.max(0, Math.round(orig * (1 - globalDiscountPct / 100)));
      return {
        id: `tier-preset-${idx}-${Date.now()}`,
        size,
        name: generateTierName(size),
        originalPrice: orig,
        discountPct: globalDiscountPct,
        discountedPrice: discounted,
        isCustomPrice: false,
        isFeatured: size === 100000,
        isBestSeller: size === 100000,
      };
    });
    setTiers(newTiers);
  };

  // Handle Mode Change (1-step, 2-step, 3-step, Instant)
  const handleModeChange = (newMode: number) => {
    setMode(newMode);
    let defaultSuffix = '2-Step Stellar';
    if (newMode === 1) defaultSuffix = '1-STEP';
    else if (newMode === 2) defaultSuffix = '2-Step Stellar';
    else if (newMode === 3) defaultSuffix = '3-Step Pro';
    else if (newMode === 0) defaultSuffix = 'Instant ZERO';

    setSeriesName(defaultSuffix);
    updateAllTierNames(defaultSuffix);

    // Adjust target defaults
    if (newMode === 1) {
      setPhase1TargetPct(6);
      setPhase2TargetPct(0);
      setDailyLossLimitPct(4);
      setMaxLossLimitPct(6);
      setLossType('Trailing');
    } else if (newMode === 2) {
      setPhase1TargetPct(8);
      setPhase2TargetPct(5);
      setDailyLossLimitPct(5);
      setMaxLossLimitPct(10);
      setLossType('Static');
    } else if (newMode === 3) {
      setPhase1TargetPct(6);
      setPhase2TargetPct(6);
      setDailyLossLimitPct(5);
      setMaxLossLimitPct(10);
      setLossType('Static');
    } else if (newMode === 0) {
      setPhase1TargetPct(0);
      setPhase2TargetPct(0);
      setDailyLossLimitPct(4);
      setMaxLossLimitPct(6);
      setLossType('Static');
    }
  };

  // Handle Custom Size submission from text input
  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customSizeInput.replace(/[^0-9]/g, '');
    const num = parseInt(clean, 10);
    if (!num || isNaN(num) || num <= 0) {
      alert('Please enter a valid numeric account size, e.g. 15000 or 75000');
      return;
    }
    addTier(num);
    setCustomSizeInput('');
  };

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!selectedFirmId && !customFirmName) {
      errors.push('Please select a Prop Firm or provide a Custom Firm Name.');
    }
    if (!seriesName.trim()) {
      errors.push('Please provide a Series / Model Name (e.g. 1-STEP or Instant ZERO).');
    }
    if (tiers.length === 0) {
      errors.push('Please add at least 1 Challenge Account Size tier.');
    }
    const missingPriceTier = tiers.find((t) => t.originalPrice <= 0 || t.discountedPrice <= 0);
    if (missingPriceTier) {
      errors.push(`Tier ${missingPriceTier.name} must have original and discounted prices greater than 0.`);
    }
    return errors;
  }, [selectedFirmId, customFirmName, seriesName, tiers]);

  // One-Click Batch Creation Handler
  const handleCreateBatch = async () => {
    if (validationErrors.length > 0) {
      alert('Cannot create batch:\n' + validationErrors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    try {
      const resolvedFirmName = currentFirm?.name || customFirmName || 'Prop Firm';
      const resolvedFirmSlug = currentFirm?.slug || customFirmName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'prop-firm';
      const resolvedFirmLogo = currentFirm?.logo_url || customFirmLogo || '/logos/nys.png';
      const resolvedFirmId = currentFirm?.id || resolvedFirmSlug;

      // Construct payload for all challenges
      const challengesPayload: Omit<Challenge, 'id'>[] = tiers.map((tier) => {
        return {
          firm_id: resolvedFirmId,
          firm_name: resolvedFirmName,
          firm_slug: resolvedFirmSlug,
          firm_logo: resolvedFirmLogo,
          name: tier.name.trim(),
          account_size: tier.size,
          steps: mode,
          price: tier.discountedPrice,
          original_price: tier.originalPrice,
          profit_split_pct: profitSplitPct,
          daily_loss_limit_pct: dailyLossLimitPct,
          max_loss_limit_pct: maxLossLimitPct,
          profit_target_pct: mode === 0 ? 0 : phase1TargetPct,
          phase_2_target_pct: mode >= 2 ? phase2TargetPct : 0,
          min_trading_days: hasMinTradingDays ? minTradingDaysCount : 0,
          max_trading_days: maxTradingDays || 'Unlimited',
          payout_frequency: payoutFrequency || 'Bi-Weekly / 14 Days',
          avg_payout: avgPayout || '$5,400',
          leverage: leverage || '1:100',
          refundable_fee: refundableFee,
          buy_url: affiliateUrl || 'https://discord.gg/ww4dkeeZdp',
          coupon_code: (couponCode || 'EMPIRE').toUpperCase().trim(),
          discount_pct: tier.discountPct,
          is_featured: tier.isFeatured,
          is_best_seller: tier.isBestSeller,
          category: category,
          rating: currentFirm?.rating || 4.9,
          review_count: currentFirm?.review_count || 1200,
          consistency_rule: hasConsistencyRule ? consistencyDetails : 'No Consistency Rule',
          max_risk_per_trade: maxRiskPerTrade || '2% / Trade',
          inactivity_period: inactivityPeriod || '30 Days',
          crypto_max_leverage: cryptoMaxLeverage || '1:5',
          crypto_max_open_positions: cryptoMaxOpenPositions || '5 Positions',
          crypto_total_notional_exposure: cryptoTotalNotionalExposure || '$250,000',
          news_trading: newsTrading,
          overnight_weekend: overnightWeekend,
          loss_type: lossType,
          ea_algo_trading: eaAllowed ? (eaDetails || 'YES / Allowed') : 'NO / Prohibited',
        };
      });

      // Save all in 1 single batch call
      const createdChallenges = await createChallengesBatch(challengesPayload);

      // Log Audit Action
      logAdminAction({
        action: `Batch Created ${createdChallenges.length} Challenges for ${resolvedFirmName} (${seriesName})`,
        module: 'challenges',
        target_id: `batch-${Date.now()}`,
        entity_name: `${resolvedFirmName} (${createdChallenges.length} Tiers)`,
        previous_state: null,
        new_state: {
          count: createdChallenges.length,
          firm: resolvedFirmName,
          mode,
          series: seriesName,
          tiers: tiers.map((t) => ({ size: t.size, price: t.discountedPrice })),
        },
      });

      setSubmittedBatch({
        count: createdChallenges.length,
        firmName: resolvedFirmName,
        challenges: createdChallenges,
      });

      if (onBatchCreated) {
        onBatchCreated(createdChallenges);
      }
    } catch (err: any) {
      console.error('Batch challenge creation failed:', err);
      alert('Failed to generate challenge batch: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Summary Metrics
  const totalAccountValue = tiers.reduce((sum, t) => sum + t.size, 0);
  const minPrice = tiers.length > 0 ? Math.min(...tiers.map((t) => t.discountedPrice)) : 0;
  const maxPrice = tiers.length > 0 ? Math.max(...tiers.map((t) => t.discountedPrice)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Heading */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black text-white dark:bg-white dark:text-black">
              <Zap className="w-3.5 h-3.5 fill-current" />
              BATCH CREATOR PORTAL
            </span>
            <span className="text-xs text-muted-foreground font-semibold">1-Time Rapid Data Entry</span>
          </div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Evaluation Challenge Batch Generator
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Create an entire tier suite ($5K, $15K, $100K, etc.) for any prop firm in 1 shot.
            Set the mode, affiliate link, rules, and discount once — the system generates all challenges automatically.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onSwitchToSingleView && (
            <button
              type="button"
              onClick={onSwitchToSingleView}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Back to Challenges Table</span>
            </button>
          )}

          <button
            type="button"
            disabled={isSubmitting || validationErrors.length > 0}
            onClick={handleCreateBatch}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md ${
              isSubmitting || validationErrors.length > 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                <span>Generating {tiers.length} Challenges...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Publish {tiers.length} Challenges</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {submittedBatch && (
        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border border-zinc-800 dark:border-zinc-200 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-black dark:bg-black dark:text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold">
                  Successfully Published {submittedBatch.count} Challenges for {submittedBatch.firmName}!
                </h2>
                <p className="text-xs text-zinc-300 dark:text-zinc-700">
                  All challenge account sizes, rules, and discounted prices are live and synced in the catalog.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubmittedBatch(null)}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 dark:border-zinc-300 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Dismiss
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800 dark:border-zinc-200 text-xs">
            <span className="font-semibold">Created Challenges:</span>
            {submittedBatch.challenges.map((c) => (
              <span key={c.id} className="px-2.5 py-1 rounded-md bg-zinc-800 dark:bg-zinc-200 font-mono text-[11px] font-bold">
                {c.name} (${c.price})
              </span>
            ))}
            {onSwitchToSingleView && (
              <button
                onClick={onSwitchToSingleView}
                className="ml-auto underline font-bold hover:text-zinc-300 dark:hover:text-zinc-700 text-xs"
              >
                View in Management Table →
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 1: FIRM, MODE, ASSET CLASS & SERIES IDENTITY */}
      <section className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-bold">
              1
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">Program Identity & Affiliate Settings</h2>
              <p className="text-xs text-muted-foreground">Select the prop firm, challenge mode, asset type, and series naming template.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Prop Firm Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Target Prop Firm *</span>
            </label>
            <select
              value={selectedFirmId}
              onChange={(e) => setSelectedFirmId(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:border-foreground font-semibold"
            >
              {firms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.rating ? `★ ${f.rating}` : 'Partner'})
                </option>
              ))}
            </select>
            {currentFirm && (
              <div className="flex items-center gap-2 pt-1">
                <img src={currentFirm.logo_url} alt={currentFirm.name} className="h-4 w-auto max-w-[24px] object-contain rounded" />
                <span className="text-[11px] text-muted-foreground font-medium truncate">{currentFirm.name} selected</span>
              </div>
            )}
          </div>

          {/* Evaluation Mode */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Evaluation Mode *</span>
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { label: '1-Step', val: 1 },
                { label: '2-Step', val: 2 },
                { label: '3-Step', val: 3 },
                { label: 'Instant', val: 0 },
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => handleModeChange(m.val)}
                  className={`py-2 rounded-xl text-center text-xs font-bold transition-all ${
                    mode === m.val
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground border border-zinc-200/80 dark:border-zinc-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Market / Asset Category */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Market Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:border-foreground"
            >
              <option value="forex">Forex & Multi-Asset</option>
              <option value="futures">Futures Contracts</option>
              <option value="crypto">Crypto Dedicated</option>
              <option value="instant-funding">Instant Direct Funding</option>
            </select>
          </div>

          {/* Series Custom Suffix Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground">
              Challenge Series Suffix *
            </label>
            <input
              type="text"
              required
              value={seriesName}
              onChange={(e) => {
                setSeriesName(e.target.value);
                updateAllTierNames(e.target.value);
              }}
              placeholder='e.g. 1STEP, Instant ZERO, Stellar'
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:border-foreground font-semibold"
            />
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <span className="text-[10px] text-muted-foreground">Presets:</span>
              {['1-STEP', 'Instant ZERO', '2-Step Stellar', 'Royal Evaluation', 'Pro 1-Step'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setSeriesName(p);
                    updateAllTierNames(p);
                  }}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground border border-zinc-200 dark:border-zinc-800"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Affiliate Link & Coupon & Naming Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="space-y-1.5 md:col-span-1">
            <label className="font-bold text-foreground">Naming Format Pattern</label>
            <select
              value={nameFormatPattern}
              onChange={(e) => {
                const pat = e.target.value as any;
                setNameFormatPattern(pat);
                updateAllTierNames(undefined, pat);
              }}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
            >
              <option value="size_series">$[Size] [Suffix] (e.g. $5K 1STEP, $100K 1STEP)</option>
              <option value="firm_size_series">[Firm] $[Size] [Suffix] (e.g. NYS $100K 1STEP)</option>
              <option value="size_firm_series">$[Size] [Firm] [Suffix] (e.g. $100K NYS 1STEP)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Affiliate Directing / Buy URL *</label>
            <input
              type="url"
              required
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              placeholder="https://firm.com/challenge?ref=empirial"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Promo Coupon Code</label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="EMPIRE"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono font-bold uppercase"
            />
          </div>
        </div>
      </section>

      {/* STEP 2: ACCOUNT SIZES, DISCOUNT % & REAL-TIME PRICE ENGINE */}
      <section className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-bold">
              2
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Challenge Tiers, Non-Discounted Prices & Automated Discount Calculator
              </h2>
              <p className="text-xs text-muted-foreground">
                Set the discount %. Enter the original price for each size — the discounted price is calculated in real-time.
              </p>
            </div>
          </div>

          {/* Master Discount % Widget */}
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5 px-3">
            <Percent className="w-4 h-4 text-foreground" />
            <span className="text-xs font-bold text-foreground whitespace-nowrap">Global Discount:</span>
            <input
              type="number"
              min="0"
              max="99"
              value={globalDiscountPct}
              onChange={(e) => handleGlobalDiscountChange(parseFloat(e.target.value) || 0)}
              className="w-14 bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs text-foreground focus:outline-none focus:border-foreground"
            />
            <span className="text-xs font-bold text-muted-foreground">% OFF</span>
          </div>
        </div>

        {/* Quick Discount Presets Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground font-semibold text-[11px]">Quick Discount Presets:</span>
          {[0, 10, 15, 20, 25, 30, 35, 40, 50].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handleGlobalDiscountChange(pct)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                globalDiscountPct === pct
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-muted-foreground'
              }`}
            >
              {pct === 0 ? '0% (No Discount)' : `${pct}% OFF`}
            </button>
          ))}
        </div>

        {/* Quick Add Sizes Chips */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground">Click to Quick-Add Sizes to Batch:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadPresetBundle(STANDARD_BUNDLE_SIZES)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-foreground border border-zinc-200 dark:border-zinc-800"
              >
                Load Standard ($5K - $200K)
              </button>
              <button
                type="button"
                onClick={() => loadPresetBundle(MICRO_MID_SIZES)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-foreground border border-zinc-200 dark:border-zinc-800"
              >
                Load Micro Bundle ($5K - $50K)
              </button>
              <button
                type="button"
                onClick={() => setTiers([])}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Clear All Tiers
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {COMMON_SIZE_PRESETS.map((preset) => {
              const isAdded = tiers.some((t) => t.size === preset.value);
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => addTier(preset.value)}
                  disabled={isAdded}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isAdded
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200/50 dark:border-zinc-800/50'
                      : 'bg-white hover:bg-zinc-100 dark:bg-card dark:hover:bg-zinc-800 text-foreground border border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-2xs'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  <span>+{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Size manual entry bar */}
          <div className="flex items-center gap-2 max-w-md pt-2">
            <div className="relative flex-1">
              <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSize();
                  }
                }}
                placeholder="Type any custom size (e.g. 15000 or 75000)"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-foreground font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAddCustomSize()}
              className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
            >
              Add Custom
            </button>
          </div>
        </div>

        {/* TIERS MATRIX TABLE */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-100/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 font-bold text-foreground">
                  <th className="py-3 px-3.5">Account Size</th>
                  <th className="py-3 px-3.5">Generated Challenge Name</th>
                  <th className="py-3 px-3.5">Original Price ($)</th>
                  <th className="py-3 px-3.5">Discount %</th>
                  <th className="py-3 px-3.5 bg-zinc-200/50 dark:bg-zinc-800/50">
                    Calculated Price ($)
                  </th>
                  <th className="py-3 px-3.5 text-center">Featured / Best Seller</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-card">
                {tiers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground text-xs">
                      No challenge account sizes added yet. Use the presets above or type a size to begin.
                    </td>
                  </tr>
                ) : (
                  tiers.map((tier) => {
                    const savings = Math.max(0, tier.originalPrice - tier.discountedPrice);
                    return (
                      <tr key={tier.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors">
                        {/* Size */}
                        <td className="py-3 px-3.5 font-extrabold text-foreground font-mono text-sm tracking-tight">
                          ${tier.size.toLocaleString('en-US')}
                        </td>

                        {/* Editable Name */}
                        <td className="py-3 px-3.5">
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-semibold focus:outline-none focus:border-foreground"
                          />
                        </td>

                        {/* Original Price */}
                        <td className="py-3 px-3.5">
                          <div className="relative w-28">
                            <DollarSign className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="number"
                              min="1"
                              value={tier.originalPrice || ''}
                              onChange={(e) =>
                                updateTier(tier.id, {
                                  originalPrice: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder="e.g. 599"
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-6 pr-2 py-1.5 text-foreground font-mono font-bold focus:outline-none focus:border-foreground"
                            />
                          </div>
                        </td>

                        {/* Discount % Override */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1 w-20">
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={tier.discountPct}
                              onChange={(e) =>
                                updateTier(tier.id, {
                                  discountPct: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-center text-foreground font-mono font-bold focus:outline-none focus:border-foreground"
                            />
                            <span className="text-muted-foreground font-semibold">%</span>
                          </div>
                        </td>

                        {/* Real-Time Calculated Price */}
                        <td className="py-3 px-3.5 bg-zinc-50/50 dark:bg-zinc-900/50">
                          <div className="flex items-center gap-2">
                            <div className="relative w-28">
                              <DollarSign className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-foreground font-bold" />
                              <input
                                type="number"
                                min="1"
                                value={tier.discountedPrice || ''}
                                onChange={(e) =>
                                  updateTier(tier.id, {
                                    discountedPrice: parseFloat(e.target.value) || 0,
                                    isCustomPrice: true,
                                  })
                                }
                                className="w-full bg-white dark:bg-card border border-zinc-300 dark:border-zinc-700 rounded-lg pl-6 pr-2 py-1.5 text-foreground font-mono font-extrabold text-sm focus:outline-none focus:border-foreground"
                              />
                            </div>

                            {savings > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-muted-foreground whitespace-nowrap">
                                Save ${savings}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Featured / Best Seller Badges */}
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <label className="flex items-center gap-1 cursor-pointer text-[11px]">
                              <input
                                type="checkbox"
                                checked={tier.isFeatured}
                                onChange={(e) => updateTier(tier.id, { isFeatured: e.target.checked })}
                                className="rounded text-black dark:text-white"
                              />
                              <span className="text-muted-foreground font-medium">Featured</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer text-[11px]">
                              <input
                                type="checkbox"
                                checked={tier.isBestSeller}
                                onChange={(e) => updateTier(tier.id, { isBestSeller: e.target.checked })}
                                className="rounded text-black dark:text-white"
                              />
                              <span className="font-bold text-foreground">Best Seller</span>
                            </label>
                          </div>
                        </td>

                        {/* Action: Delete */}
                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => removeTier(tier.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Remove Tier"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* STEP 3: COMMON 1-TIME RULES & TRADING PARAMETERS */}
      <section className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-bold">
              3
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Common Account Rules & Parameters (Applied to Entire Batch)
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure EA allowances, consistency rule, trading days, drawdowns, profit splits, and payout schedules 1 time for this entire series.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          {/* EA & Algo Trading */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-xs">EA & Algo Trading</span>
              <div className="flex items-center gap-1 bg-white dark:bg-card p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setEaAllowed(true);
                    setEaDetails('YES / Allowed');
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    eaAllowed ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-muted-foreground'
                  }`}
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEaAllowed(false);
                    setEaDetails('NO / Prohibited');
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    !eaAllowed ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-muted-foreground'
                  }`}
                >
                  NO
                </button>
              </div>
            </div>
            <input
              type="text"
              value={eaDetails}
              onChange={(e) => setEaDetails(e.target.value)}
              placeholder="e.g. YES / Allowed"
              className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-foreground"
            />
          </div>

          {/* Consistency Rule */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-xs">Consistency Rule</span>
              <div className="flex items-center gap-1 bg-white dark:bg-card p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setHasConsistencyRule(false);
                    setConsistencyDetails('No Consistency Rule');
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    !hasConsistencyRule ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-muted-foreground'
                  }`}
                >
                  NO RULE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasConsistencyRule(true);
                    setConsistencyDetails('30% Daily Profit Consistency');
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    hasConsistencyRule ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-muted-foreground'
                  }`}
                >
                  HAS RULE
                </button>
              </div>
            </div>
            <input
              type="text"
              value={consistencyDetails}
              onChange={(e) => setConsistencyDetails(e.target.value)}
              placeholder="e.g. No Consistency Rule"
              className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-foreground"
            />
          </div>

          {/* Min Trading Days */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-xs">Minimum Trading Days</span>
              <div className="flex items-center gap-1 bg-white dark:bg-card p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setHasMinTradingDays(false);
                    setMinTradingDaysCount(0);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    !hasMinTradingDays ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-muted-foreground'
                  }`}
                >
                  0 (NO MIN)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasMinTradingDays(true);
                    setMinTradingDaysCount(minTradingDaysCount || 3);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    hasMinTradingDays ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-muted-foreground'
                  }`}
                >
                  SET DAYS
                </button>
              </div>
            </div>
            {hasMinTradingDays ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={minTradingDaysCount}
                  onChange={(e) => setMinTradingDaysCount(parseInt(e.target.value) || 0)}
                  className="w-20 bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-foreground font-mono font-bold"
                />
                <span className="text-muted-foreground font-semibold">Minimum Days Required</span>
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground font-medium py-1.5">
                ✓ 0 Days Minimum (Instant pass allowed)
              </div>
            )}
          </div>

          {/* Profit Targets Phase 1 & 2 */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-foreground text-xs block">Profit Targets</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Phase 1 Target (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={phase1TargetPct}
                  onChange={(e) => setPhase1TargetPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">
                  Phase 2 Target (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  disabled={mode < 2}
                  value={mode < 2 ? 0 : phase2TargetPct}
                  onChange={(e) => setPhase2TargetPct(parseFloat(e.target.value) || 0)}
                  className={`w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold ${
                    mode < 2 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Daily & Max Drawdown */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-foreground text-xs block">Drawdowns & Loss Model</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Daily DD (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={dailyLossLimitPct}
                  onChange={(e) => setDailyLossLimitPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-foreground font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Max DD (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={maxLossLimitPct}
                  onChange={(e) => setMaxLossLimitPct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-foreground font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Type</label>
                <select
                  value={lossType}
                  onChange={(e) => setLossType(e.target.value as any)}
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-foreground font-bold"
                >
                  <option value="Static">Static</option>
                  <option value="Trailing">Trailing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Profit Split & Payout Frequency */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-foreground text-xs block">Profit Split & Payouts</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Profit Split (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={profitSplitPct}
                  onChange={(e) => setProfitSplitPct(parseInt(e.target.value) || 80)}
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Payout Cycle</label>
                <input
                  type="text"
                  value={payoutFrequency}
                  onChange={(e) => setPayoutFrequency(e.target.value)}
                  placeholder="Bi-Weekly"
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Leverage & News Trading */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-foreground text-xs block">Trading Environment</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Leverage</label>
                <input
                  type="text"
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  placeholder="1:100"
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">News Trading</label>
                <input
                  type="text"
                  value={newsTrading}
                  onChange={(e) => setNewsTrading(e.target.value)}
                  placeholder="YES / Allowed"
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Weekend Holding & Refundable Fee */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-foreground text-xs block">Holding & Fees</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Overnight & Weekend</label>
                <input
                  type="text"
                  value={overnightWeekend}
                  onChange={(e) => setOvernightWeekend(e.target.value)}
                  placeholder="YES | YES"
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-semibold"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={refundableFee}
                    onChange={(e) => setRefundableFee(e.target.checked)}
                    className="rounded text-black dark:text-white"
                  />
                  <span className="font-bold text-foreground text-xs">Refundable Fee</span>
                </label>
              </div>
            </div>
          </div>

          {/* Average Payout & Max Trading Days */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-foreground text-xs block">Payout Stats & Max Days</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Avg Payout ($)</label>
                <input
                  type="text"
                  value={avgPayout}
                  onChange={(e) => setAvgPayout(e.target.value)}
                  placeholder="$5,400"
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Max Days</label>
                <input
                  type="text"
                  value={maxTradingDays}
                  onChange={(e) => setMaxTradingDays(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Max Risk Per Trade & Inactivity Period */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="font-bold text-foreground text-xs block">Risk & Inactivity Parameters</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Max Risk / Trade</label>
                <input
                  type="text"
                  value={maxRiskPerTrade}
                  onChange={(e) => setMaxRiskPerTrade(e.target.value)}
                  placeholder="2% / Trade"
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-mono font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Inactivity Period</label>
                <input
                  type="text"
                  value={inactivityPeriod}
                  onChange={(e) => setInactivityPeriod(e.target.value)}
                  placeholder="30 Days"
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Dedicated Crypto Challenges Settings */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold">
                  ₿
                </span>
                Dedicated Crypto Challenges Settings
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">Applied to crypto & multi-asset challenges in this batch</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">MAX Leverage</label>
                <input
                  type="text"
                  value={cryptoMaxLeverage}
                  onChange={(e) => setCryptoMaxLeverage(e.target.value)}
                  placeholder="1:5"
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Max Open Positions</label>
                <input
                  type="text"
                  value={cryptoMaxOpenPositions}
                  onChange={(e) => setCryptoMaxOpenPositions(e.target.value)}
                  placeholder="5 Positions"
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase block">Total Notional Exposure</label>
                <input
                  type="text"
                  value={cryptoTotalNotionalExposure}
                  onChange={(e) => setCryptoTotalNotionalExposure(e.target.value)}
                  placeholder="$250,000"
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-foreground font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 4: LIVE BATCH SUMMARY & INSTANT PUBLISH */}
      <section className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-foreground" />
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Live Batch Verification & Instant Publication
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review the batch metrics before publishing {tiers.length} challenge tiers to the catalog.
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting || validationErrors.length > 0}
            onClick={handleCreateBatch}
            className={`inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-sm font-bold transition-all cursor-pointer shadow-lg ${
              isSubmitting || validationErrors.length > 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                <span>Publishing Challenges...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>⚡ Generate & Publish {tiers.length} Challenges</span>
              </>
            )}
          </button>
        </div>

        {/* Validation Errors If Any */}
        {validationErrors.length > 0 && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Please resolve before publishing:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Summary Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Tiers in Batch</span>
            <span className="text-xl font-extrabold text-foreground tracking-tight">{tiers.length} Challenges</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Size Coverage</span>
            <span className="text-xl font-extrabold text-foreground tracking-tight">
              {tiers.length > 0 ? `${formatSizeAbbr(tiers[0]?.size)} → ${formatSizeAbbr(tiers[tiers.length - 1]?.size)}` : 'N/A'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Price Range</span>
            <span className="text-xl font-extrabold text-foreground tracking-tight">
              ${minPrice} → ${maxPrice}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Discount Tag</span>
            <span className="text-xl font-extrabold text-foreground tracking-tight">{globalDiscountPct}% OFF</span>
          </div>
        </div>

        {/* Live Card Preview Box */}
        {tiers.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Live Card Preview (Public Website Format)
            </span>

            <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 space-y-4 shadow-sm max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={currentFirm?.logo_url || '/logos/nys.png'}
                      alt={currentFirm?.name || 'Firm'}
                      className="h-7 w-auto max-w-[36px] object-contain rounded-md"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-foreground">{currentFirm?.name || 'Prop Firm'}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {tiers[tiers.length - 1]?.name || 'Challenge Name'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Account Size</span>
                    <span className="font-extrabold text-foreground tracking-tight">
                      ${(tiers[tiers.length - 1]?.size || 100000).toLocaleString('en-US')}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground">
                    {mode === 0 ? 'Instant' : `${mode}-Step`}
                  </span>

                  <div>
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Target</span>
                    <span className="font-extrabold text-foreground">
                      {mode === 0 ? 'No Target' : `${phase1TargetPct}% ${mode >= 2 ? `| ${phase2TargetPct}%` : ''}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Daily | Max DD</span>
                    <span className="font-extrabold text-foreground">
                      {dailyLossLimitPct}% | {maxLossLimitPct}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Split</span>
                    <span className="font-extrabold text-foreground">Up to {profitSplitPct}%</span>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-foreground">${tiers[tiers.length - 1]?.discountedPrice}</div>
                    <div className="text-[10px] line-through text-muted-foreground">
                      ${tiers[tiers.length - 1]?.originalPrice}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] font-bold">
                      Code {couponCode || 'EMPIRE'}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs">
                      BUY
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Detail Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Payout Cycle</span>
                  <span className="font-bold text-foreground">{payoutFrequency}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Average Payout</span>
                  <span className="font-extrabold text-foreground">{avgPayout}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Consistency</span>
                  <span className="font-bold text-foreground">
                    {hasConsistencyRule ? consistencyDetails : 'No Consistency Rule'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Minimum Days</span>
                  <span className="font-bold text-foreground">
                    {hasMinTradingDays ? `${minTradingDaysCount} Days` : '0 Days (No Min)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
