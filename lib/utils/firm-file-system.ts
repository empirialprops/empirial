'use client';

import { Firm, Challenge } from '@/lib/types';
import { getStoredFirms, updateStoredFirm } from './firms-store';
import { getStoredChallenges, addStoredChallenges, deleteMultipleStoredChallenges } from './challenges-store';
import { updateFirm, createChallenge, deleteChallengesBatch } from '@/lib/firebase/services';
import { db } from '@/lib/firebase/config';
import { logAdminAction } from './audit-log-store';

export interface FirmImportAccountTier {
  name: string;
  account_size: number;
  steps: number; // 0 (Instant), 1, 2, 3
  price: number;
  original_price: number;
  profit_split_pct: number;
  daily_loss_limit_pct: number;
  max_loss_limit_pct: number;
  profit_target_pct: number;
  phase_2_target_pct?: number;
  min_trading_days: number | string;
  max_trading_days: string;
  payout_frequency: string;
  leverage: string;
  refundable_fee: boolean;
  category: 'forex' | 'futures' | 'crypto' | 'instant-funding';
  loss_type?: 'Trailing' | 'Static';
  news_trading?: string;
  overnight_weekend?: string;
  ea_algo_trading?: string;
  consistency_rule?: string;
  inactivity_period?: string;
  max_risk_per_trade?: string;
  is_featured?: boolean;
  is_best_seller?: boolean;
}

export interface FirmImportPayload {
  firm_name: string;
  firm_slug?: string;
  fallback_placeholder?: string; // e.g. "NO INFO", "N/A"
  overview: {
    headquarters?: string;
    founded_year?: number;
    rating?: number;
    max_allocation?: string;
    profit_split_custom?: string;
    payout_custom?: string;
    payout_cycle?: string;
    payout_split_pct?: string;
    leverage?: string;
    platforms?: string;
    category?: 'forex' | 'futures' | 'crypto' | 'instant-funding' | 'all';
    buy_url?: string;
    coupon_code_custom?: string;
    discount_label_custom?: string;
    total_payouts?: string;
    avg_payout_time?: string;
    trust_score?: number;
    description?: string;
  };
  rules: {
    consistency_rule?: string;
    firm_rules_content?: string;
    rule_articles?: Array<{ title: string; url: string }>;
    restricted_countries?: string[];
    models?: string[];
  };
  accounts: FirmImportAccountTier[];
}

export const DEFAULT_FALLBACK_OPTIONS = [
  'NO INFO',
  'N/A',
  'Not Disclosed',
  'Under Review',
  'Contact Support',
  'Variable',
];

/**
 * Apply customizable fallback text to empty or undefined string fields
 */
export function applyFallbackPlaceholders<T extends Record<string, any>>(
  obj: T,
  fallbackText: string = 'NO INFO',
  exemptKeys: string[] = ['name', 'slug', 'id', 'firm_name', 'firm_slug', 'firm_id', 'logo_url']
): T {
  const result: any = { ...obj };
  for (const key of Object.keys(result)) {
    if (exemptKeys.includes(key)) continue;
    const val = result[key];
    if (val === undefined || val === null || val === '' || val === 'undefined') {
      result[key] = fallbackText;
    }
  }
  return result;
}

/**
 * Generate standard JSON template for a Firm
 */
