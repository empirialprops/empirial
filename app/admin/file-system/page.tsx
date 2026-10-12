'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FolderUp,
  FileText,
  Download,
  Upload,
  Check,
  AlertCircle,
  Building2,
  Trash2,
  Plus,
  Edit,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  Search,
  ExternalLink,
  Percent,
  SlidersHorizontal,
  DollarSign,
  X,
} from 'lucide-react';
import { Firm, Challenge } from '@/lib/types';
import { getStoredFirms } from '@/lib/utils/firms-store';
import { getStoredChallenges } from '@/lib/utils/challenges-store';
import { getFirms, getChallenges } from '@/lib/firebase/services';
import {
  FirmImportPayload,
  FirmImportAccountTier,
  DEFAULT_FALLBACK_OPTIONS,
  generateFirmJsonTemplate,
  generateFirmCsvTemplate,
  parseAccountsCsv,
  commitFirmImport,
  applyFallbackPlaceholders,
} from '@/lib/utils/firm-file-system';

export default function AdminFirmFileSystemPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedFirmId, setSelectedFirmId] = useState<string>('');
  const [searchFirmQuery, setSearchFirmQuery] = useState('');

  // Fallback options
  const [fallbackText, setFallbackText] = useState<string>('NO INFO');
  const [customFallbackInput, setCustomFallbackInput] = useState('');
  const [replaceExistingAccounts, setReplaceExistingAccounts] = useState(true);

  // File Upload & Input State
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [rawText, setRawText] = useState('');
  const [fileFormat, setFileFormat] = useState<'json' | 'csv'>('json');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsed Payload & Preview State
  const [parsedPayload, setParsedPayload] = useState<FirmImportPayload | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'accounts' | 'overview' | 'rules' | 'raw'>('accounts');
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState<string | null>(null);

  // All Details Modal for Account Tier
  const [detailModalTierIndex, setDetailModalTierIndex] = useState<number | null>(null);

  // Load existing firms & challenges directly from real Firestore database
  useEffect(() => {
    const localF = getStoredFirms();
    const localC = getStoredChallenges();
    setFirms(localF);
    setChallenges(localC);
    if (localF.length > 0 && !selectedFirmId) {
      setSelectedFirmId(localF[0].id);
    }

    async function fetchLiveDatabase() {
      try {
        const [liveFirms, liveChalls] = await Promise.all([getFirms(), getChallenges()]);
        if (liveFirms && liveFirms.length > 0) {
          setFirms(liveFirms);
          if (!selectedFirmId || !liveFirms.some((f) => f.id === selectedFirmId)) {
            setSelectedFirmId(liveFirms[0].id);
          }
        }
        if (liveChalls && liveChalls.length > 0) {
          setChallenges(liveChalls);
        }
      } catch (err) {
        console.warn('Silent fallback for file-system database fetch:', err);
      }
    }

    fetchLiveDatabase();
  }, []);

  const selectedFirm = firms.find((f) => f.id === selectedFirmId) || firms[0];
  const selectedFirmChallenges = challenges.filter(
    (c) => c.firm_id === selectedFirm?.id || c.firm_slug === selectedFirm?.slug
  );

  // Filtered firms for selection
  const filteredFirms = firms.filter(
    (f) =>
      f.name.toLowerCase().includes(searchFirmQuery.toLowerCase()) ||
      f.slug.toLowerCase().includes(searchFirmQuery.toLowerCase())
  );

  // 1. Template Download Handlers
  const handleDownloadJsonTemplate = () => {
    if (!selectedFirm) return;
    const jsonStr = generateFirmJsonTemplate(selectedFirm, selectedFirmChallenges);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFirm.slug}-firm-data-template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsvTemplate = () => {
    if (!selectedFirm) return;
    const csvStr = generateFirmCsvTemplate(selectedFirm, selectedFirmChallenges);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFirm.slug}-accounts-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. Parse File or Raw Text
  const parseContent = (content: string, format: 'json' | 'csv') => {
    setParseError(null);
    setCommitSuccess(null);
    if (!content.trim()) {
      setParsedPayload(null);
      return;
    }

    const activeFallback = customFallbackInput.trim() || fallbackText;
    const trimmed = content.trim();

    // Auto-detect format intelligently
    let resolvedFormat = format;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      resolvedFormat = 'json';
    } else if (trimmed.includes(',') && (trimmed.includes('\n') || trimmed.includes('\r'))) {
      resolvedFormat = 'csv';
    }
    setFileFormat(resolvedFormat);

    try {
      if (resolvedFormat === 'json') {
        const parsed = JSON.parse(content);
        if (!parsed.accounts || !Array.isArray(parsed.accounts)) {
          throw new Error('Invalid JSON structure: missing "accounts" array.');
        }

        const sanitizedPayload: FirmImportPayload = {
          firm_name: parsed.firm_name || selectedFirm?.name || 'Firm Data',
          firm_slug: parsed.firm_slug || selectedFirm?.slug,
          fallback_placeholder: activeFallback,
          overview: applyFallbackPlaceholders(parsed.overview || {}, activeFallback),
          rules: {
            ...parsed.rules,
            consistency_rule: parsed.rules?.consistency_rule || '',
          },
          accounts: parsed.accounts.map((acc: any) => {
            const rawSize = acc.account_size !== undefined ? Number(acc.account_size) : 100000;
            const price = acc.price !== undefined ? Number(acc.price) : 0;
            const original_price =
              acc.original_price !== undefined
                ? Number(acc.original_price)
                : price
                ? Math.round(price * 1.2)
                : 0;

            const discPct =
              acc.discount_pct !== undefined && acc.discount_pct !== ''
                ? Number(acc.discount_pct)
                : undefined;

            let discPrice =
              acc.discounted_price !== undefined && acc.discounted_price !== ''
                ? Number(acc.discounted_price)
                : undefined;

            if (discPrice === undefined && discPct !== undefined && price > 0) {
              discPrice = Math.round(price * (1 - discPct / 100));
            } else if (discPrice !== undefined && discPct === undefined && price > 0) {
              discPct === undefined ? Math.round(((price - discPrice) / price) * 100) : discPct;
            }

            return {
              name: acc.name || `$${rawSize.toLocaleString('en-US')} Evaluation`,
              account_size: rawSize,
              steps: acc.steps !== undefined ? Number(acc.steps) : 2,
              price: price,
              original_price: original_price,
              discount_pct: discPct,
              discounted_price: discPrice,
              coupon_code: acc.coupon_code || '',
              profit_split_pct: acc.profit_split_pct !== undefined ? Number(acc.profit_split_pct) : 80,
              daily_loss_limit_pct: acc.daily_loss_limit_pct !== undefined ? Number(acc.daily_loss_limit_pct) : 5,
              max_loss_limit_pct: acc.max_loss_limit_pct !== undefined ? Number(acc.max_loss_limit_pct) : 10,
              profit_target_pct: acc.profit_target_pct !== undefined ? Number(acc.profit_target_pct) : 8,
              phase_2_target_pct: acc.phase_2_target_pct !== undefined ? Number(acc.phase_2_target_pct) : 5,
              min_trading_days: acc.min_trading_days !== undefined ? acc.min_trading_days : '',
              max_trading_days: acc.max_trading_days || '',
              payout_frequency: acc.payout_frequency || '',
              avg_payout: acc.avg_payout || '',
              leverage: acc.leverage || '',
              refundable_fee: acc.refundable_fee !== undefined ? Boolean(acc.refundable_fee) : true,
              category: acc.category || selectedFirm?.category || 'forex',
              loss_type: acc.loss_type || '',
              news_trading: acc.news_trading || '',
              overnight_weekend: acc.overnight_weekend || '',
              ea_algo_trading: acc.ea_algo_trading || '',
              consistency_rule: acc.consistency_rule || '',
              inactivity_period: acc.inactivity_period || '',
              max_risk_per_trade: acc.max_risk_per_trade || '',
              crypto_max_leverage: acc.crypto_max_leverage || '',
              crypto_max_open_positions: acc.crypto_max_open_positions || '',
              crypto_total_notional_exposure: acc.crypto_total_notional_exposure || '',
              is_featured: Boolean(acc.is_featured),
              is_best_seller: Boolean(acc.is_best_seller),
              buy_url: acc.buy_url || '',
            };
          }),
        };

        setParsedPayload(sanitizedPayload);
      } else {
        // CSV Parsing
        const parsedTiers = parseAccountsCsv(content, '');
        if (parsedTiers.length === 0) {
          throw new Error('Could not parse any accounts from CSV file. Verify headers.');
        }

        const csvPayload: FirmImportPayload = {
          firm_name: selectedFirm?.name || 'Imported Firm',
          firm_slug: selectedFirm?.slug,
          fallback_placeholder: activeFallback,
          overview: {
            headquarters: selectedFirm?.headquarters || activeFallback,
            founded_year: selectedFirm?.founded_year,
            rating: selectedFirm?.rating || 4.9,
            max_allocation: selectedFirm?.max_allocation || activeFallback,
            profit_split_custom: selectedFirm?.profit_split_custom || activeFallback,
            payout_custom: selectedFirm?.payout_custom || activeFallback,
            payout_cycle: selectedFirm?.payout_cycle || activeFallback,
            payout_split_pct: (selectedFirm?.payout_split_pct as string) || activeFallback,
            leverage: selectedFirm?.leverage || activeFallback,
            platforms: selectedFirm?.platforms || activeFallback,
            category: selectedFirm?.category || 'forex',
            buy_url: selectedFirm?.buy_url,
            coupon_code_custom: selectedFirm?.coupon_code_custom,
            discount_label_custom: selectedFirm?.discount_label_custom,
            discount_pct: selectedFirm?.discount_pct,
            total_payouts: selectedFirm?.total_payouts || activeFallback,
            avg_payout_time: selectedFirm?.avg_payout_time || activeFallback,
            trust_score: selectedFirm?.trust_score || 95,
          },
          rules: {
            consistency_rule: selectedFirm?.consistency_rule || '',
            firm_rules_content: selectedFirm?.firm_rules_content || '',
            rule_articles: selectedFirm?.rule_articles || [],
            restricted_countries: selectedFirm?.restricted_countries || [],
            models: selectedFirm?.models || ['1-Step Challenge', '2-Step Evaluation'],
          },
          accounts: parsedTiers,
        };

        setParsedPayload(csvPayload);
      }
    } catch (err: any) {
      // Auto-fallback: If JSON parse failed because user pasted CSV, try CSV!
      if (resolvedFormat === 'json') {
        try {
          const parsedTiers = parseAccountsCsv(content, '');
          if (parsedTiers.length > 0) {
            setFileFormat('csv');
            const csvPayload: FirmImportPayload = {
              firm_name: selectedFirm?.name || 'Imported Firm',
              firm_slug: selectedFirm?.slug,
              fallback_placeholder: activeFallback,
              overview: {
                headquarters: selectedFirm?.headquarters || activeFallback,
                founded_year: selectedFirm?.founded_year,
                rating: selectedFirm?.rating || 4.9,
                max_allocation: selectedFirm?.max_allocation || activeFallback,
                profit_split_custom: selectedFirm?.profit_split_custom || activeFallback,
                payout_custom: selectedFirm?.payout_custom || activeFallback,
                payout_cycle: selectedFirm?.payout_cycle || activeFallback,
                payout_split_pct: (selectedFirm?.payout_split_pct as string) || activeFallback,
                leverage: selectedFirm?.leverage || activeFallback,
                platforms: selectedFirm?.platforms || activeFallback,
                category: selectedFirm?.category || 'forex',
                buy_url: selectedFirm?.buy_url,
                coupon_code_custom: selectedFirm?.coupon_code_custom,
                discount_label_custom: selectedFirm?.discount_label_custom,
                discount_pct: selectedFirm?.discount_pct,
                total_payouts: selectedFirm?.total_payouts || activeFallback,
                avg_payout_time: selectedFirm?.avg_payout_time || activeFallback,
                trust_score: selectedFirm?.trust_score || 95,
              },
              rules: {
                consistency_rule: selectedFirm?.consistency_rule || '',
                firm_rules_content: selectedFirm?.firm_rules_content || '',
                rule_articles: selectedFirm?.rule_articles || [],
                restricted_countries: selectedFirm?.restricted_countries || [],
                models: selectedFirm?.models || ['1-Step Challenge', '2-Step Evaluation'],
              },
              accounts: parsedTiers,
            };

            setParsedPayload(csvPayload);
            return;
          }
        } catch {
          // Fall through to original error
        }
      }

      console.error('File parse failed:', err);
      setParseError(err.message || 'Failed to parse file format.');
      setParsedPayload(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const isCsv = file.name.endsWith('.csv');
    const format = isCsv ? 'csv' : 'json';
    setFileFormat(format);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      parseContent(text, format);
    };
    reader.readAsText(file);
  };

  // 3. In-Preview Edit Handlers
  const handleAccountChange = (index: number, field: keyof FirmImportAccountTier, value: any) => {
    if (!parsedPayload) return;
    const updatedAccounts = [...parsedPayload.accounts];
    const current = { ...updatedAccounts[index] };

    if (field === 'discount_pct') {
      const dPct = value === '' ? undefined : Number(value);
      current.discount_pct = dPct;
      if (dPct !== undefined && current.price > 0) {
        current.discounted_price = Math.round(current.price * (1 - dPct / 100));
      } else if (dPct === undefined) {
        current.discounted_price = undefined;
      }
    } else if (field === 'discounted_price') {
      const dPrice = value === '' ? undefined : Number(value);
      current.discounted_price = dPrice;
      if (dPrice !== undefined && current.price > 0) {
        current.discount_pct = Math.round(((current.price - dPrice) / current.price) * 100);
      }
    } else if (field === 'price') {
      const p = Number(value) || 0;
      current.price = p;
      if (current.discount_pct !== undefined && p > 0) {
        current.discounted_price = Math.round(p * (1 - current.discount_pct / 100));
      }
    } else {
      (current as any)[field] = value;
    }

    updatedAccounts[index] = current;
    setParsedPayload({
      ...parsedPayload,
      accounts: updatedAccounts,
    });
  };

  // Apply firm profile discount percentage and coupon code across all account tiers with one click
  const handleApplyFirmDiscountToAll = () => {
    if (!parsedPayload) return;
    const firmDiscount = selectedFirm?.discount_pct || 15;
    const firmCode = selectedFirm?.coupon_code_custom || 'EMPIRIAL';

    const updated = parsedPayload.accounts.map((acc) => {
      const discounted = acc.price > 0 ? Math.round(acc.price * (1 - firmDiscount / 100)) : 0;
      return {
        ...acc,
        discount_pct: firmDiscount,
        discounted_price: discounted,
        coupon_code: acc.coupon_code || firmCode,
      };
    });

    setParsedPayload({
      ...parsedPayload,
      accounts: updated,
    });
  };

  const handleAddAccountTier = () => {
    if (!parsedPayload) return;
    const firmDiscount = selectedFirm?.discount_pct || 15;
    const price = 949;
    const newTier: FirmImportAccountTier = {
      name: `$200,000 2-Step Standard`,
      account_size: 200000,
      steps: 2,
      price: price,
      original_price: 1099,
      discount_pct: firmDiscount,
      discounted_price: Math.round(price * (1 - firmDiscount / 100)),
      coupon_code: selectedFirm?.coupon_code_custom || 'EMPIRIAL',
      profit_split_pct: 85,
      daily_loss_limit_pct: 5,
      max_loss_limit_pct: 10,
      profit_target_pct: 8,
      phase_2_target_pct: 5,
      min_trading_days: 0,
      max_trading_days: 'Unlimited',
      payout_frequency: 'Bi-Weekly',
      avg_payout: '',
      leverage: '1:100',
      refundable_fee: true,
      category: 'forex',
      loss_type: 'Static',
      news_trading: '',
      overnight_weekend: '',
      ea_algo_trading: '',
      consistency_rule: '',
      inactivity_period: '',
      max_risk_per_trade: '',
      crypto_max_leverage: '',
      crypto_max_open_positions: '',
      crypto_total_notional_exposure: '',
      is_featured: false,
      is_best_seller: false,
      buy_url: selectedFirm?.buy_url || '',
    };
    setParsedPayload({
      ...parsedPayload,
      accounts: [...parsedPayload.accounts, newTier],
    });
  };

  const handleDeleteAccountTier = (index: number) => {
    if (!parsedPayload) return;
    const updatedAccounts = parsedPayload.accounts.filter((_, i) => i !== index);
    setParsedPayload({
      ...parsedPayload,
      accounts: updatedAccounts,
    });
  };

  const handleOverviewChange = (field: string, value: any) => {
    if (!parsedPayload) return;
    setParsedPayload({
      ...parsedPayload,
      overview: {
        ...parsedPayload.overview,
        [field]: value,
      },
    });
  };

  const handleRuleChange = (field: string, value: any) => {
    if (!parsedPayload) return;
    setParsedPayload({
      ...parsedPayload,
      rules: {
        ...parsedPayload.rules,
        [field]: value,
      },
    });
  };

  // 4. Commit Changes
  const handleCommit = async () => {
    if (!parsedPayload) return;

    setIsCommitting(true);
    setCommitSuccess(null);
    setParseError(null);

    try {
      const matchedFirm = firms.find(
        (f) =>
          (parsedPayload.firm_slug && f.slug.toLowerCase() === parsedPayload.firm_slug.toLowerCase()) ||
          (parsedPayload.firm_name && f.name.toLowerCase() === parsedPayload.firm_name.toLowerCase())
      );

      const firmToUse: Firm = matchedFirm || selectedFirm || {
        id: parsedPayload.firm_slug || 'orion-funded',
        name: parsedPayload.firm_name || 'Orion Funded',
        slug: parsedPayload.firm_slug || 'orion-funded',
        logo_url: `/logos/${parsedPayload.firm_slug || 'orion-funded'}.svg`,
        rating: parsedPayload.overview.rating || 4.5,
        review_count: 0,
        max_allocation: parsedPayload.overview.max_allocation || '$400,000',
        profit_split_custom: parsedPayload.overview.profit_split_custom || '80%',
        payout_custom: parsedPayload.overview.payout_custom || 'Bi-Weekly',
        payout_cycle: parsedPayload.overview.payout_cycle || 'Bi-Weekly / 14 Days',
        payout_split_pct: (parsedPayload.overview.payout_split_pct as string) || '80%',
        leverage: parsedPayload.overview.leverage || '1:100',
        platforms: parsedPayload.overview.platforms || 'MT5, Match-Trader',
        category: parsedPayload.overview.category || 'forex',
        buy_url: parsedPayload.overview.buy_url || 'https://www.orionfunded.com?coupon=EMPIRIAL',
        coupon_code_custom: parsedPayload.overview.coupon_code_custom || 'EMPIRIAL',
        discount_label_custom: parsedPayload.overview.discount_label_custom || (parsedPayload.overview.discount_pct ? `${parsedPayload.overview.discount_pct}% OFF` : ''),
        discount_pct: parsedPayload.overview.discount_pct !== undefined ? Number(parsedPayload.overview.discount_pct) : undefined,
        total_payouts: parsedPayload.overview.total_payouts || '$6,600,000+',
        avg_payout_time: parsedPayload.overview.avg_payout_time || '< 5 Hours',
        trust_score: parsedPayload.overview.trust_score || 94,
        description: parsedPayload.overview.description || '',
        consistency_rule: parsedPayload.rules.consistency_rule || '',
        firm_rules_content: parsedPayload.rules.firm_rules_content || '',
        rule_articles: parsedPayload.rules.rule_articles || [],
        restricted_countries: parsedPayload.rules.restricted_countries || [],
        models: parsedPayload.rules.models || [],
      };

      const res = await commitFirmImport(firmToUse, parsedPayload, replaceExistingAccounts);
      setCommitSuccess(res.message);
      // Refresh local stores
      setFirms(getStoredFirms());
      setChallenges(getStoredChallenges());
      if (firmToUse.id) {
        setSelectedFirmId(firmToUse.id);
      }
    } catch (err: any) {
      console.error('Commit failed:', err);
      setParseError(err.message || 'Failed to commit firm import to database.');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5 space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground border border-zinc-200 dark:border-zinc-700">
                <FolderUp className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
                Firms Data & Rules File System
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Upload, preview, customize fallback placeholders, and bulk-sync firm rules and account tiers to the live website.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/firms"
              className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-medium transition-colors"
            >
              Firms Directory
            </Link>
            <Link
              href="/admin/challenges"
              className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-medium transition-colors"
            >
              Challenges Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Top Configuration & Firm Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Target Firm Selector */}
        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Step 1 • Target Firm
            </span>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </div>

          <p className="text-xs text-muted-foreground">
            Select the existing firm from your website database to associate and synchronize.
          </p>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search existing firms..."
              value={searchFirmQuery}
              onChange={(e) => setSearchFirmQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-hidden focus:border-foreground"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {filteredFirms.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFirmId(f.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors border ${
                  selectedFirmId === f.id
                    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-900 dark:border-white font-bold text-foreground'
                    : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
                    {/* Authentic partner logo */}
                    <img src={f.logo_url} alt={f.name} className="w-5 h-5 object-contain" />
                  </div>
                  <span>{f.name}</span>
                </div>
                {selectedFirmId === f.id && <Check className="w-3.5 h-3.5 text-foreground" />}
              </button>
            ))}
          </div>

          {selectedFirm && (
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-1">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-muted-foreground">Selected:</span>
                <span className="font-bold text-foreground">{selectedFirm.name}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-muted-foreground">Existing Challenges:</span>
                <span className="font-bold text-foreground">{selectedFirmChallenges.length} account tiers</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Customizable Fallback Options */}
        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
              Step 2 • Fallback Options
            </span>
            <Sliders className="w-4 h-4 text-muted-foreground" />
          </div>

          <p className="text-xs text-muted-foreground">
            Configure placeholder text for features the firm doesn't disclose (e.g. average payout time, min trading days).
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Feature Placeholder Value:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {DEFAULT_FALLBACK_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setFallbackText(opt);
                    setCustomFallbackInput('');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-colors border ${
                    fallbackText === opt && !customFallbackInput
                      ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <input
                type="text"
                placeholder="Or type custom placeholder text..."
                value={customFallbackInput}
                onChange={(e) => setCustomFallbackInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={replaceExistingAccounts}
                onChange={(e) => setReplaceExistingAccounts(e.target.checked)}
                className="rounded-sm border-zinc-300 dark:border-zinc-700 accent-black dark:accent-white"
              />
              <span className="text-foreground font-medium">
                Replace existing accounts for this firm
              </span>
            </label>
            <p className="text-[11px] text-muted-foreground pl-5">
              Uncheck to append new tiers without overwriting existing challenge records.
            </p>
          </div>
        </div>

        {/* Step 3: Templates & Export Actions */}
        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground">
                Step 3 • Templates & Export
              </span>
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Download formatted templates matching your website schema, or export {selectedFirm?.name}'s current data.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleDownloadJsonTemplate}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Full JSON Template</span>
            </button>

            <button
              onClick={handleDownloadCsvTemplate}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-medium transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Accounts CSV Template</span>
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-[11px] text-muted-foreground flex items-center gap-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Files support all platform rules, payout schedules, and account tiers.</span>
          </div>
        </div>
      </div>

      {/* File Upload / Paste Box */}
      <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Upload or Paste Firm File</h2>
            <p className="text-xs text-muted-foreground">
              Upload .json or .csv with your firm's rules and accounts to generate an instant interactive preview.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setInputMode('upload')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                inputMode === 'upload'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setInputMode('paste')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                inputMode === 'paste'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Paste JSON / CSV
            </button>
          </div>
        </div>

        {inputMode === 'upload' ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-foreground dark:hover:border-foreground rounded-2xl p-8 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center space-y-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground border border-zinc-200 dark:border-zinc-700 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {fileName ? fileName : 'Click to browse or drag and drop your firm file'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .json (full firm profile + accounts) and .csv (accounts spreadsheet)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono">Format Selection:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFileFormat('json');
                    if (rawText.trim()) parseContent(rawText, 'json');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    fileFormat === 'json'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFileFormat('csv');
                    if (rawText.trim()) parseContent(rawText, 'csv');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    fileFormat === 'csv'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  CSV
                </button>
              </div>
            </div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                parseContent(e.target.value, fileFormat);
              }}
              placeholder={`Paste your ${fileFormat.toUpperCase()} contents here...`}
              className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono focus:outline-hidden"
            />
          </div>
        )}

        {/* Error Alert */}
        {parseError && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Success Alert */}
        {commitSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 shrink-0" />
            <span>{commitSuccess}</span>
          </div>
        )}
      </div>

      {/* Full Rich Interactive Preview & Inline Editing Console */}
      {parsedPayload && (
        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  Interactive Preview: {parsedPayload.firm_name}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review parsed attributes and account tiers. You can edit any field directly in this preview before committing.
              </p>
            </div>

            {/* Preview Navigation Tabs */}
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setPreviewTab('accounts')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  previewTab === 'accounts'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Account Tiers ({parsedPayload.accounts.length})
              </button>
              <button
                onClick={() => setPreviewTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  previewTab === 'overview'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Firm Profile
              </button>
              <button
                onClick={() => setPreviewTab('rules')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  previewTab === 'rules'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Rules & Articles
              </button>
              <button
                onClick={() => setPreviewTab('raw')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  previewTab === 'raw'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Raw JSON
              </button>
            </div>
          </div>

          {/* TAB 1: Account Tiers & In-Preview Table Editing */}
          {previewTab === 'accounts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-foreground">
                      Account Tiers ({parsedPayload.accounts.length} tiers ready to commit)
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Amount after discount is calculated automatically or manually editable. Unspecified parameters are left blank for team entry.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyFirmDiscountToAll}
                    title="Calculate final prices for all tiers using firm profile discount"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-medium transition-colors shadow-2xs"
                  >
                    <Percent className="w-3.5 h-3.5 text-foreground" />
                    <span>Apply Firm Discount ({selectedFirm?.discount_pct || 15}%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddAccountTier}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tier</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-muted-foreground font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Account Name</th>
                      <th className="py-2.5 px-3">Size ($)</th>
                      <th className="py-2.5 px-3">Steps</th>
                      <th className="py-2.5 px-3">Price ($)</th>
                      <th className="py-2.5 px-3">Disc (%)</th>
                      <th className="py-2.5 px-3">After Disc ($)</th>
                      <th className="py-2.5 px-3">Split (%)</th>
                      <th className="py-2.5 px-3">Daily Loss (%)</th>
                      <th className="py-2.5 px-3">Max Loss (%)</th>
                      <th className="py-2.5 px-3">Target (%)</th>
                      <th className="py-2.5 px-3 text-center">Challenge Details</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                    {parsedPayload.accounts.map((acc, index) => {
                      const calculatedDisc =
                        acc.discounted_price !== undefined
                          ? acc.discounted_price
                          : acc.price > 0 && acc.discount_pct !== undefined
                          ? Math.round(acc.price * (1 - acc.discount_pct / 100))
                          : acc.price;

                      return (
                        <tr key={index} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={acc.name}
                              onChange={(e) => handleAccountChange(index, 'name', e.target.value)}
                              className="w-40 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground font-sans font-semibold text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={acc.account_size}
                              onChange={(e) => handleAccountChange(index, 'account_size', Number(e.target.value))}
                              className="w-24 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={acc.steps}
                              onChange={(e) => handleAccountChange(index, 'steps', Number(e.target.value))}
                              className="px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                            >
                              <option value={0}>0 (Instant)</option>
                              <option value={1}>1-Step</option>
                              <option value={2}>2-Step</option>
                              <option value={3}>3-Step</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={acc.price}
                              onChange={(e) => handleAccountChange(index, 'price', Number(e.target.value))}
                              className="w-16 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              placeholder="0"
                              value={acc.discount_pct !== undefined ? acc.discount_pct : ''}
                              onChange={(e) => handleAccountChange(index, 'discount_pct', e.target.value)}
                              className="w-14 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              placeholder={String(calculatedDisc)}
                              value={acc.discounted_price !== undefined ? acc.discounted_price : ''}
                              onChange={(e) => handleAccountChange(index, 'discounted_price', e.target.value)}
                              className="w-16 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 font-bold text-foreground text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={acc.profit_split_pct}
                              onChange={(e) => handleAccountChange(index, 'profit_split_pct', Number(e.target.value))}
                              className="w-14 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={acc.daily_loss_limit_pct}
                              onChange={(e) => handleAccountChange(index, 'daily_loss_limit_pct', Number(e.target.value))}
                              className="w-14 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={acc.max_loss_limit_pct}
                              onChange={(e) => handleAccountChange(index, 'max_loss_limit_pct', Number(e.target.value))}
                              className="w-14 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={acc.profit_target_pct}
                              onChange={(e) => handleAccountChange(index, 'profit_target_pct', Number(e.target.value))}
                              className="w-14 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setDetailModalTierIndex(index)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-[11px] font-medium transition-colors"
                            >
                              <SlidersHorizontal className="w-3 h-3 text-foreground" />
                              <span>All Details (33)</span>
                            </button>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteAccountTier(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Comprehensive 33-Option Challenge Details Modal */}
              {detailModalTierIndex !== null && parsedPayload.accounts[detailModalTierIndex] && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
                    <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-foreground" />
                          <h3 className="text-base font-bold text-foreground">
                            Challenge Rules & Details: {parsedPayload.accounts[detailModalTierIndex].name}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Configure all 33 evaluation options for this tier. Missing options from files are left blank for manual input.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDetailModalTierIndex(null)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* All 33 Challenge Options Organized in 6 Logical Groups */}
                    {(() => {
                      const tier = parsedPayload.accounts[detailModalTierIndex];
                      const idx = detailModalTierIndex;

                      return (
                        <div className="space-y-6 text-xs font-mono">
                          {/* Group 1: Pricing & Discounts */}
                          <div className="space-y-3">
                            <h4 className="font-sans font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>1. Pricing, Discounts & Referral Codes</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Offered Price ($)</label>
                                <input
                                  type="number"
                                  value={tier.price}
                                  onChange={(e) => handleAccountChange(idx, 'price', Number(e.target.value))}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Original / Cut Price ($)</label>
                                <input
                                  type="number"
                                  value={tier.original_price}
                                  onChange={(e) => handleAccountChange(idx, 'original_price', Number(e.target.value))}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Discount % (e.g. 15, 20)</label>
                                <input
                                  type="number"
                                  placeholder="Blank (Enter %...)"
                                  value={tier.discount_pct !== undefined ? tier.discount_pct : ''}
                                  onChange={(e) => handleAccountChange(idx, 'discount_pct', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">
                                  Amount After Discount ($) [Auto-calculated or Manual]
                                </label>
                                <input
                                  type="number"
                                  placeholder="Blank (Enter price...)"
                                  value={tier.discounted_price !== undefined ? tier.discounted_price : ''}
                                  onChange={(e) => handleAccountChange(idx, 'discounted_price', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-bold text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Coupon Code</label>
                                <input
                                  type="text"
                                  placeholder="e.g. EMPIRIAL"
                                  value={tier.coupon_code || ''}
                                  onChange={(e) => handleAccountChange(idx, 'coupon_code', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Direct Buy URL</label>
                                <input
                                  type="text"
                                  placeholder="https://..."
                                  value={tier.buy_url || ''}
                                  onChange={(e) => handleAccountChange(idx, 'buy_url', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Group 2: Targets & Drawdown Rules */}
                          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <h4 className="font-sans font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                              2. Targets, Drawdown Limits & Loss Types
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Phase 1 Target (%)</label>
                                <input
                                  type="number"
                                  value={tier.profit_target_pct}
                                  onChange={(e) => handleAccountChange(idx, 'profit_target_pct', Number(e.target.value))}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Phase 2 Target (%)</label>
                                <input
                                  type="number"
                                  placeholder="Blank (0 if 1-step)"
                                  value={tier.phase_2_target_pct !== undefined ? tier.phase_2_target_pct : ''}
                                  onChange={(e) => handleAccountChange(idx, 'phase_2_target_pct', Number(e.target.value))}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Daily Loss Limit (%)</label>
                                <input
                                  type="number"
                                  value={tier.daily_loss_limit_pct}
                                  onChange={(e) => handleAccountChange(idx, 'daily_loss_limit_pct', Number(e.target.value))}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Max Loss Limit / DD (%)</label>
                                <input
                                  type="number"
                                  value={tier.max_loss_limit_pct}
                                  onChange={(e) => handleAccountChange(idx, 'max_loss_limit_pct', Number(e.target.value))}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Loss Type</label>
                                <select
                                  value={tier.loss_type || ''}
                                  onChange={(e) => handleAccountChange(idx, 'loss_type', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                >
                                  <option value="">Blank / Not Specified</option>
                                  <option value="Static">Static</option>
                                  <option value="Trailing">Trailing</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Profit Split (%)</label>
                                <input
                                  type="number"
                                  value={tier.profit_split_pct}
                                  onChange={(e) => handleAccountChange(idx, 'profit_split_pct', Number(e.target.value))}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Group 3: Operations & Permissions */}
                          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <h4 className="font-sans font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                              3. Trading Conditions & Rule Permissions
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">News Trading Rule</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. YES / Allowed)"
                                  value={tier.news_trading || ''}
                                  onChange={(e) => handleAccountChange(idx, 'news_trading', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Overnight & Weekend</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. YES | YES)"
                                  value={tier.overnight_weekend || ''}
                                  onChange={(e) => handleAccountChange(idx, 'overnight_weekend', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">EA & Algo Trading</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. YES | YES)"
                                  value={tier.ea_algo_trading || ''}
                                  onChange={(e) => handleAccountChange(idx, 'ea_algo_trading', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Consistency Rule</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. No Consistency Rule)"
                                  value={tier.consistency_rule || ''}
                                  onChange={(e) => handleAccountChange(idx, 'consistency_rule', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Inactivity Period</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. 30 Days)"
                                  value={tier.inactivity_period || ''}
                                  onChange={(e) => handleAccountChange(idx, 'inactivity_period', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Max Risk Per Trade</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. No Limit)"
                                  value={tier.max_risk_per_trade || ''}
                                  onChange={(e) => handleAccountChange(idx, 'max_risk_per_trade', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Min Trading Days</label>
                                <input
                                  type="text"
                                  placeholder="Blank (0 Days)"
                                  value={tier.min_trading_days || ''}
                                  onChange={(e) => handleAccountChange(idx, 'min_trading_days', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Max Trading Days</label>
                                <input
                                  type="text"
                                  placeholder="Blank (Unlimited)"
                                  value={tier.max_trading_days || ''}
                                  onChange={(e) => handleAccountChange(idx, 'max_trading_days', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Leverage</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. 1:100)"
                                  value={tier.leverage || ''}
                                  onChange={(e) => handleAccountChange(idx, 'leverage', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Refundable Evaluation Fee</label>
                                <select
                                  value={tier.refundable_fee ? 'true' : 'false'}
                                  onChange={(e) => handleAccountChange(idx, 'refundable_fee', e.target.value === 'true')}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                >
                                  <option value="true">Yes / Refundable</option>
                                  <option value="false">No / Non-refundable</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Group 4: Payout Schedule */}
                          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <h4 className="font-sans font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                              4. Payout Schedules & Metric Statistics
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Payout Frequency</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. Bi-Weekly / 14 Days)"
                                  value={tier.payout_frequency || ''}
                                  onChange={(e) => handleAccountChange(idx, 'payout_frequency', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Average Payout Amount</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. $12,800)"
                                  value={tier.avg_payout || ''}
                                  onChange={(e) => handleAccountChange(idx, 'avg_payout', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Group 5: Crypto Constraints */}
                          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <h4 className="font-sans font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                              5. Crypto Specific Trading Rules
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Crypto Max Leverage</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. 1:20)"
                                  value={tier.crypto_max_leverage || ''}
                                  onChange={(e) => handleAccountChange(idx, 'crypto_max_leverage', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Crypto Max Open Positions</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. 5 Positions)"
                                  value={tier.crypto_max_open_positions || ''}
                                  onChange={(e) => handleAccountChange(idx, 'crypto_max_open_positions', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Crypto Total Notional Exposure</label>
                                <input
                                  type="text"
                                  placeholder="Blank (e.g. $250,000)"
                                  value={tier.crypto_total_notional_exposure || ''}
                                  onChange={(e) => handleAccountChange(idx, 'crypto_total_notional_exposure', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Group 6: Listing Badges & Market Category */}
                          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <h4 className="font-sans font-bold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                              6. Category & Showcase Badges
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                              <div className="space-y-1">
                                <label className="text-muted-foreground block text-[11px]">Asset Market Category</label>
                                <select
                                  value={tier.category || 'forex'}
                                  onChange={(e) => handleAccountChange(idx, 'category', e.target.value)}
                                  className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                                >
                                  <option value="forex">Forex</option>
                                  <option value="futures">Futures</option>
                                  <option value="crypto">Crypto</option>
                                  <option value="instant-funding">Instant Funding</option>
                                </select>
                              </div>
                              <div className="pt-4 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="tier-is-featured"
                                  checked={Boolean(tier.is_featured)}
                                  onChange={(e) => handleAccountChange(idx, 'is_featured', e.target.checked)}
                                  className="rounded border-zinc-300 dark:border-zinc-700 accent-black dark:accent-white"
                                />
                                <label htmlFor="tier-is-featured" className="text-xs text-foreground cursor-pointer select-none">
                                  Mark as Featured Challenge
                                </label>
                              </div>
                              <div className="pt-4 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="tier-is-bestseller"
                                  checked={Boolean(tier.is_best_seller)}
                                  onChange={(e) => handleAccountChange(idx, 'is_best_seller', e.target.checked)}
                                  className="rounded border-zinc-300 dark:border-zinc-700 accent-black dark:accent-white"
                                />
                                <label htmlFor="tier-is-bestseller" className="text-xs text-foreground cursor-pointer select-none">
                                  Mark as Best Seller Badge
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Modal Footer */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        All edits are reflected immediately in your interactive preview.
                      </span>
                      <button
                        type="button"
                        onClick={() => setDetailModalTierIndex(null)}
                        className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-colors shadow-xs"
                      >
                        Done & Apply to Preview
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Firm Overview In-Preview Editing */}
          {previewTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Headquarters</label>
                <input
                  type="text"
                  value={parsedPayload.overview.headquarters || ''}
                  onChange={(e) => handleOverviewChange('headquarters', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Founded Year</label>
                <input
                  type="number"
                  value={parsedPayload.overview.founded_year || 2024}
                  onChange={(e) => handleOverviewChange('founded_year', Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Max Allocation</label>
                <input
                  type="text"
                  value={parsedPayload.overview.max_allocation || ''}
                  onChange={(e) => handleOverviewChange('max_allocation', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Profit Split Custom</label>
                <input
                  type="text"
                  value={parsedPayload.overview.profit_split_custom || ''}
                  onChange={(e) => handleOverviewChange('profit_split_custom', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Average Payout Time</label>
                <input
                  type="text"
                  value={parsedPayload.overview.avg_payout_time || ''}
                  onChange={(e) => handleOverviewChange('avg_payout_time', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Total Payouts Metric</label>
                <input
                  type="text"
                  value={parsedPayload.overview.total_payouts || ''}
                  onChange={(e) => handleOverviewChange('total_payouts', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Platforms</label>
                <input
                  type="text"
                  value={parsedPayload.overview.platforms || ''}
                  onChange={(e) => handleOverviewChange('platforms', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Coupon Code</label>
                <input
                  type="text"
                  value={parsedPayload.overview.coupon_code_custom || ''}
                  onChange={(e) => handleOverviewChange('coupon_code_custom', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={parsedPayload.overview.discount_pct ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                    handleOverviewChange('discount_pct', val);
                    if (val !== undefined && val > 0) {
                      handleOverviewChange('discount_label_custom', `${val}% OFF`);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Discount Label</label>
                <input
                  type="text"
                  value={parsedPayload.overview.discount_label_custom || ''}
                  onChange={(e) => handleOverviewChange('discount_label_custom', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Rules & Policy In-Preview Editing */}
          {previewTab === 'rules' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Consistency Rule Description</label>
                <textarea
                  rows={3}
                  value={parsedPayload.rules.consistency_rule || ''}
                  onChange={(e) => handleRuleChange('consistency_rule', e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">General Rules Content & Policies</label>
                <textarea
                  rows={4}
                  value={parsedPayload.rules.firm_rules_content || ''}
                  onChange={(e) => handleRuleChange('firm_rules_content', e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-foreground"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Raw JSON */}
          {previewTab === 'raw' && (
            <div className="bg-zinc-950 text-zinc-100 p-4 rounded-xl text-xs font-mono max-h-96 overflow-y-auto">
              <pre>{JSON.stringify(parsedPayload, null, 2)}</pre>
            </div>
          )}

          {/* Commit Action Bar */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                Ready to commit {parsedPayload.accounts.length} account tiers to{' '}
                <strong className="text-foreground">{selectedFirm?.name}</strong>.
              </span>
            </div>

            <button
              onClick={handleCommit}
              disabled={isCommitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs"
            >
              {isCommitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synchronizing Database...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save & Apply to Website</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
