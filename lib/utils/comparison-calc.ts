import { Firm, Challenge } from '@/lib/types';

export interface ComparisonMetricScore {
  subject: string;
  score: number;
  displayValue: string;
  fullMark: number;
}

/**
 * Intelligent helper to parse Consistency Rules:
 * - Simple numbers/percentages: "35%", "35", "0%"
 * - Multi-step sentences: "35% in 1 Step and 45% in 2-Step", "35% (1-Step) / 45% (2-Step)"
 * - Free text: "No consistency rule", "None", "Max 40% daily"
 */
export function parseConsistencyRule(
  rawText?: string,
  targetStep?: number
): { score: number; displayValue: string; stepNumbers?: Record<number, number> } {
  if (!rawText || typeof rawText !== 'string') {
    return { score: 100, displayValue: 'No Rule (Best)' };
  }

  const trimmed = rawText.trim();
  const lower = trimmed.toLowerCase();

  // 1. Check if explicitly no consistency rule
  const isNoRule =
    lower.includes('no consistency') ||
    lower.includes('no strict') ||
    lower.includes('without consistency') ||
    lower.includes('none') ||
    lower.includes('zero rule') ||
    lower === '0' ||
    lower === '0%' ||
    lower.includes('no rule');

  if (isNoRule && !lower.includes('step')) {
    return { score: 100, displayValue: 'No Rule (Best)' };
  }

  // 2. Extract step-specific percentages: e.g. "35% in 1 Step and 45% in 2-Step"
  const stepNumbers: Record<number, number> = {};

  // Regex patterns to capture step 1, 2, 3...
  const step1Regex = /(?:(\d+(?:\.\d+)?)\s*%\s*(?:in|for)?\s*1[- ]*(?:step|phase)|1[- ]*(?:step|phase)[^0-9]*(\d+(?:\.\d+)?)\s*%)/i;
  const step2Regex = /(?:(\d+(?:\.\d+)?)\s*%\s*(?:in|for)?\s*2[- ]*(?:step|phase)|2[- ]*(?:step|phase)[^0-9]*(\d+(?:\.\d+)?)\s*%)/i;
  const step3Regex = /(?:(\d+(?:\.\d+)?)\s*%\s*(?:in|for)?\s*3[- ]*(?:step|phase)|3[- ]*(?:step|phase)[^0-9]*(\d+(?:\.\d+)?)\s*%)/i;

  const m1 = trimmed.match(step1Regex);
  if (m1) stepNumbers[1] = parseFloat(m1[1] || m1[2]);

  const m2 = trimmed.match(step2Regex);
  if (m2) stepNumbers[2] = parseFloat(m2[1] || m2[2]);

  const m3 = trimmed.match(step3Regex);
  if (m3) stepNumbers[3] = parseFloat(m3[1] || m3[2]);

  // If targetStep is requested and found
  if (targetStep && stepNumbers[targetStep] !== undefined) {
    const pct = stepNumbers[targetStep];
    const score = calculateScoreFromPercentage(pct);
    return {
      score,
      displayValue: `${pct}% (${targetStep}-Step)`,
      stepNumbers,
    };
  }

  // If multi-step values were found
  const foundSteps = Object.keys(stepNumbers);
  if (foundSteps.length > 0) {
    const parts = foundSteps.map((s) => `${stepNumbers[Number(s)]}% (${s}-Step)`);
    const avgPct =
      Object.values(stepNumbers).reduce((acc, v) => acc + v, 0) / foundSteps.length;
    const score = calculateScoreFromPercentage(avgPct);
    return {
      score,
      displayValue: parts.join(' / '),
      stepNumbers,
    };
  }

  // 3. Fallback: Extract general percentages from text, e.g. "35%", "35% consistency", "35"
  const allPctMatches = Array.from(trimmed.matchAll(/(\d+(?:\.\d+)?)\s*%/g));
  if (allPctMatches.length > 0) {
    const pcts = allPctMatches.map((m) => parseFloat(m[1]));
    const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    const score = calculateScoreFromPercentage(avg);
    const displayValue = pcts.length === 1 ? `${pcts[0]}%` : `${pcts.join('% / ')}%`;
    return { score, displayValue };
  }

  // Check pure numbers like "35" or "40"
  const pureNumMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
  if (pureNumMatch) {
    const num = parseFloat(pureNumMatch[1]);
    const score = calculateScoreFromPercentage(num);
    return { score, displayValue: `${num}%` };
  }

  // If text is present but no numbers, return text summary
  return {
    score: 80,
    displayValue: trimmed.length > 25 ? `${trimmed.substring(0, 22)}...` : trimmed,
  };
}

