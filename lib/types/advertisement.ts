export type AdvertisementTemplate = 'deal' | 'rule-update' | 'feature' | 'custom';

export type AdGraphicIcon = 'sparkles' | 'shield' | 'flame' | 'gift' | 'bell' | 'trophy' | 'zap';

export interface AdvertisementConfig {
  id?: string;
  enabled: boolean;
  template: AdvertisementTemplate;
  
  // Display locations
  showSpotlightCard: boolean; // Homepage in-between section
  showSlideToast: boolean;     // Floating corner slide-in toast
  showInFeedCards: boolean;    // In-feed native sponsored cards in /challenges & /firms
  inFeedFrequency: number;     // e.g. 6 (show card every 6th item)
  
  // Identity & Imagery
  badge: string;              // e.g. "⚡ FLASH DEAL", "RULE UPDATE", "NEW FEATURE"
  title: string;              // Main headline
  subtitle: string;           // Supporting copy / description
  firmId?: string;            // Associated firm ID (if any)
  firmName?: string;          // Firm Name
  logoUrl?: string;           // Firm logo URL or graphic image URL
  useEmpirialLogo?: boolean;  // Automatically use official EMPIRIAL light/dark logo
  graphicIcon?: AdGraphicIcon; // Pre-built SVG icon when no logo is used
  customGraphicUrl?: string;  // Uploaded custom graphic / badge
  backgroundImageUrl?: string; // Background backdrop image (e.g. Trident or Lucid Glass texture)
  backgroundPosition?: 'watermark-right' | 'watermark-center' | 'cover' | 'contain-left'; // Alignment of background art
  backgroundMaskFade?: boolean; // Softly fade artwork away from text side to prevent contrast overlap
  glassOpacity?: number;      // Frosted backdrop opacity percentage (e.g. 10-50%)
  
  // Promotional Offer & Action
  couponCode?: string;        // Optional coupon code for 1-click copy
  discountTag?: string;       // e.g. "20% OFF", "ZERO RESTRICTIONS", "FREE PASS"
  ctaText: string;            // Button text (e.g. "Claim Deal →", "Read Rules →")
  ctaLink: string;            // Affiliate or internal target URL
  secondaryCtaText?: string;  // Optional secondary button
  secondaryCtaLink?: string;  // Optional secondary link
  benefits: string[];         // Bullet points shown on the spotlight card
  
  // Animation & Behavior
  sparkleAnimation: boolean;  // ✦ Sparkle star burst around perimeter
  sparkleDensity?: 'minimal' | 'standard' | 'vibrant'; // Sparkle star particle density (6, 12, or 18 stars)
  autoDismissSeconds: number; // 0 = permanent until closed; 3, 5, 8 etc.
  toastPosition: 'bottom-left' | 'bottom-right';
  
  updatedAt: number;
}

