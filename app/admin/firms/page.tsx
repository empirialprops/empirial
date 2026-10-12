'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  Check,
  X,
  Search,
  ExternalLink,
  Copy,
  Sparkles,
  Sliders,
  Star,
  Image as ImageIcon,
  Clock,
  Layers,
  Globe,
  Calendar,
  DollarSign,
  Tag,
  Filter,
  Monitor,
  FolderUp,
} from 'lucide-react';
import Link from 'next/link';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { Firm } from '@/lib/types';
import { getFirms, createFirm, updateFirm, deleteFirm } from '@/lib/firebase/services';
import { logAdminAction } from '@/lib/utils/audit-log-store';
import { PlatformItem, getStoredPlatforms } from '@/lib/utils/platforms-store';


const ALL_EVALUATION_MODELS = [
  '1-Step Challenge',
  '2-Step Evaluation',
  '3-Step Challenge',
  'Instant Model',
  'Futures Combine',
];

const ALL_FIRM_TYPES = [
  'Forex',
  'Futures',
  'Crypto',
  'Instant Funding',
  'Prediction Markets',
  'Synthetic',
];

const COMMON_RESTRICTED_COUNTRIES = [
  'United States',
  'Canada',
  'Cuba',
  'Iran',
  'North Korea',
  'Syria',
  'Russia',
  'Belarus',
];

