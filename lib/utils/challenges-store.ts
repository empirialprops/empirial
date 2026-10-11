'use client';

import { Challenge } from '@/lib/types';
import { MOCK_CHALLENGES } from '@/lib/data/challenges-data';

const STORAGE_KEY = 'empirial_challenges_list';
const INITIALIZED_KEY = 'empirial_challenges_initialized';

export function getStoredChallenges(): Challenge[] {
  if (typeof window === 'undefined') return MOCK_CHALLENGES;
  try {
    const isInit = localStorage.getItem(INITIALIZED_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);

    if (isInit === 'true' && raw) {
      let parsed: Challenge[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip out unadded mock/default firms
        const UNADDED_MOCK_CHALLENGE_IDS = new Set([
          'ch-nys-100k', 'ch-ck-100k', 'ch-dolvero-100k', 'ch-alpha-100k',
          'ch-gtf-100k', 'ch-pipstone-100k', 'ch-shark-100k', 'ch-sure-100k',
          'ch-ftmo-100k', 'ch-pips-100k'
        ]);
        const beforeFilterLen = parsed.length;
        parsed = parsed.filter(c => !UNADDED_MOCK_CHALLENGE_IDS.has(c.id) && c.firm_id !== 'ftmo' && c.firm_id !== 'funding-pips');
        let shouldSync = parsed.length !== beforeFilterLen;
        
        // Auto-merge any newly added mock challenges (e.g. Orion Funded)
        const existingIds = new Set(parsed.map(c => c.id));
        const missingMockChallenges = MOCK_CHALLENGES.filter(c => !existingIds.has(c.id));
        if (missingMockChallenges.length > 0) {
          parsed = [...parsed, ...missingMockChallenges];
          shouldSync = true;
        }

        // Sync Orion challenges with appropriate code: EMPIRIAL50 for 50%, EMPIRIAL for 15%
        parsed = parsed.map(c => {
          if (c.firm_id === 'orion-funded') {
            const orig = c.original_price || c.price;
            if (c.discount_pct === 50 || (!c.discount_pct && c.coupon_code !== 'EMPIRIAL')) {
              const half = Math.max(1, Math.round(orig * 0.5));
              if (c.coupon_code !== 'EMPIRIAL50' || c.price !== half || !c.buy_url?.includes('EMPIRIAL50')) {
                shouldSync = true;
                return {
                  ...c,
                  discount_pct: 50,
                  price: half,
                  discounted_price: half,
                  coupon_code: 'EMPIRIAL50',
                  buy_url: 'https://www.orionfunded.com?coupon=EMPIRIAL50'
                };
              }
            } else if (c.discount_pct === 15) {
              const discPrice = Math.max(1, Math.round(orig * 0.85));
              if (c.coupon_code !== 'EMPIRIAL' || c.price !== discPrice || !c.buy_url?.includes('EMPIRIAL')) {
                shouldSync = true;
                return {
                  ...c,
                  discount_pct: 15,
                  price: discPrice,
                  discounted_price: discPrice,
                  coupon_code: 'EMPIRIAL',
                  buy_url: 'https://www.orionfunded.com?coupon=EMPIRIAL'
                };
              }
            }
          }
          return c;
        });

        if (shouldSync) {
          saveStoredChallenges(parsed);
        }
        
        return parsed;
      }
    }

    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CHALLENGES));
    return MOCK_CHALLENGES;
  } catch {
    return MOCK_CHALLENGES;
  }
}

export function saveStoredChallenges(challenges: Challenge[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    window.dispatchEvent(new CustomEvent('empirial_challenges_changed', { detail: challenges }));
  } catch (err) {
    console.error('Failed to save challenges to localStorage:', err);
  }
}

export function addStoredChallenges(newChallenges: Challenge[]): Challenge[] {
  const current = getStoredChallenges();
  const newIds = new Set(newChallenges.map((c) => c.id));
  const filteredCurrent = current.filter((c) => !newIds.has(c.id));
  const updated = [...newChallenges, ...filteredCurrent];
  saveStoredChallenges(updated);
  return updated;
}

export function addStoredChallenge(challenge: Challenge): Challenge[] {
  return addStoredChallenges([challenge]);
}

export function updateStoredChallenge(id: string, updates: Partial<Challenge>): Challenge[] {
  const current = getStoredChallenges();
  const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
  saveStoredChallenges(updated);
  return updated;
}

export function deleteStoredChallenge(id: string): Challenge[] {
  const current = getStoredChallenges();
  const updated = current.filter((c) => c.id !== id);
  saveStoredChallenges(updated);
  return updated;
}

export function deleteMultipleStoredChallenges(ids: string[]): Challenge[] {
  const idSet = new Set(ids);
  const current = getStoredChallenges();
  const updated = current.filter((c) => !idSet.has(c.id));
  saveStoredChallenges(updated);
  return updated;
}
