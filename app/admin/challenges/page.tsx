'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Plus,
  Trash2,
  Edit,
  X,
  Search,
  Building2,
  Copy,
  ExternalLink,
  Star,
  Clock,
  ShieldCheck,
  Check,
  Percent,
  Zap,
  Layers,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { MOCK_CHALLENGES } from '@/lib/data/challenges-data';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { Firm, Challenge } from '@/lib/types';
import {
  getChallenges,
  getFirms,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  deleteChallengesBatch,
  updateFirm,
} from '@/lib/firebase/services';
import { getStoredChallenges, saveStoredChallenges } from '@/lib/utils/challenges-store';
import { updateStoredFirm } from '@/lib/utils/firms-store';
import { logAdminAction } from '@/lib/utils/audit-log-store';
import BatchChallengePortal from '@/components/admin/BatchChallengePortal';

export default function AdminChallengesPage() {
  const [activeTab, setActiveTab] = useState<'batch' | 'directory'>('directory');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFirmFilter, setSelectedFirmFilter] = useState('all');
  const [stepsFilter, setStepsFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewStyle, setViewStyle] = useState<'cards' | 'table'>('cards');

  // Multi-selection for bulk delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Bulk Edit by Firm State
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkTargetFirmId, setBulkTargetFirmId] = useState<string>('');
  const [bulkScope, setBulkScope] = useState<'all' | 'selected'>('all');
  const [bulkEnableDiscount, setBulkEnableDiscount] = useState(true);
  const [bulkDiscountPct, setBulkDiscountPct] = useState<number>(50);
  const [bulkAutoRecalculatePrices, setBulkAutoRecalculatePrices] = useState(true);
  const [bulkApplyToPrice, setBulkApplyToPrice] = useState(true);
  const [bulkEnableCoupon, setBulkEnableCoupon] = useState(true);
  const [bulkCouponCode, setBulkCouponCode] = useState<string>('EMPIRIAL50');
  const [bulkEnableBuyUrl, setBulkEnableBuyUrl] = useState(false);
  const [bulkBuyUrl, setBulkBuyUrl] = useState<string>('');
  const [bulkEnableProfitSplit, setBulkEnableProfitSplit] = useState(false);
  const [bulkProfitSplit, setBulkProfitSplit] = useState<number>(80);
  const [bulkEnablePayoutFreq, setBulkEnablePayoutFreq] = useState(false);
  const [bulkPayoutFreq, setBulkPayoutFreq] = useState<string>('Bi-Weekly / 14 Days');
  const [bulkEnableLeverage, setBulkEnableLeverage] = useState(false);
  const [bulkLeverage, setBulkLeverage] = useState<string>('1:100');
  const [bulkSyncFirmProfile, setBulkSyncFirmProfile] = useState(true);
  const [bulkFeaturedMode, setBulkFeaturedMode] = useState<'keep' | 'set_true' | 'set_false'>('keep');
  const [bulkBestSellerMode, setBulkBestSellerMode] = useState<'keep' | 'set_true' | 'set_false'>('keep');
  const [isBulkApplying, setIsBulkApplying] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Single Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  // Single Form State
  const [formData, setFormData] = useState<Partial<Challenge>>({
    firm_id: 'orion-funded',
    firm_name: 'Orion Funded',
    firm_slug: 'orion-funded',
    firm_logo: '/logos/orion-funded.svg',
    name: '$5,000 2-Step Standard',
    account_size: 5000,
    steps: 2,
    price: 30,
    original_price: 59,
    profit_split_pct: 80,
    daily_loss_limit_pct: 3,
    max_loss_limit_pct: 6,
    profit_target_pct: 6,
    phase_2_target_pct: 6,
    min_trading_days: 4,
    max_trading_days: 'Unlimited',
    payout_frequency: 'Bi-Weekly / 14 Days',
    leverage: '1:100',
    refundable_fee: true,
    buy_url: 'https://www.orionfunded.com?coupon=EMPIRIAL50',
    coupon_code: 'EMPIRIAL50',
    discount_pct: 50,
    is_featured: true,
    is_best_seller: false,
    category: 'forex',
    rating: 4.5,
    review_count: 2100,
    consistency_rule: 'No Best Day Rule',
    max_risk_per_trade: 'No Limit',
    inactivity_period: '30 Days',
    crypto_max_leverage: '1:20',
    crypto_max_open_positions: '',
    crypto_total_notional_exposure: '',
    news_trading: 'YES / Allowed',
    overnight_weekend: 'YES | YES',
    loss_type: 'Static',
    ea_algo_trading: 'YES | YES',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [challsData, firmsData] = await Promise.all([getChallenges(), getFirms()]);
        const challMap = new Map<string, Challenge>();
        MOCK_CHALLENGES.forEach((c: Challenge) => { if (c.id) challMap.set(c.id, c); });
        const localChalls: Challenge[] = typeof window !== 'undefined' ? getStoredChallenges() : [];
        localChalls.forEach((c: Challenge) => { if (c.id) challMap.set(c.id, c); });
        (challsData || []).forEach((c: Challenge) => { if (c.id) challMap.set(c.id, c); });
        const resolvedChallenges = Array.from(challMap.values());
        setChallenges(resolvedChallenges);

        const resolvedFirms = firmsData.length > 0 ? firmsData : MOCK_FIRMS;
        setFirms(resolvedFirms);
        if (resolvedFirms.length > 0) {
          const defaultF = resolvedFirms.find((f) => f.id === 'orion-funded') || resolvedFirms[0];
          setFormData((prev) => ({
            ...prev,
            firm_id: defaultF.id,
            firm_name: defaultF.name,
            firm_slug: defaultF.slug,
            firm_logo: defaultF.logo_url,
            coupon_code: defaultF.coupon_code_custom || 'EMPIRIAL50',
            discount_pct: defaultF.discount_pct || 50,
            buy_url: defaultF.buy_url || 'https://www.orionfunded.com?coupon=EMPIRIAL50',
          }));
        }
      } catch (err) {
        console.error('Failed to load challenges database:', err);
        setChallenges(MOCK_CHALLENGES);
        setFirms(MOCK_FIRMS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFirmSelectChange = (firmId: string) => {
    const matched = firms.find((f) => f.id === firmId);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        firm_id: matched.id,
        firm_name: matched.name,
        firm_slug: matched.slug,
        firm_logo: matched.logo_url,
        rating: matched.rating || prev.rating || 4.5,
        review_count: matched.review_count || prev.review_count || 2100,
        buy_url: matched.buy_url || prev.buy_url,
        coupon_code: matched.coupon_code_custom || prev.coupon_code || 'EMPIRIAL50',
        discount_pct: matched.discount_pct || prev.discount_pct || 50,
      }));
    }
  };

  const handleStartAdd = () => {
    const defaultFirm = firms.find((f) => f.id === 'orion-funded') || firms[0] || {
      id: 'orion-funded',
      name: 'Orion Funded',
      slug: 'orion-funded',
      logo_url: '/logos/orion-funded.svg',
      rating: 4.5,
      review_count: 2100,
    };
    setFormData({
      firm_id: defaultFirm.id,
      firm_name: defaultFirm.name,
      firm_slug: defaultFirm.slug,
      firm_logo: defaultFirm.logo_url,
      name: '$5,000 2-Step Standard',
      account_size: 5000,
      steps: 2,
      price: 30,
      original_price: 59,
      profit_split_pct: 80,
      daily_loss_limit_pct: 3,
      max_loss_limit_pct: 6,
      profit_target_pct: 6,
      phase_2_target_pct: 6,
      min_trading_days: 4,
      max_trading_days: 'Unlimited',
      payout_frequency: 'Bi-Weekly / 14 Days',
      avg_payout: '$5,400',
      leverage: '1:100',
      refundable_fee: true,
      buy_url: defaultFirm.buy_url || 'https://discord.gg/ww4dkeeZdp',
      coupon_code: defaultFirm.coupon_code_custom || 'EMPIRE',
      discount_pct: defaultFirm.discount_pct || 20,
      is_featured: true,
      is_best_seller: false,
      category: 'forex',
      rating: defaultFirm.rating || 4.9,
      review_count: defaultFirm.review_count || 1200,
      consistency_rule: 'No Consistency Rule',
      max_risk_per_trade: '2% / Trade',
      inactivity_period: '30 Days',
      crypto_max_leverage: '1:5',
      crypto_max_open_positions: '5 Positions',
      crypto_total_notional_exposure: '$250,000',
      news_trading: 'YES / Allowed',
      overnight_weekend: 'YES | YES',
      loss_type: 'Static',
      ea_algo_trading: 'YES | YES',
    });
    setEditingChallenge(null);
    setIsAdding(true);
  };

  const handleStartEdit = (challenge: Challenge) => {
    setFormData({
      ...challenge,
    });
    setEditingChallenge(challenge);
    setIsAdding(true);
  };

  const handleDuplicate = (challenge: Challenge) => {
    setFormData({
      ...challenge,
      name: `${challenge.name} (Copy)`,
    });
    setEditingChallenge(null);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently remove this evaluation challenge?')) return;
    const targetChallenge = challenges.find((c) => c.id === id);
    try {
      await deleteChallenge(id);
    } catch (err) {
      console.error('Failed to delete challenge:', err);
    }
    setChallenges(challenges.filter((c) => c.id !== id));
    setSelectedIds(selectedIds.filter((selId) => selId !== id));
    logAdminAction({
      action: `Deleted Challenge: ${targetChallenge?.name || id}`,
      module: 'challenges',
      target_id: id,
      entity_name: targetChallenge?.name || id,
      previous_state: targetChallenge || null,
      new_state: null,
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently remove ${selectedIds.length} challenges?`)) return;

    try {
      await deleteChallengesBatch(selectedIds);
    } catch (err) {
      console.error('Failed to bulk delete challenges:', err);
    }

    const removedCount = selectedIds.length;
    setChallenges(challenges.filter((c) => !selectedIds.includes(c.id)));
    setSelectedIds([]);

    logAdminAction({
      action: `Bulk Deleted ${removedCount} Challenges`,
      module: 'challenges',
      target_id: `bulk-${Date.now()}`,
      entity_name: `${removedCount} Challenges`,
      previous_state: null,
      new_state: null,
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredChallenges.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredChallenges.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selId) => selId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenBulkFirmEdit = (targetFirmId?: string) => {
    const resolvedFirmId =
      targetFirmId ||
      (selectedFirmFilter !== 'all' ? selectedFirmFilter : '') ||
      (firms.some((f) => f.id === 'orion-funded') ? 'orion-funded' : firms[0]?.id || '');

    const targetFirm = firms.find((f) => f.id === resolvedFirmId);
    setBulkTargetFirmId(resolvedFirmId);

    const selectedBelongingToFirm = selectedIds.filter((id) => {
      const ch = challenges.find((c) => c.id === id);
      return ch?.firm_id === resolvedFirmId;
    });

    if (selectedBelongingToFirm.length > 0 && selectedIds.length === selectedBelongingToFirm.length) {
      setBulkScope('selected');
    } else {
      setBulkScope('all');
    }

    const initialDiscount =
      resolvedFirmId === 'orion-funded' ? 50 : targetFirm?.discount_pct || 20;
    setBulkDiscountPct(initialDiscount);
    setBulkEnableDiscount(true);
    setBulkAutoRecalculatePrices(true);
    setBulkApplyToPrice(true);

    const initialCoupon =
      resolvedFirmId === 'orion-funded'
        ? (initialDiscount === 50 ? 'EMPIRIAL50' : 'EMPIRIAL')
        : targetFirm?.coupon_code_custom || 'EMPIRE';
    setBulkCouponCode(initialCoupon);
    setBulkEnableCoupon(true);

    const initialBuyUrl =
      resolvedFirmId === 'orion-funded'
        ? (initialDiscount === 50
            ? 'https://www.orionfunded.com?coupon=EMPIRIAL50'
            : 'https://www.orionfunded.com?coupon=EMPIRIAL')
        : targetFirm?.buy_url || '';
    setBulkBuyUrl(initialBuyUrl);
    setBulkEnableBuyUrl(resolvedFirmId === 'orion-funded');

    setBulkProfitSplit(80);
    setBulkEnableProfitSplit(false);
    setBulkPayoutFreq('Bi-Weekly / 14 Days');
    setBulkEnablePayoutFreq(false);
    setBulkLeverage('1:100');
    setBulkEnableLeverage(false);
    setBulkFeaturedMode('keep');
    setBulkBestSellerMode('keep');
    setBulkSyncFirmProfile(true);
    setBulkFeedback(null);
    setIsBulkEditModalOpen(true);
  };

  const targetChallengesForBulkEdit = useMemo(() => {
    if (!bulkTargetFirmId) return [];
    return challenges.filter((c) => {
      if (c.firm_id !== bulkTargetFirmId) return false;
      if (bulkScope === 'selected') {
        return selectedIds.includes(c.id);
      }
      return true;
    });
  }, [challenges, bulkTargetFirmId, bulkScope, selectedIds]);

  const previewChallenges = useMemo(() => {
    return targetChallengesForBulkEdit.map((ch) => {
      const origPrice = ch.original_price || ch.price;
      const targetDiscount = bulkEnableDiscount ? bulkDiscountPct : (ch.discount_pct || 0);

      let newPrice = ch.price;
      let newDiscountedPrice = ch.discounted_price || ch.price;

      if (bulkEnableDiscount && bulkAutoRecalculatePrices) {
        const calculatedDiscountPrice = Math.max(1, Math.round(origPrice * (1 - targetDiscount / 100)));
        newDiscountedPrice = calculatedDiscountPrice;
        if (bulkApplyToPrice) {
          newPrice = calculatedDiscountPrice;
        }
      }

      const newCoupon = bulkEnableCoupon ? bulkCouponCode.trim().toUpperCase() : ch.coupon_code;
      const newBuyUrl = bulkEnableBuyUrl && bulkBuyUrl.trim() ? bulkBuyUrl.trim() : ch.buy_url;
      const newProfitSplit = bulkEnableProfitSplit ? bulkProfitSplit : ch.profit_split_pct;
      const newPayoutFreq = bulkEnablePayoutFreq && bulkPayoutFreq ? bulkPayoutFreq : ch.payout_frequency;
      const newLeverage = bulkEnableLeverage && bulkLeverage ? bulkLeverage : ch.leverage;
      const newFeatured =
        bulkFeaturedMode === 'set_true' ? true : bulkFeaturedMode === 'set_false' ? false : ch.is_featured;
      const newBestSeller =
        bulkBestSellerMode === 'set_true' ? true : bulkBestSellerMode === 'set_false' ? false : ch.is_best_seller;

      const updates: Partial<Challenge> = {
        ...(bulkEnableDiscount ? { discount_pct: targetDiscount, discounted_price: newDiscountedPrice } : {}),
        ...(bulkEnableDiscount && bulkAutoRecalculatePrices && bulkApplyToPrice ? { price: newPrice } : {}),
        ...(bulkEnableCoupon ? { coupon_code: newCoupon } : {}),
        ...(bulkEnableBuyUrl && bulkBuyUrl.trim() ? { buy_url: newBuyUrl } : {}),
        ...(bulkEnableProfitSplit ? { profit_split_pct: newProfitSplit } : {}),
        ...(bulkEnablePayoutFreq && bulkPayoutFreq ? { payout_frequency: newPayoutFreq } : {}),
        ...(bulkEnableLeverage && bulkLeverage ? { leverage: newLeverage } : {}),
        ...(bulkFeaturedMode !== 'keep' ? { is_featured: newFeatured } : {}),
        ...(bulkBestSellerMode !== 'keep' ? { is_best_seller: newBestSeller } : {}),
      };

      return {
        id: ch.id,
        name: ch.name,
        account_size: ch.account_size,
        origPrice,
        oldPrice: ch.price,
        oldDiscount: ch.discount_pct || 0,
        oldCoupon: ch.coupon_code,
        newPrice,
        newDiscount: targetDiscount,
        newDiscountedPrice,
        newCoupon,
        savings: origPrice - newPrice,
        updates,
      };
    });
  }, [
    targetChallengesForBulkEdit,
    bulkEnableDiscount,
    bulkDiscountPct,
    bulkAutoRecalculatePrices,
    bulkApplyToPrice,
    bulkEnableCoupon,
    bulkCouponCode,
    bulkEnableBuyUrl,
    bulkBuyUrl,
    bulkEnableProfitSplit,
    bulkProfitSplit,
    bulkEnablePayoutFreq,
    bulkPayoutFreq,
    bulkEnableLeverage,
    bulkLeverage,
    bulkFeaturedMode,
    bulkBestSellerMode,
  ]);

  const handleApplyBulkFirmUpdate = async () => {
    if (previewChallenges.length === 0) {
      alert('No challenges found to update for the selected firm and scope.');
      return;
    }

    setIsBulkApplying(true);
    setBulkFeedback(null);

    const targetFirm = firms.find((f) => f.id === bulkTargetFirmId);
    const firmName = targetFirm?.name || bulkTargetFirmId;

    try {
      const updateMap = new Map<string, Partial<Challenge>>();
      previewChallenges.forEach((item) => {
        updateMap.set(item.id, item.updates);
      });

      const updatedChallenges = challenges.map((ch) => {
        const patch = updateMap.get(ch.id);
        if (patch) {
          return { ...ch, ...patch };
        }
        return ch;
      });

      setChallenges(updatedChallenges);
      saveStoredChallenges(updatedChallenges);

      const updatePromises = previewChallenges.map((item) =>
        updateChallenge(item.id, item.updates).catch((err) =>
          console.warn(`Failed Firestore update for challenge ${item.id}:`, err)
        )
      );

      if (bulkSyncFirmProfile && targetFirm) {
        const firmUpdates: Partial<Firm> = {};
        if (bulkEnableDiscount) {
          firmUpdates.discount_pct = bulkDiscountPct;
          firmUpdates.discount_label_custom = `${bulkDiscountPct}% OFF`;
        }
        if (bulkEnableCoupon) {
          firmUpdates.coupon_code_custom = bulkCouponCode.trim().toUpperCase();
        }
        if (bulkEnableBuyUrl && bulkBuyUrl.trim()) {
          firmUpdates.buy_url = bulkBuyUrl.trim();
        }

        if (Object.keys(firmUpdates).length > 0) {
          updateStoredFirm(targetFirm.id, firmUpdates);
          updateFirm(targetFirm.id, firmUpdates).catch((err) =>
            console.warn(`Failed Firestore update for firm ${targetFirm.id}:`, err)
          );
          setFirms((prevFirms) =>
            prevFirms.map((f) => (f.id === targetFirm.id ? { ...f, ...firmUpdates } : f))
          );
        }
      }

      await Promise.allSettled(updatePromises);

      logAdminAction({
        action: `Bulk updated ${previewChallenges.length} challenges for ${firmName} (Discount: ${bulkEnableDiscount ? `${bulkDiscountPct}%` : 'unchanged'}, Coupon: ${bulkEnableCoupon ? bulkCouponCode : 'unchanged'})`,
        module: 'challenges',
        target_id: `bulk-${bulkTargetFirmId}-${Date.now()}`,
        entity_name: `${firmName} (${previewChallenges.length} challenges)`,
        previous_state: null,
        new_state: {
          firm_id: bulkTargetFirmId,
          count: previewChallenges.length,
          discount_pct: bulkEnableDiscount ? bulkDiscountPct : undefined,
          coupon_code: bulkEnableCoupon ? bulkCouponCode : undefined,
        },
      });

      setBulkFeedback({
        type: 'success',
        message: `Successfully updated ${previewChallenges.length} challenges for ${firmName}! All prices and discounts are now live across the platform.`,
      });

      setTimeout(() => {
        setIsBulkEditModalOpen(false);
        setBulkFeedback(null);
      }, 1500);
    } catch (err: any) {
      console.error('Error during bulk challenges update:', err);
      setBulkFeedback({
        type: 'error',
        message: `Failed to complete bulk update: ${err?.message || 'Unknown error'}`,
      });
    } finally {
      setIsBulkApplying(false);
    }
  };

  const parseNum = (val: any, fallback: number): number => {
    if (val === undefined || val === null || val === '') return fallback;
    const num = typeof val === 'number' ? val : Number(val);
    return isNaN(num) ? fallback : num;
  };

  // Automated price calculation handler in single edit modal
  const handleOriginalPriceChange = (val: number) => {
    const disc = formData.discount_pct ?? 20;
    const calcPrice = Math.max(0, Math.round(val * (1 - disc / 100)));
    setFormData((prev) => ({
      ...prev,
      original_price: val,
      price: calcPrice,
    }));
  };

  const handleDiscountPctChange = (disc: number) => {
    const orig = formData.original_price ?? 599;
    const calcPrice = Math.max(0, Math.round(orig * (1 - disc / 100)));
    setFormData((prev) => ({
      ...prev,
      discount_pct: disc,
      price: calcPrice,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.firm_id) {
      alert('Firm and challenge name are required');
      return;
    }

    const selectedFirm = firms.find((f) => f.id === formData.firm_id);
    const stepsVal = parseNum(formData.steps, 2);

    const payload: Omit<Challenge, 'id'> = {
      firm_id: formData.firm_id,
      firm_name: selectedFirm?.name || formData.firm_name || 'Prop Firm',
      firm_slug: selectedFirm?.slug || formData.firm_slug || 'prop-firm',
      firm_logo: selectedFirm?.logo_url || formData.firm_logo || '/logos/nys.png',
      name: formData.name.trim(),
      account_size: parseNum(formData.account_size, 100000),
      steps: stepsVal,
      price: parseNum(formData.price, 499),
      original_price: parseNum(formData.original_price, 599),
      profit_split_pct: parseNum(formData.profit_split_pct, 85),
      daily_loss_limit_pct: parseNum(formData.daily_loss_limit_pct, 5),
      max_loss_limit_pct: parseNum(formData.max_loss_limit_pct, 10),
      profit_target_pct: stepsVal === 0 ? 0 : parseNum(formData.profit_target_pct, 8),
      phase_2_target_pct: stepsVal < 2 ? 0 : parseNum(formData.phase_2_target_pct, 0),
      min_trading_days: parseNum(formData.min_trading_days, 0),
      max_trading_days: formData.max_trading_days || 'Unlimited',
      payout_frequency: formData.payout_frequency || 'Bi-Weekly / 14 Days',
      avg_payout: formData.avg_payout || '$5,400',
      leverage: formData.leverage || '1:100',
      refundable_fee: !!formData.refundable_fee,
      buy_url: formData.buy_url || 'https://discord.gg/ww4dkeeZdp',
      coupon_code: (formData.coupon_code || 'EMPIRE').toUpperCase(),
      discount_pct: parseNum(formData.discount_pct, 20),
      is_featured: !!formData.is_featured,
      is_best_seller: !!formData.is_best_seller,
      category: formData.category || 'forex',
      rating: parseNum(formData.rating, selectedFirm?.rating || 4.9),
      review_count: parseNum(formData.review_count, selectedFirm?.review_count || 1200),
      consistency_rule: formData.consistency_rule || 'No Consistency Rule',
      max_risk_per_trade: formData.max_risk_per_trade || '2% / Trade',
      inactivity_period: formData.inactivity_period || '30 Days',
      crypto_max_leverage: formData.crypto_max_leverage || '1:5',
      crypto_max_open_positions: formData.crypto_max_open_positions || '5 Positions',
      crypto_total_notional_exposure: formData.crypto_total_notional_exposure || '$250,000',
      news_trading: formData.news_trading || 'YES / Allowed',
      overnight_weekend: formData.overnight_weekend || 'YES | YES',
      loss_type: formData.loss_type || 'Static',
      ea_algo_trading: formData.ea_algo_trading || 'YES | YES',
    };

    if (editingChallenge) {
      try {
        await updateChallenge(editingChallenge.id, payload);
      } catch (err) {
        console.error('Failed to update challenge:', err);
      }
      const updatedItem = { ...editingChallenge, ...payload };
      setChallenges(challenges.map((c) => (c.id === editingChallenge.id ? updatedItem : c)));
      logAdminAction({
        action: `Updated Challenge: ${payload.name}`,
        module: 'challenges',
        target_id: editingChallenge.id,
        entity_name: payload.name,
        previous_state: editingChallenge,
        new_state: updatedItem,
      });
    } else {
      let createdId = 'ch-' + Date.now();
      try {
        createdId = await createChallenge(payload);
      } catch (err) {
        console.error('Failed to create challenge:', err);
      }
      const newItem = { id: createdId, ...payload };
      setChallenges([newItem, ...challenges]);
      logAdminAction({
        action: `Created Challenge: ${payload.name}`,
        module: 'challenges',
        target_id: createdId,
        entity_name: payload.name,
        previous_state: null,
        new_state: newItem,
      });
    }

    setIsAdding(false);
    setEditingChallenge(null);
  };

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchesSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.firm_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.coupon_code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFirm = selectedFirmFilter === 'all' || c.firm_id === selectedFirmFilter;
      const matchesSteps =
        stepsFilter === 'all' ||
        (stepsFilter === 'instant' ? c.steps === 0 : c.steps === parseInt(stepsFilter, 10));
      const matchesCategory =
        categoryFilter === 'all' || c.category === categoryFilter;
      return matchesSearch && matchesFirm && matchesSteps && matchesCategory;
    });
  }, [challenges, searchQuery, selectedFirmFilter, stepsFilter, categoryFilter]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-foreground rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-mono">Loading challenges portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top View Selector Tabs (Batch Creator vs Directory) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>⚡ Batch Challenge Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Challenge Directory ({challenges.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'directory' && (
            <>
              <button
                type="button"
                onClick={() => handleOpenBulkFirmEdit(selectedFirmFilter !== 'all' ? selectedFirmFilter : undefined)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Bulk Edit by Firm</span>
              </button>

              <button
                type="button"
                onClick={handleStartAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Single Challenge</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 1. BATCH CREATOR TAB */}
      {activeTab === 'batch' && (
        <BatchChallengePortal
          firms={firms}
          onSwitchToSingleView={() => setActiveTab('directory')}
          onBatchCreated={(newCreated) => {
            setChallenges((prev) => [...newCreated, ...prev.filter((p) => !newCreated.some((n) => n.id === p.id))]);
          }}
        />
      )}

      {/* 2. DIRECTORY & SINGLE EDITOR TAB */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
                Live Challenges Directory
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Browse, search, edit, duplicate, or delete existing prop firm evaluation challenges.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const firstSelected = challenges.find((c) => selectedIds.includes(c.id));
                      handleOpenBulkFirmEdit(firstSelected?.firm_id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Bulk Edit Selected ({selectedIds.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Selected ({selectedIds.length})</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => handleOpenBulkFirmEdit(selectedFirmFilter !== 'all' ? selectedFirmFilter : undefined)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Bulk Edit Firm Challenges</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('batch')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-black text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>+ Launch Batch Creator</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search challenges or firms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Firm Filter Dropdown */}
              <select
                value={selectedFirmFilter}
                onChange={(e) => setSelectedFirmFilter(e.target.value)}
                className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground font-medium"
              >
                <option value="all">All Prop Firms ({firms.length})</option>
                {firms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              {selectedFirmFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => handleOpenBulkFirmEdit(selectedFirmFilter)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  title="Bulk edit discounts & settings for this firm"
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Bulk Edit Firm</span>
                </button>
              )}

              {/* Steps Filter */}
              <select
                value={stepsFilter}
                onChange={(e) => setStepsFilter(e.target.value)}
                className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground font-medium"
              >
                <option value="all">All Evaluation Modes</option>
                <option value="1">1-Step Evaluation</option>
                <option value="2">2-Step Evaluation</option>
                <option value="3">3-Step Evaluation</option>
                <option value="instant">Instant Funding</option>
              </select>

              {/* View Style Switcher */}
              <div className="flex items-center gap-1 bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setViewStyle('cards')}
                  className={`p-1.5 rounded-lg ${
                    viewStyle === 'cards' ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewStyle('table')}
                  className={`p-1.5 rounded-lg ${
                    viewStyle === 'table' ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground'
                  }`}
                  title="Compact Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Select Helper */}
          {filteredChallenges.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 hover:text-foreground font-semibold"
              >
                {selectedIds.length === filteredChallenges.length ? (
                  <CheckSquare className="w-4 h-4 text-foreground" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>
                  {selectedIds.length === filteredChallenges.length
                    ? 'Deselect All'
                    : `Select All (${filteredChallenges.length})`}
                </span>
              </button>

              <span>Showing {filteredChallenges.length} of {challenges.length} challenges</span>
            </div>
          )}

          {/* CARDS VIEW */}
          {viewStyle === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredChallenges.map((ch) => {
                const isSelected = selectedIds.includes(ch.id);
                return (
                  <div
                    key={ch.id}
                    className={`bg-white dark:bg-card border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all duration-200 ${
                      isSelected
                        ? 'border-black dark:border-white ring-1 ring-black dark:ring-white'
                        : 'border-zinc-200 dark:border-border hover:border-foreground'
                    }`}
                  >
                    <div>
                      {/* Firm & Challenge Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleSelectOne(ch.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-foreground" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <div className="w-11 h-11 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={ch.firm_logo || '/logos/nys.png'}
                              alt={ch.firm_name}
                              className="h-7 w-auto max-w-[36px] object-contain rounded-md"
                            />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground leading-snug">{ch.name}</h3>
                            <span className="text-xs text-muted-foreground font-semibold">{ch.firm_name}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(ch)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Duplicate Challenge"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(ch)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Challenge"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(ch.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Delete Challenge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Main Metric: Account Size & Price */}
                      <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase block">Account Size</span>
                          <span className="text-xl font-extrabold text-foreground tracking-tight font-mono">
                            ${ch.account_size.toLocaleString('en-US')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs line-through text-muted-foreground block font-mono">
                            ${ch.original_price}
                          </span>
                          <span className="text-lg font-black text-foreground font-mono">
                            ${ch.price}
                          </span>
                        </div>
                      </div>

                      {/* Details Matrix */}
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Evaluation Model</span>
                          <span className="font-bold text-foreground">
                            {ch.steps === 0 ? 'Instant Funding' : `${ch.steps}-Step Evaluation`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Profit Split</span>
                          <span className="font-bold text-foreground">Up to {ch.profit_split_pct}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Profit Target</span>
                          <span className="font-semibold text-foreground">
                            {ch.steps === 0 ? 'No Target' : `${ch.profit_target_pct}% ${ch.phase_2_target_pct ? `| ${ch.phase_2_target_pct}%` : ''}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Drawdowns</span>
                          <span className="font-semibold text-foreground">
                            {ch.daily_loss_limit_pct}% Daily | {ch.max_loss_limit_pct}% Max
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Loss Type</span>
                          <span className="font-semibold text-foreground">{ch.loss_type || 'Static'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Min. Trading Days</span>
                          <span className="font-semibold text-foreground">
                            {ch.min_trading_days === 0 ? '0 Days (No Min)' : `${ch.min_trading_days} Days`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Max Risk / Trade</span>
                          <span className="font-semibold text-foreground font-mono">{ch.max_risk_per_trade || '2% / Trade'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Inactivity Period</span>
                          <span className="font-semibold text-foreground font-mono">{ch.inactivity_period || '30 Days'}</span>
                        </div>
                      </div>

                      {ch.category === 'crypto' && (
                        <div className="mt-2.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] grid grid-cols-3 gap-2 text-center">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground block">Max Lev</span>
                            <span className="font-bold text-foreground font-mono">{ch.crypto_max_leverage || '1:5'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground block">Max Pos</span>
                            <span className="font-bold text-foreground font-mono">{ch.crypto_max_open_positions || '5'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground block">Notional Exp</span>
                            <span className="font-bold text-foreground font-mono">{ch.crypto_total_notional_exposure || '$250K'}</span>
                          </div>
                        </div>
                      )}

                      {/* Promo Code Info */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <span className="font-semibold text-muted-foreground">Discount: {ch.discount_pct}% OFF</span>
                        <span className="font-mono font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-foreground">
                          {ch.coupon_code || 'EMPIRE'}
                        </span>
                      </div>
                    </div>

                    {/* Badges and Buy Action */}
                    <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        {ch.is_best_seller && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-900 text-white dark:bg-white dark:text-black">
                            Best Seller
                          </span>
                        )}
                        {ch.is_featured && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 text-muted-foreground">
                            Featured
                          </span>
                        )}
                      </div>

                      {ch.buy_url && (
                        <a
                          href={ch.buy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold"
                        >
                          <span>Affiliate Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TABLE VIEW */}
          {viewStyle === 'table' && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-100/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 font-bold text-foreground">
                      <th className="py-3 px-3.5 w-10">
                        <button type="button" onClick={toggleSelectAll}>
                          {selectedIds.length === filteredChallenges.length && filteredChallenges.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-foreground" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-3 px-3.5">Firm & Challenge</th>
                      <th className="py-3 px-3.5">Size</th>
                      <th className="py-3 px-3.5">Mode</th>
                      <th className="py-3 px-3.5">Price</th>
                      <th className="py-3 px-3.5">Target / DD</th>
                      <th className="py-3 px-3.5">Split</th>
                      <th className="py-3 px-3.5">Code</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-card">
                    {filteredChallenges.map((ch) => {
                      const isSelected = selectedIds.includes(ch.id);
                      return (
                        <tr key={ch.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50">
                          <td className="py-3 px-3.5">
                            <button type="button" onClick={() => toggleSelectOne(ch.id)}>
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-foreground" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={ch.firm_logo || '/logos/nys.png'}
                                alt={ch.firm_name}
                                className="h-6 w-auto max-w-[28px] object-contain rounded"
                              />
                              <div>
                                <span className="font-bold text-foreground block">{ch.name}</span>
                                <span className="text-[11px] text-muted-foreground">{ch.firm_name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 font-mono font-bold">
                            ${ch.account_size.toLocaleString('en-US')}
                          </td>
                          <td className="py-3 px-3.5 font-semibold">
                            {ch.steps === 0 ? 'Instant' : `${ch.steps}-Step`}
                          </td>
                          <td className="py-3 px-3.5 font-mono">
                            <span className="font-extrabold text-foreground">${ch.price}</span>{' '}
                            <span className="line-through text-muted-foreground text-[10px]">${ch.original_price}</span>
                          </td>
                          <td className="py-3 px-3.5">
                            {ch.steps === 0 ? '0%' : `${ch.profit_target_pct}%`} | {ch.max_loss_limit_pct}% Max
                          </td>
                          <td className="py-3 px-3.5 font-semibold">{ch.profit_split_pct}%</td>
                          <td className="py-3 px-3.5 font-mono font-bold">{ch.coupon_code}</td>
                          <td className="py-3 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleDuplicate(ch)}
                                className="p-1 rounded text-muted-foreground hover:text-foreground"
                                title="Duplicate"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(ch)}
                                className="p-1 rounded text-muted-foreground hover:text-foreground"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(ch.id)}
                                className="p-1 rounded text-muted-foreground hover:text-red-500"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SINGLE CHALLENGE MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-foreground" />
                <h2 className="text-lg font-bold text-foreground">
                  {editingChallenge ? `Edit Challenge: ${editingChallenge.name}` : 'Add Single Evaluation Challenge'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Matrix Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Firm Selection */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Associated Prop Firm *</label>
                <select
                  required
                  value={formData.firm_id || ''}
                  onChange={(e) => handleFirmSelectChange(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-semibold"
                >
                  {firms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Challenge Name */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Challenge Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. $100K 2-Step Stellar"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-semibold"
                />
              </div>

              {/* Account Size */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Account Size ($ USD) *</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={formData.account_size || 100000}
                  onChange={(e) => setFormData({ ...formData, account_size: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono font-bold"
                />
              </div>

              {/* Steps */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Evaluation Steps</label>
                <select
                  value={formData.steps ?? 2}
                  onChange={(e) => setFormData({ ...formData, steps: parseInt(e.target.value, 10) })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-semibold"
                >
                  <option value={1}>1-Step Evaluation</option>
                  <option value={2}>2-Step Evaluation</option>
                  <option value={3}>3-Step Evaluation</option>
                  <option value={0}>Instant Funding (0-Step)</option>
                </select>
              </div>

              {/* Original Price & Discount % -> Automated Discounted Price */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Original Price ($ USD) (Non-Discounted)</label>
                <input
                  type="number"
                  value={formData.original_price || 599}
                  onChange={(e) => handleOriginalPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={formData.discount_pct ?? 20}
                  onChange={(e) => handleDiscountPctChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              {/* Calculated Discounted Price */}
              <div className="space-y-1 md:col-span-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Calculated Discounted Price
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Automatically calculated: ${formData.original_price} - {formData.discount_pct}% OFF
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono line-through text-muted-foreground">${formData.original_price}</span>
                  <input
                    type="number"
                    value={formData.price || 479}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-24 bg-white dark:bg-card border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-right font-mono font-extrabold text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Profit Target Phase 1 & Phase 2 */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Phase 1 Profit Target (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.profit_target_pct ?? 8}
                  onChange={(e) => setFormData({ ...formData, profit_target_pct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Phase 2 Profit Target (%)</label>
                <input
                  type="number"
                  step="0.5"
                  disabled={(formData.steps ?? 2) < 2}
                  value={(formData.steps ?? 2) < 2 ? 0 : formData.phase_2_target_pct ?? 5}
                  onChange={(e) => setFormData({ ...formData, phase_2_target_pct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              {/* Daily Loss & Max Loss */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Daily Loss Limit (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.daily_loss_limit_pct ?? 5}
                  onChange={(e) => setFormData({ ...formData, daily_loss_limit_pct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Max Loss Limit (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.max_loss_limit_pct ?? 10}
                  onChange={(e) => setFormData({ ...formData, max_loss_limit_pct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              {/* Loss Type & Profit Split */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Drawdown Loss Type</label>
                <select
                  value={formData.loss_type || 'Static'}
                  onChange={(e) => setFormData({ ...formData, loss_type: e.target.value as any })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-semibold"
                >
                  <option value="Static">Static Loss Model</option>
                  <option value="Trailing">Trailing Drawdown Model</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Profit Split (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.profit_split_pct ?? 85}
                  onChange={(e) => setFormData({ ...formData, profit_split_pct: parseInt(e.target.value, 10) || 85 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              {/* Trading Days: Min & Max */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Min Trading Days (0 = No Min)</label>
                <input
                  type="number"
                  value={formData.min_trading_days ?? 0}
                  onChange={(e) => setFormData({ ...formData, min_trading_days: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Max Trading Days</label>
                <input
                  type="text"
                  value={formData.max_trading_days || 'Unlimited'}
                  onChange={(e) => setFormData({ ...formData, max_trading_days: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Payout Frequency & Leverage */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Payout Frequency</label>
                <input
                  type="text"
                  value={formData.payout_frequency || 'Bi-Weekly / 14 Days'}
                  onChange={(e) => setFormData({ ...formData, payout_frequency: e.target.value })}
                  placeholder="e.g. Bi-Weekly / 14 Days"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Leverage</label>
                <input
                  type="text"
                  value={formData.leverage || '1:100'}
                  onChange={(e) => setFormData({ ...formData, leverage: e.target.value })}
                  placeholder="e.g. 1:100"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              {/* Coupon Code & Directing Link */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Promo Coupon Code</label>
                <input
                  type="text"
                  value={formData.coupon_code || 'EMPIRE'}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Market Category</label>
                <select
                  value={formData.category || 'forex'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                >
                  <option value="forex">Forex & Multi-Asset</option>
                  <option value="futures">Futures</option>
                  <option value="crypto">Crypto</option>
                  <option value="instant-funding">Instant Funding</option>
                </select>
              </div>

              {/* Buy URL Directing Link */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-foreground">Affiliate Buy / Directing URL</label>
                <input
                  type="url"
                  value={formData.buy_url || ''}
                  onChange={(e) => setFormData({ ...formData, buy_url: e.target.value })}
                  placeholder="https://firm.com/challenge?ref=empirial"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono text-[11px]"
                />
              </div>

              {/* News Trading, Overnight, EA */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">News Trading Allowed</label>
                <input
                  type="text"
                  value={formData.news_trading || 'YES / Allowed'}
                  onChange={(e) => setFormData({ ...formData, news_trading: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Overnight & Weekend Holding</label>
                <input
                  type="text"
                  value={formData.overnight_weekend || 'YES | YES'}
                  onChange={(e) => setFormData({ ...formData, overnight_weekend: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">EA & Algo Trading</label>
                <input
                  type="text"
                  value={formData.ea_algo_trading || 'YES | YES'}
                  onChange={(e) => setFormData({ ...formData, ea_algo_trading: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Consistency Rule Details</label>
                <input
                  type="text"
                  value={formData.consistency_rule || 'No Consistency Rule'}
                  onChange={(e) => setFormData({ ...formData, consistency_rule: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Advanced Challenge Rules */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Max Risk Per Trade</label>
                <input
                  type="text"
                  value={formData.max_risk_per_trade || '2% / Trade'}
                  onChange={(e) => setFormData({ ...formData, max_risk_per_trade: e.target.value })}
                  placeholder="e.g. 2% / Trade, or No Limit"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Inactivity Period</label>
                <input
                  type="text"
                  value={formData.inactivity_period || '30 Days'}
                  onChange={(e) => setFormData({ ...formData, inactivity_period: e.target.value })}
                  placeholder="e.g. 30 Days, 60 Days, or Unlimited"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              {/* Dedicated Crypto Challenges Settings */}
              <div className="space-y-3 md:col-span-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold">
                      ₿
                    </span>
                    <span className="font-bold text-xs text-foreground uppercase tracking-tight">
                      Dedicated Crypto Challenges Settings
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">Applied to crypto & multi-asset challenges</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground block">MAX Leverage</label>
                    <input
                      type="text"
                      value={formData.crypto_max_leverage || '1:5'}
                      onChange={(e) => setFormData({ ...formData, crypto_max_leverage: e.target.value })}
                      placeholder="e.g. 1:5, 1:10"
                      className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground block">Max Open Positions</label>
                    <input
                      type="text"
                      value={formData.crypto_max_open_positions || '5 Positions'}
                      onChange={(e) => setFormData({ ...formData, crypto_max_open_positions: e.target.value })}
                      placeholder="e.g. 5 Positions, No Limit"
                      className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground block">Total Notional Exposure</label>
                    <input
                      type="text"
                      value={formData.crypto_total_notional_exposure || '$250,000'}
                      onChange={(e) => setFormData({ ...formData, crypto_total_notional_exposure: e.target.value })}
                      placeholder="e.g. $250,000 or 100% Capital"
                      className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 md:col-span-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.refundable_fee}
                      onChange={(e) => setFormData({ ...formData, refundable_fee: e.target.checked })}
                      className="rounded border-zinc-300 text-black dark:text-white"
                    />
                    <span className="font-semibold text-foreground">Refundable Fee</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.is_best_seller}
                      onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                      className="rounded border-zinc-300 text-black dark:text-white"
                    />
                    <span className="font-semibold text-foreground">Best Seller Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded border-zinc-300 text-black dark:text-white"
                    />
                    <span className="font-semibold text-foreground">Featured Challenge</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow-xs"
              >
                {editingChallenge ? 'Save Challenge Changes' : 'Create Challenge'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BULK EDIT FIRM CHALLENGES MODAL */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 max-w-4xl w-full space-y-6 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
                    <Percent className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    Bulk Edit Challenges by Firm
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Instantly batch update discount rates, auto-calculate new prices, override coupon codes, and synchronize firm data across all challenge accounts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsBulkEditModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feedback Alert */}
            {bulkFeedback && (
              <div
                className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
                  bulkFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                }`}
              >
                {bulkFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{bulkFeedback.message}</span>
              </div>
            )}

            {/* Target Firm & Scope Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Select Target Prop Firm
                </label>
                <select
                  value={bulkTargetFirmId}
                  onChange={(e) => {
                    const newFirmId = e.target.value;
                    setBulkTargetFirmId(newFirmId);
                    const matched = firms.find((f) => f.id === newFirmId);
                    if (newFirmId === 'orion-funded') {
                      setBulkDiscountPct(50);
                      setBulkCouponCode('EMPIRIAL');
                    } else if (matched) {
                      setBulkDiscountPct(matched.discount_pct || 20);
                      setBulkCouponCode(matched.coupon_code_custom || 'EMPIRE');
                    }
                  }}
                  className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-foreground"
                >
                  {firms.map((f) => {
                    const firmChallsCount = challenges.filter((c) => c.firm_id === f.id).length;
                    return (
                      <option key={f.id} value={f.id}>
                        {f.name} ({firmChallsCount} challenges in directory)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Application Scope
                </label>
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setBulkScope('all')}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      bulkScope === 'all'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-white dark:bg-card border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All Firm Challenges ({challenges.filter((c) => c.firm_id === bulkTargetFirmId).length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkScope('selected')}
                    disabled={selectedIds.filter((id) => challenges.find((c) => c.id === id)?.firm_id === bulkTargetFirmId).length === 0}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      bulkScope === 'selected'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-white dark:bg-card border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    Selected Only ({selectedIds.filter((id) => challenges.find((c) => c.id === id)?.firm_id === bulkTargetFirmId).length})
                  </button>
                </div>
              </div>
            </div>

            {/* Configuration Tabs / Panels */}
            <div className="space-y-4">
              {/* SECTION 1: DISCOUNT & PRICE CALCULATION (MAIN FEATURE) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-foreground" />
                    <h3 className="text-sm font-bold text-foreground">
                      Bulk Discount & Automated Price Recalculation
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={bulkEnableDiscount}
                      onChange={(e) => setBulkEnableDiscount(e.target.checked)}
                      className="rounded border-zinc-300 text-black dark:text-white"
                    />
                    <span>Apply Discount Updates</span>
                  </label>
                </div>

                {bulkEnableDiscount && (
                  <div className="space-y-3.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">
                          Discount Percentage (%)
                        </label>
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          Currently Set: {bulkDiscountPct}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={bulkDiscountPct}
                          onChange={(e) => setBulkDiscountPct(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                          className="w-28 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono font-extrabold text-foreground focus:outline-none focus:border-foreground"
                        />
                        <div className="flex flex-wrap items-center gap-1.5 flex-1">
                          {[
                            { label: '15% (EMPIRIAL)', val: 15 },
                            { label: '20%', val: 20 },
                            { label: '25%', val: 25 },
                            { label: '30%', val: 30 },
                            { label: '40%', val: 40 },
                            { label: '50% (EMPIRIAL50)', val: 50 },
                            { label: '60%', val: 60 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => {
                                setBulkDiscountPct(preset.val);
                                if (bulkTargetFirmId === 'orion-funded') {
                                  if (preset.val === 50) {
                                    setBulkCouponCode('EMPIRIAL50');
                                    setBulkBuyUrl('https://www.orionfunded.com?coupon=EMPIRIAL50');
                                  } else if (preset.val === 15) {
                                    setBulkCouponCode('EMPIRIAL');
                                    setBulkBuyUrl('https://www.orionfunded.com?coupon=EMPIRIAL');
                                  }
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                                bulkDiscountPct === preset.val
                                  ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold shadow-2xs'
                                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-muted-foreground hover:text-foreground font-semibold'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bulkAutoRecalculatePrices}
                          onChange={(e) => setBulkAutoRecalculatePrices(e.target.checked)}
                          className="mt-0.5 rounded border-zinc-300 text-black dark:text-white"
                        />
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            Auto-calculate Discounted Price
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            Calculates price as <code className="font-mono text-foreground font-semibold">original_price × (1 - {bulkDiscountPct}%)</code>
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bulkApplyToPrice}
                          onChange={(e) => setBulkApplyToPrice(e.target.checked)}
                          className="mt-0.5 rounded border-zinc-300 text-black dark:text-white"
                        />
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            Apply Directly to Display Price
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            Updates the main listing price so directory cards immediately showcase the {bulkDiscountPct}% discount price.
                          </span>
                        </div>
                      </label>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs">
                      <input
                        type="checkbox"
                        checked={bulkSyncFirmProfile}
                        onChange={(e) => setBulkSyncFirmProfile(e.target.checked)}
                        className="rounded border-zinc-300 text-black dark:text-white"
                      />
                      <span className="font-semibold text-foreground">
                        Also sync firm profile badge & active promo to {bulkDiscountPct}% OFF
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* SECTION 2: COUPON CODE & AFFILIATE LINK */}
              <div className="p-5 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-foreground" />
                    <h3 className="text-sm font-bold text-foreground">
                      Coupon Code & Affiliate Buy Links
                    </h3>
                  </div>
                  {bulkTargetFirmId === 'orion-funded' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkDiscountPct(50);
                          setBulkCouponCode('EMPIRIAL50');
                          setBulkBuyUrl('https://www.orionfunded.com?coupon=EMPIRIAL50');
                          setBulkEnableCoupon(true);
                          setBulkEnableBuyUrl(true);
                        }}
                        className="px-2 py-1 rounded-md text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-foreground transition-colors cursor-pointer"
                      >
                        50% OFF (EMPIRIAL50)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkDiscountPct(15);
                          setBulkCouponCode('EMPIRIAL');
                          setBulkBuyUrl('https://www.orionfunded.com?coupon=EMPIRIAL');
                          setBulkEnableCoupon(true);
                          setBulkEnableBuyUrl(true);
                        }}
                        className="px-2 py-1 rounded-md text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-foreground transition-colors cursor-pointer"
                      >
                        15% OFF (EMPIRIAL)
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">Coupon Code</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={bulkEnableCoupon}
                          onChange={(e) => setBulkEnableCoupon(e.target.checked)}
                          className="rounded border-zinc-300 text-black dark:text-white"
                        />
                        <span>Update Code</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={!bulkEnableCoupon}
                      value={bulkCouponCode}
                      onChange={(e) => setBulkCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. EMPIRIAL"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-extrabold text-foreground focus:outline-none focus:border-foreground disabled:opacity-40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">Affiliate / Buy URL</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={bulkEnableBuyUrl}
                          onChange={(e) => setBulkEnableBuyUrl(e.target.checked)}
                          className="rounded border-zinc-300 text-black dark:text-white"
                        />
                        <span>Update URL</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={!bulkEnableBuyUrl}
                      value={bulkBuyUrl}
                      onChange={(e) => setBulkBuyUrl(e.target.value)}
                      placeholder="e.g. https://www.orionfunded.com?coupon=EMPIRIAL"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-foreground disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: OTHER OPTIONAL SPEC OVERRIDES */}
              <div className="p-5 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-foreground" />
                    <h3 className="text-sm font-bold text-foreground">
                      Challenge Specs & Badges (Optional Overrides)
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Leave untoggled to keep existing specs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-foreground">Profit Split %</span>
                      <input
                        type="checkbox"
                        checked={bulkEnableProfitSplit}
                        onChange={(e) => setBulkEnableProfitSplit(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    <input
                      type="number"
                      disabled={!bulkEnableProfitSplit}
                      value={bulkProfitSplit}
                      onChange={(e) => setBulkProfitSplit(Number(e.target.value))}
                      placeholder="80"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none disabled:opacity-40"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-foreground">Payout Frequency</span>
                      <input
                        type="checkbox"
                        checked={bulkEnablePayoutFreq}
                        onChange={(e) => setBulkEnablePayoutFreq(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    <input
                      type="text"
                      disabled={!bulkEnablePayoutFreq}
                      value={bulkPayoutFreq}
                      onChange={(e) => setBulkPayoutFreq(e.target.value)}
                      placeholder="Bi-Weekly / 14 Days"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none disabled:opacity-40"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-foreground">Max Leverage</span>
                      <input
                        type="checkbox"
                        checked={bulkEnableLeverage}
                        onChange={(e) => setBulkEnableLeverage(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    <input
                      type="text"
                      disabled={!bulkEnableLeverage}
                      value={bulkLeverage}
                      onChange={(e) => setBulkLeverage(e.target.value)}
                      placeholder="1:100"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE IMPACT PREVIEW TABLE */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Live Impact Preview ({previewChallenges.length} challenges affected)
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Showing price recalculations before applying
                </span>
              </div>

              <div className="border border-zinc-200 dark:border-border rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-900 text-muted-foreground text-[10px] uppercase font-bold sticky top-0 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3">Challenge Tier</th>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Original</th>
                      <th className="py-2.5 px-3">Before</th>
                      <th className="py-2.5 px-3">After ({bulkDiscountPct}% OFF)</th>
                      <th className="py-2.5 px-3 text-right">Trader Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                    {previewChallenges.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                        <td className="py-2 px-3 font-sans font-bold text-foreground">
                          {item.name}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          ${item.account_size.toLocaleString('en-US')}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground line-through">
                          ${item.origPrice}
                        </td>
                        <td className="py-2 px-3 text-zinc-500">
                          ${item.oldPrice} ({item.oldDiscount}%)
                        </td>
                        <td className="py-2 px-3 font-extrabold text-foreground">
                          <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                            ${item.newPrice}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          +${item.savings} ({bulkDiscountPct}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-muted-foreground">
                Target: <strong>{firms.find((f) => f.id === bulkTargetFirmId)?.name || bulkTargetFirmId}</strong> • {previewChallenges.length} challenges
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBulkEditModalOpen(false)}
                  disabled={isBulkApplying}
                  className="px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkFirmUpdate}
                  disabled={isBulkApplying || previewChallenges.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold cursor-pointer shadow-xs transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isBulkApplying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
                      <span>Applying to {previewChallenges.length} Challenges...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Apply Updates to {previewChallenges.length} Challenges</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
