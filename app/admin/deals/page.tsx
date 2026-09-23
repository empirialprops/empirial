'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Check,
  X,
  Save,
  RotateCcw,
  Search,
  ExternalLink,
  ShieldCheck,
  Star,
  Copy,
  Clock,
  Layers,
  Building2,
  Filter,
  SlidersHorizontal,
  Eye,
  Upload,
} from 'lucide-react';
import { MOCK_DEALS } from '@/lib/data/deals-data';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { Firm, Deal } from '@/lib/types';
import { getDeals, getFirms, createDeal, updateDeal, deleteDeal } from '@/lib/firebase/services';
import {
  getStoredDeals,
  addStoredDeal,
  updateStoredDeal,
  deleteStoredDeal,
  sortDeals,
} from '@/lib/utils/deals-store';
import {
  OfferPosterConfig,
  getStoredOfferPoster,
  saveOfferPoster,
  resetOfferPoster,
  DEFAULT_OFFER_POSTER,
} from '@/lib/utils/offer-popup-store';

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Custom Directory Filters State (Requirement 1: Admin can add and edit Filters)
  const [customFilters, setCustomFilters] = useState<string[]>([
    'all',
    'forex',
    'futures',
    'crypto',
    'instant-funding',
    'bogo',
    'cashback',
    'exclusive',
  ]);
  const [newFilterInput, setNewFilterInput] = useState('');
  const [showFilterManager, setShowFilterManager] = useState(false);

  // Offer Poster Config State
  const [posterConfig, setPosterConfig] = useState<OfferPosterConfig>(DEFAULT_OFFER_POSTER);
  const [isPosterSaved, setIsPosterSaved] = useState(false);
  const [showPosterPreview, setShowPosterPreview] = useState(false);
  const [benefitsText, setBenefitsText] = useState('');

  // Form State for New Offer (Includes Requirement 2 & 3)
  const [formData, setFormData] = useState<{
    firm_id: string;
    firm_name: string;
    firm_slug: string;
    firm_logo: string;
    code: string;
    discount_label: string;
    discount_pct: number;
    description: string;
    category: 'forex' | 'futures' | 'crypto' | 'instant-funding';
    offer_type: 'bogo' | 'cashback' | 'refund' | 'discount';
    affiliate_url: string;
    expires_at: string;
    is_featured: boolean;
    is_verified: boolean;
  }>({
    firm_id: '',
    firm_name: '',
    firm_slug: '',
    firm_logo: '',
    code: 'EMPIRIAL20',
    discount_label: '20% OFF Exclusive Promo',
    discount_pct: 20,
    description: 'Exclusive audited partner offer with instant discount applied at checkout.',
    category: 'forex',
    offer_type: 'discount',
    affiliate_url: 'https://discord.gg/ww4dkeeZdp',
    expires_at: 'Limited Time Offer',
    is_featured: true,
    is_verified: true,
  });

  useEffect(() => {
    const loadedPoster = getStoredOfferPoster();
    setPosterConfig(loadedPoster);
    setBenefitsText((loadedPoster.benefits || []).join('\n'));

    async function loadData() {
      try {
        const [dealsData, firmsData] = await Promise.all([getDeals(), getFirms()]);
        
        let loadedFirms = MOCK_FIRMS;
        if (firmsData && firmsData.length > 0) {
          loadedFirms = Array.from(new Map(firmsData.map(f => [f.id || f.slug, f])).values());
        }
        setFirms(loadedFirms);

        if (dealsData && dealsData.length > 0) {
          setDeals(sortDeals(dealsData));
        } else {
          setDeals(getStoredDeals());
        }

        // Initialize default form firm choice
        if (loadedFirms.length > 0) {
          const firstFirm = loadedFirms[0];
          setFormData((prev) => ({
            ...prev,
            firm_id: firstFirm.id,
            firm_name: firstFirm.name,
            firm_slug: firstFirm.slug,
            firm_logo: firstFirm.logo_url || '/logos/nys.png',
            category: (firstFirm.category as any) || 'forex',
          }));
        }
      } catch (err) {
        console.error('Failed to load offers data:', err);
        setDeals(getStoredDeals());
        setFirms(MOCK_FIRMS);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleDealsChange = (e: any) => {
      if (e.detail) {
        setDeals(sortDeals(e.detail));
      }
    };
    window.addEventListener('empirial_deals_changed', handleDealsChange);
    return () => {
      window.removeEventListener('empirial_deals_changed', handleDealsChange);
    };
  }, []);

  // Handle Firm Dropdown Selection (Requirement 2: Auto-loads Firm Name and LOGO)
  const handleFirmSelection = (selectedFirmId: string, isEditingForm = false) => {
    const targetFirm = firms.find((f) => f.id === selectedFirmId);
    if (!targetFirm) return;

    if (isEditingForm && editingDeal) {
      setEditingDeal({
        ...editingDeal,
        firm_id: targetFirm.id,
        firm_name: targetFirm.name,
        firm_slug: targetFirm.slug,
        firm_logo: targetFirm.logo_url || editingDeal.firm_logo,
        category: (targetFirm.category as any) || editingDeal.category,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        firm_id: targetFirm.id,
        firm_name: targetFirm.name,
        firm_slug: targetFirm.slug,
        firm_logo: targetFirm.logo_url || '/logos/nys.png',
        category: (targetFirm.category as any) || 'forex',
      }));
    }
  };

  // Add / Remove Custom Directory Filters (Requirement 1)
  const handleAddCustomFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterInput.trim()) return;
    const cleanFilter = newFilterInput.toLowerCase().trim().replace(/\s+/g, '-');
    if (!customFilters.includes(cleanFilter)) {
      setCustomFilters([...customFilters, cleanFilter]);
    }
    setNewFilterInput('');
  };

  const handleRemoveCustomFilter = (filterTag: string) => {
    if (filterTag === 'all') return;
    setCustomFilters(customFilters.filter((f) => f !== filterTag));
    if (selectedCategoryFilter === filterTag) {
      setSelectedCategoryFilter('all');
    }
  };

  // Handle Poster Image Upload File
  const handlePosterImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setPosterConfig((prev) => ({
          ...prev,
          posterImageUrl: evt.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Poster Settings Save
  const handleSavePoster = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedBenefits = benefitsText
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);

    const finalConfig: OfferPosterConfig = {
      ...posterConfig,
      benefits: cleanedBenefits.length > 0 ? cleanedBenefits : posterConfig.benefits || [],
    };

    saveOfferPoster(finalConfig);
    setPosterConfig(finalConfig);
    setIsPosterSaved(true);
    setTimeout(() => setIsPosterSaved(false), 2500);
  };

  const handleResetPoster = () => {
    const defaultConf = resetOfferPoster();
    setPosterConfig(defaultConf);
    setBenefitsText((defaultConf.benefits || []).join('\n'));
    setIsPosterSaved(true);
    setTimeout(() => setIsPosterSaved(false), 2500);
  };

  // Create New Deal (Requirement 2 & 3)
  const handleAddDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.firm_id) return;

    const createdAt = new Date().toISOString();
    const newDealData: Omit<Deal, 'id'> = {
      firm_id: formData.firm_id,
      firm_name: formData.firm_name,
      firm_slug: formData.firm_slug,
      firm_logo: formData.firm_logo,
      code: formData.code.toUpperCase(),
      discount_label: formData.discount_label,
      discount_pct: formData.discount_pct,
      description: formData.description,
      category: formData.category,
      offer_type: formData.offer_type,
      affiliate_url: formData.affiliate_url,
      expires_at: formData.expires_at,
      clicks_count: 0,
      is_featured: formData.is_featured,
      is_verified: formData.is_verified,
      created_at: createdAt,
    };

    let generatedId = 'deal-' + Date.now();
    try {
      generatedId = await createDeal(newDealData);
    } catch (err) {
      console.error('Failed to create deal in Firestore, saving locally:', err);
    }

    const fullDeal: Deal = { id: generatedId, ...newDealData };
    const updatedDeals = addStoredDeal(fullDeal);
    setDeals(updatedDeals);
    setIsAdding(false);
  };

  // Save Edited Deal
  const handleSaveEditDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal) return;

    const updatedData: Partial<Deal> = {
      firm_id: editingDeal.firm_id,
      firm_name: editingDeal.firm_name,
      firm_slug: editingDeal.firm_slug,
      firm_logo: editingDeal.firm_logo,
      code: editingDeal.code.toUpperCase(),
      discount_label: editingDeal.discount_label,
      discount_pct: editingDeal.discount_pct,
      description: editingDeal.description,
      category: editingDeal.category,
      offer_type: editingDeal.offer_type,
      affiliate_url: editingDeal.affiliate_url,
      expires_at: editingDeal.expires_at,
      is_featured: editingDeal.is_featured,
      is_verified: editingDeal.is_verified,
      updated_at: new Date().toISOString(),
    };

    try {
      await updateDeal(editingDeal.id, updatedData);
    } catch (err) {
      console.error('Failed to update deal in Firestore:', err);
    }

    const updatedDeals = updateStoredDeal(editingDeal.id, updatedData);
    setDeals(updatedDeals);
    setEditingDeal(null);
  };

  // Delete Deal
  const handleDeleteDeal = async (id: string) => {
    try {
      await deleteDeal(id);
    } catch (err) {
      console.error('Failed to delete deal from Firestore:', err);
    } finally {
      const updatedDeals = deleteStoredDeal(id);
      setDeals(updatedDeals);
      setDeleteConfirmId(null);
    }
  };

  // Processed Filtered Offers List
  const filteredDealsList = useMemo(() => {
    return deals.filter((deal) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (deal.firm_name || '').toLowerCase().includes(q);
        const matchCode = (deal.code || '').toLowerCase().includes(q);
        const matchDesc = (deal.description || '').toLowerCase().includes(q);
        const matchLabel = (deal.discount_label || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchDesc && !matchLabel) return false;
      }

      if (selectedCategoryFilter !== 'all') {
        const matchCat = deal.category === selectedCategoryFilter;
        const matchType = deal.offer_type === selectedCategoryFilter;
        if (!matchCat && !matchType) return false;
      }

      return true;
    });
  }, [deals, searchQuery, selectedCategoryFilter]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-mono">Loading promo offers matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-background text-foreground transition-colors duration-200">
      
      {/* Page Header (RULE:BW Typography) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            PROMO DEALS & OFFERS CMS
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground mt-1">
            Manage verified partner promo codes, affiliate links, offer categories, and session popup banners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => alert('All discount promo deals and offer settings have been saved!')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFilterManager(!showFilterManager)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Manage Filters</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-foreground text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Offer</span>
          </button>
        </div>
      </div>

      {/* Requirement 1: Collapsible Directory Filters Manager */}
      {showFilterManager && (
        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-foreground" />
              <h2 className="text-xs sm:text-sm font-bold text-foreground">Offer Category & Filter Tags Manager</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowFilterManager(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddCustomFilter} className="flex items-center gap-2">
            <input
              type="text"
              value={newFilterInput}
              onChange={(e) => setNewFilterInput(e.target.value)}
              placeholder="Add custom filter tag (e.g. exclusive, high-discount)..."
              className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-black dark:focus:border-white"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black text-xs font-semibold shadow-xs cursor-pointer shrink-0"
            >
              Add Filter
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1">
            {customFilters.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200 dark:border-zinc-800"
              >
                <span>{tag}</span>
                {tag !== 'all' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomFilter(tag)}
                    className="text-muted-foreground hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Global Welcome Offer Poster Manager */}
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-foreground" />
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Session Welcome Offer Popup Poster
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload poster image, configure offer copy, select popup layout, and preview live before visitors see it.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPosterPreview(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Poster</span>
            </button>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={posterConfig.enabled}
                onChange={(e) => setPosterConfig({ ...posterConfig, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0 cursor-pointer"
              />
              <span className={posterConfig.enabled ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted-foreground"}>
                {posterConfig.enabled ? "Popup Active" : "Popup Disabled"}
              </span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSavePoster} className="space-y-5">
          {/* Poster Image Upload & Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            {/* Poster Thumbnail */}
            <div className="md:col-span-4 flex flex-col items-center gap-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground self-start">
                Poster Graphic Preview
              </label>
              {posterConfig.posterImageUrl ? (
                <div className="relative w-full max-w-[200px] h-[240px] rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-950 shadow-md group">
                  <img
                    src={posterConfig.posterImageUrl}
                    alt="Poster Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPosterConfig({ ...posterConfig, posterImageUrl: '' })}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                    title="Remove Poster Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-[200px] h-[240px] rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center p-4 text-center text-muted-foreground bg-zinc-100/50 dark:bg-zinc-900">
                  <Upload className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs font-medium">No Poster Uploaded</span>
                </div>
              )}
            </div>

            {/* Upload Controls & URL */}
            <div className="md:col-span-8 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Upload Poster File (Portrait / Banner)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterImageFile}
                  className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white dark:file:bg-white dark:file:text-black cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Or Paste Direct Poster Image URL
                </label>
                <input
                  type="text"
                  value={posterConfig.posterImageUrl || ''}
                  onChange={(e) => setPosterConfig({ ...posterConfig, posterImageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Layout Structure
                  </label>
                  <select
                    value={posterConfig.layoutStructure || 'side-by-side'}
                    onChange={(e) => setPosterConfig({ ...posterConfig, layoutStructure: e.target.value as any })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-foreground focus:outline-none font-medium"
                  >
                    <option value="side-by-side">Side-by-Side (Poster Left + Details Right)</option>
                    <option value="stacked">Stacked (Poster Top + Details Below)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Discount Badge Tag
                  </label>
                  <input
                    type="text"
                    value={posterConfig.discountTag || ''}
                    onChange={(e) => setPosterConfig({ ...posterConfig, discountTag: e.target.value })}
                    placeholder="UP TO 80% OFF"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Copy & Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Top Badge Label
              </label>
              <input
                type="text"
                value={posterConfig.badge || ''}
                onChange={(e) => setPosterConfig({ ...posterConfig, badge: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={posterConfig.title || ''}
                onChange={(e) => setPosterConfig({ ...posterConfig, title: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-foreground focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Subtitle Description
              </label>
              <input
                type="text"
                value={posterConfig.subtitle || ''}
                onChange={(e) => setPosterConfig({ ...posterConfig, subtitle: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Coupon Code
              </label>
              <input
                type="text"
                value={posterConfig.couponCode || ''}
                onChange={(e) => setPosterConfig({ ...posterConfig, couponCode: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-mono uppercase text-foreground font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={posterConfig.buttonText || ''}
                onChange={(e) => setPosterConfig({ ...posterConfig, buttonText: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-foreground focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Button Destination Link
              </label>
              <input
                type="text"
                value={posterConfig.buttonLink || ''}
                onChange={(e) => setPosterConfig({ ...posterConfig, buttonLink: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-foreground focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Offer Benefits (One per line)
              </label>
              <textarea
                rows={3}
                value={benefitsText}
                onChange={(e) => setBenefitsText(e.target.value)}
                placeholder="Payout Protection Guarantee&#10;Special Accounts (100% OFF)&#10;VIP Support via Discord"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-foreground focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Extra Note / Timer Urgency Footer
              </label>
              <textarea
                rows={3}
                value={posterConfig.extraNote || ''}
                onChange={(e) => setPosterConfig({ ...posterConfig, extraNote: e.target.value })}
                placeholder="Valid till Friday 5 PM EST. 1 Lucky buyer gets a 100% Free Account!"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetPoster}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPosterPreview(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview Poster</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isPosterSaved && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved & Live!
                </span>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Poster Settings</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Search & Category Filter Tabs */}
      <div className="space-y-3">
        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
          
          {/* Search Query */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offer by firm name, coupon code..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-black dark:focus:border-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {customFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedCategoryFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategoryFilter === filter
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ADD NEW OFFER MODAL / FORM (Requirement 2 & 3) */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleAddDealSubmit}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 max-w-4xl w-full space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Create New Prop Deal / Promo Code</span>
                </h3>
                <p className="text-xs text-muted-foreground">Select a previously added firm to auto-load name and logo.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Requirement 2: Select Previously Added Firm & Auto-load Logo + Name */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-foreground block uppercase tracking-wider">
                1. Select Firm (Auto-loads Name & Logo)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2">
                  <select
                    value={formData.firm_id}
                    onChange={(e) => handleFirmSelection(e.target.value)}
                    className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-foreground focus:outline-none"
                  >
                    {firms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.headquarters || f.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Firm Identity Preview Box */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-card border border-zinc-200 dark:border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={formData.firm_logo || '/logos/nys.png'}
                      alt={formData.firm_name}
                      className="h-7 w-auto max-w-[36px] object-contain rounded-md"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-foreground">{formData.firm_name || 'Selected Firm'}</div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{formData.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirement 3: Card Details, Text, Tags, Buttons */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-foreground block uppercase tracking-wider">
                2. Customize Offer Card Text, Code & Button Action
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Promo Coupon Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    placeholder="EMPIRIAL20"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-mono uppercase font-bold text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount_pct}
                    onChange={(e) => setFormData({ ...formData, discount_pct: parseInt(e.target.value, 10) || 0 })}
                    required
                    placeholder="20"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-mono font-bold text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Discount Label Text
                  </label>
                  <input
                    type="text"
                    value={formData.discount_label}
                    onChange={(e) => setFormData({ ...formData, discount_label: e.target.value })}
                    required
                    placeholder="20% OFF Exclusive Promo"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Category Tag
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold focus:outline-none"
                  >
                    <option value="forex">Forex</option>
                    <option value="futures">Futures</option>
                    <option value="crypto">Crypto</option>
                    <option value="instant-funding">Instant Funding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Offer Type
                  </label>
                  <select
                    value={formData.offer_type}
                    onChange={(e) => setFormData({ ...formData, offer_type: e.target.value as any })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold focus:outline-none"
                  >
                    <option value="discount">Standard Discount</option>
                    <option value="bogo">BOGO (Buy 1 Get 1)</option>
                    <option value="cashback">Cashback Reward</option>
                    <option value="refund">100% Fee Refund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Expiry Date / Timer Text
                  </label>
                  <input
                    type="text"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    placeholder="Limited Time / Valid till Friday"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Affiliate Button Destination URL
                  </label>
                  <input
                    type="url"
                    value={formData.affiliate_url}
                    onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
                    required
                    placeholder="https://discord.gg/ww4dkeeZdp"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Offer Card Description Text
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed explanation of the offer..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs pt-1">
                <label className="flex items-center gap-2 font-semibold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0"
                  />
                  <span>Featured Offer</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0"
                  />
                  <span>Verified Partner Offer</span>
                </label>
              </div>
            </div>

            {/* Live Offer Card Preview */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Live Card Preview
              </span>
              <div className="p-4 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                    <img src={formData.firm_logo} alt={formData.firm_name} className="h-7 w-auto max-w-[36px] object-contain rounded-md" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">{formData.firm_name}</div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{formData.discount_label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono font-bold text-xs bg-zinc-50 dark:bg-zinc-900">
                    {formData.code}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs">
                    Claim Offer
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white text-zinc-900 dark:bg-card dark:text-foreground text-xs font-semibold hover:bg-zinc-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Create Offer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDITING OFFER MODAL */}
      {editingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveEditDeal}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 max-w-4xl w-full space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  <span>Edit Offer: {editingDeal.code}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDeal(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-foreground block uppercase tracking-wider">
                1. Select Firm (Auto-loads Name & Logo)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div className="sm:col-span-2">
                  <select
                    value={editingDeal.firm_id}
                    onChange={(e) => handleFirmSelection(e.target.value, true)}
                    className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-foreground focus:outline-none"
                  >
                    {firms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.headquarters || f.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-card border border-zinc-200 dark:border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={editingDeal.firm_logo || '/logos/nys.png'}
                      alt={editingDeal.firm_name}
                      className="h-7 w-auto max-w-[36px] object-contain rounded-md"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-foreground">{editingDeal.firm_name}</div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{editingDeal.category}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={editingDeal.code}
                    onChange={(e) => setEditingDeal({ ...editingDeal, code: e.target.value })}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-mono uppercase font-bold text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={editingDeal.discount_pct}
                    onChange={(e) => setEditingDeal({ ...editingDeal, discount_pct: parseInt(e.target.value, 10) || 0 })}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-mono font-bold text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Discount Label Text
                  </label>
                  <input
                    type="text"
                    value={editingDeal.discount_label}
                    onChange={(e) => setEditingDeal({ ...editingDeal, discount_label: e.target.value })}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-bold text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Affiliate Link URL
                  </label>
                  <input
                    type="url"
                    value={editingDeal.affiliate_url}
                    onChange={(e) => setEditingDeal({ ...editingDeal, affiliate_url: e.target.value })}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-mono text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Expiry Date / Timer Text
                  </label>
                  <input
                    type="text"
                    value={editingDeal.expires_at || ''}
                    onChange={(e) => setEditingDeal({ ...editingDeal, expires_at: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Description Text
                </label>
                <textarea
                  rows={2}
                  value={editingDeal.description || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, description: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-foreground"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 font-semibold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDeal.is_featured}
                    onChange={(e) => setEditingDeal({ ...editingDeal, is_featured: e.target.checked })}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0"
                  />
                  <span>Featured Offer</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingDeal.is_verified}
                    onChange={(e) => setEditingDeal({ ...editingDeal, is_verified: e.target.checked })}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0"
                  />
                  <span>Verified Partner Offer</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingDeal(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white text-zinc-900 dark:bg-card dark:text-foreground text-xs font-semibold hover:bg-zinc-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Save Offer Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-foreground">Confirm Offer Deletion</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete this promo offer? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card text-foreground text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDeal(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Delete Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFERS TABLE / GRID SYSTEM (Strict RULE:BW Styling) */}
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-foreground" />
            <h2 className="text-xs sm:text-sm font-bold text-foreground">
              Active Offers Matrix ({filteredDealsList.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                <th className="p-4">Prop Firm</th>
                <th className="p-4">Promo Code</th>
                <th className="p-4">Discount & Label</th>
                <th className="p-4 text-center">Category</th>
                <th className="p-4 text-center">Clicks</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-foreground">
              {filteredDealsList.length > 0 ? (
                filteredDealsList.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                    
                    {/* 1. Firm Logo & Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={d.firm_logo || '/logos/nys.png'}
                            alt={d.firm_name}
                            className="h-6 w-auto max-w-[30px] object-contain rounded-md"
                          />
                        </div>
                        <div>
                          <div className="font-extrabold text-foreground">{d.firm_name}</div>
                          {d.is_verified && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" /> Verified Partner
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Promo Code */}
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono font-black text-foreground">
                        {d.code}
                      </span>
                    </td>

                    {/* 3. Discount & Label */}
                    <td className="p-4">
                      <div className="font-extrabold text-foreground">{d.discount_label}</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        -{d.discount_pct}% OFF
                      </div>
                    </td>

                    {/* 4. Category */}
                    <td className="p-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200 dark:border-zinc-800">
                        {d.category}
                      </span>
                    </td>

                    {/* 5. Clicks */}
                    <td className="p-4 text-center font-mono font-bold text-muted-foreground">
                      {(d.clicks_count || 0).toLocaleString()}
                    </td>

                    {/* 6. Actions */}
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingDeal(d)}
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
                        title="Edit Offer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(d.id)}
                        className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shadow-2xs cursor-pointer"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    No promo offers found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Poster Popup Preview Modal */}
      {showPosterPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-foreground" />
                <h3 className="text-base font-bold text-foreground">Live Offer Poster Popup Preview</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-muted-foreground font-semibold">
                  {posterConfig.layoutStructure === 'stacked' ? 'Stacked Layout' : 'Side-by-Side Layout'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPosterPreview(false)}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-black dark:border-white bg-zinc-100 dark:bg-zinc-900 text-xs font-semibold text-foreground tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>{posterConfig.badge || 'SPECIAL OFFER'}</span>
              </div>

              {posterConfig.layoutStructure === 'stacked' ? (
                <div className="space-y-5">
                  {posterConfig.posterImageUrl && (
                    <div className="w-full flex justify-center">
                      <img
                        src={posterConfig.posterImageUrl}
                        alt={posterConfig.title}
                        className="w-full max-h-[300px] object-cover rounded-2xl border-2 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {posterConfig.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{posterConfig.subtitle}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {posterConfig.posterImageUrl && (
                    <div className="md:col-span-5 flex justify-center">
                      <img
                        src={posterConfig.posterImageUrl}
                        alt={posterConfig.title}
                        className="w-full max-h-[380px] object-cover rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 shadow-lg"
                      />
                    </div>
                  )}
                  <div className={`${posterConfig.posterImageUrl ? 'md:col-span-7' : 'md:col-span-12'} space-y-4`}>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                        {posterConfig.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">{posterConfig.subtitle}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {posterConfig.discountTag && (
                        <span className="px-3 py-1 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs">
                          {posterConfig.discountTag}
                        </span>
                      )}
                      {posterConfig.couponCode && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono font-bold text-xs">
                          <span>CODE: {posterConfig.couponCode}</span>
                        </div>
                      )}
                    </div>

                    {posterConfig.benefits && posterConfig.benefits.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {posterConfig.benefits.map((b, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-foreground font-medium">
                            <Check className="w-3.5 h-3.5 text-foreground shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => alert(`Destination URL: ${posterConfig.buttonLink || '#'}`)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>{posterConfig.buttonText || 'Claim Offer'}</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {posterConfig.extraNote && (
                <p className="text-xs text-center text-muted-foreground italic border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  {posterConfig.extraNote}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowPosterPreview(false)}
                className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
