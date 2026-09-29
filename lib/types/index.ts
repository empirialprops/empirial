export interface Firm {
  id: string;
  name: string;
  slug: string;
  type?: 'prop_firm' | 'broker';
  logo_url: string;
  rating: number;
  review_count: number;
  max_allocation: string;
  profit_split_custom: string;
  payout_custom: string;
  discount_label_custom: string;
  coupon_code_custom: string;
  discount_pct?: number;
  badge_custom?: string;
  platforms: string;
  category: 'forex' | 'futures' | 'crypto' | 'instant-funding' | 'all';
  is_featured: boolean;
  is_verified: boolean;
  is_popular: boolean;
  trust_score: number;
  founded_year?: number;
  headquarters?: string;
  country?: string;
  years_working?: string;
  total_payouts?: string;
  avg_payout_time?: string;
  models?: string[];
  buy_url?: string;
  platform_ids?: string[];
  max_loss_pct?: number;
  daily_loss_pct?: number;
  profit_target_pct?: number;
  min_price?: number;
  consistency_rules_content?: string;
  consistency_rule?: string;
  payout_cycle?: string;
  payout_split_pct?: number | string;
  leverage?: string;
  firm_types?: string[];
  firm_rules_content?: string;
  restricted_countries?: string[];
  restricted_jurisdictions?: string[];
  payout_programs?: Array<{ name: string; schedule: string; split: string }>;
  description?: string;
}

export interface Challenge {
  id: string;
  firm_id: string;
  firm_name: string;
  firm_slug: string;
  firm_logo?: string;
  name: string;
  account_size: number;
  steps: number; // 1, 2, 3, or 0 (instant)
  price: number;
  original_price: number;
  profit_split_pct: number;
  daily_loss_limit_pct: number;
  max_loss_limit_pct: number;
  profit_target_pct: number;
  phase_2_target_pct?: number;
  min_trading_days: number;
  max_trading_days: string;
  payout_frequency: string;
  leverage: string;
  refundable_fee: boolean;
  buy_url: string;
  coupon_code: string;
  discount_pct: number;
  is_featured: boolean;
  is_best_seller: boolean;
  category: 'forex' | 'futures' | 'crypto' | 'instant-funding';
  rating?: number;
  review_count?: number;
  avg_payout?: string;
  consistency_rule?: string;
  max_risk_per_trade?: string;
  inactivity_period?: string;
  crypto_max_leverage?: string;
  crypto_max_open_positions?: string;
  crypto_total_notional_exposure?: string;
  news_trading?: string;
  overnight_weekend?: string;
  loss_type?: 'Trailing' | 'Static';
  ea_algo_trading?: string;
}

export interface Deal {
  id: string;
  firm_id: string;
  firm_name: string;
  firm_slug: string;
  firm_logo?: string;
  code: string;
  discount_label: string;
  discount_pct: number;
  description: string;
  category: 'forex' | 'futures' | 'crypto' | 'instant-funding';
  affiliate_url: string;
  clicks_count?: number;
  expires_at?: string;
  is_featured: boolean;
  is_verified: boolean;
  rating?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
  offer_type?: 'bogo' | 'cashback' | 'refund' | 'discount';
  offer_badge?: string;
  refund_pct?: number;
  cashback_pct?: number;
  is_bogo?: boolean;
  account_size?: string;
  eval_type?: string;
  profit_target?: string;
  drawdown?: string;
  profit_split?: string;
  original_price?: string;
  offered_price?: string;
  payout_frequency?: string;
}

export interface Payout {
  id: string;
  firm_id: string;
  firm_name: string;
  firm_logo?: string;
  trader_display_name: string;
  amount: number;
  currency: string;
  region: 'India' | 'UAE' | 'USA' | 'Europe' | 'Asia' | 'Global';
  concept: 'ICT / SMC' | 'Price Action' | 'Scalping' | 'Algorithmic EA' | 'Swing';
  account_size: string;
  payout_method: string;
  proof_image_url: string;
  is_verified: boolean;
  payout_date: string;
}

export interface BrokerSpread {
  id: string;
  broker_name?: string;
  pair: 'EURUSD' | 'GBPUSD' | 'USDJPY' | 'XAUUSD' | 'BTCUSD' | 'US30';
  spread_pips: number;
  commission_per_lot: number;
  account_type: string;
  platform: string;
  is_active?: boolean;
  feed_name?: string;
  status?: string;
}

