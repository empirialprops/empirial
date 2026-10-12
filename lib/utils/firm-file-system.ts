'use client';

import { Firm, Challenge } from '@/lib/types';
import { getStoredFirms, updateStoredFirm, addStoredFirm } from './firms-store';
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
  discount_pct?: number; // Discount % (e.g. 15 for 15%)
  discounted_price?: number; // Amount after discount code applied
  coupon_code?: string;
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
  avg_payout?: string;
  crypto_max_leverage?: string;
  crypto_max_open_positions?: string;
  crypto_total_notional_exposure?: string;
  is_featured?: boolean;
  is_best_seller?: boolean;
  buy_url?: string;
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
    discount_pct?: number;
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
      coupon_code_custom: firm?.coupon_code_custom || 'EMPIRE',
      discount_label_custom: firm?.discount_label_custom || (firm?.discount_pct ? `${firm.discount_pct}% OFF` : ''),
      discount_pct: firm?.discount_pct !== undefined ? firm.discount_pct : (firm?.discount_label_custom ? parseInt(firm.discount_label_custom.match(/(\d+)%/)?.[1] || '0', 10) || undefined : undefined),
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
        ? existingChallenges.map((ch) => {
            const discPct = ch.discount_pct !== undefined ? ch.discount_pct : firm?.discount_pct || 15;
            const discPrice =
              ch.discounted_price !== undefined
                ? ch.discounted_price
                : Math.round(ch.price * (1 - discPct / 100));

            return {
              name: ch.name,
              account_size: ch.account_size,
              steps: ch.steps,
              price: ch.price,
              original_price: ch.original_price,
              discount_pct: discPct,
              discounted_price: discPrice,
              coupon_code: ch.coupon_code || firm?.coupon_code_custom || 'EMPIRIAL',
              profit_split_pct: ch.profit_split_pct,
              daily_loss_limit_pct: ch.daily_loss_limit_pct,
              max_loss_limit_pct: ch.max_loss_limit_pct,
              profit_target_pct: ch.profit_target_pct,
              phase_2_target_pct: ch.phase_2_target_pct !== undefined ? ch.phase_2_target_pct : (ch.steps >= 2 ? ch.profit_target_pct : 0),
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
              avg_payout: ch.avg_payout || '',
              crypto_max_leverage: ch.crypto_max_leverage || '',
              crypto_max_open_positions: ch.crypto_max_open_positions || '',
              crypto_total_notional_exposure: ch.crypto_total_notional_exposure || '',
              is_featured: ch.is_featured,
              is_best_seller: ch.is_best_seller,
              buy_url: ch.buy_url || firm?.buy_url || '',
            };
          })
        : [
            {
              name: '$10,000 2-Step Standard',
              account_size: 10000,
              steps: 2,
              price: 89,
              original_price: 110,
              discount_pct: 15,
              discounted_price: 76,
              coupon_code: firm?.coupon_code_custom || 'EMPIRIAL',
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
              avg_payout: '$5,400',
              crypto_max_leverage: '1:20',
              crypto_max_open_positions: '',
              crypto_total_notional_exposure: '',
              is_featured: false,
              is_best_seller: false,
              buy_url: firm?.buy_url || '',
            },
            {
              name: '$50,000 2-Step Standard',
              account_size: 50000,
              steps: 2,
              price: 299,
              original_price: 360,
              discount_pct: 15,
              discounted_price: 254,
              coupon_code: firm?.coupon_code_custom || 'EMPIRIAL',
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
              avg_payout: '$12,800',
              crypto_max_leverage: '1:20',
              crypto_max_open_positions: '',
              crypto_total_notional_exposure: '',
              is_featured: true,
              is_best_seller: true,
              buy_url: firm?.buy_url || '',
            },
            {
              name: '$100,000 2-Step Standard',
              account_size: 100000,
              steps: 2,
              price: 499,
              original_price: 624,
              discount_pct: 15,
              discounted_price: 424,
              coupon_code: firm?.coupon_code_custom || 'EMPIRIAL',
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
              avg_payout: '$24,500',
              crypto_max_leverage: '1:20',
              crypto_max_open_positions: '',
              crypto_total_notional_exposure: '',
              is_featured: true,
              is_best_seller: false,
              buy_url: firm?.buy_url || '',
            },
          ],
  };

  return JSON.stringify(template, null, 2);
}

