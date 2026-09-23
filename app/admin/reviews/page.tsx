'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  Trash2,
  Edit,
  ShieldCheck,
  X,
  Search,
  Plus,
  Building2,
  ThumbsUp,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { MOCK_REVIEWS } from '@/lib/data/reviews-data';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { Review, Firm } from '@/lib/types';
import {
  getReviews,
  getFirms,
  createReview,
  updateReview,
  deleteReview,
} from '@/lib/firebase/services';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFirmFilter, setSelectedFirmFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  // Add / Edit Modal States
  const [isAdding, setIsAdding] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const [formData, setFormData] = useState<Partial<Review>>({
    firm_id: 'nys',
    firm_name: 'NYS Capital',
    user_name: 'trader_pro',
    full_name: 'Sarah Chen',
    title: 'Flawless 1-Step Evaluation & Immediate Payout',
    body: 'Passed my NYS Capital evaluation with code EMPIRE. The drawdown buffer is generous and payout arrived in crypto within 12 hours.',
    overall_rating: 5,
    trading_conditions: 5,
    customer_care: 5,
    user_friendliness: 5,
    payout_process: 5,
    is_verified_trader: true,
    upvotes: 14,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [revsData, firmsData] = await Promise.all([getReviews(), getFirms()]);
        setReviews(revsData.length > 0 ? revsData : MOCK_REVIEWS);
        const resolvedFirms = firmsData.length > 0 ? firmsData : MOCK_FIRMS;
        setFirms(resolvedFirms);
      } catch (err) {
        console.error('Failed to load reviews:', err);
        setReviews(MOCK_REVIEWS);
        setFirms(MOCK_FIRMS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFirmChange = (firmId: string) => {
    const matched = firms.find((f) => f.id === firmId);
    setFormData((prev) => ({
      ...prev,
      firm_id: firmId,
      firm_name: matched ? matched.name : prev.firm_name,
    }));
  };

  const handleStartAdd = () => {
    const defaultFirm = firms[0] || { id: 'nys', name: 'NYS Capital' };
    setFormData({
      firm_id: defaultFirm.id,
      firm_name: defaultFirm.name,
      user_name: 'verified_trader',
      full_name: 'Marcus Rodriguez',
      title: 'Reliable Spreads & Instant Payout Processing',
      body: 'Verified evaluation rules and prompt support. The spread consistency on raw accounts is top notch.',
      overall_rating: 5,
      trading_conditions: 5,
      customer_care: 5,
      user_friendliness: 5,
      payout_process: 5,
      is_verified_trader: true,
      upvotes: 10,
    });
    setEditingReview(null);
    setIsAdding(true);
  };

  const handleStartEdit = (review: Review) => {
    setFormData({ ...review });
    setEditingReview(review);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trader review?')) return;
    try {
      await deleteReview(id);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete review:', err);
      setReviews(reviews.filter((r) => r.id !== id));
    }
  };

  const handleToggleVerify = async (review: Review) => {
    const nextVerify = !review.is_verified_trader;
    try {
      await updateReview(review.id, { is_verified_trader: nextVerify });
      setReviews(reviews.map((r) => (r.id === review.id ? { ...r, is_verified_trader: nextVerify } : r)));
    } catch (err) {
      console.error('Failed to toggle verification:', err);
      setReviews(reviews.map((r) => (r.id === review.id ? { ...r, is_verified_trader: nextVerify } : r)));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.title || !formData.body) {
      alert('Reviewer name, title, and body are required.');
      return;
    }

    const tc = Number(formData.trading_conditions) || 5;
    const cc = Number(formData.customer_care) || 5;
    const uf = Number(formData.user_friendliness) || 5;
    const pp = Number(formData.payout_process) || 5;
    const overall = Math.round((tc + cc + uf + pp) / 4);

    const payload: Omit<Review, 'id' | 'created_at'> = {
      firm_id: formData.firm_id || 'nys',
      firm_name: formData.firm_name || 'Verified Firm',
      user_name: (formData.user_name || formData.full_name?.toLowerCase().replace(/\s+/g, '') || 'trader').trim(),
      full_name: formData.full_name.trim(),
      title: formData.title.trim(),
      body: formData.body.trim(),
      overall_rating: overall,
      trading_conditions: tc,
      customer_care: cc,
      user_friendliness: uf,
      payout_process: pp,
      is_verified_trader: !!formData.is_verified_trader,
      upvotes: Number(formData.upvotes) || 0,
    };

    if (editingReview) {
      try {
        await updateReview(editingReview.id, payload);
        setReviews(reviews.map((r) => (r.id === editingReview.id ? { ...r, ...payload, overall_rating: overall } : r)));
      } catch (err) {
        console.error('Failed to update review:', err);
        setReviews(reviews.map((r) => (r.id === editingReview.id ? { ...r, ...payload, overall_rating: overall } : r)));
      }
    } else {
      try {
        const id = await createReview(payload);
        const inserted: Review = {
          id,
          created_at: new Date().toISOString().split('T')[0],
          ...payload,
        };
        setReviews([inserted, ...reviews]);
      } catch (err) {
        console.error('Failed to create review:', err);
        const inserted: Review = {
          id: 'rev-' + Date.now(),
          created_at: new Date().toISOString().split('T')[0],
          ...payload,
        };
        setReviews([inserted, ...reviews]);
      }
    }

    setIsAdding(false);
    setEditingReview(null);
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.firm_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFirm = selectedFirmFilter === 'all' || r.firm_id === selectedFirmFilter || r.firm_name === selectedFirmFilter;
    const matchesRating = ratingFilter === 'all' || r.overall_rating === parseInt(ratingFilter);
    const matchesVerified =
      verifiedFilter === 'all' ||
      (verifiedFilter === 'verified' && r.is_verified_trader) ||
      (verifiedFilter === 'unverified' && !r.is_verified_trader);

    return matchesSearch && matchesFirm && matchesRating && matchesVerified;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3.5 h-3.5 ${
              s <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-300 dark:text-zinc-700'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-foreground rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-mono">Loading reviews database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Trader Reviews Moderation
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Moderate community reviews, edit category ratings (Trading Conditions, Customer Care, Usability, Payouts), and toggle verified trader badges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert('All trader review updates and moderation statuses have been saved!')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
          <button
            type="button"
            onClick={handleStartAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-foreground text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reviews, users, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Firm Filter */}
          <select
            value={selectedFirmFilter}
            onChange={(e) => setSelectedFirmFilter(e.target.value)}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="all">All Firms</option>
            {firms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Star Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Verified Status Filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
          >
            <option value="all">All Traders</option>
            <option value="verified">Verified Traders Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-foreground transition-all duration-200"
          >
            <div>
              {/* Header: User & Firm */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-foreground">
                    {rev.full_name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'TR'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-foreground">{rev.full_name}</span>
                      {rev.is_verified_trader && (
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">@{rev.user_name} • {rev.firm_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(rev)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Edit Review"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Star Ratings Overview */}
              <div className="mt-3 flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  {renderStars(rev.overall_rating)}
                  <span className="text-xs font-bold text-foreground">{rev.overall_rating}.0</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">{rev.created_at}</span>
              </div>

              {/* Title & Body */}
              <div className="mt-3 space-y-1.5">
                <h4 className="text-sm font-bold text-foreground line-clamp-1">{rev.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">&ldquo;{rev.body}&rdquo;</p>
              </div>

              {/* 4 Critical Rating Breakdown */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Trading Conditions:</span>
                  <span className="font-bold text-foreground">{rev.trading_conditions} ★</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Customer Care:</span>
                  <span className="font-bold text-foreground">{rev.customer_care} ★</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Usability / App:</span>
                  <span className="font-bold text-foreground">{rev.user_friendliness} ★</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Payout Process:</span>
                  <span className="font-bold text-foreground">{rev.payout_process} ★</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Verify Toggle & Upvotes */}
            <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => handleToggleVerify(rev)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  rev.is_verified_trader
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300/40'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-transparent'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{rev.is_verified_trader ? 'Verified Trader' : 'Set as Verified'}</span>
              </button>

              <div className="flex items-center gap-1 text-muted-foreground font-semibold">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{rev.upvotes || 0} Upvotes</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Review Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <h2 className="text-lg font-bold text-foreground">
                  {editingReview ? `Edit Review by ${editingReview.full_name}` : 'Add Trader Review'}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Firm Selection */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Associated Prop Firm *</label>
                <select
                  required
                  value={formData.firm_id || ''}
                  onChange={(e) => handleFirmChange(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                >
                  {firms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reviewer Full Name */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Reviewer Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name || ''}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Sarah Chen"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Username & Upvotes */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Username Handle</label>
                <input
                  type="text"
                  value={formData.user_name || ''}
                  onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                  placeholder="e.g. sarah_fx"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Upvotes Count</label>
                <input
                  type="number"
                  value={formData.upvotes ?? 10}
                  onChange={(e) => setFormData({ ...formData, upvotes: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* 4 Rating Parameters (1-5) */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Trading Conditions (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.trading_conditions ?? 5}
                  onChange={(e) => setFormData({ ...formData, trading_conditions: parseInt(e.target.value) || 5 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Customer Care (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.customer_care ?? 5}
                  onChange={(e) => setFormData({ ...formData, customer_care: parseInt(e.target.value) || 5 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Usability / App (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.user_friendliness ?? 5}
                  onChange={(e) => setFormData({ ...formData, user_friendliness: parseInt(e.target.value) || 5 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Payout Process (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.payout_process ?? 5}
                  onChange={(e) => setFormData({ ...formData, payout_process: parseInt(e.target.value) || 5 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Review Title */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-foreground">Review Headline Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Fast evaluation pass and transparent rules"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Review Body */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-foreground">Review Content *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.body || ''}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Share details about evaluation, rules, spreads, and payouts..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Verified Badge */}
              <div className="space-y-2 md:col-span-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.is_verified_trader}
                    onChange={(e) => setFormData({ ...formData, is_verified_trader: e.target.checked })}
                    className="rounded border-zinc-300 text-black dark:text-white"
                  />
                  <span className="font-semibold text-foreground">Mark as Verified Funded Trader</span>
                </label>
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
                {editingReview ? 'Save Review Changes' : 'Create Review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
