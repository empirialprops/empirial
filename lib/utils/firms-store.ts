'use client';

import { Firm } from '@/lib/types';
import { MOCK_FIRMS } from '@/lib/data/firms-data';

const STORAGE_KEY = 'empirial_firms_list';
const INITIALIZED_KEY = 'empirial_firms_initialized';

export function getStoredFirms(): Firm[] {
  if (typeof window === 'undefined') return MOCK_FIRMS;
  try {
    const isInit = localStorage.getItem(INITIALIZED_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);

    if (isInit === 'true' && raw) {
      let parsed: Firm[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip out unadded default firms
        parsed = parsed.filter(f => f.id !== 'ftmo' && f.id !== 'funding-pips' && f.slug !== 'ftmo' && f.slug !== 'funding-pips');
        
        // Auto-merge any newly added mock firms (e.g. Orion Funded)
        const existingIds = new Set(parsed.map(f => f.id));
        const missingMockFirms = MOCK_FIRMS.filter(f => !existingIds.has(f.id));
        let shouldSyncFirms = false;
        if (missingMockFirms.length > 0) {
          parsed = [...parsed, ...missingMockFirms];
          shouldSyncFirms = true;
        }

        // Upgrade Orion firm if stored with previous 15% discount
        parsed = parsed.map(f => {
          if (f.id === 'orion-funded' && (f.discount_pct === 15 || f.discount_label_custom === 'SPECIAL OFFER')) {
            shouldSyncFirms = true;
            return { ...f, discount_pct: 50, discount_label_custom: '50% OFF', coupon_code_custom: 'EMPIRIAL' };
          }
          return f;
        });

        if (shouldSyncFirms) {
          saveStoredFirms(parsed);
        }
        return parsed;
      }
    }

    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_FIRMS));
    return MOCK_FIRMS;
  } catch {
    return MOCK_FIRMS;
  }
}

export function saveStoredFirms(firms: Firm[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(firms));
    window.dispatchEvent(new CustomEvent('empirial_firms_changed', { detail: firms }));
  } catch (err) {
    console.error('Failed to save firms to localStorage:', err);
  }
}

export function addStoredFirm(firm: Firm): Firm[] {
  const current = getStoredFirms();
  const updated = [firm, ...current.filter((f) => f.id !== firm.id)];
  saveStoredFirms(updated);
  return updated;
}

export function updateStoredFirm(id: string, updates: Partial<Firm>): Firm[] {
  const current = getStoredFirms();
  const updated = current.map((f) => (f.id === id ? { ...f, ...updates } : f));
  saveStoredFirms(updated);
  return updated;
}

export function deleteStoredFirm(id: string): Firm[] {
  const current = getStoredFirms();
  const updated = current.filter((f) => f.id !== id);
  saveStoredFirms(updated);
  return updated;
}
