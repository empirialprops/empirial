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

    const activeFallback = customFallbackInput.trim() || fallbackText;

    try {
      if (format === 'json') {
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
            consistency_rule: parsed.rules?.consistency_rule || activeFallback,
          },
          accounts: parsed.accounts.map((acc: any) =>
            applyFallbackPlaceholders(
              {
                ...acc,
                category: acc.category || selectedFirm?.category || 'forex',
                steps: Number(acc.steps) || 2,
                account_size: Number(acc.account_size) || 100000,
                price: Number(acc.price) || 499,
                original_price: Number(acc.original_price) || 599,
                profit_split_pct: Number(acc.profit_split_pct) || 85,
                daily_loss_limit_pct: Number(acc.daily_loss_limit_pct) || 5,
                max_loss_limit_pct: Number(acc.max_loss_limit_pct) || 10,
                profit_target_pct: Number(acc.profit_target_pct) || 8,
              },
              activeFallback
            )
          ),
        };

        setParsedPayload(sanitizedPayload);
      } else {
        // CSV Parsing
        const parsedTiers = parseAccountsCsv(content, activeFallback);
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
            total_payouts: selectedFirm?.total_payouts || activeFallback,
            avg_payout_time: selectedFirm?.avg_payout_time || activeFallback,
            trust_score: selectedFirm?.trust_score || 95,
          },
          rules: {
            consistency_rule: selectedFirm?.consistency_rule || activeFallback,
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
    updatedAccounts[index] = {
      ...updatedAccounts[index],
      [field]: value,
    };
    setParsedPayload({
      ...parsedPayload,
      accounts: updatedAccounts,
    });
  };

  const handleAddAccountTier = () => {
    if (!parsedPayload) return;
    const activeFallback = customFallbackInput.trim() || fallbackText;
    const newTier: FirmImportAccountTier = {
      name: `$200,000 2-Step Standard`,
      account_size: 200000,
      steps: 2,
      price: 949,
      original_price: 1099,
      profit_split_pct: 85,
      daily_loss_limit_pct: 5,
      max_loss_limit_pct: 10,
      profit_target_pct: 8,
      phase_2_target_pct: 5,
      min_trading_days: 0,
      max_trading_days: 'Unlimited',
      payout_frequency: 'Bi-Weekly',
      leverage: '1:100',
      refundable_fee: true,
      category: 'forex',
      loss_type: 'Static',
      news_trading: 'YES / Allowed',
      overnight_weekend: 'YES | YES',
      ea_algo_trading: 'YES | YES',
      consistency_rule: activeFallback,
      inactivity_period: '30 Days',
      max_risk_per_trade: 'No Limit',
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
    if (!selectedFirm || !parsedPayload) return;

    setIsCommitting(true);
    setCommitSuccess(null);
    setParseError(null);

    try {
      const res = await commitFirmImport(selectedFirm, parsedPayload, replaceExistingAccounts);
      setCommitSuccess(res.message);
      // Refresh local challenges
      setChallenges(getStoredChallenges());
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
                  onClick={() => setFileFormat('json')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    fileFormat === 'json'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-muted-foreground'
                  }`}
                >
                  JSON
                </button>
                <button
                  type="button"
                  onClick={() => setFileFormat('csv')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    fileFormat === 'csv'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-muted-foreground'
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  Editable Account Table ({parsedPayload.accounts.length} tiers ready to commit)
                </span>
                <button
                  type="button"
                  onClick={handleAddAccountTier}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Account Tier</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-muted-foreground font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Account Name</th>
                      <th className="py-2.5 px-3">Size ($)</th>
                      <th className="py-2.5 px-3">Steps</th>
                      <th className="py-2.5 px-3">Price ($)</th>
                      <th className="py-2.5 px-3">Split (%)</th>
                      <th className="py-2.5 px-3">Daily Loss (%)</th>
                      <th className="py-2.5 px-3">Max Loss (%)</th>
                      <th className="py-2.5 px-3">Target (%)</th>
                      <th className="py-2.5 px-3">Min Days</th>
                      <th className="py-2.5 px-3">Leverage</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                    {parsedPayload.accounts.map((acc, index) => (
                      <tr key={index} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={acc.name}
                            onChange={(e) => handleAccountChange(index, 'name', e.target.value)}
                            className="w-44 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground font-sans font-semibold text-xs"
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
                            className="w-20 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={acc.profit_split_pct}
                            onChange={(e) => handleAccountChange(index, 'profit_split_pct', Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={acc.daily_loss_limit_pct}
                            onChange={(e) => handleAccountChange(index, 'daily_loss_limit_pct', Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={acc.max_loss_limit_pct}
                            onChange={(e) => handleAccountChange(index, 'max_loss_limit_pct', Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={acc.profit_target_pct}
                            onChange={(e) => handleAccountChange(index, 'profit_target_pct', Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={acc.min_trading_days}
                            onChange={(e) => handleAccountChange(index, 'min_trading_days', e.target.value)}
                            className="w-20 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={acc.leverage}
                            onChange={(e) => handleAccountChange(index, 'leverage', e.target.value)}
                            className="w-20 px-2 py-1 rounded bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-foreground focus:bg-white dark:focus:bg-zinc-900 text-foreground text-xs"
                          />
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
                    ))}
                  </tbody>
                </table>
              </div>
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
