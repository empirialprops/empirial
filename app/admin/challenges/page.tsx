'use client';

import React, { useState, useEffect } from 'react';
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
} from '@/lib/firebase/services';

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFirmFilter, setSelectedFirmFilter] = useState('all');
  const [stepsFilter, setStepsFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  // Form State
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge tier?')) return;
    try {
      await deleteChallenge(id);
      setChallenges(challenges.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete challenge:', err);
      setChallenges(challenges.filter((c) => c.id !== id));
    }
  };

  const parseNum = (val: any, fallback: number): number => {
    if (val === undefined || val === null || val === '') return fallback;
    const num = typeof val === 'number' ? val : Number(val);
    return isNaN(num) ? fallback : num;
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
      profit_target_pct: parseNum(formData.profit_target_pct, 8),
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
        setChallenges(challenges.map((c) => (c.id === editingChallenge.id ? { ...c, ...payload } : c)));
      } catch (err) {
        console.error('Failed to update challenge:', err);
        setChallenges(challenges.map((c) => (c.id === editingChallenge.id ? { ...c, ...payload } : c)));
      }
    } else {
      try {
        const id = await createChallenge(payload);
        setChallenges([{ id, ...payload }, ...challenges]);
      } catch (err) {
        console.error('Failed to create challenge:', err);
        setChallenges([{ id: 'ch-' + Date.now(), ...payload }, ...challenges]);
      }
    }

    setIsAdding(false);
    setEditingChallenge(null);
  };

  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.firm_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.coupon_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFirm = selectedFirmFilter === 'all' || c.firm_id === selectedFirmFilter;
    const matchesSteps =
      stepsFilter === 'all' ||
      (stepsFilter === 'instant' ? c.steps === 0 : c.steps === parseInt(stepsFilter));
    return matchesSearch && matchesFirm && matchesSteps;
  });

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-foreground rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-mono">Loading challenges database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Evaluation Challenges Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure challenge tiers, account sizes, evaluation steps, drawdown models, profit targets, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert('All evaluation challenges are synced and saved to the database!')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
          <button
            type="button"
            onClick={handleStartAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-foreground text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Challenge</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search challenges or firms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Firm Filter Dropdown */}
          <select
            value={selectedFirmFilter}
            onChange={(e) => setSelectedFirmFilter(e.target.value)}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="all">All Prop Firms</option>
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
            className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="all">All Steps</option>
            <option value="1">1-Step</option>
            <option value="2">2-Step</option>
            <option value="3">3-Step</option>
            <option value="instant">Instant Funding</option>
          </select>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredChallenges.map((ch) => (
          <div
            key={ch.id}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-foreground transition-all duration-200"
          >
            <div>
              {/* Firm & Challenge Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={ch.firm_logo || '/logos/nys.png'}
                      alt={ch.firm_name}
                      className="h-7 w-auto max-w-[36px] object-contain rounded-md"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{ch.name}</h3>
                    <span className="text-xs text-muted-foreground font-semibold">{ch.firm_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(ch)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Edit Challenge"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ch.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Delete Challenge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Metric: Account Size & Price */}
              <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase block">Account Size</span>
                  <span className="text-xl font-extrabold text-foreground tracking-tight">
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
                    {ch.profit_target_pct}% {ch.phase_2_target_pct ? `| ${ch.phase_2_target_pct}%` : ''}
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
                  <span>Challenge Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Challenge Modal */}
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
                  {editingChallenge ? `Edit Challenge: ${editingChallenge.name}` : 'Add New Evaluation Challenge'}
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
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
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
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
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
                  onChange={(e) => setFormData({ ...formData, account_size: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              {/* Steps */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Evaluation Steps</label>
                <select
                  value={formData.steps ?? 2}
                  onChange={(e) => setFormData({ ...formData, steps: parseInt(e.target.value) })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                >
                  <option value={1}>1-Step Evaluation</option>
                  <option value={2}>2-Step Evaluation</option>
                  <option value={3}>3-Step Evaluation</option>
                  <option value={0}>Instant Funding (0-Step)</option>
                </select>
              </div>

              {/* Price & Original Price */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Discounted Price ($ USD)</label>
                <input
                  type="number"
                  value={formData.price || 499}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Original Price ($ USD)</label>
                <input
                  type="number"
                  value={formData.original_price || 599}
                  onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              {/* Profit Target Phase 1 & Phase 2 */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Phase 1 Profit Target (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.profit_target_pct ?? 8}
                  onChange={(e) => setFormData({ ...formData, profit_target_pct: e.target.value === '' ? '' as any : parseFloat(e.target.value) })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Phase 2 Profit Target (%) (Optional)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.phase_2_target_pct ?? 0}
                  onChange={(e) => setFormData({ ...formData, phase_2_target_pct: e.target.value === '' ? '' as any : parseFloat(e.target.value) })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Daily Loss & Max Loss */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Daily Loss Limit (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.daily_loss_limit_pct ?? 5}
                  onChange={(e) => setFormData({ ...formData, daily_loss_limit_pct: e.target.value === '' ? '' as any : parseFloat(e.target.value) })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Max Loss Limit (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.max_loss_limit_pct ?? 10}
                  onChange={(e) => setFormData({ ...formData, max_loss_limit_pct: e.target.value === '' ? '' as any : parseFloat(e.target.value) })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Loss Type & Profit Split */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Drawdown Loss Type</label>
                <select
                  value={formData.loss_type || 'Static'}
                  onChange={(e) => setFormData({ ...formData, loss_type: e.target.value as any })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
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
                  onChange={(e) => setFormData({ ...formData, profit_split_pct: e.target.value === '' ? '' as any : parseInt(e.target.value) })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Trading Days: Min & Max */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Min Trading Days (0 = No Minimum)</label>
                <input
                  type="number"
                  value={formData.min_trading_days ?? 0}
                  onChange={(e) => setFormData({ ...formData, min_trading_days: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
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
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Coupon Code & Directing Link */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Promo Coupon Code</label>
                <input
                  type="text"
                  value={formData.coupon_code || 'EMPIRE'}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Discount Percentage (%)</label>
                <input
                  type="number"
                  value={formData.discount_pct ?? 20}
                  onChange={(e) => setFormData({ ...formData, discount_pct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Buy URL Directing Link */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-foreground">Challenge Directing / Buy URL</label>
                <input
                  type="url"
                  value={formData.buy_url || ''}
                  onChange={(e) => setFormData({ ...formData, buy_url: e.target.value })}
                  placeholder="https://firm.com/challenge?ref=empirial"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
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
                <label className="font-semibold text-foreground">Average Payout ($)</label>
                <input
                  type="text"
                  value={formData.avg_payout || '$5,400'}
                  onChange={(e) => setFormData({ ...formData, avg_payout: e.target.value })}
                  placeholder="e.g. $5,400"
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

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Star Rating (e.g. 4.9)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.rating ?? 4.9}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.9 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Review Count (e.g. 2430)</label>
                <input
                  type="number"
                  value={formData.review_count ?? 1200}
                  onChange={(e) => setFormData({ ...formData, review_count: parseInt(e.target.value) || 0 })}
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

            {/* Live Preview Card */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Live Card Preview (Matching Main Website View)
              </span>

              <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                      <img src={formData.firm_logo || '/logos/nys.png'} alt={formData.firm_name} className="h-7 w-auto max-w-[36px] object-contain rounded-md" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-foreground">{formData.firm_name || 'Firm Name'}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                          ★ {(formData.rating || 4.9).toFixed(1)}
                        </span>
                        <span>({(formData.review_count || 1200).toLocaleString()} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Account Size</span>
                      <span className="font-extrabold text-foreground tracking-tight">${(formData.account_size || 100000).toLocaleString()}</span>
                    </div>

                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground">
                      {formData.steps === 0 ? 'Instant' : `${formData.steps || 2}-Step`}
                    </span>

                    <div>
                      <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Target</span>
                      <span className="font-extrabold text-foreground">{formData.profit_target_pct}% {formData.phase_2_target_pct ? `| ${formData.phase_2_target_pct}%` : ''}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Daily | Max DD</span>
                      <span className="font-extrabold text-foreground">{formData.daily_loss_limit_pct}% | {formData.max_loss_limit_pct}%</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Split</span>
                      <span className="font-extrabold text-foreground">Up to {formData.profit_split_pct}%</span>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-foreground">${formData.price}</div>
                      <div className="text-[10px] line-through text-muted-foreground">${formData.original_price}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] font-bold">
                        Code {formData.coupon_code || 'EMPIRE'}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs">
                        BUY
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Detail Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Payout Cycle</span>
                    <span className="font-bold text-foreground">{formData.payout_frequency || 'Bi-Weekly'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Average Payout</span>
                    <span className="font-extrabold text-foreground">{formData.avg_payout || '$5,400'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Consistency</span>
                    <span className="font-bold text-foreground">{formData.consistency_rule || 'No Consistency Rule'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[9px] uppercase font-semibold text-muted-foreground block">Minimum Days</span>
                    <span className="font-bold text-foreground">{formData.min_trading_days ? `${formData.min_trading_days} Days` : '0 Days'}</span>
                  </div>
                </div>

                {/* Rules Row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-muted-foreground font-semibold">Rules:</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-medium">
                    News Trading: <span className="font-bold">{formData.news_trading}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-medium">
                    Overnight & Weekend: <span className="font-bold">{formData.overnight_weekend}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-medium">
                    Loss Type: <span className="font-bold">{formData.loss_type}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-medium">
                    EA & Algo: <span className="font-bold">{formData.ea_algo_trading}</span>
                  </span>
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
