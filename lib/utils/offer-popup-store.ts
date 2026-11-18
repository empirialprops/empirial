export interface OfferPosterConfig {
  enabled: boolean;
  layoutStructure: 'side-by-side' | 'stacked';
  badge: string;
  title: string;
  subtitle: string;
  discountTag: string;
  couponCode: string;
  buttonText: string;
  buttonLink: string;
  posterImageUrl?: string;
  benefits: string[];
  extraNote?: string;
  updatedAt?: number;
}

export const DEFAULT_OFFER_POSTER: OfferPosterConfig = {
  enabled: true,
  layoutStructure: 'side-by-side',
  badge: "VERY LIMITED DEAL + 1 FREE ACCOUNT ‼️",
  title: "Funded Futures Family Flash Sale",
  subtitle: "Get Discount of up to 80% in FUNDED FUTURES FAMILY + 1 FREE ACCOUNT for the Lucky Trader!",
  discountTag: "UP TO 80% OFF",
  couponCode: "ANURAJ",
  buttonText: "Claim 80% Discount & Buy Challenge",
  buttonLink: "https://app.fundedfuturesfamily.com/affiliation/?ref_code=ebf4f4f2-30a0-4067-bdc7-396dca6c5258",
  posterImageUrl: "/posters/funded-futures-family.jpg",
  benefits: [
    "Payout Protection Guarantee",
    "Special Accounts (100% OFF)",
    "Special VIP Support via Discord (Link in Bio)",
  ],
  extraNote: "Valid till Friday 5 PM EST. 1 Lucky buyer gets a 100% Free Account!",
  updatedAt: 1,
};

const STORAGE_KEY = "empirial_offer_poster_config";

/**
 * Compresses any user-uploaded image file client-side using an HTML5 canvas.
 * Reduces raw 5-15MB phone/desktop camera photos down to a fast ~40-70KB JPEG.
 * Prevents Firestore 1MB document quota errors and localStorage QuotaExceeded errors.
 */
export function compressPosterImage(
  file: File,
  maxWidth = 900,
  maxHeight = 1100,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Browser environment required for image compression'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error('Empty image file'));
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Force output as standard JPEG with optimized compression
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export function getStoredOfferPoster(): OfferPosterConfig {
  if (typeof window === "undefined") return DEFAULT_OFFER_POSTER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_OFFER_POSTER;
    return { ...DEFAULT_OFFER_POSTER, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_OFFER_POSTER;
  }
}

/**
 * Fetch live offer poster configuration from Firestore siteSettings document.
 * Caches to localStorage upon successful fetch.
 */
export async function fetchOfferPoster(): Promise<OfferPosterConfig> {
  try {
    const { getSiteSettings } = await import('@/lib/firebase/services');
    const settings = await getSiteSettings();
    if (settings && settings.offerPoster) {
      const liveConfig: OfferPosterConfig = {
        ...DEFAULT_OFFER_POSTER,
        ...settings.offerPoster,
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(liveConfig));
        } catch (_) {}
      }
      return liveConfig;
    }
  } catch (err) {
    console.warn("Failed to fetch live offer poster from Firestore:", err);
  }
  return getStoredOfferPoster();
}

/**
 * Saves offer poster config to localStorage, dispatches local browser event,
 * and syncs directly to Firestore siteSettings with awaitable Promise.
 */
export async function saveOfferPoster(config: OfferPosterConfig): Promise<OfferPosterConfig> {
  const configWithTimestamp: OfferPosterConfig = {
    ...config,
    updatedAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configWithTimestamp));
    } catch (err) {
      console.warn("Warning: localStorage quota issue while saving offer poster:", err);
    }
    try {
      window.dispatchEvent(new CustomEvent("offer-poster-changed", { detail: configWithTimestamp }));
    } catch (_) {}
  }

  // Sync to Firestore siteSettings with full promise await
  try {
    const { updateSiteSettings, invalidateSiteSettingsCache } = await import('@/lib/firebase/services');
    invalidateSiteSettingsCache();
    await updateSiteSettings({ offerPoster: configWithTimestamp });
  } catch (err) {
    console.error("Failed to sync offer poster to Firestore:", err);
    throw err;
  }

  return configWithTimestamp;
}

export async function resetOfferPoster(): Promise<OfferPosterConfig> {
  const resetConfig: OfferPosterConfig = {
    ...DEFAULT_OFFER_POSTER,
    updatedAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    try {
      window.dispatchEvent(new CustomEvent("offer-poster-changed", { detail: resetConfig }));
    } catch (_) {}
  }

  try {
    const { updateSiteSettings, invalidateSiteSettingsCache } = await import('@/lib/firebase/services');
    invalidateSiteSettingsCache();
    await updateSiteSettings({ offerPoster: resetConfig });
  } catch (err) {
    console.error("Failed to reset offer poster in Firestore:", err);
    throw err;
  }

  return resetConfig;
}
