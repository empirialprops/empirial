'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Sparkles,
  ShieldCheck,
  Flame,
  Gift,
  Bell,
  Trophy,
  Zap,
  Sliders,
  Eye,
  Check,
  RefreshCw,
  AlertCircle,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Building2,
  Layers,
  ArrowRight,
  Clock,
  Play,
  RotateCcw,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Image as ImageIcon,
} from 'lucide-react';
import {
  AdvertisementConfig,
  AdvertisementTemplate,
  AdGraphicIcon,
} from '@/lib/types/advertisement';
import {
  getStoredAdConfig,
  saveStoredAdConfig,
  DEFAULT_AD_CONFIG,
  TEMPLATE_PRESETS,
} from '@/lib/utils/ad-store';
import { getStoredFirms } from '@/lib/utils/firms-store';
import { getFirms, updateAdvertisement } from '@/lib/firebase/services';
import { Firm } from '@/lib/types';
import { HomepageSpotlightCard } from '@/components/ads/homepage-spotlight-card';
import { SparkleToastAd } from '@/components/ads/sparkle-toast-ad';
import { InFeedAdCard } from '@/components/ads/in-feed-ad-card';

const GRAPHIC_ICON_OPTIONS: { id: AdGraphicIcon; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { id: 'shield', label: 'Shield', icon: ShieldCheck },
  { id: 'flame', label: 'Flame', icon: Flame },
  { id: 'gift', label: 'Gift', icon: Gift },
  { id: 'bell', label: 'Bell', icon: Bell },
  { id: 'trophy', label: 'Trophy', icon: Trophy },
  { id: 'zap', label: 'Lightning', icon: Zap },
];

const BACKDROP_PRESETS = [
  { id: 'trident-head', label: '🔱 Trident Head (Clean Prongs)', url: '/images/ads/lucid-trident-head.png' },
  { id: 'trident-emblem', label: '🔱 Trident Emblem (Square)', url: '/images/ads/lucid-trident-emblem.png' },
  { id: 'trident-full', label: '🔱 Full Trident (Wide Shaft)', url: '/images/ads/lucid-trident-bg.png' },
  { id: 'frosted', label: '✨ Lucid Glass 3D', url: '/images/ads/lucid-glass-bg.jpg' },
  { id: 'none', label: 'Pure Glass (No Art)', url: '' },
];