export function generateFirmJsonTemplate(firm?: Firm, existingChallenges: Challenge[] = []): string {
  const template: FirmImportPayload = {
    firm_name: firm ? firm.name : 'Dolvero',
    firm_slug: firm ? firm.slug : 'dolvero',
    fallback_placeholder: 'NO INFO',
    overview: {
      headquarters: firm?.headquarters || 'London, United Kingdom',
      founded_year: firm?.founded_year || 2024,
      rating: firm?.rating || 4.9,
      max_allocation: firm?.max_allocation || '$2,000,000',
      profit_split_custom: firm?.profit_split_custom || 'Up to 90%',
      payout_custom: firm?.payout_custom || 'Bi-Weekly / 14 Days',
      payout_cycle: firm?.payout_cycle || 'Bi-Weekly / 14 Days',
      payout_split_pct: (firm?.payout_split_pct as string) || '80%-90%',
      leverage: firm?.leverage || '1:100',
      platforms: firm?.platforms || 'MT5, cTrader, DXtrade',
      category: firm?.category || 'forex',
      buy_url: firm?.buy_url || 'https://dolvero.com?ref=empirial',
      coupon_code_custom: firm?.coupon_code_custom || 'DOLVERO20',
      discount_label_custom: firm?.discount_label_custom || '20% OFF',
      total_payouts: firm?.total_payouts || '$10,000,000+',
      avg_payout_time: firm?.avg_payout_time || '6-18 Hours',
      trust_score: firm?.trust_score || 96,
      description: firm?.description || 'Institutional-grade proprietary trading evaluation platform.',
    },
    rules: {
      consistency_rule: firm?.consistency_rule || 'No strict consistency rule on standard accounts.',
      firm_rules_content: firm?.firm_rules_content || 'Expert advisors and news trading fully permitted.',
      rule_articles: firm?.rule_articles || [
        { title: 'Official Payout Policy & KYC Guide', url: 'https://help.dolvero.com/payouts' },
        { title: 'Drawdown Calculation Method', url: 'https://help.dolvero.com/drawdown' },
      ],
      restricted_countries: firm?.restricted_countries || ['United States', 'Cuba', 'Iran', 'North Korea'],
      models: firm?.models || ['1-Step Challenge', '2-Step Evaluation'],
    },
    accounts:
      existingChallenges.length > 0
        ? existingChallenges.map((ch) => ({
            name: ch.name,
            account_size: ch.account_size,
            steps: ch.steps,
            price: ch.price,
            original_price: ch.original_price,
            profit_split_pct: ch.profit_split_pct,
            daily_loss_limit_pct: ch.daily_loss_limit_pct,
            max_loss_limit_pct: ch.max_loss_limit_pct,
            profit_target_pct: ch.profit_target_pct,
            phase_2_target_pct: ch.phase_2_target_pct || 5,
            min_trading_days: ch.min_trading_days,
            max_trading_days: ch.max_trading_days,
            payout_frequency: ch.payout_frequency,
            leverage: ch.leverage,
            refundable_fee: ch.refundable_fee,
            category: ch.category,
            loss_type: ch.loss_type || 'Static',
            news_trading: ch.news_trading || 'YES / Allowed',
            overnight_weekend: ch.overnight_weekend || 'YES | YES',
            ea_algo_trading: ch.ea_algo_trading || 'YES | YES',
            consistency_rule: ch.consistency_rule || 'No Consistency Rule',
            inactivity_period: ch.inactivity_period || '30 Days',
            max_risk_per_trade: ch.max_risk_per_trade || 'No Limit',
            is_featured: ch.is_featured,
            is_best_seller: ch.is_best_seller,
          }))
        : [
            {
              name: '$10,000 2-Step Standard',
              account_size: 10000,
              steps: 2,
              price: 89,
              original_price: 110,
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
              consistency_rule: 'No Consistency Rule',
              inactivity_period: '30 Days',
              max_risk_per_trade: 'No Limit',
              is_featured: false,
              is_best_seller: false,
            },
            {
              name: '$50,000 2-Step Standard',
              account_size: 50000,
              steps: 2,
              price: 299,
              original_price: 360,
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
              consistency_rule: 'No Consistency Rule',
              inactivity_period: '30 Days',
              max_risk_per_trade: 'No Limit',
              is_featured: true,
              is_best_seller: true,
            },
            {
              name: '$100,000 2-Step Standard',
              account_size: 100000,
              steps: 2,
              price: 499,
              original_price: 624,
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
              consistency_rule: 'No Consistency Rule',
              inactivity_period: '30 Days',
              max_risk_per_trade: 'No Limit',
              is_featured: true,
              is_best_seller: false,
            },
          ],
  };

  return JSON.stringify(template, null, 2);
}

