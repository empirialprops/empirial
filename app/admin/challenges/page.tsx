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
} from '@/lib/firebase/services';
import { logAdminAction } from '@/lib/utils/audit-log-store';
import BatchChallengePortal from '@/components/admin/BatchChallengePortal';

export default function AdminChallengesPage() {
  const [activeTab, setActiveTab] = useState<'batch' | 'directory'>('batch');
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

  // Single Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  // Single Form State
  const [formData, setFormData] = useState<Partial<Challenge>>({
    firm_id: '',
    firm_name: '',
    firm_slug: '',
    firm_logo: '/logos/nys.png',
    name: '$100K 2-Step Evaluation',
    account_size: 100000,
    steps: 2,
    price: 499,
    original_price: 599,
    profit_split_pct: 85,
    daily_loss_limit_pct: 5,
    max_loss_limit_pct: 10,
    profit_target_pct: 8,
    phase_2_target_pct: 5,
    min_trading_days: 0,
    max_trading_days: 'Unlimited',
    payout_frequency: 'Bi-Weekly / 14 Days',
    leverage: '1:100',
    refundable_fee: true,
    buy_url: 'https://discord.gg/ww4dkeeZdp',
    coupon_code: 'EMPIRE',
    discount_pct: 20,
    is_featured: true,
    is_best_seller: false,
    category: 'forex',
    rating: 4.9,
    review_count: 1200,
    consistency_rule: 'No Consistency Rule',
    news_trading: 'YES / Allowed',
    overnight_weekend: 'YES | YES',
    loss_type: 'Static',
    ea_algo_trading: 'YES | YES',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [challsData, firmsData] = await Promise.all([getChallenges(), getFirms()]);
        setChallenges(challsData.length > 0 ? challsData : MOCK_CHALLENGES);
        const resolvedFirms = firmsData.length > 0 ? firmsData : MOCK_FIRMS;
        setFirms(resolvedFirms);
        if (resolvedFirms.length > 0) {
          setFormData((prev) => ({
            ...prev,
            firm_id: resolvedFirms[0].id,
            firm_name: resolvedFirms[0].name,
            firm_slug: resolvedFirms[0].slug,
            firm_logo: resolvedFirms[0].logo_url,
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
        rating: matched.rating || prev.rating || 4.9,
        review_count: matched.review_count || prev.review_count || 1200,
        buy_url: matched.buy_url || prev.buy_url,
        coupon_code: matched.coupon_code_custom || prev.coupon_code || 'EMPIRE',
      }));
    }
  };

  const handleStartAdd = () => {
    const defaultFirm = firms[0] || {
      id: 'nys',
      name: 'NYS Capital',
      slug: 'nys-capital',
      logo_url: '/logos/nys.png',
      rating: 4.9,
      review_count: 1200,
    };
    setFormData({
      firm_id: defaultFirm.id,
      firm_name: defaultFirm.name,
      firm_slug: defaultFirm.slug,
      firm_logo: defaultFirm.logo_url,
      name: '$100K 2-Step Stellar',
      account_size: 100000,
      steps: 2,
      price: 479,
      original_price: 599,
      profit_split_pct: 85,
      daily_loss_limit_pct: 5,
      max_loss_limit_pct: 10,
      profit_target_pct: 8,
      phase_2_target_pct: 5,
      min_trading_days: 0,
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
            <button
              type="button"
              onClick={handleStartAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Single Challenge</span>
            </button>
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

            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}

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
                      </div>

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
    </div>
  );
}