export default function AdminAdvertisementsPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [config, setConfig] = useState<AdvertisementConfig>(DEFAULT_AD_CONFIG);
  const [activeTab, setActiveTab] = useState<'preview-card' | 'preview-toast' | 'preview-infeed'>('preview-toast');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastReplayCount, setToastReplayCount] = useState(0);

  // Load firms and current configuration
  useEffect(() => {
    const localFirms = getStoredFirms();
    setFirms(localFirms);
    const initialConfig = getStoredAdConfig();
    setConfig(initialConfig);

    getFirms().then((liveFirms) => {
      if (liveFirms && liveFirms.length > 0) {
        setFirms(liveFirms);
      }
    }).catch(() => {});
  }, []);

  // Handle template selection
  const handleSelectTemplate = (tpl: AdvertisementTemplate) => {
    const preset = TEMPLATE_PRESETS[tpl];
    setConfig((prev) => ({
      ...prev,
      ...preset,
      updatedAt: Date.now(),
    }));
    setToastReplayCount((c) => c + 1);
  };

  // Handle firm selection
  const handleSelectFirm = (firmId: string) => {
    if (!firmId) {
      setConfig((p) => ({
        ...p,
        firmId: undefined,
        firmName: 'EMPIRIAL',
        logoUrl: '/favicon.ico',
      }));
      return;
    }
    const target = firms.find((f) => f.id === firmId);
    if (!target) return;

    setConfig((p) => ({
      ...p,
      firmId: target.id,
      firmName: target.name,
      logoUrl: target.logo_url || `/logos/${target.slug}.svg`,
      couponCode: target.coupon_code_custom || p.couponCode || 'EMPIRIAL',
      discountTag: target.discount_label_custom || (target.discount_pct ? `${target.discount_pct}% OFF` : p.discountTag),
      ctaLink: target.buy_url || p.ctaLink,
    }));
  };

  // Benefit checklist actions
  const handleAddBenefit = () => {
    setConfig((p) => ({
      ...p,
      benefits: [...(p.benefits || []), 'New Benefit Point'],
    }));
  };

  const handleUpdateBenefit = (index: number, val: string) => {
    setConfig((p) => {
      const updated = [...(p.benefits || [])];
      updated[index] = val;
      return { ...p, benefits: updated };
    });
  };

  const handleDeleteBenefit = (index: number) => {
    setConfig((p) => {
      const updated = (p.benefits || []).filter((_, i) => i !== index);
      return { ...p, benefits: updated };
    });
  };

  // Save to cloud & local
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    const updated: AdvertisementConfig = {
      ...config,
      updatedAt: Date.now(),
    };

    try {
      // 1. Save to local store & dispatch custom event immediately
      saveStoredAdConfig(updated);
      // 2. Sync to Firestore siteSettings in background
      updateAdvertisement(updated).catch((err) => {
        console.warn('Background Firestore sync encountered error:', err);
      });

      setSaveSuccess('✓ Advertisement settings published and synchronized across the live website.');
      setToastReplayCount((c) => c + 1);
    } catch (err: any) {
      console.error('Failed to save ad settings:', err);
      setSaveError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* Page Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5 space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground border border-zinc-200 dark:border-zinc-700">
                <Megaphone className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
                Advertisements &amp; Spotlight Engine
              </h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Lucid Glass translucent ads with White Theme + Dark Theme support, 14-star sparkle physics, and chatbox collision avoidance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/challenges"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-card text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
            >
              <span>View Challenges Grid</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save &amp; Publish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success / Error Messages */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}
      {saveError && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Template Quick Switcher */}
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Choose Template Preset</h2>
            <p className="text-xs text-muted-foreground">
              Select a specialized template to pre-fill content, or customize all fields below.
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            Current: <strong>{config.template}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {[
            { id: 'deal', label: 'Flash Deal / Discount', desc: 'Promote firm discounts & coupon codes', icon: Flame },
            { id: 'rule-update', label: 'Rule Change Notice', desc: 'Announce policy or trading rule revisions', icon: ShieldCheck },
            { id: 'feature', label: 'Platform Feature', desc: 'Announce new tools, explorer, or perks', icon: Sparkles },
            { id: 'custom', label: 'Custom Freeform', desc: '100% manual headline, graphic & links', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = config.template === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTemplate(item.id as AdvertisementTemplate)}
                className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between space-y-2 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold">{item.label}</span>
                </div>
                <p className="text-[10px] opacity-80 leading-snug">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Column: Controls & Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Lucid Glass Background & Frosted Settings */}
          <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-bold text-foreground">Lucid Glass Artwork &amp; Translucency</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">Glassmorphism</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Backdrop Graphic Preset</label>
                <div className="grid grid-cols-3 gap-2">
                  {BACKDROP_PRESETS.map((bp) => {
                    const isSelected = (config.backgroundImageUrl || '') === bp.url;
                    return (
                      <button
                        key={bp.id}
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, backgroundImageUrl: bp.url }))}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-semibold ${
                          isSelected
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {bp.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold">Custom Background Image URL</label>
                  <input
                    type="text"
                    value={config.backgroundImageUrl || ''}
                    onChange={(e) => setConfig((p) => ({ ...p, backgroundImageUrl: e.target.value }))}
                    placeholder="/images/ads/lucid-trident-bg.png"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-muted-foreground font-semibold">Glass Artwork Opacity</label>
                    <span className="font-mono text-foreground font-bold">{config.glassOpacity ?? 20}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={config.glassOpacity ?? 20}
                    onChange={(e) => setConfig((p) => ({ ...p, glassOpacity: Number(e.target.value) }))}
                    className="w-full accent-black dark:accent-white cursor-pointer mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>5% (Subtle)</span>
                    <span>20% (Recommended)</span>
                    <span>50% (High Depth)</span>
                  </div>
                </div>
              </div>

              {/* Background Alignment & Masking Adjustment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground font-semibold">Watermark / Art Alignment</label>
                  <select
                    value={config.backgroundPosition || 'watermark-right'}
                    onChange={(e) => setConfig((p) => ({ ...p, backgroundPosition: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                  >
                    <option value="watermark-right">Right Watermark (Recommended — Clean Text)</option>
                    <option value="watermark-center">Centered Watermark</option>
                    <option value="cover">Full Cover Texture</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground">
                    Prevents the trident or graphic from bisecting headline copy.
                  </p>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.backgroundMaskFade !== false}
                      onChange={(e) => setConfig((p) => ({ ...p, backgroundMaskFade: e.target.checked }))}
                      className="rounded accent-black dark:accent-white w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-foreground text-xs block">
                        Soft Gradient Mask Fade
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        Fades artwork towards text so badges and headlines never get crossed
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Target Firm & Visual Identity */}
          <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-bold text-foreground">Target Firm &amp; Graphic Icon</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">Identity</span>
            </div>

            {/* Quick Logo Mode Selector */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() =>
                  setConfig((p) => ({
                    ...p,
                    useEmpirialLogo: true,
                    firmName: p.firmName === 'EMPIRIAL' ? p.firmName : 'EMPIRIAL',
                    logoUrl: '/logos/empirial-trident-dark.png',
                  }))
                }
                className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  config.useEmpirialLogo
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>🔱 Use Official EMPIRIAL Logo</span>
                {config.useEmpirialLogo && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setConfig((p) => ({ ...p, useEmpirialLogo: false }))}
                className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  !config.useEmpirialLogo
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>🏢 Custom / Firm Partner Logo</span>
                {!config.useEmpirialLogo && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Select Associated Firm</label>
                <select
                  value={config.firmId || ''}
                  onChange={(e) => handleSelectFirm(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                >
                  <option value="">None / EMPIRIAL Brand</option>
                  {firms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Firm / Sponsor Name</label>
                <input
                  type="text"
                  value={config.firmName || ''}
                  onChange={(e) => setConfig((p) => ({ ...p, firmName: e.target.value }))}
                  placeholder="e.g. Velotrade"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Logo Image URL</label>
                <input
                  type="text"
                  value={config.logoUrl || ''}
                  onChange={(e) => setConfig((p) => ({ ...p, logoUrl: e.target.value }))}
                  placeholder="/logos/velotrade.svg"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Fallback Graphic Icon</label>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {GRAPHIC_ICON_OPTIONS.map((g) => {
                    const GIcon = g.icon;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, graphicIcon: g.id }))}
                        title={g.label}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          config.graphicIcon === g.id
                            ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs'
                            : 'border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <GIcon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Headings, Badge & Coupon Text */}
          <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-bold text-foreground">Content, Headlines &amp; Coupon</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">Copy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Badge Tag</label>
                <input
                  type="text"
                  value={config.badge}
                  onChange={(e) => setConfig((p) => ({ ...p, badge: e.target.value }))}
                  placeholder="⚡ FLASH DEAL"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Discount / Tag Pill</label>
                <input
                  type="text"
                  value={config.discountTag || ''}
                  onChange={(e) => setConfig((p) => ({ ...p, discountTag: e.target.value }))}
                  placeholder="20% OFF"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-muted-foreground font-semibold">Headline Title</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Exclusive 20% OFF All Challenges"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground font-semibold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-muted-foreground font-semibold">Subtitle Description</label>
                <textarea
                  rows={2}
                  value={config.subtitle}
                  onChange={(e) => setConfig((p) => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Limited-time verified discount with maximum profit split..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Coupon Code (Optional)</label>
                <input
                  type="text"
                  value={config.couponCode || ''}
                  onChange={(e) => setConfig((p) => ({ ...p, couponCode: e.target.value.toUpperCase() }))}
                  placeholder="EMPIRIAL"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground font-mono uppercase font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Primary CTA Button Label</label>
                <input
                  type="text"
                  value={config.ctaText}
                  onChange={(e) => setConfig((p) => ({ ...p, ctaText: e.target.value }))}
                  placeholder="Claim Deal →"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground font-semibold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-muted-foreground font-semibold">CTA Button Destination URL</label>
                <input
                  type="url"
                  value={config.ctaLink}
                  onChange={(e) => setConfig((p) => ({ ...p, ctaLink: e.target.value }))}
                  placeholder="https://velotrade.com/?ref=empirial"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground font-mono"
                />
              </div>
            </div>

            {/* Checklist / Benefit Points */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Spotlight Card Highlights (Bullet Points)
                </label>
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground hover:underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Highlight
                </button>
              </div>

              <div className="space-y-2">
                {(config.benefits || []).map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleUpdateBenefit(idx, e.target.value)}
                      className="flex-1 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteBenefit(idx)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Behavior & Sparkle Animation Controls */}
          <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-bold text-foreground">Animation &amp; Display Rules</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">Behavior</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Sparkle Star Burst Toggle */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-foreground" />
                    Sparkle Stars Burst
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    14-star perimeter burst framing on slide entrance
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.sparkleAnimation}
                  onChange={(e) => setConfig((p) => ({ ...p, sparkleAnimation: e.target.checked }))}
                  className="rounded accent-black dark:accent-white w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Toast Position */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Toast Slide Position</label>
                <select
                  value={config.toastPosition}
                  onChange={(e) => setConfig((p) => ({ ...p, toastPosition: e.target.value as any }))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                >
                  <option value="bottom-right">Bottom-Right (Safely Upside of Chat Button)</option>
                  <option value="bottom-left">Bottom-Left Corner</option>
                </select>
              </div>

              {/* Auto Dismiss Seconds */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Auto-Dismiss Timer</label>
                <select
                  value={config.autoDismissSeconds}
                  onChange={(e) => setConfig((p) => ({ ...p, autoDismissSeconds: Number(e.target.value) }))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                >
                  <option value={3}>3 Seconds (Quick)</option>
                  <option value={5}>5 Seconds (Recommended)</option>
                  <option value={8}>8 Seconds (Extended)</option>
                  <option value={0}>Permanent (Only user clicks ✕)</option>
                </select>
              </div>

              {/* Sparkle Particle Density */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Sparkle Density</label>
                <select
                  value={config.sparkleDensity || 'standard'}
                  onChange={(e) => setConfig((p) => ({ ...p, sparkleDensity: e.target.value as any }))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                >
                  <option value="minimal">Minimal (6 Stars)</option>
                  <option value="standard">Standard (14 Stars)</option>
                </select>
              </div>

              {/* In-Feed Frequency */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-muted-foreground font-semibold">In-Feed Grid Frequency</label>
                <select
                  value={config.inFeedFrequency || 6}
                  onChange={(e) => setConfig((p) => ({ ...p, inFeedFrequency: Number(e.target.value) }))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                >
                  <option value={4}>Every 4th Card</option>
                  <option value={6}>Every 6th Card (Recommended)</option>
                  <option value={8}>Every 8th Card</option>
                </select>
              </div>

              {/* Placement Checkboxes */}
              <div className="sm:col-span-2 space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showSpotlightCard}
                    onChange={(e) => setConfig((p) => ({ ...p, showSpotlightCard: e.target.checked }))}
                    className="rounded accent-black dark:accent-white"
                  />
                  <span className="font-semibold text-foreground">
                    Show on Homepage (Between Verified Firms &amp; Plans)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showSlideToast}
                    onChange={(e) => setConfig((p) => ({ ...p, showSlideToast: e.target.checked }))}
                    className="rounded accent-black dark:accent-white"
                  />
                  <span className="font-semibold text-foreground">
                    Show Floating Slide-in Notification Toast (Upside of chat button)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showInFeedCards}
                    onChange={(e) => setConfig((p) => ({ ...p, showInFeedCards: e.target.checked }))}
                    className="rounded accent-black dark:accent-white"
                  />
                  <span className="font-semibold text-foreground">
                    Show In-Feed Native Cards in /challenges &amp; /firms
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-bold text-foreground">Live Previews</h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Theme Mode Switcher (White Theme vs Dark Theme) */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('light')}
                    title="Preview in White/Light Theme"
                    className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                      previewTheme === 'light'
                        ? 'bg-white text-black shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px]">White</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('dark')}
                    title="Preview in Dark Theme"
                    className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                      previewTheme === 'dark'
                        ? 'bg-black text-white shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px]">Dark</span>
                  </button>
                </div>

                {/* Device Mode Switcher */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    title="Desktop Preview"
                    className={`p-1 rounded transition-colors ${
                      previewDevice === 'desktop'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    title="Mobile Screen Preview"
                    className={`p-1 rounded transition-colors ${
                      previewDevice === 'mobile'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview-toast')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      activeTab === 'preview-toast'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Toast
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview-card')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      activeTab === 'preview-card'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Spotlight
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview-infeed')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      activeTab === 'preview-infeed'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    In-Feed
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Device Frame Container with Dark/Light Class Wrapper */}
            <div className={`transition-all duration-300 ${previewTheme === 'dark' ? 'dark' : ''}`}>
              <div className={`transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-[340px] mx-auto border-2 border-zinc-700/80 rounded-3xl p-2.5 bg-zinc-950 shadow-xl' : ''}`}>
                
                {/* Preview 1: Notification Slide Toast with Replay Button */}
                {activeTab === 'preview-toast' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Notification Toast ({previewTheme === 'light' ? 'White Theme' : 'Dark Theme'}):
                      </span>
                      <button
                        type="button"
                        onClick={() => setToastReplayCount((c) => c + 1)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-foreground font-semibold text-xs border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Replay</span>
                      </button>
                    </div>

                    <div className={`relative h-64 rounded-2xl border flex items-center justify-center overflow-hidden p-4 transition-colors ${
                      previewTheme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
                    }`}>
                      {/* Embedded Toast Simulator */}
                      <SparkleToastAd
                        key={`${toastReplayCount}-${previewTheme}`}
                        forcePreviewConfig={config}
                        triggerPreview={true}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center">
                      Notification slide toast with Lucid Glass frosted depth, 14-star perimeter sparkles, and auto-dismiss.
                    </p>
                  </div>
                )}

                {/* Preview 2: Homepage In-Between Spotlight Card */}
                {activeTab === 'preview-card' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Homepage Spotlight ({previewTheme === 'light' ? 'White Theme' : 'Dark Theme'}):</span>
                      <span className="font-mono text-[10px] uppercase">{previewDevice}</span>
                    </div>
                    <div className={`rounded-2xl border overflow-hidden p-2 transition-colors ${
                      previewTheme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
                    }`}>
                      <HomepageSpotlightCard forceConfig={config} />
                    </div>
                  </div>
                )}

                {/* Preview 3: In-Feed Native Card (/challenges & /firms) */}
                {activeTab === 'preview-infeed' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>In-Feed Sponsored Grid ({previewTheme === 'light' ? 'White Theme' : 'Dark Theme'}):</span>
                      <span className="font-mono text-[10px] uppercase">{previewDevice}</span>
                    </div>
                    <div className={`rounded-2xl border p-2 overflow-hidden transition-colors ${
                      previewTheme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
                    }`}>
                      <InFeedAdCard forceConfig={config} />
                    </div>
                    <p className="text-[11px] text-muted-foreground text-center pt-1">
                      Appears naturally inside /challenges and /firms after every {config.inFeedFrequency || 6} items.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