/**
 * Generate CSV template for accounts
 */
/**
 * Generate CSV template for accounts
 */
export function generateFirmCsvTemplate(firm?: Firm, existingChallenges: Challenge[] = []): string {
  const headers = [
    'Account Tier Name',
    'Account Size',
    'Steps',
    'Price',
    'Original Price',
    'Discount %',
    'Amount after Discount',
    'Coupon Code',
    'Profit Split %',
    'Daily Loss %',
    'Max Loss %',
    'Target %',
    'Phase 2 Target %',
    'Min Days',
    'Max Days',
    'Payout Frequency',
    'Average Payout',
    'Leverage',
    'Refundable Fee',
    'Category',
    'Loss Type',
    'News Trading',
    'Overnight/Weekend',
    'EA/Algo',
    'Consistency Rule',
    'Inactivity Period',
    'Max Risk Per Trade',
    'Crypto Max Leverage',
    'Crypto Max Open Positions',
    'Crypto Total Notional Exposure',
    'Is Featured',
    'Is Best Seller',
    'Buy URL',
  ];

  const defaultDiscPct = firm?.discount_pct || 15;
  const rows = (existingChallenges.length > 0 ? existingChallenges : [
    {
      name: '$50,000 2-Step Standard',
      account_size: 50000,
      steps: 2,
      price: 299,
      original_price: 360,
      discount_pct: 15,
      discounted_price: 254,
      coupon_code: firm?.coupon_code_custom || 'EMPIRIAL',
      profit_split_pct: 85,
      daily_loss_limit_pct: 5,
      max_loss_limit_pct: 10,
      profit_target_pct: 8,
      phase_2_target_pct: 5,
      min_trading_days: 0,
      max_trading_days: 'Unlimited',
      payout_frequency: 'Bi-Weekly',
      avg_payout: '$12,800',
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
      crypto_max_leverage: '1:20',
      crypto_max_open_positions: '',
      crypto_total_notional_exposure: '',
      is_featured: true,
      is_best_seller: true,
      buy_url: firm?.buy_url || '',
    },
    {
      name: '$100,000 2-Step Standard',
      account_size: 100000,
      steps: 2,
      price: 499,
      original_price: 624,
      discount_pct: 15,
      discounted_price: 424,
      coupon_code: firm?.coupon_code_custom || 'EMPIRIAL',
      profit_split_pct: 85,
      daily_loss_limit_pct: 5,
      max_loss_limit_pct: 10,
      profit_target_pct: 8,
      phase_2_target_pct: 5,
      min_trading_days: 0,
      max_trading_days: 'Unlimited',
      payout_frequency: 'Bi-Weekly',
      avg_payout: '$24,500',
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
      crypto_max_leverage: '1:20',
      crypto_max_open_positions: '',
      crypto_total_notional_exposure: '',
      is_featured: true,
      is_best_seller: false,
      buy_url: firm?.buy_url || '',
    },
  ]).map((row: any) => {
    const dPct = row.discount_pct !== undefined ? row.discount_pct : defaultDiscPct;
    const dPrice = row.discounted_price !== undefined ? row.discounted_price : Math.round(row.price * (1 - dPct / 100));

    return [
      `"${row.name || ''}"`,
      row.account_size || '',
      row.steps !== undefined ? row.steps : '',
      row.price !== undefined ? row.price : '',
      row.original_price !== undefined ? row.original_price : '',
      dPct,
      dPrice,
      `"${row.coupon_code || firm?.coupon_code_custom || 'EMPIRIAL'}"`,
      row.profit_split_pct !== undefined ? row.profit_split_pct : '',
      row.daily_loss_limit_pct !== undefined ? row.daily_loss_limit_pct : '',
      row.max_loss_limit_pct !== undefined ? row.max_loss_limit_pct : '',
      row.profit_target_pct !== undefined ? row.profit_target_pct : '',
      row.phase_2_target_pct !== undefined ? row.phase_2_target_pct : (row.steps >= 2 ? row.profit_target_pct : ''),
      row.min_trading_days !== undefined ? row.min_trading_days : '',
      `"${row.max_trading_days || ''}"`,
      `"${row.payout_frequency || ''}"`,
      `"${row.avg_payout || ''}"`,
      `"${row.leverage || ''}"`,
      row.refundable_fee !== undefined ? (row.refundable_fee ? 'true' : 'false') : '',
      `"${row.category || ''}"`,
      `"${row.loss_type || ''}"`,
      `"${row.news_trading || ''}"`,
      `"${row.overnight_weekend || ''}"`,
      `"${row.ea_algo_trading || ''}"`,
      `"${row.consistency_rule || ''}"`,
      `"${row.inactivity_period || ''}"`,
      `"${row.max_risk_per_trade || ''}"`,
      `"${row.crypto_max_leverage || ''}"`,
      `"${row.crypto_max_open_positions || ''}"`,
      `"${row.crypto_total_notional_exposure || ''}"`,
      row.is_featured ? 'true' : 'false',
      row.is_best_seller ? 'true' : 'false',
      `"${row.buy_url || firm?.buy_url || ''}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Parse CSV raw string into Account Tiers (supports both human headers and normalized snake_case).
 * If any detail option is not found or empty in the file, it is left BLANK ('') so admin/team can manually fill it in.
 */
export function parseAccountsCsv(csvText: string, fallbackText: string = ''): FirmImportAccountTier[] {
  const lines = csvText.trim().split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  // Parse CSV line taking care of quotes and escaped quotes
  const parseLine = (line: string): string[] => {
    const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
    const values: string[] = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      const val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2] || '';
      values.push(val.trim());
    }
    return values;
  };

  const rawHeaders = parseLine(lines[0]);
  const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');
  const headerKeys = rawHeaders.map(normalizeKey);

  const tiers: FirmImportAccountTier[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 0 || values.every((v) => v === '')) continue;

    const rowMap: Record<string, string> = {};
    headerKeys.forEach((k, idx) => {
      rowMap[k] = values[idx] ?? '';
    });

    const getVal = (...keys: string[]): string => {
      for (const k of keys) {
        const norm = normalizeKey(k);
        if (rowMap[norm] !== undefined && rowMap[norm] !== '') {
          return rowMap[norm];
        }
      }
      return '';
    };

    const rawSize = getVal('accountsize', 'size', 'capital');
    const accountSize = rawSize ? Number(rawSize.replace(/[^0-9.]/g, '')) || 100000 : 100000;
    const name =
      getVal('accounttiername', 'name', 'tiername', 'tier') ||
      `$${accountSize.toLocaleString('en-US')} Evaluation`;

    const stepsRaw = getVal('steps', 'phases', 'model');
    const steps =
      stepsRaw !== ''
        ? Number(stepsRaw)
        : name.toLowerCase().includes('instant') || name.toLowerCase().includes('zero')
        ? 0
        : 2;

    const priceRaw = getVal('price', 'cost');
    const price = priceRaw ? Number(priceRaw.replace(/[^0-9.]/g, '')) || 0 : 0;

    const originalPriceRaw = getVal('originalprice', 'regularprice');
    const originalPrice = originalPriceRaw
      ? Number(originalPriceRaw.replace(/[^0-9.]/g, '')) || (price ? Math.round(price * 1.2) : 0)
      : price ? Math.round(price * 1.2) : 0;

    // Discount percentage
    const discPctRaw = getVal('discountpct', 'discount', 'discountpercentage', 'coupondiscount');
    const discountPct = discPctRaw !== '' ? Number(discPctRaw.replace(/[^0-9.]/g, '')) : undefined;

    // Amount after discount applied
    const discPriceRaw = getVal(
      'amountafterdiscount',
      'discountedprice',
      'priceafterdiscount',
      'finalprice',
      'discountprice',
      'offeredprice'
    );
    let discountedPrice = discPriceRaw !== '' ? Number(discPriceRaw.replace(/[^0-9.]/g, '')) : undefined;
    if (discountedPrice === undefined && discountPct !== undefined && price > 0) {
      discountedPrice = Math.round(price * (1 - discountPct / 100));
    }

    const couponCode = getVal('couponcode', 'coupon', 'code', 'promocode');

    const profitSplitRaw = getVal('profitsplitpct', 'profitsplit', 'split');
    const profitSplit = profitSplitRaw !== '' ? Number(profitSplitRaw.replace(/[^0-9.]/g, '')) : 80;

    const dailyLossRaw = getVal('dailylosslimitpct', 'dailyloss', 'daily');
    const dailyLoss = dailyLossRaw !== '' ? Number(dailyLossRaw.replace(/[^0-9.]/g, '')) : (steps === 3 ? 5 : 3);

    const maxLossRaw = getVal('maxlosslimitpct', 'maxloss', 'totaldrawdown', 'maxdrawdown');
    const maxLoss = maxLossRaw !== '' ? Number(maxLossRaw.replace(/[^0-9.]/g, '')) : 6;

    const targetRaw = getVal('profittargetpct', 'target', 'profittarget', 'phase1target');
    const target = targetRaw !== '' ? Number(targetRaw.replace(/[^0-9.]/g, '')) : (steps === 0 ? 0 : 8);

    const phase2TargetRaw = getVal('phase2targetpct', 'phase2target', 'verificationtarget');
    const phase2Target = phase2TargetRaw !== '' ? Number(phase2TargetRaw.replace(/[^0-9.]/g, '')) : (steps >= 2 ? target : 0);

    const minDaysRaw = getVal('mintradingdays', 'mindays', 'minimumdays');
    const minDays = minDaysRaw !== '' ? (isNaN(Number(minDaysRaw)) ? minDaysRaw : Number(minDaysRaw)) : '';

    const maxDays = getVal('maxtradingdays', 'maxdays', 'period');
    const payoutFrequency = getVal('payoutfrequency', 'payout', 'payoutcycle');
    const avgPayout = getVal('averagepayout', 'avgpayout', 'payoutaverage');
    const leverage = getVal('leverage');
    const refundableRaw = getVal('refundablefee', 'refundable', 'fee');
    const refundableFee = refundableRaw !== '' ? refundableRaw.toLowerCase() !== 'false' : true;

    const category = (getVal('category', 'market') as any) || (steps === 0 ? 'instant-funding' : 'forex');
    const lossType = (getVal('losstype', 'drawdowntype') as any) || '';

    // Leaving blank if unable to find in file, so admin/team can manually add
    const newsTrading = getVal('newstrading', 'news');
    const overnightWeekend = getVal('overnightweekend', 'weekend', 'overnight');
    const eaAlgoTrading = getVal('eaalgotrading', 'eaalgo', 'ea', 'algos');
    const consistencyRule = getVal('consistencyrule', 'consistency');
    const inactivityPeriod = getVal('inactivityperiod', 'inactivity');
    const maxRiskPerTrade = getVal('maxriskpertrade', 'maxrisk');

    const cryptoMaxLeverage = getVal('cryptomaxleverage', 'cryptoleverage');
    const cryptoMaxOpenPositions = getVal('cryptomaxopenpositions', 'cryptopositions', 'cryptomaxpositions');
    const cryptoTotalNotionalExposure = getVal('cryptototalnotionalexposure', 'cryptoexposure', 'cryptonotionalexposure');

    const isFeatured = getVal('isfeatured', 'featured').toLowerCase() === 'true';
    const isBestSeller = getVal('isbestseller', 'bestseller').toLowerCase() === 'true';
    const buyUrl = getVal('buyurl', 'url', 'affiliatelink');

    tiers.push({
      name,
      account_size: accountSize,
      steps,
      price,
      original_price: originalPrice,
      discount_pct: discountPct,
      discounted_price: discountedPrice,
      coupon_code: couponCode,
      profit_split_pct: profitSplit,
      daily_loss_limit_pct: dailyLoss,
      max_loss_limit_pct: maxLoss,
      profit_target_pct: target,
      phase_2_target_pct: phase2Target,
      min_trading_days: minDays,
      max_trading_days: maxDays,
      payout_frequency: payoutFrequency,
      avg_payout: avgPayout,
      leverage,
      refundable_fee: refundableFee,
      category,
      loss_type: lossType as any,
      news_trading: newsTrading,
      overnight_weekend: overnightWeekend,
      ea_algo_trading: eaAlgoTrading,
      consistency_rule: consistencyRule,
      inactivity_period: inactivityPeriod,
      max_risk_per_trade: maxRiskPerTrade,
      crypto_max_leverage: cryptoMaxLeverage,
      crypto_max_open_positions: cryptoMaxOpenPositions,
      crypto_total_notional_exposure: cryptoTotalNotionalExposure,
      is_featured: isFeatured,
      is_best_seller: isBestSeller,
      buy_url: buyUrl,
    });
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
  const parsedDiscPct = payload.overview.discount_pct !== undefined
    ? Number(payload.overview.discount_pct)
    : (payload.overview.discount_label_custom
      ? parseInt(payload.overview.discount_label_custom.match(/(\d+)%/)?.[1] || '', 10) || undefined
      : targetFirm.discount_pct);

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
    discount_label_custom: payload.overview.discount_label_custom || (parsedDiscPct ? `${parsedDiscPct}% OFF` : targetFirm.discount_label_custom),
    discount_pct: parsedDiscPct !== undefined ? parsedDiscPct : targetFirm.discount_pct,
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

  // Update or add in local store
  const currentFirms = getStoredFirms();
  const firmExists = currentFirms.some((f) => f.id === targetFirm.id || f.slug === targetFirm.slug);
  if (firmExists) {
    updateStoredFirm(targetFirm.id, firmUpdates);
  } else {
    addStoredFirm({ ...targetFirm, ...firmUpdates });
  }

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

    const discPct = acc.discount_pct !== undefined ? acc.discount_pct : (targetFirm.discount_pct || 15);
    const discPrice =
      acc.discounted_price !== undefined
        ? acc.discounted_price
        : acc.price > 0 && discPct > 0
        ? Math.round(acc.price * (1 - discPct / 100))
        : undefined;

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
      discount_pct: discPct,
      discounted_price: discPrice,
      coupon_code: acc.coupon_code || targetFirm.coupon_code_custom || 'EMPIRIAL',
      buy_url: acc.buy_url || targetFirm.buy_url || 'https://empirialprops.com',
      profit_split_pct: acc.profit_split_pct,
      daily_loss_limit_pct: acc.daily_loss_limit_pct,
      max_loss_limit_pct: acc.max_loss_limit_pct,
      profit_target_pct: acc.profit_target_pct,
      phase_2_target_pct: acc.phase_2_target_pct,
      min_trading_days: Number(acc.min_trading_days) || 0,
      max_trading_days: acc.max_trading_days || 'Unlimited',
      payout_frequency: acc.payout_frequency || targetFirm.payout_custom || '',
      avg_payout: acc.avg_payout || '',
      leverage: acc.leverage || targetFirm.leverage || '',
      refundable_fee: acc.refundable_fee !== undefined ? acc.refundable_fee : true,
      is_featured: acc.is_featured || false,
      is_best_seller: acc.is_best_seller || false,
      category: acc.category || targetFirm.category || 'forex',
      loss_type: acc.loss_type || 'Static',
      news_trading: acc.news_trading || '',
      overnight_weekend: acc.overnight_weekend || '',
      ea_algo_trading: acc.ea_algo_trading || '',
      consistency_rule: acc.consistency_rule || targetFirm.consistency_rule || '',
      inactivity_period: acc.inactivity_period || '',
      max_risk_per_trade: acc.max_risk_per_trade || '',
      crypto_max_leverage: acc.crypto_max_leverage || '',
      crypto_max_open_positions: acc.crypto_max_open_positions || '',
      crypto_total_notional_exposure: acc.crypto_total_notional_exposure || '',
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
