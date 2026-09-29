import { MarketTicker } from '@/lib/types';

export const MOCK_TICKERS: MarketTicker[] = [
  { symbol: 'EURUSD', price: '1.0854', change_24h: '0.12%', is_positive: true },
  { symbol: 'GBPUSD', price: '1.2678', change_24h: '-0.08%', is_positive: false },
  { symbol: 'XAUUSD', price: '2,342.15', change_24h: '1.45%', is_positive: true },
  { symbol: 'BTCUSD', price: '68,420.50', change_24h: '3.25%', is_positive: true },
  { symbol: 'US30', price: '39,120.80', change_24h: '-0.15%', is_positive: false }
];

export interface TrustStat {
  label: string;
  value: string;
  change: string;
}

export const TRUST_STATS: TrustStat[] = [
  { label: 'Evaluation Challenges Audited', value: '124,580+', change: '+12% MoM' },
  { label: 'Drawdown Solvency Score', value: '99.8%', change: 'Stable' },
  { label: 'Forensic Payout Proofs', value: '$15.2M+', change: 'Verified' }
];

export interface PartnerLogo {
  name: string;
  logo: string;
  badge: string;
}

export const PARTNER_LOGOS: PartnerLogo[] = [
  { name: 'NYS Capital', logo: '/logos/nys.png', badge: 'Dubai HQ' },
  { name: 'CK Capital', logo: '/logos/ck-capital.avif', badge: 'London HQ' },
  { name: 'Dolvero', logo: '/logos/dolvero.png', badge: 'Dubai HQ' },
  { name: 'Shark Funded', logo: '/logos/shark.png', badge: 'St. Vincent HQ' }
];

export interface Testimonial {
  id: string;
  initials: string;
  name: string;
  role: string;
  company: string;
  stars: number;
  text: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    initials: 'SC',
    name: 'Sarah Chen',
    role: 'Funded Forex Trader',
    company: 'Empirial Community',
    stars: 5,
    text: 'Empirial made finding the perfect prop firm challenge effortless. The side-by-side comparison of drawdown rules, payout splits, and spread telemetry saved me weeks of manual research.'
  },
  {
    id: 't-2',
    initials: 'MR',
    name: 'Marcus Rodriguez',
    role: 'Futures & Algo Trader',
    company: 'Empirial Community',
    stars: 5,
    text: 'The multi-firm rating system and community feedback on Empirial are unmatched. I filtered firms by instant funding, no-time-limit challenges, and verified payout proofs before committing capital.'
  },
  {
    id: 't-3',
    initials: 'ET',
    name: 'Emma Thompson',
    role: 'Prop Portfolio Manager',
    company: 'Empirial Community',
    stars: 5,
    text: 'Empirial\'s evaluation breakdown tool helped me discover prop firms offering 90%+ profit splits and zero news trading restrictions. The community giveaway events and promo discounts are awesome!'
  }
];

export interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  period: string;
  features: string[];
  ctaText: string;
  isPopular: boolean;
  badge?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'tier-free',
    name: 'Free Intelligence',
    subtitle: 'Essential prop directory parameters',
    price: 0,
    period: '/month',
    features: [
      'Access to verified firm listings',
      'Compare up to 2 challenges simultaneously',
      'Standard broker spread telemetry',
      'Community discussion board access'
    ],
    ctaText: 'Start Free Account',
    isPopular: false
  },
  {
    id: 'tier-pro',
    name: 'Pro Trader',
    subtitle: 'Institutional metrics & drawdown alarms',
    price: 19,
    period: '/month',
    features: [
      'Drawdown alert SMS & Discord webhooks',
      'Compare unlimited challenges side by side',
      'Priority access to high-tier coupon discount codes',
      'Advanced forensic proof audits',
      'Direct priority support desk access'
    ],
    ctaText: 'Go Pro Level',
    isPopular: true,
    badge: 'Best Value'
  },
  {
    id: 'tier-vip',
    name: 'VIP Elite Hub',
    subtitle: 'Direct telemetry API & institutional support',
    price: 49,
    period: '/month',
    features: [
      'Forex spread telemetry Webhook API feed',
      'Direct trader mentorship & risk audits',
      '1-on-1 strategy coaching sessions',
      'Exclusive VIP Telegram alpha channel group'
    ],
    ctaText: 'Access Elite Level',
    isPopular: false
  }
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is EMPIRIAL?',
    answer: 'EMPIRIAL is a prop trading intelligence platform that helps traders compare prop firms, evaluate drawdown & payout rules, aggregate verified discount codes, and access real-time spread telemetry.'
  },
  {
    question: 'Are the discount codes and offers verified?',
    answer: 'Yes! Every promo code, coupon, and exclusive deal listed on EMPIRIAL is verified directly with partner prop firms and updated daily.'
  },
  {
    question: 'How do I compare prop firm rules & drawdown models?',
    answer: 'You can use our Compare tool to inspect profit splits, trailing vs. static drawdowns, scaling plans, maximum lot sizes, and news trading rules side by side.'
  },
  {
    question: 'Is EMPIRIAL free to use for traders?',
    answer: 'Yes, accessing our firm comparison tools, telemetry data, discount codes, and community resources is completely free for all traders.'
  },
  {
    question: 'How do I join the EMPIRIAL trader community?',
    answer: 'You can join our Discord community to connect with funded traders, share strategy insights, and get real-time payout alerts.'
  }
];