export type EventCategory = 'giveaway' | 'event';
export type GiveawaySubCategory = 'tournament' | 'gaming' | 'learn-crack';
export type EventSubCategory = 'live-session' | 'bootcamp';
export type EventEntryType = 'free' | 'paid';

export interface Event {
  id: string;
  title: string;
  slug?: string;
  category: EventCategory; // 'giveaway' | 'event'
  sub_category: GiveawaySubCategory | EventSubCategory | string;
  type?: 'tournament' | 'bootcamp' | 'masterclass' | 'webinar' | 'gaming' | 'learn-crack' | 'live-session';
  entry_type: EventEntryType; // 'free' | 'paid'
  entry_fee?: number;
  
  // Firm association
  is_firm_sponsored: boolean;
  firm_id?: string;
  firm_name?: string;
  firm_logo?: string;
  host_firm?: string;
  host_name: string;
  
  prize_pool: string;
  prize_amount_usd?: number;
  
  start_date: string;
  end_date: string;
  countdown_label?: string;
  
  participants_count: number;
  max_participants?: number;
  
  popularity_score?: number;
  created_at?: string;
  updated_at?: string;
  
  registration_url: string;
  image_url?: string;
  poster_url?: string;
  is_active: boolean;
  is_featured?: boolean;
  description: string;
  rules?: string[];
  schedule?: string;
  prizes_breakdown?: Array<{ place: string; reward: string }>;
  
  // Discord & Custom Participation Tasks (Points 1 & 2)
  requires_discord?: boolean;
  discord_url?: string;
  registration_tasks?: Array<{
    id: string;
    title: string;
    type: 'discord' | 'follow' | 'form' | 'submit_id';
    action_url?: string;
    is_completed?: boolean;
  }>;
}

export interface Award {
  id: string;
  category_name: string;
  description: string;
  nominated_firms: Array<{ firm_id: string; firm_name: string; votes: number; logo_url?: string }>;
  year: number;
  is_voting_open: boolean;
}

export interface CommunityComment {
  id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  upvotes: number;
}

export interface CommunityPost {
  id: string;
  title: string;
  body: string;
  user_name: string;
  user_avatar?: string;
  is_verified: boolean;
  firm_tag?: string;
  category_tag: 'OFFERS' | 'KNOWLEDGE' | 'PSYCHOLOGY' | 'GENERAL' | 'RULES';
  upvotes: number;
  downvotes: number;
  views: number;
  comments_count: number;
  created_at: string;
  comments?: CommunityComment[];
}

export interface Review {
  id: string;
  firm_id: string;
  firm_name: string;
  user_name: string;
  full_name: string;
  title: string;
  body: string;
  overall_rating: number;
  trading_conditions: number;
  customer_care: number;
  user_friendliness: number;
  payout_process: number;
  is_verified_trader: boolean;
  upvotes: number;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  points_cost: number;
  reward_type?: 'voucher' | 'merchandise' | 'cashback';
  stock?: number;
  is_active?: boolean;
  description: string;
  voucher_code?: string;
  is_available?: boolean;
  category?: 'cash' | 'challenge' | 'commission' | string;
  reward_value?: string;
}

export interface MarketTicker {
  symbol: string;
  price: string;
  change_24h: string;
  is_positive: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  read_time: string;
  category: string;
  published_at: string;
  updated_at?: string;
  cover_image: string;
}

export type SocialCategory =
  | 'PROP FIRM OFFERS'
  | 'TRADING KNOWLEDGE'
  | 'TRADING PSYCHOLOGY'
  | 'ACCOUNT RULES'
  | 'TRADER INSIGHTS'
  | 'COMMUNITY';

export interface SocialLinkPreview {
  url: string;
  title?: string;
  description?: string;
  domain?: string;
  image?: string;
}

export interface SocialPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_handle: string;
  is_verified: boolean;
  author_role: 'firm' | 'trader' | 'analyst' | 'admin';
  firm_badge?: string;
  firm_logo?: string;
  content: string;
  media_urls?: string[];
  link_preview?: SocialLinkPreview;
  category: SocialCategory;
  upvotes: number;
  downvotes: number;
  upvoted_by: string[];
  downvoted_by: string[];
  created_at: string;
  is_pinned?: boolean;
}

export interface VerificationApplication {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  trading_experience: string;
  category: 'Prop Firm Official' | 'Funded Trader' | 'Market Analyst' | 'Educator';
  proof_links?: string;
  applied_at: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
}

