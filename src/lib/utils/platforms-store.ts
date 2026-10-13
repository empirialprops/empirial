
export interface PlatformItem {
  id: string;
  name: string;
  logo: string;
  logo_url?: string;
  type?: 'forex' | 'futures' | 'both';
  is_active?: boolean;
  description?: string;
  created_at?: string;
}

export const DEFAULT_PLATFORMS: PlatformItem[] = [
  { id: 'mt5', name: 'MetaTrader 5', logo: '/platforms/mt5.png', type: 'forex', is_active: true },
  { id: 'mt4', name: 'MetaTrader 4', logo: '/platforms/mt5.png', type: 'forex', is_active: true },
  { id: 'ctrader', name: 'cTrader', logo: '/platforms/ctrader.svg', type: 'forex', is_active: true },
  { id: 'match-trader', name: 'Match-Trader', logo: '/platforms/match-trader.svg', type: 'forex', is_active: true },
  { id: 'tradelocker', name: 'TradeLocker', logo: '/platforms/tradelocker.jpeg', type: 'forex', is_active: true },
  { id: 'tradingview', name: 'TradingView', logo: '/platforms/tradingview.png', type: 'both', is_active: true },
  { id: 'tradovate', name: 'Tradovate', logo: '/platforms/tradovate.png', type: 'futures', is_active: true },
  { id: 'ninjatrader', name: 'NinjaTrader', logo: '/platforms/ninjatrader.svg', type: 'futures', is_active: true },
  { id: 'bookmap', name: 'Bookmap', logo: '/platforms/bookmap.jpeg', type: 'futures', is_active: true },
  { id: 'atas', name: 'ATAS', logo: '/platforms/atas.jpeg', type: 'futures', is_active: true },
  { id: 'multicharts', name: 'MultiCharts', logo: '/platforms/multicharts.svg', type: 'futures', is_active: true },
  { id: 'deepcharts', name: 'DeepCharts', logo: '/platforms/deepcharts.jpeg', type: 'futures', is_active: true },
];

const STORAGE_KEY = 'empirial_platforms_list';
const INITIALIZED_KEY = 'empirial_platforms_initialized';

export function getStoredPlatforms(): PlatformItem[] {
  if (typeof window === 'undefined') return DEFAULT_PLATFORMS;
  try {
    const isInit = localStorage.getItem(INITIALIZED_KEY);
    const raw = localStorage.getItem(STORAGE_KEY);

    if (isInit === 'true' && raw) {
      const parsed: PlatformItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default platforms exist in list if missing
        const existingIds = new Set(parsed.map((p) => p.id));
        const missing = DEFAULT_PLATFORMS.filter((d) => !existingIds.has(d.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }

    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLATFORMS));
    return DEFAULT_PLATFORMS;
  } catch {
    return DEFAULT_PLATFORMS;
  }
}

export function saveStoredPlatforms(platforms: PlatformItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INITIALIZED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(platforms));
    window.dispatchEvent(new CustomEvent('empirial_platforms_changed', { detail: platforms }));

    // Async sync to Firestore if configured
    import('@/lib/firebase/config').then(({ db }) => {
      if (db) {
        import('firebase/firestore').then(({ doc, setDoc }) => {
          platforms.forEach((plat) => {
            const docRef = doc(db, 'platforms', plat.id);
            setDoc(docRef, {
              ...plat,
              updated_at: new Date().toISOString(),
            }, { merge: true }).catch(() => {});
          });
        });
      }
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to save platforms:', err);
  }
}

export function addStoredPlatform(platform: Omit<PlatformItem, 'id'> & { id?: string }): PlatformItem {
  const current = getStoredPlatforms();
  const id = platform.id || platform.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const newPlat: PlatformItem = {
    ...platform,
    id,
    is_active: platform.is_active ?? true,
    created_at: new Date().toISOString(),
  };

  const updated = [newPlat, ...current.filter((p) => p.id !== id)];
  saveStoredPlatforms(updated);
  return newPlat;
}

export function updateStoredPlatform(id: string, updates: Partial<PlatformItem>): PlatformItem | null {
  const current = getStoredPlatforms();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedItem: PlatformItem = {
    ...current[index],
    ...updates,
  };
  current[index] = updatedItem;
  saveStoredPlatforms(current);
  return updatedItem;
}

export function deleteStoredPlatform(id: string): boolean {
  const current = getStoredPlatforms();
  const updated = current.filter((p) => p.id !== id);
  if (updated.length === current.length) return false;
  saveStoredPlatforms(updated);

  // Attempt delete from Firestore
  import('@/lib/firebase/config').then(({ db }) => {
    if (db) {
      import('firebase/firestore').then(({ doc, deleteDoc }) => {
        deleteDoc(doc(db, 'platforms', id)).catch(() => {});
      });
    }
  }).catch(() => {});

  return true;
}

export function getPlatformDictionary(): Record<string, { name: string; logo: string; type: 'forex' | 'futures' | 'both' }> {
  const platforms = getStoredPlatforms();
  const dict: Record<string, { name: string; logo: string; type: 'forex' | 'futures' | 'both' }> = {};
  platforms.forEach((p) => {
    dict[p.id] = {
      name: p.name,
      logo: p.logo,
      type: p.type || 'forex',
    };
  });
  return dict;
}
