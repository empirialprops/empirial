
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

        // Upgrade firms with authentic real discounts and coupon codes
        parsed = parsed.map(f => {
          const mockMatch = MOCK_FIRMS.find(m => m.id === f.id || m.slug === f.slug);
          let updated = { ...f };
          let changed = false;

          // If discount_pct is missing on stored firm, populate from mock or parse from label
          if (updated.discount_pct === undefined || updated.discount_pct === null) {
            if (mockMatch?.discount_pct !== undefined) {
              updated.discount_pct = mockMatch.discount_pct;
              changed = true;
            } else if (updated.discount_label_custom) {
              const match = updated.discount_label_custom.match(/(\d+)%/);
              if (match) {
                updated.discount_pct = parseInt(match[1], 10);
                changed = true;
              }
            }
          }

          // If discount_label_custom was old generic '20% OFF' but real discount is different, sync label & pct
          if (mockMatch && (updated.discount_label_custom === '20% OFF' || !updated.discount_label_custom) && mockMatch.discount_pct !== 20) {
            updated.discount_label_custom = mockMatch.discount_label_custom;
            updated.discount_pct = mockMatch.discount_pct;
            if (mockMatch.coupon_code_custom) {
              updated.coupon_code_custom = mockMatch.coupon_code_custom;
            }
            changed = true;
          }

          // Special upgrade for Orion Funded
          if (updated.id === 'orion-funded') {
            if (updated.discount_pct !== 50 || updated.coupon_code_custom !== 'EMPIRIAL50' || !updated.buy_url?.includes('EMPIRIAL50')) {
              updated.discount_pct = 50;
              updated.discount_label_custom = '50% OFF';
              updated.coupon_code_custom = 'EMPIRIAL50';
              updated.buy_url = 'https://www.orionfunded.com?coupon=EMPIRIAL50';
              changed = true;
            }
          }

          if (changed) {
            shouldSyncFirms = true;
          }
          return updated;
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