/**
 * Score calculation helper:
 * For profit consistency rules (e.g. 35% max profit on a single day):
 * 0% or no rule = 100 (complete freedom)
 * 50% = 88 (very lenient)
 * 45% = 85
 * 35% = 78
 * 30% = 72
 * 20% = 60
 * 10% = 50 (very strict)
 */
function calculateScoreFromPercentage(pct: number): number {
  if (pct <= 0) return 100;
  // Linear interpolation: 10% -> 50, 50% -> 88
  const score = Math.round(50 + ((pct - 10) / (50 - 10)) * 38);
  return Math.max(45, Math.min(95, score));
}

/**
 * Intelligent helper to parse Minimum Trading Days:
 * - "0", "0 Days", "No minimum", "None" -> 0 days (score 100)
 * - "3 Days", "5", "Minimum 4 trading days" -> extracts days accurately
 */
export function parseMinTradingDays(val: any): { days: number; score: number; displayValue: string } {
  if (val === undefined || val === null || val === '') {
    return { days: 0, score: 100, displayValue: '0 Days (Best)' };
  }

  if (typeof val === 'number') {
    const score = val === 0 ? 100 : val <= 3 ? 90 : val <= 5 ? 75 : Math.max(40, 75 - (val - 5) * 5);
    return {
      days: val,
      score,
      displayValue: val === 0 ? '0 Days (Best)' : `${val} Days`,
    };
  }

  const str = String(val).toLowerCase().trim();
  if (str.includes('no min') || str.includes('none') || str.includes('0 day') || str === '0') {
    return { days: 0, score: 100, displayValue: '0 Days (Best)' };
  }

  const numMatch = str.match(/(\d+)/);
  if (numMatch) {
    const days = parseInt(numMatch[1], 10);
    const score = days === 0 ? 100 : days <= 3 ? 90 : days <= 5 ? 75 : Math.max(40, 75 - (days - 5) * 5);
    return {
      days,
      score,
      displayValue: days === 0 ? '0 Days (Best)' : `${days} Days`,
    };
  }

  return { days: 3, score: 90, displayValue: '3 Days' };
}