/**
 * Generate CSV template for accounts
 */
export function generateFirmCsvTemplate(firm?: Firm, existingChallenges: Challenge[] = []): string {
  const headers = [
    'name',
    'account_size',
    'steps',
    'price',
    'original_price',
    'profit_split_pct',
    'daily_loss_limit_pct',
    'max_loss_limit_pct',
    'profit_target_pct',
    'phase_2_target_pct',
    'min_trading_days',
    'max_trading_days',
    'payout_frequency',
    'leverage',
    'refundable_fee',
    'category',
    'loss_type',
    'news_trading',
    'overnight_weekend',
    'ea_algo_trading',
    'consistency_rule',
    'inactivity_period',
    'max_risk_per_trade',
  ];

  const rows = (existingChallenges.length > 0 ? existingChallenges : [
    {
      name: '$50,000 2-Step Standard',
      account_size: 50000,
      steps: 2,
      price: 299,
      original_price: 360,
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
      consistency_rule: 'No Consistency Rule',
      inactivity_period: '30 Days',
      max_risk_per_trade: 'No Limit',
    },
    {
      name: '$100,000 2-Step Standard',
      account_size: 100000,
      steps: 2,
      price: 499,
      original_price: 624,
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
      consistency_rule: 'No Consistency Rule',
      inactivity_period: '30 Days',
      max_risk_per_trade: 'No Limit',
    },
  ]).map((row: any) =>
    [
      `"${row.name}"`,
      row.account_size,
      row.steps,
      row.price,
      row.original_price,
      row.profit_split_pct,
      row.daily_loss_limit_pct,
      row.max_loss_limit_pct,
      row.profit_target_pct,
      row.phase_2_target_pct || 5,
      row.min_trading_days,
      `"${row.max_trading_days}"`,
      `"${row.payout_frequency}"`,
      `"${row.leverage}"`,
      row.refundable_fee ? 'true' : 'false',
      `"${row.category}"`,
      `"${row.loss_type || 'Static'}"`,
      `"${row.news_trading || 'YES / Allowed'}"`,
      `"${row.overnight_weekend || 'YES | YES'}"`,
      `"${row.ea_algo_trading || 'YES | YES'}"`,
      `"${row.consistency_rule || 'No Consistency Rule'}"`,
      `"${row.inactivity_period || '30 Days'}"`,
      `"${row.max_risk_per_trade || 'No Limit'}"`,
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Parse CSV raw string into Account Tiers
 */
export function parseAccountsCsv(csvText: string, fallbackText: string = 'NO INFO'): FirmImportAccountTier[] {
  const lines = csvText.trim().split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
  const tiers: FirmImportAccountTier[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Simple regex to parse CSV taking care of quotes
    const regex = /(?:^|,)(?:"([^"]*)"|([^,]*))/g;
    const values: string[] = [];
    let match;
    while ((match = regex.exec(rawLine)) !== null) {
      values.push(match[1] !== undefined ? match[1] : match[2] || '');
    }

    if (values.length === 0) continue;

    const rowObj: any = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });

    const tier: FirmImportAccountTier = {
      name: rowObj.name || `$${rowObj.account_size || 100000} Evaluation`,
      account_size: Number(rowObj.account_size) || 100000,
      steps: Number(rowObj.steps) || 2,
      price: Number(rowObj.price) || 499,
      original_price: Number(rowObj.original_price) || 599,
      profit_split_pct: Number(rowObj.profit_split_pct) || 85,
      daily_loss_limit_pct: Number(rowObj.daily_loss_limit_pct) || 5,
      max_loss_limit_pct: Number(rowObj.max_loss_limit_pct) || 10,
      profit_target_pct: Number(rowObj.profit_target_pct) || 8,
      phase_2_target_pct: Number(rowObj.phase_2_target_pct) || 5,
      min_trading_days: rowObj.min_trading_days !== undefined && rowObj.min_trading_days !== '' ? rowObj.min_trading_days : fallbackText,
      max_trading_days: rowObj.max_trading_days || 'Unlimited',
      payout_frequency: rowObj.payout_frequency || fallbackText,
      leverage: rowObj.leverage || fallbackText,
      refundable_fee: String(rowObj.refundable_fee).toLowerCase() === 'true',
      category: (rowObj.category as any) || 'forex',
      loss_type: (rowObj.loss_type as any) || 'Static',
      news_trading: rowObj.news_trading || fallbackText,
      overnight_weekend: rowObj.overnight_weekend || fallbackText,
      ea_algo_trading: rowObj.ea_algo_trading || fallbackText,
      consistency_rule: rowObj.consistency_rule || fallbackText,
      inactivity_period: rowObj.inactivity_period || fallbackText,
      max_risk_per_trade: rowObj.max_risk_per_trade || fallbackText,
    };

    tiers.push(tier);
  }

  return tiers;
}

