'use client';

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Layers,
  Save,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import {
  PlatformItem,
  getStoredPlatforms,
  saveStoredPlatforms,
  addStoredPlatform,
  updateStoredPlatform,
  deleteStoredPlatform,
} from '@/lib/utils/platforms-store';
import { getStoredFirms } from '@/lib/utils/firms-store';
import { logAdminAction } from '@/lib/utils/audit-log-store';

export default function AdminPlatformsPage() {
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<PlatformItem | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formType, setFormType] = useState<'forex' | 'futures' | 'both'>('forex');
  const [formDescription, setFormDescription] = useState('');
  const [formActive, setFormActive] = useState(true);

  // Firm usage counts
  const [firmCountMap, setFirmCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const list = getStoredPlatforms();
    setPlatforms(list);

    // Calculate usage from firms
    const firms = getStoredFirms();
    const map: Record<string, number> = {};
    firms.forEach((f) => {
      const pids = f.platform_ids || (f.platforms ? f.platforms.toLowerCase().split(/[,\s/]+/).map((s) => s.trim()) : []);
      pids.forEach((p) => {
        map[p] = (map[p] || 0) + 1;
      });
    });
    setFirmCountMap(map);

    const handlePlatformsChanged = (e: CustomEvent) => {
      if (e.detail) setPlatforms(e.detail);
    };
    window.addEventListener('empirial_platforms_changed' as any, handlePlatformsChanged);
    return () => window.removeEventListener('empirial_platforms_changed' as any, handlePlatformsChanged);
  }, []);

  const handleOpenAdd = () => {
    setEditingPlatform(null);
    setFormName('');
    setFormId('');
    setFormLogo('/platforms/mt5.png');
    setFormType('forex');
    setFormDescription('');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PlatformItem) => {
    setEditingPlatform(p);
    setFormName(p.name);
    setFormId(p.id);
    setFormLogo(p.logo);
    setFormType(p.type || 'forex');
    setFormDescription(p.description || '');
    setFormActive(p.is_active ?? true);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingPlatform) {
      const generatedId = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormId(generatedId);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const idToUse = (formId.trim() || formName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'));

    if (editingPlatform) {
      const updated = updateStoredPlatform(editingPlatform.id, {
        name: formName.trim(),
        logo: formLogo.trim() || '/platforms/mt5.png',
        type: formType,
        description: formDescription.trim(),
        is_active: formActive,
      });
      if (updated) {
        setPlatforms(getStoredPlatforms());
        logAdminAction({
          action: `Updated Trading Platform: ${formName}`,
          module: 'firms',
          target_id: editingPlatform.id,
          entity_name: formName,
          previous_state: editingPlatform,
          new_state: updated,
        });
      }
    } else {
      const added = addStoredPlatform({
        id: idToUse,
        name: formName.trim(),
        logo: formLogo.trim() || '/platforms/mt5.png',
        type: formType,
        description: formDescription.trim(),
        is_active: formActive,
      });
      setPlatforms(getStoredPlatforms());
      logAdminAction({
        action: `Added New Trading Platform: ${formName}`,
        module: 'firms',
        target_id: added.id,
        entity_name: formName,
        previous_state: null,
        new_state: added,
      });
    }

    setSaveSuccessMsg(`Platform "${formName}" saved successfully!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the platform "${name}"?`)) {
      deleteStoredPlatform(id);
      setPlatforms(getStoredPlatforms());
      logAdminAction({
        action: `Deleted Trading Platform: ${name}`,
        module: 'firms',
        target_id: id,
        entity_name: name,
        previous_state: null,
        new_state: null,
      });
    }
  };

  const filteredPlatforms = platforms.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.type && p.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Trading Platforms Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add and manage supported trading platforms with logos and configurations synced to firms & compare matrices.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Platform</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search platforms by name, id, or asset type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span>Total Platforms: <strong className="text-foreground font-bold">{platforms.length}</strong></span>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlatforms.map((p) => {
          const usageCount = firmCountMap[p.id] || 0;
          return (
            <div
              key={p.id}
              className="bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-sm space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 flex items-center justify-center shrink-0">
                    <img
                      src={p.logo || '/platforms/mt5.png'}
                      alt={p.name}
                      className="max-h-8 max-w-8 object-contain rounded"
                      onError={(e) => {
                        (e.target as any).src = '/platforms/mt5.png';
                      }}
                    />
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                      p.type === 'futures'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : p.type === 'both'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {p.type === 'both' ? 'Multi-Asset' : p.type || 'Forex'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-foreground">{p.name}</h3>
                  <span className="text-[11px] font-mono text-muted-foreground block">ID: {p.id}</span>
                  {p.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">
                  Firms Using: <strong className="text-foreground font-bold">{usageCount}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-muted-foreground hover:text-foreground bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Platform"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1.5 text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                    title="Delete Platform"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add / Edit Platform */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {editingPlatform ? 'Edit Trading Platform' : 'Add New Trading Platform'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Configure platform name, icon/logo, and market classification.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Platform Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. DXtrade, ThinkTrader, Quantower"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Identifier / Slug
                </label>
                <input
                  type="text"
                  required
                  value={formId}
                  onChange={(e) => setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. dxtrade"
                  disabled={!!editingPlatform}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none transition-all disabled:opacity-60"
                />
                <span className="text-[10px] text-muted-foreground">
                  Unique internal key used in database relations and filters.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Logo Image URL
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={formLogo || '/platforms/mt5.png'}
                      alt="Preview"
                      className="max-h-7 max-w-7 object-contain rounded"
                      onError={(e) => {
                        (e.target as any).src = '/platforms/mt5.png';
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    placeholder="/platforms/mt5.png or https://example.com/logo.png"
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:outline-none transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1 flex-wrap text-[10px] text-muted-foreground">
                  <span>Quick Presets:</span>
                  {[
                    { label: 'MT5', url: '/platforms/mt5.png' },
                    { label: 'cTrader', url: '/platforms/ctrader.svg' },
                    { label: 'Match-Trader', url: '/platforms/match-trader.svg' },
                    { label: 'TradeLocker', url: '/platforms/tradelocker.jpeg' },
                    { label: 'TradingView', url: '/platforms/tradingview.png' },
                    { label: 'Tradovate', url: '/platforms/tradovate.png' },
                    { label: 'NinjaTrader', url: '/platforms/ninjatrader.svg' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormLogo(preset.url)}
                      className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Market Classification
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="forex">Forex & CFD Trading</option>
                  <option value="futures">Futures Trading</option>
                  <option value="both">Multi-Asset (Forex, Crypto, Futures)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Description / Features (Optional)
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief notes about platform features, order types, or compatibility..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="platActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 accent-black dark:accent-white cursor-pointer"
                />
                <label htmlFor="platActive" className="text-xs font-semibold text-foreground cursor-pointer">
                  Platform Active & Available for Selection in Firms
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-foreground font-medium text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs transition-all cursor-pointer shadow flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Platform</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
