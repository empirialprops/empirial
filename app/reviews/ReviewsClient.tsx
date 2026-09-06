'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShieldCheck,
  Search,
  Plus,
  X,
  ChevronDown,
  MessageSquare,
  Building2,
  ExternalLink,
  Layers,
  ThumbsUp,
  UserCheck,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { MOCK_REVIEWS } from '@/lib/data/reviews-data';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { Review, Firm } from '@/lib/types';
import { getStoredUser, openAuthModal } from '@/lib/utils/auth-store';
import { getReviews, getFirms, createReview } from '@/lib/firebase/services';
import { calculateFirmMetrics } from '@/lib/utils/rating-calculator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ReviewsClient() {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [firmsList, setFirmsList] = useState<Firm[]>([]);
  const [selectedFirmSlugs, setSelectedFirmSlugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredFirmId, setHoveredFirmId] = useState<string | null>(null);
  const [expandedFirmId, setExpandedFirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Review Modal State
  const [viewAllFirmId, setViewAllFirmId] = useState<string | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedModalFirmId, setSelectedModalFirmId] = useState<string>('nys');
  const [fullName, setFullName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [tradingRating, setTradingRating] = useState<number>(5);
  const [customerCareRating, setCustomerCareRating] = useState<number>(5);
  const [payoutRating, setPayoutRating] = useState<number>(5);
  const [usabilityRating, setUsabilityRating] = useState<number>(5);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const handleMouseEnterReview = (id: string) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredFirmId(id);
  };

  const handleMouseLeaveReview = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = setTimeout(() => {
      setHoveredFirmId(null);
    }, 300); // 300ms smooth stay duration after removing mouse pointer
  };

  useEffect(() => {
    async function loadReviewsData() {
      try {
        const [revs, fms] = await Promise.all([getReviews(), getFirms()]);
        if (revs && revs.length > 0) {
          const uniqueRevs = Array.from(new Map(revs.map((r) => [r.id, r])).values());
          setReviewsList(uniqueRevs);
        } else {
          setReviewsList(MOCK_REVIEWS);
        }

        if (fms && fms.length > 0) {
          const uniqueFirms = Array.from(new Map(fms.map((f) => [f.id || f.slug, f])).values());
          setFirmsList(uniqueFirms);
        } else {
          setFirmsList(MOCK_FIRMS);
        }
      } catch (err) {
        console.error('Failed to load reviews dynamic data:', err);
        setReviewsList(MOCK_REVIEWS);
        setFirmsList(MOCK_FIRMS);
      } finally {
        setLoading(false);
      }
    }
    loadReviewsData();
  }, []);

  // Filter States
  const [starFilter, setStarFilter] = useState<'all' | '5' | '4.5' | '4'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');

  // Toggle multi-select firm filter
  const toggleFirmFilter = (firmId: string) => {
    if (selectedFirmSlugs.includes(firmId)) {
      setSelectedFirmSlugs(selectedFirmSlugs.filter((id) => id !== firmId));
    } else {
      setSelectedFirmSlugs([...selectedFirmSlugs, firmId]);
    }
  };

  const handleClearFirmFilters = () => {
    setSelectedFirmSlugs([]);
    setStarFilter('all');
    setSortBy('rating');
    setSearchQuery('');
  };

  // Open Review modal pre-selecting a specific firm (Requires Account)
  const handleOpenReviewModal = (firmId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const user = getStoredUser();
    if (!user) {
      openAuthModal();
      return;
    }
    setSelectedModalFirmId(firmId);
    setFullName(user.displayName || '');
    setIsSubmitOpen(true);
    setIsSubmittedSuccess(false);
  };

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !reviewTitle.trim() || !reviewBody.trim()) return;

    const listFirms = firmsList.length > 0 ? firmsList : MOCK_FIRMS;
    const firmObj = listFirms.find((f) => f.id === selectedModalFirmId || f.slug === selectedModalFirmId);
    const overall = Math.round((tradingRating + customerCareRating + payoutRating + usabilityRating) / 4);

    const currentUser = getStoredUser();
    const isVerified = currentUser?.is_verified === true;

    const newRev: Omit<Review, 'id' | 'created_at'> = {
      firm_id: selectedModalFirmId,
      firm_name: firmObj?.name || 'Verified Firm',
      user_name: fullName.toLowerCase().replace(/\s+/g, ''),
      full_name: fullName.trim(),
      title: reviewTitle.trim(),
      body: reviewBody.trim(),
      overall_rating: overall,
      trading_conditions: tradingRating,
      customer_care: customerCareRating,
      user_friendliness: usabilityRating,
      payout_process: payoutRating,
      is_verified_trader: isVerified,
      upvotes: 1,
    };

    try {
      const id = await createReview(newRev);
      const inserted: Review = {
        id,
        created_at: new Date().toISOString().split('T')[0],
        ...newRev
      };
      setReviewsList([inserted, ...reviewsList]);
    } catch (err) {
      console.error('Failed to create review in Firestore:', err);
      const inserted: Review = {
        id: 'rev-' + Date.now(),
        created_at: new Date().toISOString().split('T')[0],
        ...newRev
      };
      setReviewsList([inserted, ...reviewsList]);
    }

    setIsSubmittedSuccess(true);

    setTimeout(() => {
      setIsSubmitOpen(false);
      setIsSubmittedSuccess(false);
      setFullName('');
      setReviewTitle('');
      setReviewBody('');
      setTradingRating(5);
      setCustomerCareRating(5);
      setPayoutRating(5);
      setUsabilityRating(5);
    }, 1200);
  };

  // Map firms with calculated review metrics & reviews list
  const firmRows = useMemo(() => {
    const listFirms = firmsList.length > 0 ? firmsList : MOCK_FIRMS;
    return listFirms.map((firm) => {
      if (!firm) return null;
      // Find all reviews matching firm
      const matchingReviews = reviewsList.filter(
        (r) =>
          r &&
          (r.firm_id === firm.id ||
            r.firm_id === firm.slug ||
            (r.firm_name || '').toLowerCase() === (firm.name || '').toLowerCase() ||
            (firm.id && r.firm_id === firm.id.replace('-capital', '')) ||
            (firm.slug && r.firm_id === firm.slug.replace('-capital', '')))
      );

      const metrics = calculateFirmMetrics(firm, reviewsList);

      return {
        firm: metrics.firm,
        reviewCount: metrics.reviewCount,
        tradingConditions: metrics.tradingConditions,
        customerCare: metrics.customerCare,
        payoutProcess: metrics.payoutProcess,
        overallRank: metrics.overallRank,
        reviews: metrics.reviews,
      };
    }).filter(Boolean) as Array<{
      firm: any;
      reviewCount: number;
      tradingConditions: number;
      customerCare: number;
      payoutProcess: number;
      overallRank: number;
      reviews: any[];
    }>;
  }, [firmsList, reviewsList]);

  // Filtered & Sorted Firm Rows based on Search, Star Filters, and Ranking
  const filteredRows = useMemo(() => {
    let list = firmRows.filter((row) => {
      if (!row || !row.firm) return false;
      
      // 1. Multi-Select Firm Pills Filter
      if (selectedFirmSlugs.length > 0) {
        const matchesFirm =
          selectedFirmSlugs.includes(row.firm.id) ||
          selectedFirmSlugs.includes(row.firm.slug) ||
          selectedFirmSlugs.includes(row.firm.name);
        if (!matchesFirm) return false;
      }

      // 2. Star Rating Threshold Filter (4+ Stars, 4.5+ Stars, 5 Stars)
      if (starFilter === '5') {
        if (row.overallRank < 5) return false;
      } else if (starFilter === '4.5') {
        if (row.overallRank < 4.5) return false;
      } else if (starFilter === '4') {
        if (row.overallRank < 4) return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (row.firm.name || '').toLowerCase().includes(q);
        const matchesCategory = row.firm.category?.toLowerCase().includes(q);
        const matchesCountry = row.firm.country?.toLowerCase().includes(q);
        const matchesReviews = row.reviews.some(
          (r) =>
            (r.title || '').toLowerCase().includes(q) ||
            (r.body || '').toLowerCase().includes(q) ||
            (r.full_name || '').toLowerCase().includes(q)
        );

        if (!matchesName && !matchesCategory && !matchesCountry && !matchesReviews) {
          return false;
        }
      }

      return true;
    });

    // 4. Ranking & Sorting
    return list.sort((a, b) => {
      if (sortBy === 'rating') {
        // Highest star rating first
        if (b.overallRank !== a.overallRank) {
          return b.overallRank - a.overallRank;
        }
        // Tie-breaker: More number of reviews first
        if (b.reviewCount !== a.reviewCount) {
          return b.reviewCount - a.reviewCount;
        }
        return (b.firm.trust_score || 0) - (a.firm.trust_score || 0);
      } else if (sortBy === 'reviews') {
        // Most number of reviews first (descending)
        if (b.reviewCount !== a.reviewCount) {
          return b.reviewCount - a.reviewCount;
        }
        // Tie-breaker: Highest star rating
        return b.overallRank - a.overallRank;
      } else {
        // Name A-Z
        return (a.firm.name || '').localeCompare(b.firm.name || '');
      }
    });
  }, [firmRows, selectedFirmSlugs, starFilter, searchQuery, sortBy]);

  // Helper to render stars (5 Golden Stars vs Green Stars for Overall Rank)
  const renderStars = (rating: number, isGreen = false) => {
    return (
      <div className="flex items-center gap-0.5 shrink-0">
        {Array.from({ length: 5 }).map((_, i) => {
          const isFilled = i < Math.round(rating);
          return (
            <Star
              key={i}
              className={`w-3.5 h-3.5 shrink-0 ${
                isGreen
                  ? isFilled
                    ? 'fill-emerald-500 text-emerald-500'
                    : 'text-zinc-300 dark:text-zinc-700'
                  : isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-zinc-300 dark:text-zinc-700'
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 overflow-x-clip">
      {/* Continuous Atmospheric Tilted Lite Green & Blue Mixture Light Beam */}
      <div className="absolute top-0 inset-x-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="relative w-full max-w-5xl mx-auto h-full flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.1, ease: 'easeOut' }}
            className="absolute -top-12 sm:-top-20 right-0 sm:right-6 md:right-12 w-24 sm:w-32 md:w-40 h-[2400px] sm:h-[3200px] lg:h-[4000px] bg-gradient-to-b from-[#10b981] from-0% via-[#06b6d4]/60 via-35% to-transparent to-85% blur-[75px] sm:blur-[90px] rounded-full rotate-[28deg] sm:rotate-[32deg] origin-top will-change-transform opacity-75 dark:opacity-55"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* 1. Header (Centered, Strictly following RULE:BW typography) */}
        <div className="text-center py-6 border-b border-zinc-200/80 dark:border-zinc-800 space-y-2 max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold sm:text-2xl lg:text-3xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Prop Firm Trader Reviews & Ratings
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Unfiltered ratings across Trading Conditions, Customer Care, Payout Process, and Platform Reliability with community-verified feedback.
          </p>
        </div>

        {/* 2. Search & Multi-Select Firm Filter Bar (Translucent in white theme, Strictly Monochrome Black & White) */}
        <div className="bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Top Row: Search Input & Write a Review CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prop firms, verified reviews..."
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Write a Review Button (Highlighted Black in light mode, White in dark mode) */}
            <button
              type="button"
              onClick={() => handleOpenReviewModal('nys')}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Review (+300 pts)</span>
            </button>
          </div>

          {/* Firm Selection Pills (Multi-Select, Pure Black & White) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="text-xs font-bold text-foreground mr-1">Filter Firms:</span>
            
            {/* All Prop Firms Button */}
            <button
              type="button"
              onClick={handleClearFirmFilters}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedFirmSlugs.length === 0
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-muted-foreground hover:text-foreground'
              }`}
            >
              All Prop Firms ({(firmsList.length > 0 ? firmsList : MOCK_FIRMS).length})
            </button>

            {/* Individual Multi-Select Firm Pills */}
            {(firmsList.length > 0 ? firmsList : MOCK_FIRMS).map((firm) => {
              const isSelected = selectedFirmSlugs.includes(firm.id) || selectedFirmSlugs.includes(firm.slug);
              const logoSrc = firm.logo_url || (firm as any).logo || '/logos/nys.png';
              return (
                <button
                  key={firm.id}
                  type="button"
                  onClick={() => toggleFirmFilter(firm.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <img
                    src={logoSrc}
                    alt={firm.name}
                    className="w-3.5 h-3.5 object-contain rounded-xs shrink-0"
                  />
                  <span>{firm.name}</span>
                </button>
              );
            })}
          </div>

          {/* Rating & Sorting Controls (Star Filter: 5 Stars, 4.5+ Stars, 4+ Stars; Sort By: Highest Rating, Most Reviews) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            {/* Star Rating Filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-foreground mr-1">Star Filter:</span>
              {[
                { id: 'all', label: 'All Ratings' },
                { id: '5', label: '5 Stars' },
                { id: '4.5', label: '4.5+ Stars' },
                { id: '4', label: '4+ Stars' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStarFilter(f.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    starFilter === f.id
                      ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort By Select Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-foreground shrink-0">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
              >
                <option value="rating">Highest Rating (Stars + Reviews Tie-breaker)</option>
                <option value="reviews">No. of Reviews (Highest 1st, Descending)</option>
                <option value="name">Firm Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Firms Reviews Listing Table (Exactly like Prop Firm Page layout) */}
        <div className="space-y-4">
          
          {/* Desktop Table Headers */}
          <div className="hidden lg:grid grid-cols-12 gap-3 px-6 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-3">Firm</div>
            <div className="col-span-1">No. of Reviews</div>
            <div className="col-span-2">Trading Conditions</div>
            <div className="col-span-2">Customer Care</div>
            <div className="col-span-2">Payout Process</div>
            <div className="col-span-1 text-center">Ranks</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Rows List with Fluid Animations & Hover Dropdown Accordion */}
          <TooltipProvider>
            <div className="space-y-3.5">
              <AnimatePresence mode="popLayout">
                {filteredRows.length > 0 ? (
                  filteredRows.map((row) => {
                    const firm = row.firm;
                    const isHovered = hoveredFirmId === firm.id;
                    const isExpanded = expandedFirmId === firm.id || isHovered;

                    // Progress bar calculation for review volume
                    const reviewVolumePct = Math.min(100, Math.max(15, Math.round((row.reviewCount / 5000) * 100)));

                    return (
                      <motion.div
                        layout="position"
                        key={firm.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -2, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        onMouseEnter={() => handleMouseEnterReview(firm.id)}
                        onMouseLeave={handleMouseLeaveReview}
                        onClick={() => setExpandedFirmId(expandedFirmId === firm.id ? null : firm.id)}
                        className={`relative rounded-2xl transition-all duration-500 ease-in-out border ${
                          isExpanded
                            ? 'border-black dark:border-white shadow-[0_0_20px_rgba(0,0,0,0.12)] dark:shadow-[0_0_25px_rgba(255,255,255,0.16)] bg-white/65 dark:bg-card backdrop-blur-md'
                            : 'border-zinc-200 dark:border-border hover:border-black dark:hover:border-white bg-white/60 dark:bg-card backdrop-blur-md shadow-xs'
                        }`}
                      >
                        {/* Main Row Content */}
                        <div className="p-4 sm:p-5">
                          {/* Desktop Grid Layout */}
                          <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
                            
                            {/* 1. Firm Logo & Name (Slightly rounded edges, transparent png support) */}
                            <div className="col-span-3 flex items-center gap-3.5">
                              <div className="shrink-0 w-11 h-11 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-1 overflow-hidden shadow-2xs">
                                <img
                                  src={firm.logo_url || (firm as any).logo || '/logos/nys.png'}
                                  alt={firm.name}
                                  className="h-8 w-auto max-w-[40px] object-contain rounded-md"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h2 className="text-sm font-bold text-foreground">
                                    {firm.name}
                                  </h2>
                                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                </div>
                                <span className="text-[11px] text-muted-foreground block">
                                  {firm.headquarters || firm.country || 'Global'}
                                </span>
                              </div>
                            </div>

                            {/* 2. No. of Reviews (Clean bold number + horizontal volume bar, NO review label text) */}
                            <div className="col-span-1 space-y-1">
                              <div className="text-xs">
                                <span className="font-extrabold text-foreground tracking-tight text-sm">
                                  {row.reviewCount.toLocaleString('en-US')}
                                </span>
                              </div>
                              <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-black dark:bg-white rounded-full"
                                  style={{ width: `${reviewVolumePct}%` }}
                                />
                              </div>
                            </div>

                            {/* 3. Trading Conditions (5 Golden Stars, NO subline) */}
                            <div className="col-span-2 flex items-center gap-1.5">
                              {renderStars(row.tradingConditions, false)}
                              <span className="text-xs font-bold text-foreground">
                                {row.tradingConditions.toFixed(1)}
                              </span>
                            </div>

                            {/* 4. Customer Care (5 Golden Stars, NO subline) */}
                            <div className="col-span-2 flex items-center gap-1.5">
                              {renderStars(row.customerCare, false)}
                              <span className="text-xs font-bold text-foreground">
                                {row.customerCare.toFixed(1)}
                              </span>
                            </div>

                            {/* 5. Payout Process (5 Golden Stars, NO subline) */}
                            <div className="col-span-2 flex items-center gap-1.5">
                              {renderStars(row.payoutProcess, false)}
                              <span className="text-xs font-bold text-foreground">
                                {row.payoutProcess.toFixed(1)}
                              </span>
                            </div>

                            {/* 6. Ranks (Averaged Score with GREEN Stars Pill) */}
                            <div className="col-span-1 text-center">
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 dark:border-emerald-600/30 text-emerald-600 dark:text-emerald-400">
                                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500 shrink-0" />
                                <span className="text-xs font-bold">{row.overallRank.toFixed(1)}</span>
                              </div>
                            </div>

                            {/* 7. Actions (Highlighted "Give Review" Button: White in Dark mode, Black in Light mode) */}
                            <div className="col-span-1 flex items-center justify-end">
                              <button
                                type="button"
                                onClick={(e) => handleOpenReviewModal(firm.id, e)}
                                className="px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                Give Review
                              </button>
                            </div>

                          </div>

                          {/* Mobile View */}
                          <div className="lg:hidden flex flex-col space-y-3.5">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-1">
                                  <img
                                    src={firm.logo_url}
                                    alt={firm.name}
                                    className="h-7 w-auto max-w-[36px] object-contain rounded-md"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h2 className="text-sm font-bold text-foreground">{firm.name}</h2>
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">
                                    {row.reviewCount.toLocaleString('en-US')} Community Reviews
                                  </span>
                                </div>
                              </div>

                              {/* Overall Rank Green Badge */}
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 dark:border-emerald-600/30 text-emerald-600 dark:text-emerald-400">
                                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                                <span className="text-xs font-bold">{row.overallRank.toFixed(1)}</span>
                              </div>
                            </div>

                            {/* Criteria Ratings Grid */}
                            <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs">
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Trading</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <strong className="text-foreground">{row.tradingConditions.toFixed(1)}</strong>
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Support</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <strong className="text-foreground">{row.customerCare.toFixed(1)}</strong>
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Payout</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <strong className="text-foreground">{row.payoutProcess.toFixed(1)}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Mobile Action Button */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={(e) => handleOpenReviewModal(firm.id, e)}
                                className="flex-1 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer shadow-xs text-center"
                              >
                                Give Review
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 6. Hover / Click Dropdown Menu with Hand-Written Reviews */}
                        <AnimatePresence>
                          {(isHovered || isExpanded) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-b-2xl"
                            >
                              <div className="p-4 sm:p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                    <h3 className="text-xs sm:text-sm font-bold text-foreground">
                                      Trader Hand-Written Feedback for {firm.name}
                                    </h3>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewAllFirmId(firm.id);
                                    }}
                                    className="text-xs font-bold text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <span>View All Reviews</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Reviews Preview Grid (Showing Top 2 Best Reviews) */}
                                {row.reviews.length > 0 ? (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {[...row.reviews]
                                        .sort((a, b) => (b.overall_rating || 5) - (a.overall_rating || 5) || (b.upvotes || 0) - (a.upvotes || 0))
                                        .slice(0, 2)
                                        .map((rev) => {
                                          const reviewAverage = Number(
                                            (
                                              (rev.trading_conditions +
                                                rev.customer_care +
                                                rev.user_friendliness +
                                                rev.payout_process) /
                                              4
                                            ).toFixed(1)
                                          );

                                          return (
                                            <div
                                              key={rev.id}
                                              className="p-4 rounded-2xl bg-white/70 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border shadow-2xs space-y-3 flex flex-col justify-between"
                                            >
                                              <div className="space-y-2">
                                                {/* Star Header */}
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-1.5">
                                                    {renderStars(reviewAverage, false)}
                                                    <span className="text-xs font-bold text-foreground">
                                                      {reviewAverage.toFixed(1)}
                                                    </span>
                                                  </div>
                                                  <span className="text-[10px] text-muted-foreground font-mono">
                                                    {rev.created_at}
                                                  </span>
                                                </div>

                                                {/* Title & Body */}
                                                <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                                                  "{rev.title}"
                                                </h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                  {rev.body}
                                                </p>
                                              </div>

                                              {/* Scorecard with Stars & Author */}
                                              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                                                  <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                                                    <span className="text-muted-foreground">Trading:</span>
                                                    <span className="inline-flex items-center gap-1 font-bold text-foreground">
                                                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                                                      <span>{rev.trading_conditions}/5</span>
                                                    </span>
                                                  </div>
                                                  <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                                                    <span className="text-muted-foreground">Support:</span>
                                                    <span className="inline-flex items-center gap-1 font-bold text-foreground">
                                                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                                                      <span>{rev.customer_care}/5</span>
                                                    </span>
                                                  </div>
                                                  <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                                                    <span className="text-muted-foreground">Platform:</span>
                                                    <span className="inline-flex items-center gap-1 font-bold text-foreground">
                                                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                                                      <span>{rev.user_friendliness}/5</span>
                                                    </span>
                                                  </div>
                                                  <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                                                    <span className="text-muted-foreground">Payout:</span>
                                                    <span className="inline-flex items-center gap-1 font-bold text-foreground">
                                                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                                                      <span>{rev.payout_process}/5</span>
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-1 text-xs">
                                                  <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-foreground">
                                                      {rev.full_name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-foreground text-xs">{rev.full_name}</span>
                                                  </div>
                                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Verified Trader
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>

                                    {/* Action to view all reviews if total > 2 */}
                                    {row.reviews.length > 2 && (
                                      <div className="text-center pt-2">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setViewAllFirmId(firm.id);
                                          }}
                                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                                        >
                                          <span>View All {row.reviews.length} Reviews for {firm.name}</span>
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                                    <p className="text-xs text-muted-foreground">
                                      No hand-written community reviews yet for {firm.name}.
                                    </p>
                                    <button
                                      type="button"
                                      onClick={(e) => handleOpenReviewModal(firm.id, e)}
                                      className="px-4 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black text-xs font-semibold"
                                    >
                                      Be First to Write Review
                                    </button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="p-10 text-center rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border">
                    <p className="text-sm font-semibold text-foreground">No matching prop firm reviews found.</p>
                    <p className="text-xs text-muted-foreground mt-1">Try clearing your filters or changing the search terms.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFirmSlugs([]);
                        setSearchQuery('');
                      }}
                      className="mt-3 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </TooltipProvider>

        </div>

        {/* 7. Write a Review Modal (Strictly Monochrome Black & White) */}
        <AnimatePresence>
          {isSubmitOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Write a Prop Firm Review</h3>
                    <p className="text-xs text-muted-foreground">Share your verified trader experience with the community</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSubmitOpen(false)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isSubmittedSuccess ? (
                  <div className="text-center py-8 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-foreground">Review Submitted!</h4>
                    <p className="text-xs text-muted-foreground">+300 community loyalty points added.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Your Full Name</label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Anuraj Sharma"
                          required
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">Prop Firm</label>
                        <select
                          value={selectedModalFirmId}
                          onChange={(e) => setSelectedModalFirmId(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-black dark:focus:border-white"
                        >
                          {MOCK_FIRMS.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Review Headline</label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="e.g. Flawless 6-hour payout turnaround and raw spreads"
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Your Honest Feedback</label>
                      <textarea
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        rows={4}
                        placeholder="Describe execution, slippage, rules clarity, drawdown enforcement, and support response times..."
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>

                    {/* 4 Star Criteria Selectors */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">Trading Conditions:</span>
                        <select
                          value={tradingRating}
                          onChange={(e) => setTradingRating(parseInt(e.target.value))}
                          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-bold text-amber-500"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>{n} Stars</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">Customer Support:</span>
                        <select
                          value={customerCareRating}
                          onChange={(e) => setCustomerCareRating(parseInt(e.target.value))}
                          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-bold text-amber-500"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>{n} Stars</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">Payout Process:</span>
                        <select
                          value={payoutRating}
                          onChange={(e) => setPayoutRating(parseInt(e.target.value))}
                          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-bold text-amber-500"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>{n} Stars</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">User Friendliness:</span>
                        <select
                          value={usabilityRating}
                          onChange={(e) => setUsabilityRating(parseInt(e.target.value))}
                          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-bold text-amber-500"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>{n} Stars</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsSubmitOpen(false)}
                        className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                      >
                        Submit Review (+300 pts)
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* View All Reviews Modal for Selected Firm */}
        <AnimatePresence>
          {viewAllFirmId && (() => {
            const listFirms = firmsList.length > 0 ? firmsList : MOCK_FIRMS;
            const targetRow = firmRows.find((r) => r.firm.id === viewAllFirmId || r.firm.slug === viewAllFirmId);
            const targetFirm = targetRow?.firm || listFirms.find((f) => f.id === viewAllFirmId || f.slug === viewAllFirmId);
            const matchingReviews = targetRow?.reviews || reviewsList.filter(
              (r) =>
                r.firm_id === viewAllFirmId ||
                r.firm_id === targetFirm?.slug ||
                (r.firm_name || '').toLowerCase() === (targetFirm?.name || '').toLowerCase()
            );

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 max-w-4xl w-full space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
                >
                  {/* Modal Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={targetFirm?.logo_url || '/logos/nys.png'}
                          alt={targetFirm?.name || 'Firm'}
                          className="h-8 w-auto max-w-[42px] object-contain rounded-md"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-foreground">{targetFirm?.name}</h2>
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                            <span>{targetRow?.overallRank.toFixed(1) || '4.9'}</span>
                          </span>
                          <span className="text-xs text-muted-foreground font-semibold">
                            ({matchingReviews.length} Community Reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          const targetId = targetFirm?.id || viewAllFirmId;
                          setViewAllFirmId(null);
                          handleOpenReviewModal(targetId);
                        }}
                        className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        + Write A Review
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewAllFirmId(null)}
                        className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Reviews Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        All Community Reviews for {targetFirm?.name}
                      </h3>
                      <span className="text-xs font-semibold text-foreground">
                        Showing {matchingReviews.length} reviews
                      </span>
                    </div>

                    {matchingReviews.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matchingReviews.map((rev) => {
                          const reviewAverage = Number(
                            (
                              (rev.trading_conditions +
                                rev.customer_care +
                                rev.user_friendliness +
                                rev.payout_process) /
                              4
                            ).toFixed(1)
                          );

                          return (
                            <div
                              key={rev.id}
                              className="p-4.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    {renderStars(reviewAverage, false)}
                                    <span className="text-xs font-bold text-foreground">
                                      {reviewAverage.toFixed(1)}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    {rev.created_at}
                                  </span>
                                </div>

                                <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                                  "{rev.title}"
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {rev.body}
                                </p>
                              </div>

                              <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                                  <div className="p-1.5 rounded-lg bg-white dark:bg-card border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                                    <span className="text-muted-foreground">Trading:</span>
                                    <span className="font-bold text-foreground">★ {rev.trading_conditions}/5</span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-white dark:bg-card border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                                    <span className="text-muted-foreground">Support:</span>
                                    <span className="font-bold text-foreground">★ {rev.customer_care}/5</span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-white dark:bg-card border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                                    <span className="text-muted-foreground">Platform:</span>
                                    <span className="font-bold text-foreground">★ {rev.user_friendliness}/5</span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-white dark:bg-card border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                                    <span className="text-muted-foreground">Payout:</span>
                                    <span className="font-bold text-foreground">★ {rev.payout_process}/5</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-1 text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[10px]">
                                      {(rev.full_name || rev.user_name || 'TR').substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-foreground text-xs">{rev.full_name || rev.user_name}</span>
                                  </div>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Verified Trader
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-muted-foreground text-xs space-y-3">
                        <p>No community reviews published for {targetFirm?.name} yet.</p>
                        <button
                          type="button"
                          onClick={() => {
                            const targetId = targetFirm?.id || viewAllFirmId;
                            setViewAllFirmId(null);
                            handleOpenReviewModal(targetId);
                          }}
                          className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold cursor-pointer"
                        >
                          Be the first to review {targetFirm?.name}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default ReviewsClient;