/**
 * Commit the imported data to both Firebase and local stores
 */
export async function commitFirmImport(
  targetFirm: Firm,
  payload: FirmImportPayload,
  replaceExistingAccounts: boolean = true
): Promise<{ success: boolean; accountsCount: number; message: string }> {
  const fallback = payload.fallback_placeholder || 'NO INFO';

  // 1. Prepare Firm Updates
  const firmUpdates: Partial<Firm> = {
    headquarters: payload.overview.headquarters || targetFirm.headquarters || fallback,
    founded_year: payload.overview.founded_year || targetFirm.founded_year,
    rating: payload.overview.rating !== undefined ? payload.overview.rating : targetFirm.rating,
    max_allocation: payload.overview.max_allocation || targetFirm.max_allocation || fallback,
    profit_split_custom: payload.overview.profit_split_custom || targetFirm.profit_split_custom || fallback,
    payout_custom: payload.overview.payout_custom || targetFirm.payout_custom || fallback,
    payout_cycle: payload.overview.payout_cycle || targetFirm.payout_cycle || fallback,
    payout_split_pct: payload.overview.payout_split_pct || targetFirm.payout_split_pct || fallback,
    leverage: payload.overview.leverage || targetFirm.leverage || fallback,
    platforms: payload.overview.platforms || targetFirm.platforms || fallback,
    category: (payload.overview.category as any) || targetFirm.category,
    buy_url: payload.overview.buy_url || targetFirm.buy_url,
    coupon_code_custom: payload.overview.coupon_code_custom || targetFirm.coupon_code_custom,
    discount_label_custom: payload.overview.discount_label_custom || targetFirm.discount_label_custom,
    total_payouts: payload.overview.total_payouts || targetFirm.total_payouts || fallback,
    avg_payout_time: payload.overview.avg_payout_time || targetFirm.avg_payout_time || fallback,
    trust_score: payload.overview.trust_score || targetFirm.trust_score,
    description: payload.overview.description || targetFirm.description,
    consistency_rule: payload.rules.consistency_rule || targetFirm.consistency_rule || fallback,
    firm_rules_content: payload.rules.firm_rules_content || targetFirm.firm_rules_content,
    rule_articles: payload.rules.rule_articles || targetFirm.rule_articles || [],
    restricted_countries: payload.rules.restricted_countries || targetFirm.restricted_countries || [],
    models: payload.rules.models || targetFirm.models || [],
  };

  // Update local store
  updateStoredFirm(targetFirm.id, firmUpdates);

  // Update Firestore if online
  if (db) {
    try {
      await updateFirm(targetFirm.id, firmUpdates);
    } catch (err) {
      console.warn('Firestore updateFirm failed, proceeding with local store:', err);
    }
  }

  // 2. Prepare Challenge Accounts
  const existingAllChallenges = getStoredChallenges();
  const currentFirmChallenges = existingAllChallenges.filter(
    (c) => c.firm_id === targetFirm.id || c.firm_slug === targetFirm.slug
  );

  if (replaceExistingAccounts && currentFirmChallenges.length > 0) {
    const idsToRemove = currentFirmChallenges.map((c) => c.id);
    deleteMultipleStoredChallenges(idsToRemove);
    if (db) {
      try {
        await deleteChallengesBatch(idsToRemove);
      } catch (e) {
        console.warn('Firestore batch delete failed:', e);
      }
    }
  }

  const newChallenges: Challenge[] = payload.accounts.map((acc, index) => {
    const slugSuffix = `${acc.steps}step-${acc.account_size / 1000}k`;
    const generatedId = `ch-${targetFirm.id || targetFirm.slug}-${slugSuffix}-${Date.now().toString().slice(-4)}-${index}`;

    return {
      id: generatedId,
      firm_id: targetFirm.id,
      firm_name: targetFirm.name,
      firm_slug: targetFirm.slug,
      firm_logo: targetFirm.logo_url,
      name: acc.name,
      account_size: acc.account_size,
      steps: acc.steps,
      price: acc.price,
      original_price: acc.original_price,
      profit_split_pct: acc.profit_split_pct,
      daily_loss_limit_pct: acc.daily_loss_limit_pct,
      max_loss_limit_pct: acc.max_loss_limit_pct,
      profit_target_pct: acc.profit_target_pct,
      phase_2_target_pct: acc.phase_2_target_pct,
      min_trading_days: Number(acc.min_trading_days) || 0,
      max_trading_days: acc.max_trading_days || 'Unlimited',
      payout_frequency: acc.payout_frequency || targetFirm.payout_custom || fallback,
      leverage: acc.leverage || targetFirm.leverage || fallback,
      refundable_fee: acc.refundable_fee !== undefined ? acc.refundable_fee : true,
      buy_url: targetFirm.buy_url || 'https://empirialprops.com',
      coupon_code: targetFirm.coupon_code_custom || 'EMPIRE',
      discount_pct: targetFirm.discount_pct || 20,
      is_featured: acc.is_featured || false,
      is_best_seller: acc.is_best_seller || false,
      category: acc.category || targetFirm.category || 'forex',
      loss_type: acc.loss_type || 'Static',
      news_trading: acc.news_trading || fallback,
      overnight_weekend: acc.overnight_weekend || fallback,
      ea_algo_trading: acc.ea_algo_trading || fallback,
      consistency_rule: acc.consistency_rule || targetFirm.consistency_rule || fallback,
      inactivity_period: acc.inactivity_period || fallback,
      max_risk_per_trade: acc.max_risk_per_trade || fallback,
    };
  });

  // Save new challenges locally
  addStoredChallenges(newChallenges);

  // Sync with Firestore
  if (db) {
    for (const ch of newChallenges) {
      try {
        await createChallenge(ch);
      } catch (err) {
        console.warn(`Failed to sync challenge ${ch.id} to Firestore:`, err);
      }
    }
  }

  // Audit log
  logAdminAction({
    action: `Imported full firm profile and generated ${newChallenges.length} account tiers via Firm File System`,
    module: 'firms',
    target_id: targetFirm.id,
    entity_name: targetFirm.name,
    previous_state: { firm_id: targetFirm.id },
    new_state: { firm_id: targetFirm.id, accountsCount: newChallenges.length },
  });

  return {
    success: true,
    accountsCount: newChallenges.length,
    message: `Successfully synchronized ${targetFirm.name} and deployed ${newChallenges.length} account tiers to the platform.`,
  };
}
