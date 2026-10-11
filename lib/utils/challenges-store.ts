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
        // Strip out unadded default firms
        parsed = parsed.filter(c => c.firm_id !== 'ftmo' && c.firm_id !== 'funding-pips' && c.id !== 'ch-ftmo-100k' && c.id !== 'ch-pips-100k');
        
        // Auto-merge any newly added mock challenges (e.g. Orion Funded)
        const existingIds = new Set(parsed.map(c => c.id));
        const missingMockChallenges = MOCK_CHALLENGES.filter(c => !existingIds.has(c.id));
        if (missingMockChallenges.length > 0) {
          parsed = [...parsed, ...missingMockChallenges];
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
