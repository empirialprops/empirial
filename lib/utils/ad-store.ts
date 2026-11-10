import { AdvertisementConfig, AdvertisementTemplate } from '@/lib/types/advertisement';

export const TEMPLATE_PRESETS: Record<AdvertisementTemplate, Omit<AdvertisementConfig, 'updatedAt'>> = {
  deal: {
    enabled: true,
    template: 'deal',
    showSpotlightCard: true,
    showSlideToast: true,
    showInFeedCards: true,
    inFeedFrequency: 6,
    sparkleDensity: 'standard',
    badge: '⚡ FLASH DEAL',
    title: '20% OFF All Challenges',
    subtitle: 'Verified discount. Instant credentials and 90% profit split.',
    firmName: 'Velotrade',
    logoUrl: '/logos/velotrade.svg',
    discountTag: '20% OFF',
    couponCode: 'EMPIRIAL',
    ctaText: 'Claim Deal →',
    ctaLink: 'https://velotrade.com/?ref=empirial',
    benefits: [
      'No Minimum Trading Days',
      '90% Profit Split Guaranteed',
      'Fast Bi-Weekly Crypto/Bank Payouts',
    ],
    backgroundImageUrl: '/images/ads/lucid-trident-head.png',
    backgroundPosition: 'watermark-right',
    backgroundMaskFade: true,
    glassOpacity: 25,
    sparkleAnimation: true,
    autoDismissSeconds: 5,
    toastPosition: 'bottom-right',
  },
  'rule-update': {
    enabled: true,
    template: 'rule-update',
    showSpotlightCard: true,
    showSlideToast: true,
    showInFeedCards: true,
    inFeedFrequency: 6,
    sparkleDensity: 'standard',
    badge: '🛡️ RULE UPDATE',
    title: 'Weekend & News Trading Unrestricted',
    subtitle: 'Alpha Capital policy revision: Zero restrictions on overnight holding.',
    firmName: 'Alpha Capital',
    logoUrl: '/logos/alpha-capital.png',
    discountTag: 'POLICY REVISED',
    couponCode: 'EMPIRIAL',
    ctaText: 'View New Rules →',
    ctaLink: '/firms/alpha-capital',
    benefits: [
      'Overnight & Weekend Holding Unrestricted',
      'High-Impact News Trading Permitted',
      'EA & Algorithmic Trading Friendly',
    ],
    backgroundImageUrl: '/images/ads/lucid-trident-head.png',
    backgroundPosition: 'watermark-right',
    backgroundMaskFade: true,
    glassOpacity: 25,
    sparkleAnimation: true,
    autoDismissSeconds: 6,
    toastPosition: 'bottom-right',
  },
  feature: {
    enabled: true,
    template: 'feature',
    showSpotlightCard: true,
    showSlideToast: true,
    showInFeedCards: true,
    inFeedFrequency: 6,
    sparkleDensity: 'standard',
    badge: '✨ NEW FEATURE',
    title: 'Live Payout Proof Explorer',
    subtitle: 'Track real-time withdrawal receipts and transaction hashes across all firms.',
    firmName: 'EMPIRIAL',
    logoUrl: '/logos/empirial-trident-dark.png',
    useEmpirialLogo: true,
    graphicIcon: 'sparkles',
    discountTag: 'NOW LIVE',
    ctaText: 'Explore Payouts →',
    ctaLink: '/firms',
    benefits: [
      'Verified On-Chain & Bank Receipts',
      'Filter By Firm & Payout Method',
      'Updated Daily by Trader Community',
    ],
    backgroundImageUrl: '/images/ads/lucid-trident-head.png',
    backgroundPosition: 'watermark-right',
    backgroundMaskFade: true,
    glassOpacity: 25,
    sparkleAnimation: true,
    autoDismissSeconds: 5,
    toastPosition: 'bottom-right',
  },
  custom: {
    enabled: true,
    template: 'custom',
    showSpotlightCard: true,
    showSlideToast: true,
    showInFeedCards: true,
    inFeedFrequency: 6,
    sparkleDensity: 'standard',
    badge: '📢 ANNOUNCEMENT',
    title: 'Special Prop Trading Announcement',
    subtitle: 'Custom promotional headline or announcement customized by the EMPIRIAL management team.',
    firmName: 'EMPIRIAL Spotlight',
    logoUrl: '/favicon.ico',
    discountTag: 'FEATURED',
    ctaText: 'Learn More →',
    ctaLink: '/challenges',
    benefits: [
      'Verified Evaluation Guidelines',
      'Exclusive Community Benefits',
      '24/7 Dedicated Trader Support',
    ],
    backgroundImageUrl: '/images/ads/lucid-trident-head.png',
    backgroundPosition: 'watermark-right',
    backgroundMaskFade: true,
    glassOpacity: 25,
    sparkleAnimation: true,
    autoDismissSeconds: 5,
    toastPosition: 'bottom-right',
  },
};

export const DEFAULT_AD_CONFIG: AdvertisementConfig = {
  ...TEMPLATE_PRESETS.deal,
  updatedAt: 1,
};

const STORAGE_KEY = 'empirial_advertisement_config';

export function getStoredAdConfig(): AdvertisementConfig {
  if (typeof window === 'undefined') return DEFAULT_AD_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AD_CONFIG;
    return { ...DEFAULT_AD_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AD_CONFIG;
  }
}

export function saveStoredAdConfig(config: AdvertisementConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('empirial-ad-changed', { detail: config }));
  } catch (err) {
    console.warn('Failed to save ad config to localStorage:', err);
  }
}