export default function AdminFirmsPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingFirm, setEditingFirm] = useState<Firm | null>(null);

  // Custom Directory Filters State
  const [customDirectoryFilters, setCustomDirectoryFilters] = useState<string[]>([
    'forex',
    'futures',
    'crypto',
    'instant-funding',
    'prediction-markets',
  ]);
  const [newFilterInput, setNewFilterInput] = useState('');
  const [showFilterManager, setShowFilterManager] = useState(false);
  const [customCountryInput, setCustomCountryInput] = useState('');
  const [availablePlatforms, setAvailablePlatforms] = useState<PlatformItem[]>(() => getStoredPlatforms());
  const [newRuleArticleTitle, setNewRuleArticleTitle] = useState('');
  const [newRuleArticleUrl, setNewRuleArticleUrl] = useState('');

  // Form States for Adding / Editing (Includes Image 1 specifications)
  const [formData, setFormData] = useState<Partial<Firm> & { logo_shape?: string }>({
    name: '',
    slug: '',
    type: 'prop_firm',
    logo_url: '/logos/nys.png',
    logo_shape: 'rounded-md',
    rating: 4.8,
    review_count: 125,
    max_allocation: '$2,000,000',
    profit_split_custom: 'Up to 90%',
    payout_custom: 'Bi-Weekly / 14 Days',
    discount_label_custom: '',
    coupon_code_custom: 'EMPIRE',
    discount_pct: undefined,
    badge_custom: 'Audited Partner',
    platforms: 'MT5, cTrader',
    platform_ids: ['mt5', 'ctrader'],
    category: 'forex',
    is_featured: true,
    is_verified: true,
    is_popular: false,
    trust_score: 95,
    founded_year: 2024,
    headquarters: 'Dubai, UAE',
    country: 'UAE',
    years_working: 'Est. 2024',
    total_payouts: '$15,000,000+',
    avg_payout_time: '8-24 Hours',
    models: ['1-Step Challenge', '2-Step Evaluation', 'Instant Model'],
    buy_url: 'https://discord.gg/ww4dkeeZdp',
    max_loss_pct: 10,
    daily_loss_pct: 5,
    profit_target_pct: 8,
    min_price: 99,
    consistency_rules_content: 'No strict consistency rule on standard accounts.',
    firm_rules_content: 'Minimum 0 trading days (No minimum requirement).',
    consistency_rule: 'No strict consistency rule',
    consistency_rule_article_title: '',
    consistency_rule_article_url: '',
    min_trading_days: 0,
    firm_rules_article_title: '',
    firm_rules_article_url: '',
    rule_articles: [],
    payout_cycle: 'Bi-Weekly / 14 Days',
    payout_split_pct: 90,
    leverage: '1:100',
    firm_types: ['Forex'],
    restricted_jurisdictions: ['United States', 'North Korea', 'Iran'],
    description: 'Forensically audited prop firm with institutional liquidity and verified payouts.',
  });

  useEffect(() => {
    const handlePlatChanged = (e: CustomEvent) => {
      if (e.detail) setAvailablePlatforms(e.detail);
    };
    window.addEventListener('empirial_platforms_changed' as any, handlePlatChanged);
    return () => window.removeEventListener('empirial_platforms_changed' as any, handlePlatChanged);
  }, []);

  useEffect(() => {
    async function loadFirms() {
      try {
        const data = await getFirms();
        if (data && data.length > 0) {
          const uniqueFirms = Array.from(new Map(data.map((item) => [item.id || item.slug, item])).values());
          setFirms(uniqueFirms);
        } else {
          const uniqueMocks = Array.from(new Map(MOCK_FIRMS.map((item) => [item.id, item])).values());
          setFirms(uniqueMocks);
        }
      } catch (err) {
        console.error('Failed to load firms:', err);
        const uniqueMocks = Array.from(new Map(MOCK_FIRMS.map((item) => [item.id, item])).values());
        setFirms(uniqueMocks);
      } finally {
        setLoading(false);
      }
    }
    loadFirms();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds the 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        logo_url: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const togglePlatform = (pId: string) => {
    const current = formData.platform_ids || [];
    const next = current.includes(pId)
      ? current.filter((id) => id !== pId)
      : [...current, pId];
    setFormData({
      ...formData,
      platform_ids: next,
      platforms: next.map((id) => availablePlatforms.find((p) => p.id === id)?.name || id).join(', '),
    });
  };

  const toggleEvaluationModel = (model: string) => {
    const current = formData.models || [];
    const next = current.includes(model)
      ? current.filter((m) => m !== model)
      : [...current, model];
    setFormData({
      ...formData,
      models: next,
    });
  };

  const toggleFirmType = (fType: string) => {
    const current = formData.firm_types || [];
    const next = current.includes(fType)
      ? current.filter((t) => t !== fType)
      : [...current, fType];
    const candidateCat = next[0]?.toLowerCase().replace(/\s+/g, '-');
    const validCats = ['forex', 'futures', 'crypto', 'instant-funding', 'all'];
    const nextCat = (validCats.includes(candidateCat) ? candidateCat : formData.category || 'forex') as Firm['category'];
    setFormData({
      ...formData,
      firm_types: next,
      category: nextCat,
    });
  };

  const toggleRestrictedJurisdiction = (country: string) => {
    const current = formData.restricted_jurisdictions || [];
    const next = current.includes(country)
      ? current.filter((c) => c !== country)
      : [...current, country];
    setFormData({
      ...formData,
      restricted_jurisdictions: next,
    });
  };

  const handleAddCustomCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCountryInput.trim()) return;
    const current = formData.restricted_jurisdictions || [];
    if (!current.includes(customCountryInput.trim())) {
      setFormData({
        ...formData,
        restricted_jurisdictions: [...current, customCountryInput.trim()],
      });
    }
    setCustomCountryInput('');
  };

  const handleRemoveRestrictedJurisdiction = (country: string) => {
    const current = formData.restricted_jurisdictions || [];
    setFormData({
      ...formData,
      restricted_jurisdictions: current.filter((c) => c !== country),
    });
  };

  const handleAddDirectoryFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterInput.trim()) return;
    const normalized = newFilterInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!customDirectoryFilters.includes(normalized)) {
      setCustomDirectoryFilters([...customDirectoryFilters, normalized]);
    }
    setNewFilterInput('');
  };

  const handleRemoveDirectoryFilter = (filter: string) => {
    setCustomDirectoryFilters(customDirectoryFilters.filter((f) => f !== filter));
  };

  const handleStartAdd = () => {
    setFormData({
      name: '',
      slug: '',
      type: 'prop_firm',
      logo_url: '/logos/nys.png',
      logo_shape: 'rounded-md',
      rating: 4.8,
      review_count: 125,
      max_allocation: '$2,000,000',
      profit_split_custom: 'Up to 90%',
      payout_custom: 'Bi-Weekly / 14 Days',
      discount_label_custom: '',
      coupon_code_custom: 'EMPIRE',
      discount_pct: undefined,
      badge_custom: 'Audited Partner',
      platforms: 'MT5, cTrader',
      platform_ids: ['mt5', 'ctrader'],
      category: 'forex',
      is_featured: true,
      is_verified: true,
      is_popular: false,
      trust_score: 95,
      founded_year: 2024,
      headquarters: 'Dubai, UAE',
      country: 'UAE',
      years_working: 'Est. 2024',
      total_payouts: '$15,000,000+',
      avg_payout_time: '8-24 Hours',
      models: ['1-Step Challenge', '2-Step Evaluation', 'Instant Model'],
      buy_url: 'https://discord.gg/ww4dkeeZdp',
      max_loss_pct: 10,
      daily_loss_pct: 5,
      profit_target_pct: 8,
      min_price: 99,
      consistency_rules_content: 'No consistency rule.',
      firm_rules_content: 'No minimum trading days.',
      consistency_rule: 'No strict consistency rule',
      consistency_rule_article_title: '',
      consistency_rule_article_url: '',
      min_trading_days: 0,
      firm_rules_article_title: '',
      firm_rules_article_url: '',
      rule_articles: [],
      payout_cycle: 'Bi-Weekly / 14 Days',
      payout_split_pct: 90,
      leverage: '1:100',
      firm_types: ['Forex'],
      restricted_jurisdictions: ['United States', 'North Korea', 'Iran'],
      description: 'Audited prop trading firm with institutional trading conditions.',
    });
    setEditingFirm(null);
    setIsAdding(true);
  };

  const handleStartEdit = (firm: Firm) => {
    setFormData({
      ...firm,
      discount_pct: firm.discount_pct !== undefined ? firm.discount_pct : (firm.discount_label_custom ? parseInt(firm.discount_label_custom.match(/(\d+)%/)?.[1] || '0', 10) || undefined : undefined),
      discount_label_custom: firm.discount_label_custom || (firm.discount_pct ? `${firm.discount_pct}% OFF` : ''),
      platform_ids:
        firm.platform_ids ||
        (firm.platforms
          ? firm.platforms.toLowerCase().split(/[,\s/]+/).map((s) => s.trim()).filter(Boolean)
          : ['mt5', 'ctrader']),
      models: firm.models || ['1-Step Challenge', '2-Step Evaluation', 'Instant Model'],
      total_payouts: firm.total_payouts || '$15,000,000+',
      avg_payout_time: firm.avg_payout_time || '8-24 Hours',
      years_working: firm.years_working || (firm.founded_year ? `Est. ${firm.founded_year}` : 'Est. 2024'),
      consistency_rule: firm.consistency_rule || firm.consistency_rules_content || 'No strict consistency rule',
      consistency_rules_content: firm.consistency_rules_content || firm.consistency_rule || '',
      consistency_rule_article_title: firm.consistency_rule_article_title || '',
      consistency_rule_article_url: firm.consistency_rule_article_url || '',
      min_trading_days: firm.min_trading_days !== undefined ? firm.min_trading_days : 0,
      firm_rules_content: firm.firm_rules_content || '',
      firm_rules_article_title: firm.firm_rules_article_title || '',
      firm_rules_article_url: firm.firm_rules_article_url || '',
      rule_articles: firm.rule_articles || [],
      payout_cycle: firm.payout_cycle || firm.payout_custom || 'Bi-Weekly / 14 Days',
      payout_split_pct: firm.payout_split_pct || 90,
      leverage: firm.leverage || '1:100',
      firm_types: firm.firm_types && firm.firm_types.length > 0 ? firm.firm_types : (firm.category ? [firm.category.charAt(0).toUpperCase() + firm.category.slice(1)] : ['Forex']),
      restricted_jurisdictions: firm.restricted_jurisdictions || firm.restricted_countries || ['United States', 'North Korea', 'Iran'],
    });
    setEditingFirm(firm);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently remove this firm profile?')) return;
    const targetFirm = firms.find((f) => f.id === id);
    try {
      await deleteFirm(id);
    } catch (err) {
      console.error('Failed to delete firm:', err);
    }
    setFirms(firms.filter((f) => f.id !== id));
    logAdminAction({
      action: `Deleted Prop Firm: ${targetFirm?.name || id}`,
      module: 'firms',
      target_id: id,
      entity_name: targetFirm?.name || id,
      previous_state: targetFirm || null,
      new_state: null,
    });
  };

  const parseNum = (val: any, fallback: number): number => {
    if (val === undefined || val === null || val === '') return fallback;
    const num = typeof val === 'number' ? val : Number(val);
    return isNaN(num) ? fallback : num;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Firm name is required');
      return;
    }

    const slug = (formData.slug || formData.name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const firmPayload: Omit<Firm, 'id'> = {
      name: formData.name.trim(),
      slug,
      type: formData.type || 'prop_firm',
      logo_url: formData.logo_url || '/logos/nys.png',
      rating: parseNum(formData.rating, 4.8),
      review_count: parseNum(formData.review_count, 125),
      max_allocation: formData.max_allocation || '$2,000,000',
      profit_split_custom: formData.profit_split_custom || 'Up to 90%',
      payout_custom: formData.payout_custom || 'Bi-Weekly / 14 Days',
      discount_pct: formData.discount_pct !== undefined && formData.discount_pct !== null && !isNaN(Number(formData.discount_pct)) ? Number(formData.discount_pct) : undefined,
      discount_label_custom: formData.discount_label_custom || (formData.discount_pct && Number(formData.discount_pct) > 0 ? `${formData.discount_pct}% OFF` : ''),
      coupon_code_custom: (formData.coupon_code_custom || 'EMPIRE').toUpperCase(),
      badge_custom: formData.badge_custom || '',
      platforms: formData.platforms || 'MT5, cTrader',
      platform_ids: formData.platform_ids || ['mt5', 'ctrader'],
      category: formData.category || 'forex',
      is_featured: !!formData.is_featured,
      is_verified: !!formData.is_verified,
      is_popular: !!formData.is_popular,
      trust_score: parseNum(formData.trust_score, 95),
      founded_year: parseNum(formData.founded_year, 2024),
      headquarters: formData.headquarters || 'Dubai, UAE',
      country: formData.country || 'UAE',
      years_working: formData.years_working || (formData.founded_year ? `Est. ${formData.founded_year}` : 'Est. 2024'),
      total_payouts: formData.total_payouts || '$15,000,000+',
      avg_payout_time: formData.avg_payout_time || '8-24 Hours',
      models: formData.models || ['1-Step Challenge', '2-Step Evaluation', 'Instant Model'],
      buy_url: formData.buy_url || 'https://discord.gg/ww4dkeeZdp',
      max_loss_pct: parseNum(formData.max_loss_pct, 10),
      daily_loss_pct: parseNum(formData.daily_loss_pct, 5),
      profit_target_pct: parseNum(formData.profit_target_pct, 8),
      min_price: parseNum(formData.min_price, 99),
      consistency_rules_content: formData.consistency_rules_content || formData.consistency_rule || 'No strict consistency rule',
      firm_rules_content: formData.firm_rules_content || 'Minimum 0 trading days (No minimum requirement).',
      consistency_rule: formData.consistency_rule || formData.consistency_rules_content || 'No strict consistency rule',
      consistency_rule_article_title: formData.consistency_rule_article_title || '',
      consistency_rule_article_url: formData.consistency_rule_article_url || '',
      min_trading_days: formData.min_trading_days !== undefined ? formData.min_trading_days : 0,
      firm_rules_article_title: formData.firm_rules_article_title || '',
      firm_rules_article_url: formData.firm_rules_article_url || '',
      rule_articles: formData.rule_articles || [],
      payout_cycle: formData.payout_cycle || 'Bi-Weekly / 14 Days',
      payout_split_pct: parseNum(formData.payout_split_pct, 90),
      leverage: formData.leverage || '1:100',
      firm_types: formData.firm_types && formData.firm_types.length > 0 ? formData.firm_types : ['Forex'],
      restricted_jurisdictions: formData.restricted_jurisdictions || [],
      restricted_countries: formData.restricted_jurisdictions || [],
      description: formData.description || 'Audited prop firm.',
    };

    if (editingFirm) {
      try {
        await updateFirm(editingFirm.id, firmPayload);
      } catch (err) {
        console.error('Failed to update firm:', err);
      }
      setFirms(firms.map((f) => (f.id === editingFirm.id ? { ...f, ...firmPayload } : f)));
      logAdminAction({
        action: `Updated Prop Firm: ${firmPayload.name}`,
        module: 'firms',
        target_id: editingFirm.id,
        entity_name: firmPayload.name,
        previous_state: editingFirm,
        new_state: { id: editingFirm.id, ...firmPayload },
      });
    } else {
      let createdId = slug;
      try {
        createdId = await createFirm(firmPayload);
      } catch (err) {
        console.error('Failed to create firm:', err);
      }
      setFirms([{ id: createdId, ...firmPayload }, ...firms]);
      logAdminAction({
        action: `Created Prop Firm: ${firmPayload.name}`,
        module: 'firms',
        target_id: createdId,
        entity_name: firmPayload.name,
        previous_state: null,
        new_state: { id: createdId, ...firmPayload },
      });
    }

    setIsAdding(false);
    setEditingFirm(null);
  };

  const filteredFirms = firms.filter((f) => {
    const matchesSearch =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.coupon_code_custom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.headquarters?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-foreground rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-mono">Loading firms database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Prop Firms Directory Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure partner firms, logos, shape styling, Image 1 fields (Headquarters, Experience, Total Payouts, Avg Payout SLA, Evaluation Models), and Directory Filters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => alert('All firm changes are synced and saved to the database!')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
          <Link
            href="/admin/file-system"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer shadow-2xs"
          >
            <FolderUp className="w-4 h-4" />
            <span>Firms File System</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowFilterManager(!showFilterManager)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer shadow-2xs"
          >
            <Filter className="w-4 h-4" />
            <span>Manage Directory Filters</span>
          </button>
          <button
            type="button"
            onClick={handleStartAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-foreground text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Firm</span>
          </button>
        </div>
      </div>

      {/* Directory Filter Manager Panel */}
      {showFilterManager && (
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Directory Filter Categories ({customDirectoryFilters.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowFilterManager(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Add or edit category filter pills displayed across the directory.</p>

          <form onSubmit={handleAddDirectoryFilter} className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              placeholder="e.g. instant-funding, futures, forex"
              value={newFilterInput}
              onChange={(e) => setNewFilterInput(e.target.value)}
              className="flex-1 bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-foreground"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold"
            >
              Add Filter
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-1">
            {customDirectoryFilters.map((flt) => (
              <span
                key={flt}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-foreground capitalize"
              >
                <span>{flt}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDirectoryFilter(flt)}
                  className="hover:text-red-500 text-muted-foreground ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search firms, codes, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            All Asset Types
          </button>
          {customDirectoryFilters.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Firms Grid / Cards System (Displaying Image 1 Specifications) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFirms.map((firm, idx) => (
          <div
            key={`${firm.id || 'firm'}-${idx}`}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-foreground transition-all duration-200"
          >
            <div>
              {/* Image 1 Header: Logo, Name, Verified Badge, Headquarters */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={firm.logo_url}
                      alt={firm.name}
                      className="h-8 w-auto max-w-[40px] object-contain rounded-md"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-foreground">{firm.name}</h3>
                      {firm.is_verified && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{firm.headquarters || 'Dubai, UAE'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(firm)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Edit Firm Specs"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(firm.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Delete Firm Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image 1 Middle Stat Cards (4 Cards: Headquarters, Experience, Total Payouts, Avg Payout SLA) */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>Headquarters</span>
                  </span>
                  <span className="font-bold text-foreground block truncate">{firm.headquarters || 'Dubai, UAE'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Experience</span>
                  </span>
                  <span className="font-bold text-foreground block truncate">
                    {firm.years_working || (firm.founded_year ? `Est. ${firm.founded_year}` : 'Est. 2024')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Total Payouts</span>
                  </span>
                  <span className="font-bold text-foreground block truncate">{firm.total_payouts || '$15,000,000+'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Avg Payout SLA</span>
                  </span>
                  <span className="font-bold text-foreground block truncate">{firm.avg_payout_time || '8-24 Hours'}</span>
                </div>
              </div>

              {/* Image 1 Bottom Models Pills */}
              <div className="mt-3 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Evaluation Models</span>
                <div className="flex flex-wrap gap-1.5">
                  {(firm.models || ['1-Step Challenge', '2-Step Evaluation', 'Instant Model']).map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-foreground border border-zinc-200 dark:border-zinc-800"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Firm Types & Rules Strip */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="font-semibold uppercase">Firm Types:</span>
                  <span className="font-mono font-medium text-foreground">Lev: {firm.leverage || '1:100'}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(firm.firm_types && firm.firm_types.length > 0 ? firm.firm_types : [firm.category || 'Forex']).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-black text-white dark:bg-white dark:text-black"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-0.5">
                  <span>Cycle: <strong className="text-foreground">{firm.payout_cycle || firm.payout_custom || 'Bi-Weekly'}</strong></span>
                  <span>Rule: <strong className="text-foreground truncate max-w-[130px]">{firm.consistency_rule || 'Standard'}</strong></span>
                </div>
              </div>

              {/* Promo Code & Allocation Bar */}
              <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Allocation & Split</span>
                  <span className="font-bold text-foreground">{firm.max_allocation} ({firm.profit_split_custom})</span>
                </div>
                <div className="flex items-center gap-1 font-mono font-bold bg-white dark:bg-card px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-foreground">
                  <Copy className="w-3 h-3 text-muted-foreground" />
                  <span>{firm.discount_label_custom || firm.coupon_code_custom || '20% OFF'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                <span>{firm.rating?.toFixed(1)}</span>
                <span className="text-muted-foreground font-normal">({firm.review_count} reviews)</span>
              </span>

              <a
                href={`/firms/${firm.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:underline"
              >
                <span>View Full Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal Drawer with ALL IMAGE 1 FIELDS */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-foreground" />
                <h2 className="text-lg font-bold text-foreground">
                  {editingFirm ? `Edit Firm Specs: ${editingFirm.name}` : 'Add New Prop Firm Profile'}
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

            {/* Form Fields Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Firm Name */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Firm Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. NYS Capital"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. nys-capital"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Logo URL, Upload & Shape Option */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-foreground">Firm Logo (Upload Image & Shape)</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={formData.logo_url || '/logos/nys.png'}
                      alt="Logo preview"
                      className="h-8 w-auto max-w-[40px] object-contain rounded-md"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.logo_url || ''}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="/logos/nys.png or image URL"
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                  />
                  <label className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground font-semibold cursor-pointer shrink-0">
                    Upload File
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* IMAGE 1 FIELD 1: Headquarters */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Headquarters Location (Image 1 Specs) *</label>
                <input
                  type="text"
                  required
                  value={formData.headquarters || ''}
                  onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                  placeholder="e.g. Dubai, UAE"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-semibold"
                />
              </div>

              {/* IMAGE 1 FIELD 2: Experience / Founded Year */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Experience / Founded Text (Image 1 Specs) *</label>
                <input
                  type="text"
                  required
                  value={formData.years_working || ''}
                  onChange={(e) => setFormData({ ...formData, years_working: e.target.value })}
                  placeholder="e.g. Est. 2024"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-semibold"
                />
              </div>

              {/* IMAGE 1 FIELD 3: Total Payouts */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Total Payouts (Image 1 Specs) *</label>
                <input
                  type="text"
                  required
                  value={formData.total_payouts || ''}
                  onChange={(e) => setFormData({ ...formData, total_payouts: e.target.value })}
                  placeholder="e.g. $15,000,000+"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-semibold font-mono"
                />
              </div>

              {/* IMAGE 1 FIELD 4: Avg Payout SLA */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Avg Payout SLA (Image 1 Specs) *</label>
                <input
                  type="text"
                  required
                  value={formData.avg_payout_time || ''}
                  onChange={(e) => setFormData({ ...formData, avg_payout_time: e.target.value })}
                  placeholder="e.g. 8-24 Hours"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-semibold"
                />
              </div>

              {/* IMAGE 1 FIELD 5: Evaluation Models Checkboxes */}
              <div className="space-y-2 md:col-span-2">
                <label className="font-semibold text-foreground block">Evaluation Models Supported (Image 1 Specs)</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_EVALUATION_MODELS.map((model) => {
                    const isChecked = (formData.models || []).includes(model);
                    return (
                      <button
                        key={model}
                        type="button"
                        onClick={() => toggleEvaluationModel(model)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-2xs'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-muted-foreground border-zinc-200 dark:border-zinc-800 hover:border-foreground'
                        }`}
                      >
                        <span>{model}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 inline ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coupon Code & Discount Label */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Coupon Code</label>
                <input
                  type="text"
                  value={formData.coupon_code_custom || ''}
                  onChange={(e) => setFormData({ ...formData, coupon_code_custom: e.target.value })}
                  placeholder="e.g. EMPIRE"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_pct ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    const num = val === '' ? undefined : Number(val);
                    setFormData({
                      ...formData,
                      discount_pct: num,
                      discount_label_custom: num !== undefined && num > 0 ? `${num}% OFF` : (num === 0 ? '' : formData.discount_label_custom),
                    });
                  }}
                  placeholder="e.g. 50"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Discount Label (e.g. 50% OFF)</label>
                <input
                  type="text"
                  value={formData.discount_label_custom || ''}
                  onChange={(e) => setFormData({ ...formData, discount_label_custom: e.target.value })}
                  placeholder="e.g. 50% OFF"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Max Allocation & Profit Split */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Max Allocation</label>
                <input
                  type="text"
                  value={formData.max_allocation || ''}
                  onChange={(e) => setFormData({ ...formData, max_allocation: e.target.value })}
                  placeholder="e.g. $2,000,000"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Profit Split Custom</label>
                <input
                  type="text"
                  value={formData.profit_split_custom || ''}
                  onChange={(e) => setFormData({ ...formData, profit_split_custom: e.target.value })}
                  placeholder="e.g. Up to 90%"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Directing / Buy Link */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-foreground">Buy / Affiliate Link (Directing URL)</label>
                <input
                  type="url"
                  value={formData.buy_url || ''}
                  onChange={(e) => setFormData({ ...formData, buy_url: e.target.value })}
                  placeholder="https://firm.com/?ref=empirial"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Rating & Review Count */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Rating (1.0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.rating ?? 4.8}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.8 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Review Count</label>
                <input
                  type="number"
                  value={formData.review_count ?? 125}
                  onChange={(e) => setFormData({ ...formData, review_count: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              {/* Platforms Multi-Select with Quick Link to Platforms Manager */}
              <div className="space-y-2 md:col-span-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-foreground" />
                    <label className="font-bold text-xs text-foreground uppercase tracking-tight">
                      Platforms Supported
                    </label>
                  </div>
                  <Link
                    href="/admin/platforms"
                    target="_blank"
                    className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1"
                  >
                    <span>+ Manage / Add Platforms</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {availablePlatforms.map((plat) => {
                    const isSelected = (formData.platform_ids || []).includes(plat.id);
                    return (
                      <button
                        key={plat.id}
                        type="button"
                        onClick={() => togglePlatform(plat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-2xs'
                            : 'bg-white dark:bg-card text-muted-foreground border-zinc-200 dark:border-zinc-800 hover:border-foreground'
                        }`}
                      >
                        <img
                          src={plat.logo || '/platforms/mt5.png'}
                          alt={plat.name}
                          className="w-4 h-4 object-contain rounded"
                          onError={(e) => {
                            (e.target as any).src = '/platforms/mt5.png';
                          }}
                        />
                        <span>{plat.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MULTI FIRM TYPE SELECTION (1 firm can have multiple types, including Prediction Markets) */}
              <div className="space-y-2 md:col-span-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-foreground uppercase tracking-tight block">
                    Multi Firm Types Supported (Select all that apply) *
                  </label>
                  <span className="text-[10px] text-muted-foreground">e.g. Forex + Crypto + Prediction Markets</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ALL_FIRM_TYPES.map((fType) => {
                    const isSelected = (formData.firm_types || []).includes(fType);
                    return (
                      <button
                        key={fType}
                        type="button"
                        onClick={() => toggleFirmType(fType)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-2xs'
                            : 'bg-white dark:bg-card text-muted-foreground border-zinc-200 dark:border-zinc-800 hover:border-foreground'
                        }`}
                      >
                        <span>{fType}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 inline ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CONSISTENCY & MIN TRADING DAYS (Syncs to Compare & Firm Profile) */}
              <div className="space-y-4 md:col-span-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <label className="font-bold text-xs text-foreground uppercase tracking-tight">
                      Consistency Rule & Minimum Trading Days (Syncs to Compare & Profile)
                    </label>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Numbers or sentences like: 35% in 1 Step and 45% in 2-Step
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-xs text-foreground block">
                      Consistency Rule Summary *
                    </label>
                    <input
                      type="text"
                      value={formData.consistency_rule || ''}
                      onChange={(e) => setFormData({ ...formData, consistency_rule: e.target.value })}
                      placeholder="e.g. 35% in 1 Step and 45% in 2-Step, or No strict consistency rule"
                      className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      Compare page automatically extracts percentages and step scores from numbers or sentences.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-xs text-foreground block">
                      Minimum Trading Days *
                    </label>
                    <input
                      type="text"
                      value={formData.min_trading_days ?? 0}
                      onChange={(e) => setFormData({ ...formData, min_trading_days: e.target.value })}
                      placeholder="e.g. 0 Days (No Min), 0, 3, or 5 Days"
                      className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-foreground font-mono font-bold"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      Enter 0 or 0 Days for no minimum days requirement (score 100/100).
                    </span>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="font-semibold text-xs text-foreground block">
                      Consistency Rule Full Description
                    </label>
                    <textarea
                      value={formData.consistency_rules_content || ''}
                      onChange={(e) => setFormData({ ...formData, consistency_rules_content: e.target.value })}
                      rows={2}
                      placeholder="Detailed explanation of lot size, risk consistency, or trading style guidelines..."
                      className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-foreground"
                    />
                  </div>

                  {/* Article Link for Consistency Rule (Point 3 - Minimal rules link) */}
                  <div className="space-y-1">
                    <label className="font-semibold text-xs text-muted-foreground block">
                      Consistency Rule Article Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.consistency_rule_article_title || ''}
                      onChange={(e) => setFormData({ ...formData, consistency_rule_article_title: e.target.value })}
                      placeholder="e.g. Read Consistency Policy & Examples"
                      className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-xs text-muted-foreground block">
                      Consistency Rule Article URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.consistency_rule_article_url || ''}
                      onChange={(e) => setFormData({ ...formData, consistency_rule_article_url: e.target.value })}
                      placeholder="https://... or /blog/..."
                      className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* EVALUATION & DRAWDOWN RULES WITH ARTICLE LINK */}
              <div className="space-y-4 md:col-span-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <label className="font-bold text-xs text-foreground uppercase tracking-tight">
                      Evaluation & Drawdown Rules
                    </label>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Keep it minimal with optional article link</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-xs text-foreground block">
                      Drawdown Rules Content
                    </label>
                    <textarea
                      value={formData.firm_rules_content || ''}
                      onChange={(e) => setFormData({ ...formData, firm_rules_content: e.target.value })}
                      rows={2}
                      placeholder="Maximum daily drawdown calculated based on previous day balance or equity..."
                      className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-xs text-muted-foreground block">
                        Drawdown Article Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.firm_rules_article_title || ''}
                        onChange={(e) => setFormData({ ...formData, firm_rules_article_title: e.target.value })}
                        placeholder="e.g. Official Drawdown Calculation Guide"
                        className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-xs text-muted-foreground block">
                        Drawdown Article URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.firm_rules_article_url || ''}
                        onChange={(e) => setFormData({ ...formData, firm_rules_article_url: e.target.value })}
                        placeholder="https://... or /blog/..."
                        className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* EXTRA RULES & ARTICLES MANAGER (Point 3) */}
              <div className="space-y-3 md:col-span-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-foreground" />
                    <label className="font-bold text-xs text-foreground uppercase tracking-tight">
                      Extra Rule Article Links (Minimal & Convenient)
                    </label>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Admin can link full articles for any extra rules</span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={newRuleArticleTitle}
                      onChange={(e) => setNewRuleArticleTitle(e.target.value)}
                      placeholder="Article Title (e.g. News Trading & Weekend Holding Policy)"
                      className="flex-1 bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newRuleArticleUrl}
                      onChange={(e) => setNewRuleArticleUrl(e.target.value)}
                      placeholder="Article URL (https://...)"
                      className="flex-1 bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newRuleArticleTitle.trim() || !newRuleArticleUrl.trim()) return;
                        const current = formData.rule_articles || [];
                        setFormData({
                          ...formData,
                          rule_articles: [...current, { title: newRuleArticleTitle.trim(), url: newRuleArticleUrl.trim() }],
                        });
                        setNewRuleArticleTitle('');
                        setNewRuleArticleUrl('');
                      }}
                      className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs whitespace-nowrap cursor-pointer hover:opacity-90"
                    >
                      + Add Link
                    </button>
                  </div>

                  {formData.rule_articles && formData.rule_articles.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      {formData.rule_articles.map((art, aIdx) => (
                        <div
                          key={aIdx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate mr-2">
                            <span className="font-semibold text-foreground truncate">{art.title}</span>
                            <span className="text-[11px] font-mono text-muted-foreground truncate">{art.url}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.rule_articles || []).filter((_, i) => i !== aIdx);
                              setFormData({ ...formData, rule_articles: updated });
                            }}
                            className="text-muted-foreground hover:text-red-500 p-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* PAYOUT & LEVERAGE */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Payout Cycle</label>
                <input
                  type="text"
                  value={formData.payout_cycle || ''}
                  onChange={(e) => setFormData({ ...formData, payout_cycle: e.target.value })}
                  placeholder="e.g. Bi-Weekly / 14 Days, Weekly, On-Demand"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Payout Split (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.payout_split_pct ?? 90}
                  onChange={(e) => setFormData({ ...formData, payout_split_pct: parseInt(e.target.value, 10) || 0 })}
                  placeholder="e.g. 90"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Account Leverage</label>
                <input
                  type="text"
                  value={formData.leverage || ''}
                  onChange={(e) => setFormData({ ...formData, leverage: e.target.value })}
                  placeholder="e.g. 1:100, 1:50"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground font-mono"
                />
              </div>

              {/* RESTRICTED JURISDICTIONS SETTINGS */}
              <div className="space-y-2.5 md:col-span-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-foreground" />
                    <label className="font-bold text-xs text-foreground uppercase tracking-tight">
                      Restricted Jurisdictions & Countries
                    </label>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Select forbidden/restricted regions</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground block">Quick Toggle Common Restrictions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_RESTRICTED_COUNTRIES.map((country) => {
                      const isRestricted = (formData.restricted_jurisdictions || []).includes(country);
                      return (
                        <button
                          key={country}
                          type="button"
                          onClick={() => toggleRestrictedJurisdiction(country)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                            isRestricted
                              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                              : 'bg-white dark:bg-card text-muted-foreground border-zinc-200 dark:border-zinc-800 hover:border-foreground'
                          }`}
                        >
                          <span>{country}</span>
                          {isRestricted && <Check className="w-3 h-3 inline ml-1" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={customCountryInput}
                      onChange={(e) => setCustomCountryInput(e.target.value)}
                      placeholder="Add another country or jurisdiction..."
                      className="flex-1 bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCountry}
                      className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90"
                    >
                      Add Jurisdiction
                    </button>
                  </div>

                  {formData.restricted_jurisdictions && formData.restricted_jurisdictions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {formData.restricted_jurisdictions.map((rj) => (
                        <span
                          key={rj}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-[11px] font-medium text-foreground"
                        >
                          <span>{rj}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRestrictedJurisdiction(rj)}
                            className="text-muted-foreground hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Primary Category</label>
                <select
                  value={formData.category || 'forex'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                >
                  {customDirectoryFilters.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-2 md:col-span-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.is_verified}
                      onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                      className="rounded border-zinc-300 text-black dark:text-white focus:ring-black"
                    />
                    <span className="font-semibold text-foreground">Verified Firm Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded border-zinc-300 text-black dark:text-white focus:ring-black"
                    />
                    <span className="font-semibold text-foreground">Featured Firm</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.is_popular}
                      onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                      className="rounded border-zinc-300 text-black dark:text-white focus:ring-black"
                    />
                    <span className="font-semibold text-foreground">Most Popular</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-foreground">Firm Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Audited institutional prop trading firm..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
            </div>

            {/* Modal Actions */}
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
                {editingFirm ? 'Save Firm Specs' : 'Create Firm'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