// 1. Calculate scores for Prop Firms comparison
export function calculateFirmComparisonScores(firm: Firm): ComparisonMetricScore[] {
  // Metric 1: Max Allocation (At Top for Firms Comparison)
  const allocStr = firm.max_allocation || '$1,000,000';
  const allocNumMatch = allocStr.replace(/[^0-9]/g, '');
  const allocVal = allocNumMatch ? parseInt(allocNumMatch, 10) : 1000000;
  let allocScore = 50;
  if (allocVal >= 4000000) allocScore = 100;
  else if (allocVal >= 2500000) allocScore = 95;
  else if (allocVal >= 2000000) allocScore = 90;
  else if (allocVal >= 1500000) allocScore = 80;
  else if (allocVal >= 1000000) allocScore = 70;
  else allocScore = Math.max(30, Math.round((allocVal / 1000000) * 70));

  // Metric 2: Profit Split
  const splitMatch = (firm.profit_split_custom || String(firm.payout_split_pct || '80')).match(/(\d+)%/);
  const splitVal = splitMatch ? parseInt(splitMatch[1], 10) : (typeof firm.payout_split_pct === 'number' ? firm.payout_split_pct : 80);
  const splitScore = splitVal >= 100 ? 100 : splitVal >= 90 ? 92 : splitVal >= 85 ? 82 : splitVal >= 80 ? 72 : 55;

  // Metric 3: Max Drawdown Limit
  const maxLoss = firm.max_loss_pct || 10;
  const maxLossScore = maxLoss >= 12 ? 100 : maxLoss >= 10 ? 90 : maxLoss >= 8 ? 75 : maxLoss >= 6 ? 60 : 45;

  // Metric 4: Consistency (Intelligent sentence & number parser)
  const rawConsistency = firm.consistency_rule || firm.consistency_rules_content || '';
  const consistencyResult = parseConsistencyRule(rawConsistency);

  // Metric 5: Min. Trading Days (Intelligent sentence & number parser)
  const rawMinDays = firm.min_trading_days ?? firm.firm_rules_content;
  const minDaysResult = parseMinTradingDays(rawMinDays);

  return [
    { subject: 'Max Allocation', score: allocScore, displayValue: allocStr, fullMark: 100 },
    { subject: 'Profit Split', score: splitScore, displayValue: firm.profit_split_custom || `${splitVal}%`, fullMark: 100 },
    { subject: 'Max Drawdown Limit', score: maxLossScore, displayValue: `${maxLoss}% Max`, fullMark: 100 },
    { subject: 'Consistency', score: consistencyResult.score, displayValue: consistencyResult.displayValue, fullMark: 100 },
    { subject: 'Min. Trading Days', score: minDaysResult.score, displayValue: minDaysResult.displayValue, fullMark: 100 },
  ];
}

// 2. Calculate scores for Challenges / Accounts comparison (Payout Frequency replaces Max Allocation)
export function calculateChallengeComparisonScores(ch: Challenge): ComparisonMetricScore[] {
  // Metric 1: Profit Split
  const splitVal = ch.profit_split_pct || 80;
  const splitScore = splitVal >= 100 ? 100 : splitVal >= 90 ? 92 : splitVal >= 85 ? 82 : splitVal >= 80 ? 72 : 55;

  // Metric 2: Max Drawdown Limit
  const maxLoss = ch.max_loss_limit_pct || 8;
  const maxLossScore = maxLoss >= 12 ? 100 : maxLoss >= 10 ? 90 : maxLoss >= 8 ? 78 : maxLoss >= 6 ? 60 : 45;

  // Metric 3: Consistency (Intelligently resolve step specific numbers if available)
  const rawConsistency = ch.consistency_rule || '';
  const consistencyResult = parseConsistencyRule(rawConsistency, ch.steps);

  // Metric 4: Min. Trading Days (0 days = 100 / Best)
  const minDaysResult = parseMinTradingDays(ch.min_trading_days);

  // Metric 5: Payout Frequency
  const payoutStr = ch.payout_frequency || 'Bi-Weekly';
  let payoutScore = 75;
  if (payoutStr.toLowerCase().includes('6hr') || payoutStr.toLowerCase().includes('instant') || payoutStr.toLowerCase().includes('demand')) {
    payoutScore = 100;
  } else if (payoutStr.toLowerCase().includes('weekly') && !payoutStr.toLowerCase().includes('bi-weekly')) {
    payoutScore = 90;
  } else if (payoutStr.toLowerCase().includes('bi-weekly') || payoutStr.toLowerCase().includes('14')) {
    payoutScore = 80;
  } else {
    payoutScore = 60;
  }

  return [
    { subject: 'Profit Split', score: splitScore, displayValue: `Up to ${splitVal}%`, fullMark: 100 },
    { subject: 'Max Drawdown Limit', score: maxLossScore, displayValue: `${maxLoss}% Max`, fullMark: 100 },
    { subject: 'Consistency', score: consistencyResult.score, displayValue: consistencyResult.displayValue, fullMark: 100 },
    { subject: 'Min. Trading Days', score: minDaysResult.score, displayValue: minDaysResult.displayValue, fullMark: 100 },
    { subject: 'Payout Frequency', score: payoutScore, displayValue: payoutStr, fullMark: 100 },
  ];
}

// Backward compatible alias
export function calculateFirmScores(firm: Firm): ComparisonMetricScore[] {
  return calculateFirmComparisonScores(firm);
}
