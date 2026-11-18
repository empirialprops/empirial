# EMPIRIAL 2.0 — COMPLETE PLATFORM FEATURES SPECIFICATION
**Institutional Proprietary Trading Intelligence, Challenge Auditing & Trader Ecosystem**  
**Lead Architect & Founder:** ANURAJ FX  
**Hashtag:** `#BuildingEmpires`  
**Document Version:** 2.5.0 (Canonical Features Reference)  
**Status:** Complete & Exhaustive

---

## EXECUTIVE SUMMARY

**EMPIRIAL 2.0** is an institutional-grade proprietary trading evaluation and intelligence platform engineered to eliminate opacity, affiliate exploitation, and hidden rules in the prop trading industry. It serves as a unified command center for retail and professional prop traders across Forex, Futures, Crypto, and Instant Funding markets.

The platform provides:
1. **Forensic Challenge Auditing**: 13-parameter side-by-side comparison matrix covering drawdowns (trailing vs static), profit targets, profit splits, daily loss rules, consistency requirements, and refundable fee policies.
2. **Guaranteed Discount & BOGO Aggregator**: Hourly verified promo codes, Buy-One-Get-One (BOGO) specials, and cashback offers protected by physical copy-to-claim safeguards.
3. **Forensic Payout Verification Hub**: Transparent repository of audited trader payout receipts with screenshot proof modals, region classifications, and trading concept tagging.
4. **Multi-Broker Raw Spreads Matrix**: Live liquidity feed monitoring spreads, commissions, and total effective lot costs across major pairs, commodities, and crypto.
5. **Annual Trader Choice Awards**: Authentically tallies community votes with session-deduplication across multiple industry categories.
6. **State Hall Social & Knowledge Network**: Categorized social feed with verified creator badges, rich link previews, upvoting algorithms, and long-form strategy guides.
7. **Tournament & Giveaway Passport Hub**: Interactive event registration with Discord task verification, screenshot proof upload, flying trophy celebrations, and printable event passports.
8. **Trader Command Center (Profile Hub)**: Personal dashboard with purchased account tracking, review management, active event passports, two-way live support messaging, and a 15% referral/loyalty reward store.
9. **Institutional Admin Panel & CMS**: Complete management console featuring role-based access control (RBAC), a Batch Challenge Portal, review moderation desk with official firm replies, live spread manager, and a session-based flash sale popup controller.

---

## TABLE OF CONTENTS

1. [Platform Architecture & Technology Stack](#1-platform-architecture--technology-stack)
2. [Design System & Core Interaction Engines](#2-design-system--core-interaction-engines)
   - 2.1 [Monochrome Black & White Visual Language](#21-monochrome-black--white-visual-language)
   - 2.2 [Signature Atmospheric Tilted Light Ray](#22-signature-atmospheric-tilted-light-ray)
   - 2.3 [Copy-to-Claim Safeguard & Haptic Vibration Engine](#23-copy-to-claim-safeguard--haptic-vibration-engine)
   - 2.4 [Bayesian Rating & Multi-Criteria Trust Score Engine](#24-bayesian-rating--multi-criteria-trust-score-engine)
   - 2.5 [Comparison & 5-Axis Radar Chart Scoring Engine](#25-comparison--5-axis-radar-chart-scoring-engine)
   - 2.6 [Session-Based Welcome Offer Modal Engine](#26-session-based-welcome-offer-modal-engine)
   - 2.7 [Referral Attribution & 15% Commission Tracking Engine](#27-referral-attribution--15-commission-tracking-engine)
   - 2.8 [VIP Phone Capture & Dual-Channel Sync Engine](#28-vip-phone-capture--dual-channel-sync-engine)
3. [Complete Public User Features](#3-complete-public-user-features)
   - 3.1 [Homepage (`/`)](#31-homepage-)
   - 3.2 [Prop Firms Directory (`/firms`)](#32-prop-firms-directory-firms)
   - 3.3 [Deep Firm Profile Hub (`/firms/[slug]`)](#33-deep-firm-profile-hub-firmsslug)
   - 3.4 [13-Column Evaluation Challenges Matrix (`/challenges`)](#34-13-column-evaluation-challenges-matrix-challenges)
   - 3.5 [Verified Deals & BOGO Catalog (`/deals` & `/offers`)](#35-verified-deals--bogo-catalog-deals--offers)
   - 3.6 [Side-by-Side Comparison Engine & Radar Chart (`/compare`)](#36-side-by-side-comparison-engine--radar-chart-compare)
   - 3.7 [Forensic Payout Proofs Registry (`/payouts`)](#37-forensic-payout-proofs-registry-payouts)
   - 3.8 [Live Broker Spreads & Liquidity Matrix (`/spreads`)](#38-live-broker-spreads--liquidity-matrix-spreads)
   - 3.9 [Industry Trader Choice Awards 2026 (`/awards`)](#39-industry-trader-choice-awards-2026-awards)
   - 3.10 [State Hall Community Feed (`/blog`)](#310-state-hall-community-feed-blog)
   - 3.11 [Strategic Knowledge Guides (`/blog/[slug]`)](#311-strategic-knowledge-guides-blogslug)
   - 3.12 [Community Discussion Forums (`/community`)](#312-community-discussion-forums-community)
   - 3.13 [Trader Command Center (`/profile`)](#313-trader-command-center-profile)
   - 3.14 [Trader Tournaments & Event Hub (`/events`)](#314-trader-tournaments--event-hub-events)
   - 3.15 [Dynamic Market Category Hubs (`/[category]`)](#315-dynamic-market-category-hubs-category)
   - 3.16 [Institutional & Informational Pages](#316-institutional--informational-pages)
4. [Trader Authentication & Identity System](#4-trader-authentication--identity-system)
5. [Institutional Admin Panel & CMS Platform (`/admin`)](#5-institutional-admin-panel--cms-platform-admin)
   - 5.1 [Admin Authentication & Role-Based Access Control (RBAC)](#51-admin-authentication--role-based-access-control-rbac)
   - 5.2 [Executive Admin Dashboard (`/admin`)](#52-executive-admin-dashboard-admin)
   - 5.3 [Prop Firms Management Desk (`/admin/firms`)](#53-prop-firms-management-desk-adminfirms)
   - 5.4 [Challenge Accounts Desk & Batch Portal (`/admin/challenges`)](#54-challenge-accounts-desk--batch-portal-adminchallenges)
   - 5.5 [Deals & Promo Codes CMS (`/admin/deals`)](#55-deals--promo-codes-cms-admindeals)
   - 5.6 [Forensic Payouts Audit Desk (`/admin/payouts`)](#56-forensic-payouts-audit-desk-adminpayouts)
   - 5.7 [Reviews Moderation Desk & Firm Replies (`/admin/reviews`)](#57-reviews-moderation-desk--firm-replies-adminreviews)
   - 5.8 [State Hall & Creator Verification Desk (`/admin/social`)](#58-state-hall--creator-verification-desk-adminsocial)
   - 5.9 [Tournaments & Events Manager (`/admin/events`)](#59-tournaments--events-manager-adminevents)
   - 5.10 [Industry Awards Manager (`/admin/awards`)](#510-industry-awards-manager-adminawards)
   - 5.11 [Blog & Strategy CMS (`/admin/blog`)](#511-blog--strategy-cms-adminblog)
   - 5.12 [Live Broker Spreads Desk (`/admin/spreads`)](#512-live-broker-spreads-desk-adminspreads)
   - 5.13 [Market Ticker Rate Editor (`/admin/market-ticker`)](#513-market-ticker-rate-editor-adminmarket-ticker)
   - 5.14 [Two-Way Support Ticket Inbox (`/admin/messages`)](#514-two-way-support-ticket-inbox-adminmessages)
   - 5.15 [Referrals & Rewards Approval Desk (`/admin/referrals`)](#515-referrals--rewards-approval-desk-adminreferrals)
   - 5.16 [Page Builder CMS (`/admin/page-builder`)](#516-page-builder-cms-adminpage-builder)
   - 5.17 [Media & Storage Library (`/admin/media`)](#517-media--storage-library-adminmedia)
   - 5.18 [Audit Logs & Telemetry Viewer (`/admin/logs`)](#518-audit-logs--telemetry-viewer-adminlogs)
   - 5.19 [Global Settings & Offer Popup Controller (`/admin/settings`)](#519-global-settings--offer-popup-controller-adminsettings)
6. [Data Architecture & External Integrations](#6-data-architecture--external-integrations)
7. [SEO, Social Graph & Telemetry Specifications](#7-seo-social-graph--telemetry-specifications)
8. [Feature Matrix by User Persona](#8-feature-matrix-by-user-persona)

---

## 1. PLATFORM ARCHITECTURE & TECHNOLOGY STACK

```
┌────────────────────────────────────────────────────────────────────────┐
│                          EMPIRIAL 2.0 CLIENT                          │
│     Next.js 15.2 (App Router) • React 19 • TypeScript 5.8 • NextThemes │
├───────────────────────────────────┬────────────────────────────────────┤
│         UI & INTERACTION          │           DATA & STATE             │
│ • Tailwind CSS 3.4 (Monochrome)   │ • Firebase Client SDK 12.18        │
│ • Radix UI Primitives             │ • Custom Auth & Social Stores      │
│ • Framer Motion 13 (Transitions)  │ • LocalStorage & Session Caching   │
│ • NumberFlow Animated Counters    │ • Haptic / Clipboard APIs          │
│ • Lucide Icons 1.16               │ • Responsive Viewport Listeners    │
└───────────────────────────────────┴────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND SERVICES & APIS                         │
├───────────────────────────────────┬────────────────────────────────────┤
│          FIREBASE SUITE           │          SERVERLESS APIS           │
│ • Cloud Firestore (17 Collections)│ • /api/auth/discord (OAuth2)       │
│ • Firebase Auth (Google, Discord) │ • /api/auth/sync-sheet (Webhook)   │
│ • Firebase Storage (Assets/Proofs)│ • /api/admin/sync-all (Data Sync)  │
│ • Firebase Admin SDK 14.3         │ • /api/contact (Inquiry Routing)   │
└───────────────────────────────────┴────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL PLATFORM ECOSYSTEM                        │
│ • Google Sheets Automation (Live Leads & Telemetry Dispatch)           │
│ • Discord Gateway (Community Server & Identity Verification)           │
│ • Prop Firm Partner Affiliate Gateways (Safeguarded Redirects)         │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Dependency Manifest
- **Framework**: `next@15.2.1` with React Server Components (RSC) and Client Components.
- **UI Runtime**: `react@19.0.0` & `react-dom@19.0.0`.
- **Language**: `typescript@5.8.2` (Strict type definitions in `lib/types/index.ts`).
- **Styling**: `tailwindcss@3.4.17` with `@tailwindcss/typography` and monochrome theme tokens.
- **Icons**: `lucide-react@1.16.0` and `@radix-ui/react-icons`.
- **Motion & Dynamics**: `framer-motion@13.1.1` for exits, modals, and vibration shakes.
- **Rollup Counters**: `@number-flow/react@0.6.2` for smooth metric counting.
- **Theme Engine**: `next-themes@0.4.6` with persistent OLED dark and light modes.
- **Backend & Admin**: `firebase@12.18.0` and `firebase-admin@14.3.0`.

---

## 2. DESIGN SYSTEM & CORE INTERACTION ENGINES

### 2.1 Monochrome Black & White Visual Language
- **Color Discipline**: Strict institutional monochrome palette:
  - Deep OLED Blacks: `#000000`, `#0A0A0A`, `#131316`.
  - Pure Whites: `#FFFFFF`.
  - Cool Grayscale Neutrals: `zinc-900` (`#18181b`), `zinc-800` (`#27272a`), `zinc-500` (`#71717a`), `zinc-400` (`#a1a1aa`), `zinc-100` (`#f4f4f5`).
- **Surface Elevation Hierarchy**:
  - `elevation-base`: Canvas background (`bg-black` or `bg-white`).
  - `elevation-surface`: Navigation bar, subtle card backdrops (`bg-zinc-950/80` or `bg-zinc-50/80`).
  - `elevation-card`: Interactive feature cards (`bg-zinc-900/60` or `bg-white`).
  - `elevation-overlay`: Modals, dialogs, drawers (`bg-black/90` with blur).
- **Partner Brand Color Preservation**: While platform controls remain monochrome, all official partner logos (Alpha Capital, NYS Capital, FundedNext, CK Capital, Topstep, etc.) retain 100% of their authentic original brand colors with smooth `rounded-md` or `rounded-lg` corners.

### 2.2 Signature Atmospheric Tilted Light Ray
- **Visual Effect**: An ambient diagonal electric beam running through the background behind the hero and feature sections.
- **Specifications**:
  - Color: `#016fee` (Deep Electric Cyan/Blue).
  - Angle: Rotated between `28deg` and `32deg`.
  - Blur Radius: `70px` to `85px` Gaussian blur.
  - Blending: `mix-blend-screen` or `opacity-20` in dark mode, generating subtle depth without visual clutter.

### 2.3 Copy-to-Claim Safeguard & Haptic Vibration Engine
To eliminate lost affiliate discounts where traders mistakenly click through without applying the required promo code:
1. **Uncopied Interception**: If a user clicks "Buy Challenge" or "Claim Offer" without copying the code:
   - The button triggers a **7-frame high-frequency vibration shake** via Framer Motion: `x: [-6, 6, -6, 6, -3, 3, 0]`.
   - A high-visibility warning notification appears: *"Please copy the discount code first to guarantee your offer!"*
2. **Copy Action**:
   - Executes `navigator.clipboard.writeText(code)`.
   - Triggers physical device vibration on supported mobile devices (`navigator.vibrate([40, 50, 40])`).
   - Displays a 2000ms checkmark transition with *"COPIED!"* label.
   - Automatically unblocks direct affiliate redirect in a new tab (`target="_blank" rel="noopener noreferrer"`).
   - Asynchronously increments the deal's `clicks_count` in Firestore.

### 2.4 Bayesian Rating & Multi-Criteria Trust Score Engine
Trader reviews in EMPIRIAL 2.0 do not rely on basic single-star averages. They are computed using a multi-criteria weighted formula implemented in `lib/utils/rating-calculator.ts`:

$$\text{Overall Review Score} = \frac{\text{Trading Conditions} + \text{Customer Care} + \text{Payout Process} + \text{User Friendliness}}{4}$$

- **Criteria Breakdown**:
  1. *Trading Conditions* (Spreads, slippage, platform execution, server uptime).
  2. *Customer Care* (Discord/ticket responsiveness, resolution speed).
  3. *Payout Process* (SLA adherence, payment methods, transaction approvals).
  4. *User Friendliness* (Dashboard clarity, rules transparency, onboarding).
- **Bayesian Trust Score (0–100)**: Combines verified review counts, payout audit history, regulatory status, and operational longevity (e.g. 99/100 Trust Score for audited leaders).
- **Firm Alias Resolution**: Intelligent string resolver recognizing multi-name variations (e.g. linking "Sure Leverage", "SLF", and "Sure Leverage Funding" seamlessly).

### 2.5 Comparison & 5-Axis Radar Chart Scoring Engine
Implemented in `lib/utils/comparison-calc.ts`, this engine powers the `/compare` page by normalizing complex prop specifications into mathematical scores (0 to 100) rendered on a dynamic SVG radar chart:

```
                  Drawdown Safety (100)
                           ▲
                          / \
                         /   \
  Min Trading Days (100) ───── Payout Speed (100)
                       \     /
                        \   /
                         ▼
             Profit Split (100) ── Consistency (100)
```

1. **Max Allocation**: Scaled from 30 to 100 ($4M+ = 100, $2.5M = 95, $2M = 90, $1.5M = 80, $1M = 70, $500K = 50).
2. **Profit Split**: Scaled based on maximum profit percentage (100% = 100, 90% = 92, 85% = 82, 80% = 72, <80% = 55).
3. **Max Drawdown Limit**: Evaluates loss tolerance ($\ge 12\% = 100, 10\% = 90, 8\% = 78, 6\% = 60$).
4. **Consistency Rules**: "No Rule" / "Zero Rule" = 100 (Best for traders); restrictive rules = 75 or lower.
5. **Minimum Trading Days**: 0 Days required = 100 (Instant qualification); $\le 3$ Days = 85; $\le 5$ Days = 70; $>5$ Days = 50.
6. **Payout Frequency**: On-Demand / 6-Hour SLA = 100; Weekly = 90; Bi-Weekly = 80; Monthly = 60.

### 2.6 Session-Based Welcome Offer Modal Engine
- **Component**: `components/offer-poster-modal.tsx` backed by `lib/utils/offer-popup-store.ts`.
- **Frequency Capping**: Triggered only once per browser session via `sessionStorage` (with fallback to `localStorage` timestamp cooldowns).
- **Layout Adaptability**: Supports both "side-by-side" (poster image + text form) and "stacked" layouts.
- **Dynamic Elements**: Countdown timer to expiration, discount badge, coupon copy box with haptic trigger, benefit bullets, and direct purchase redirection.
- **Admin Remote Control**: Administrators can enable/disable the popup globally, change target firms, replace poster artwork, and edit promo text in real time.

### 2.7 Referral Attribution & 15% Commission Tracking Engine
- **Attribution Handler**: `components/referral-tracker.tsx`.
- **Query Parameter Interception**: Listens for incoming `?ref=CODE` parameters upon user arrival on any platform page.
- **Validation**: Verifies referral code authenticity against Firestore `users` collection.
- **Cookie & Local Storage Fallback**: Stores referral attribution for 30 days to credit referring traders even if registration occurs in a later session.
- **Multi-Event Conversion**:
  - *Tier 1 (Account Registration)*: Awards +100 Loyalty Points to both referrer and invitee.
  - *Tier 2 (Challenge Purchase)*: Calculates and credits a 15% commission ledger or equivalent point balance for challenge fee refunds.

### 2.8 VIP Phone Capture & Dual-Channel Sync Engine
- **Component**: `components/ui/phone-capture-modal.tsx`.
- **Trigger**: Appears post-authentication for traders who registered via Google or Discord without providing a phone number.
- **Lead Enrichment**: Collects WhatsApp/SMS contact information for flash deal alerts, tournament passes, and payout SMS receipts.
- **Dual-Channel Dispatch**:
  1. Updates the user's Firestore document (`users/{uid}.phoneNumber`).
  2. Dispatches an asynchronous HTTP webhook to Google Sheets via `lib/firebase/auth-sync.ts` (`dispatchUserToSheet`), populating external CRM sheets in real time.

---

## 3. COMPLETE PUBLIC USER FEATURES

### 3.1 Homepage (`/`)
- **Hero Section**:
  - Main headline with monochrome gradient text: *"EMPIRIAL — Building Empires"*.
  - Subtitle highlighting platform mission and institutional audit standards.
  - Primary CTA button: *"GRAB OFFERS"* (routes to `/deals`).
  - Secondary CTA button: *"Join Discord"* (routes to VIP Discord community).
  - Atmospheric tilted light ray behind hero backdrop.
- **Live Market Ticker Bar**:
  - Real-time financial ticker bar displaying `EURUSD`, `GBPUSD`, `USDJPY`, `XAUUSD`, `BTCUSD`, and `US30`.
  - Shows price, 24-hour percentage change, and positive/negative indicators (`+1.42%`, `-0.85%`).
  - Dynamic admin overrides via `/admin/market-ticker`.
- **Bento Dashboard Feature Showcase**:
  - Interactive multi-panel grid highlighting Core Auditing, Verified Discounts, Live Spreads, and Tournament Passports.
- **Verified Prop Firms Marquee**:
  - Infinite auto-scrolling logo marquee showcasing audited prop firm partners.
  - Interactive tooltip cards on hover revealing firm name, trust score, and max allocation.
- **Home Challenges Showcase**:
  - Interactive category selector switching between Forex, Futures, Crypto, and Instant Funding challenges.
  - Direct price comparison with discount tags and one-click purchase triggers.
- **Featured Deals & Flash Sales**:
  - Highlights top 3 limited-time BOGO and high-discount promotions with live countdown clocks.
- **3-Tier Pricing & Challenge Comparison Cards**:
  - 3-column card grid comparing entry-level, mid-tier, and institutional evaluation accounts.
  - Copy-code safeguard with shaking vibration animation.
- **Animated Trust Statistics Counter**:
  - Implemented using `@number-flow/react` for smooth animated digit rolling:
    - *50K+* Active Traders
    - *40+* Audited Prop Firms
    - *12K+* Community Reviews
    - *150+* Active Evaluation Challenges
- **Trader Testimonials Grid**:
  - Verified trader feedback cards with star ratings, trader avatars, firm affiliations, and expandable review drawers.
- **Platform FAQ Accordion**:
  - High-converting 5-question interactive accordion covering evaluation guarantees, refund policies, and payout SLAs.
- **VIP Discord Community Banner**:
  - Direct invitation block with member counts, active mentors, and daily trading signal updates.
- **Session Welcome Offer Poster Modal**:
  - Instant flash sale modal with copy-first discount enforcement.

---

### 3.2 Prop Firms Directory (`/firms`)
- **Header & Search Bar**: Real-time fuzzy text search filtering firms by name, country, or supported platform.
- **Multi-Facet Category Tabs**:
  - *All Firms*
  - *Forex Prop Firms*
  - *Futures Prop Firms*
  - *Crypto Prop Firms*
  - *Instant Funding Firms*
- **Comprehensive Platform Filter**:
  - Multi-select pills for 11 trading platforms: `cTrader`, `MetaTrader 5 (MT5)`, `MetaTrader 4 (MT4)`, `TradeLocker`, `Match-Trader`, `NinjaTrader`, `Tradovate`, `TradingView`, `Bookmap`, `ATAS`, `Deepcharts`, `MultiCharts`.
- **Evaluation Model Filters**:
  - `1-Step Challenge`
  - `2-Step Evaluation`
  - `3-Step Challenge`
  - `Instant Funding (No Evaluation)`
- **Minimum Allocation Slider**: Interactive slider filtering firms with max capital scaling from `$0` to `$2,500,000+`.
- **Sorting Engine**:
  - *Most Popular*
  - *Highest Trust Score*
  - *Highest Allocation*
  - *Best Value*
  - *Highest Trader Rating*
- **Interactive Firm Cards**:
  - Official brand logo with preserved corporate colors.
  - Verified Audited badge and Trust Score indicator (e.g. `99/100`).
  - Headquarter location and operational years badge (`3+ Years`).
  - Metric badges: Max Allocation, Profit Split gauge, Payout frequency (`Bi-Weekly / 6hr SLA`).
  - Expandable Specifications Drawer: Shows instant overview of rules, allowed instruments, and prohibited EAs without navigating away.
  - Copy-to-Claim safeguard button with coupon clipboard copy and direct affiliate routing.

---

### 3.3 Deep Firm Profile Hub (`/firms/[slug]`)
A dedicated five-tab institutional dossier for every listed prop firm:
- **Identity Banner**:
  - Large firm brand logo, company name, verification checkmark.
  - Trust Score badge, headquarters country, founded year.
  - Supported platform list and active exclusive discount code.
  - One-click *"Compare Specs"* button loading this firm into the side-by-side comparison engine.
- **Highlight Metric Ribbon**:
  - 4 key metrics: Maximum Funded Capital, Profit Split (Up to 90%), Payout Turnaround (6 Hours), Overall Rating.
- **5 Dedicated Sub-Hub Tabs**:
  1. **Tab 1: Rules & Specs Overview**:
     - *Consistency & Risk Rules*: Detailed breakdown of lot consistency, profit consistency, and bracket order rules.
     - *Drawdown Mechanics*: Explicit clarification between balance-based static drawdown and equity-based trailing drawdown.
     - *Payout Scaling Program*: Comprehensive milestone table showing capital increases and profit split bumps (e.g. +25% capital every 3 months).
     - *Restricted Jurisdictions*: Pill list of restricted countries (e.g. US, Iran, North Korea, Cuba).
     - *Active Promo Spotlight*: Highlighted BOGO or discount deal card.
  2. **Tab 2: Challenges Catalog**:
     - Filterable grid of all evaluation accounts provided by this firm.
     - Shows account sizes ($5K to $500K+), steps, profit targets, daily drawdown, max loss, prices, and direct checkout links.
  3. **Tab 3: Promo Deals & Coupons**:
     - Dedicated catalog of all active coupon codes, BOGO vouchers, and cashback rates specifically for this firm.
  4. **Tab 4: Verified Trader Reviews**:
     - Filter reviews by rating or criteria.
     - Displays trader badges, review timestamps, criteria breakdowns, and official firm executive responses.
  5. **Tab 5: Forensic Payout Proofs**:
     - Audited payout proofs belonging specifically to traders funded by this firm.

---

### 3.4 13-Column Evaluation Challenges Matrix (`/challenges`)
The central auditing table of EMPIRIAL 2.0, providing side-by-side forensic analysis across 13 standardized parameters:
- **Filtering & Search Drawer**:
  - Text search by firm or challenge name.
  - Multi-select firm checklist with brand logos.
  - Account size filter pills: `$5,000`, `$10,000`, `$25,000`, `$50,000`, `$100,000`, `$200,000`, `$300,000`, `$500,000+`.
  - Steps filter (`1-Step`, `2-Step`, `3-Step`, `Instant Funding`).
  - Market category tabs (`Forex`, `Futures`, `Crypto`, `Instant`).
  - Sorting: Lowest Price, Highest Capital, Profit Target, Best Value.
- **13 Standardized Auditing Columns**:
  1. **Firm Identity**: Official logo, firm name, and trust badge.
  2. **Account Capital**: Nominal funded balance ($5K to $1M).
  3. **Challenge Model**: Name and steps required (1-Step, 2-Step, Instant).
  4. **Effective Price**: Discounted checkout price with original price strikethrough.
  5. **Profit Split**: Circular SVG visual gauge showing trader profit entitlement (e.g. 80%, 90%, 100%).
  6. **Daily Loss Limit**: Maximum permitted loss per 24-hour cycle (e.g. 3%, 4%, 5%).
  7. **Maximum Drawdown**: Total loss limit and loss calculation type (`Trailing Equity` vs `Static Balance`).
  8. **Profit Target**: Target percentage for Phase 1 and Phase 2 (e.g. Phase 1: 8%, Phase 2: 5%).
  9. **Trading Days Requirements**: Minimum trading days (0 days = Best) and maximum allowed calendar days.
  10. **Payout Schedule**: Turnaround frequency (e.g. First payout after 14 days, then bi-weekly or on-demand with 6hr SLA).
  11. **Leverage Allocation**: Maximum leverage across FX pairs (e.g. 1:100), Metals (1:30), Indices (1:20), and Crypto (1:2).
  12. **Refundable Fee Status**: 100% or 200% fee reimbursement badge upon passing evaluation and receiving first payout.
  13. **Action Button**: Combined copy-code button and direct checkout trigger with vibration safeguard.

---

### 3.5 Verified Deals & BOGO Catalog (`/deals` & `/offers`)
- **Hourly Audit Telemetry Badge**: *"100% VERIFIED DISCOUNTS AUDITED HOURLY"*.
- **Category Filter Tabs**:
  - *All Deals*
  - *BOGO Deals* (Buy One Get One / Two Free specials)
  - *Cashback Offers* (Direct cash rebates on challenge fees)
  - *Fee Refunds* (100% to 200% fee reimbursements)
  - *Direct Discounts* (-10% to -80% coupon codes)
- **Deal Card Features**:
  - Official firm logo, firm name, and star rating.
  - Large discount highlight badge (e.g. `BOGO: Buy 100K Get 100K FREE`, `UP TO 80% OFF`).
  - Clear promo terms description and expiration countdown clock.
  - Live click counter tracking community engagement.
  - Interactive coupon box with haptic copy button.
  - *"Claim Offer"* button with copy-first enforcement.

---

### 3.6 Side-by-Side Comparison Engine & Radar Chart (`/compare`)
- **Dual Comparison Modes**:
  - *Compare Prop Firms* (Evaluates macro firm policies, scaling, trust, allocation).
  - *Compare Challenge Accounts* (Evaluates micro challenge rules, drawdown, targets, prices).
- **Multi-Entity Selector**: Up to 4 simultaneous comparison slots with search dropdown and remove buttons.
- **Interactive 5-Axis SVG Radar Chart**:
  - Dynamically calculates and renders comparative polygons across 5 core dimensions:
    - *Drawdown Safety*
    - *Payout Speed & SLA*
    - *Profit Split Generosity*
    - *Spread & Commission Efficiency*
    - *Trust & Audit Score*
  - Color-coded multi-polygon overlays for instant visual contrast.
- **Deep 20+ Parameter Comparison Grid**:
  - Side-by-side table rows highlighting winning metrics in bold.
  - Covers: Price per $1K capital, Drawdown type, News trading rules, Weekend holding, EA/Algo permissions, Inactivity limits, Daily loss reset time, Scaling velocity.

---

### 3.7 Forensic Payout Proofs Registry (`/payouts`)
- **Total Audited Payout Ticker**: Animated rollup counter displaying audited payout volume (`$15,280,000+`).
- **Multi-Filter Toolbar**:
  - *Region Filter*: India, UAE, USA, Europe, Asia, Global.
  - *Trading Concept*: ICT / SMC (Smart Money Concepts), Price Action, Scalping, Algorithmic EA, Swing Trading.
  - *Firm Selector*: Filter payout proofs by specific prop firm.
- **Payout Proof Cards**:
  - Verified trader display name, avatar, and audited badge.
  - Payout amount in USD with formatted currency display.
  - Payment method badge (Rise, Deel, Crypto/USDT TRC20, Bank Wire).
  - Trading concept tag and funded account size.
  - Screenshot Proof Preview: Clicking opens a high-definition lightbox zoom modal for inspecting cryptographic transaction hashes and banking receipts.
- **Public Proof Submission Modal**:
  - Allows verified traders to upload payout receipts, transaction IDs, firm details, and screenshots for administrative audit.

---

### 3.8 Live Broker Spreads & Liquidity Matrix (`/spreads`)
- **Purpose**: Provides real-time transparency into the actual trading conditions and execution costs offered by prop firm liquidity providers.
- **Instrument Filter Tabs**:
  - `All Instruments`
  - `EURUSD` (Forex Major)
  - `GBPUSD` (Forex Major)
  - `USDJPY` (Forex Major)
  - `XAUUSD` (Spot Gold)
  - `BTCUSD` (Cryptocurrency)
  - `US30` (Dow Jones Index)
- **Spreads Table Metrics**:
  - Liquidity Provider / Broker Name.
  - Instrument Symbol.
  - Raw Spread in Pips (e.g. `0.1 pips`, `0.8 pips`).
  - Commission per Standard Lot (e.g. `$3.00`, `$5.00`, `$0.00`).
  - **Effective Cost per Lot Formula**: Automatically computes total round-turn trading cost:
    $$\text{Effective Cost} = (\text{Spread Pips} \times 10) + \text{Commission per Lot}$$
  - Account Type (`Raw Spread`, `Zero Commission`, `High Stakes`).
  - Trading Platform (`cTrader`, `MT5`, `Match-Trader`).
  - Feed Status badge (`Active Live Feed`).

---

### 3.9 Industry Trader Choice Awards 2026 (`/awards`)
- **Annual Community Voting Hub**: Democratizes the recognition of prop firms through verified trader votes.
- **Award Categories Grid**:
  - *Best Overall Prop Firm of the Year 2026*
  - *Fastest & Most Reliable Payouts 2026*
  - *Best Futures Prop Firm 2026*
  - *Best Customer Support & Trader Care 2026*
  - *Most Generous Scaling Plan 2026*
  - *Best Instant Funding Firm 2026*
- **Interactive Voting Mechanics**:
  - Each nominee displays company logo, firm name, live vote counter, and percentage share progress bar.
  - Authenticated session checking: Enforces **1 vote per category per user**.
  - Clicking *"Vote"* triggers an optimistic UI update, increments votes in Firestore, and locks the category with a *"Voted"* badge.

---

### 3.10 State Hall Community Feed (`/blog`)
- **Social Network for Prop Traders**: Community feed connecting traders, market analysts, and verified prop firm executives.
- **Category Navigation**:
  - `ALL POSTS`
  - `PROP FIRM OFFERS`
  - `TRADING KNOWLEDGE`
  - `TRADING PSYCHOLOGY`
  - `ACCOUNT RULES`
  - `TRADER INSIGHTS`
  - `COMMUNITY`
- **Feed Sorting Algorithm**:
  - *Popular*: Ranks posts based on upvote velocity, comments, and engagement score.
  - *Latest*: Chronological real-time post stream.
- **Post Author Badges**:
  - `Prop Firm Official` (Verified company representative).
  - `Funded Trader` (Audited trader with active funded account).
  - `Market Analyst` (Certified technical/macro analyst).
  - `Admin` (EMPIRIAL platform executive).
- **Interactive Post Features**:
  - Author avatar, full name, handle (`@anuraj_fx`), verification checkmark.
  - Markdown text formatting and image attachments.
  - Rich OpenGraph Link Previews (auto-fetches thumbnail, title, and domain).
  - Upvote & Downvote counters with authenticated state memory.
  - Quick share button copying post permalink.
- **Creator Verification Application Modal**:
  - Allows traders to apply for creator verification by submitting experience, trading records, and proof links.

---

### 3.11 Strategic Knowledge Guides (`/blog/[slug]`)
- **Long-Form Strategy & Education Articles**: In-depth institutional trading guides authored by ANURAJ FX and market mentors.
- **Article Header**: Category badge, estimated read time (e.g. `8 min read`), published timestamp, author bio with avatar and role.
- **Full Markdown Content Engine**: Supports headings, code blocks, mathematical drawdown formulas, callout alerts, and image figures.
- **Embedded Challenge Matrix CTA**: Contextual challenge comparison cards embedded at the conclusion of articles.

---

### 3.12 Community Discussion Forums (`/community`)
- **Threaded Trader Discussions**: Open forum organized by category tags (`OFFERS`, `KNOWLEDGE`, `PSYCHOLOGY`, `GENERAL`, `RULES`).
- **Post Composer**: Modal enabling users to submit new discussion threads with tags and firm references.
- **Thread Anatomy**:
  - Thread title, author name, verified status, view counter, comment counter.
  - Upvote/Downvote system.
  - Nested comment threads with real-time reply submission.

---

### 3.13 Trader Command Center (`/profile`)
The authenticated user dashboard providing complete visibility into trading accounts, community engagement, and reward redemptions:
- **Header Profile Card**:
  - Trader Avatar, Display Name, Unique Trader ID (`EMP-90428`), Country Flag, Discord Handle, Bio.
  - Loyalty Points Counter (e.g. `4,850 pts`).
  - Edit Profile modal (updates display name, bio, Discord handle, avatar URL).
- **5 Sub-Dashboards**:
  1. **Dashboard (Purchased Accounts Tracker)**:
     - Tracks active evaluation and funded accounts purchased by the trader.
     - Displays: Firm Logo, Account Tier (e.g. `NYS Capital $100K 1-Step`, `Topstep $150K Combine`), Account Number, Order ID, Platform, Purchase Date.
     - Status badges: `Active Evaluation`, `Phase 2 In Progress`, `Passed / KYC`, `Funded Account`, `Scaling Active`.
  2. **My Reviews**:
     - Complete history of reviews submitted by this trader.
     - Status filters: `Published`, `Pending Moderation`, `Replied by Firm`.
     - Displays official firm replies and upvotes received from the community.
  3. **Registered Events & Tournament Passports**:
     - Lists active tournament registrations.
     - Shows Discord verification status and tournament countdown clocks.
     - Printable **Event Ticket Passport** (e.g. `PASS: REG-2026-X01`) with tournament rules.
  4. **Support Tickets (Live Two-Way Chat Desk)**:
     - Allows traders to open direct support tickets with priority selection (`Low`, `Medium`, `High`, `Urgent`) and category tags (`Evaluation Query`, `Affiliate Discount`, `Payout Issue`, `Technical Bug`).
     - Real-time two-way chat thread exchanging messages with EMPIRIAL administrators.
  5. **Referrals & Rewards Store**:
     - Unique referral code and one-click copy share link (`empirial.com?ref=CODE`).
     - Referral Performance Dashboard: Total Link Clicks, Registered Referrals, Challenge Purchases, Total Commission Earned ($).
     - Referral Invitees Table: Invitee Name, Email, Joined Date, Status (`Registered` vs `Challenge Purchased`), Commission Earned.
     - **Loyalty Rewards Redemption Catalog**:
       - *$100 Challenge Fee Reimbursement* (5,000 pts)
       - *Free $25,000 Evaluation Account Voucher* (8,500 pts)
       - *EMPIRIAL Executive Trader Hoodie* (3,200 pts)
       - *1-on-1 Mentorship Session with ANURAJ FX* (15,000 pts)
       - Interactive *"Redeem Reward"* button debiting user points balance.

---

### 3.14 Trader Tournaments & Event Hub (`/events`)
- **Event Categories**:
  - *Giveaways & Tournaments* (Competitive demo combines with cash and funded account prizes).
  - *Gaming & Esports Combines* (High-frequency gamified trading challenges).
  - *Learn & Crack Sessions* (Educational hackathons).
  - *Live Trading Bootcamps* (Multi-day intensive mentorship).
- **Event Card Anatomy**:
  - High-resolution poster artwork.
  - Sponsoring firm logo and host attribution (`NYS Capital & EMPIRIAL`).
  - Total Prize Pool Highlight (e.g. `$250,000 in Accounts + $50,000 Cash`).
  - Start & End Dates with live countdown badge (`Starts in 4 Days`).
  - Entry Fee status (`FREE ENTRY` or entry fee in USD).
  - Registered participant counter and maximum capacity bar.
  - Comprehensive breakdown of prizes (1st Place, 2nd Place, 3rd Place, Top 50 rewards).
- **Interactive Registration Flow**:
  - Enforces Discord Task Verification (e.g. *"Join Discord"*, *"Submit cTrader ID"*).
  - File uploader for submitting screenshot proof of qualification.
  - Clicking *"Register Now"* triggers an animated flying trophy celebration and generates a unique Ticket Passport (`PASS: REG-2026-X01`).

---

### 3.15 Dynamic Market Category Hubs (`/[category]`)
Dynamic landing pages targeting specialized market sectors:
- `/forex`: Dedicated Forex prop firm rankings, raw spreads, and MT5/cTrader challenges.
- `/futures`: Dedicated Futures combines, Tradovate/NinjaTrader platforms, CME contract specs, and trailing drawdown audits.
- `/crypto`: Dedicated 24/7 crypto prop evaluation accounts with high leverage on BTC/ETH and Bybit/Binance execution feeds.
- `/instant-funding`: Dedicated direct-funding accounts requiring zero evaluation phases.
- **Nested Sub-Routes**:
  - `/[category]/challenges`: Filtered evaluation matrix for that specific asset class.
  - `/[category]/deals`: Filtered promo codes and BOGO specials for that specific asset class.

---

### 3.16 Institutional & Informational Pages
- **About Us (`/about`)**: Platform founding story, ANURAJ FX leadership, institutional audit philosophy, and commitment to transparency.
- **How It Works (`/how-it-works`)**: 3-step trader roadmap (Compare $\to$ Claim Discount $\to$ Get Funded).
- **Prop Rule Encyclopedia (`/rules`)**: In-depth compliance handbook explaining equity drawdowns, trailing vs static thresholds, lot consistency equations, high-impact news restrictions, and weekend holding rules.
- **Historical Rule Changes (`/rule-changes`)**: Real-time changelog tracking policy modifications across major prop firms (e.g. drawdown rule adjustments, platform migrations).
- **Transparency & Anti-Bias (`/transparency`)**: 4 Fundamental Commitments governing auditing impartiality, affiliate disclosure, and anti-bias principles.
- **Leaderboard Hall of Fame (`/leaderboard`)**: Top 8 audited prop traders ranked on a visual podium with audited payouts, win rates, and preferred firms.
- **Loyalty Program (`/loyalty`)**: Milestone tier progression (`Novice`, `Pro`, `Elite`, `Sovereign`) detailing how points are earned and redeemed.
- **Affiliate Program (`/affiliate-program`)**: 15% partner commission structure, tier bonuses, and marketing assets.
- **Free Demo Accounts (`/demo-accounts`)**: Curated links to free 14-day practice combine trials.
- **Contact & Audit Inquiries (`/contact`)**: Multi-topic contact form routing requests to Partnership, Audit Verification, or General Inquiries.
- **Careers (`/careers`)**: Openings for financial analysts, community mentors, and developers.
- **Legal Compliance**: Complete Privacy Policy (`/privacy-policy`) and Terms of Service (`/terms-and-conditions`).

---

## 4. TRADER AUTHENTICATION & IDENTITY SYSTEM

EMPIRIAL 2.0 features a unified multi-provider authentication architecture implemented in `components/auth-modal.tsx`, `lib/utils/auth-store.ts`, and `lib/firebase/config.ts`:

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTH MODAL INTERACTION                    │
├───────────────────────────────┬──────────────────────────────┤
│ 1. One-Click Google Sign-In   │ • Firebase GoogleAuthProvider│
│ 2. Discord OAuth2 Connect     │ • /api/auth/discord Callback │
│ 3. Email / Magic Link Sign-In │ • Secure credential flow     │
│ 4. Development Sandbox Mock   │ • Fast test session switch   │
└───────────────────────────────┴──────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                  USER PROFILE RECORD (FIRESTORE)             │
│ • uid: Unique Firebase Auth Identifier                       │
│ • email: Verified trader email address                       │
│ • displayName: Trader name or Discord handle                 │
│ • traderId: Formatted ID (e.g. EMP-90428)                    │
│ • photoURL: Avatar image                                     │
│ • loyaltyPoints: Point ledger balance (e.g. 4,850 pts)       │
│ • referralCode: Personal 8-character referral string         │
│ • country: User location                                     │
│ • bio: Trader trading style & bio                            │
│ • discordHandle: Discord tag for tournament sync             │
│ • phoneNumber: WhatsApp / SMS contact (optional)             │
└──────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│              AUTOMATED GOOGLE SHEETS DISPATCH                │
│ • Webhook syncs registration to external operations sheet    │
│ • Triggers WhatsApp VIP onboarding if phone number present   │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. INSTITUTIONAL ADMIN PANEL & CMS PLATFORM (`/admin`)

The EMPIRIAL 2.0 Admin Panel is an institutional-grade Content Management System (CMS) and operations console designed for administrators, editors, and moderators:

### 5.1 Admin Authentication & Role-Based Access Control (RBAC)
- **Dedicated Route**: `/admin/login`.
- **Session Security**: Separate session lock independent of public user authentication.
- **4 Granular Admin Roles** (`/admin/roles`):
  1. *Super Admin*: Unrestricted platform access (manage admin roles, view audit logs, wipe/restore database, change global configurations).
  2. *Editor*: Manage Prop Firms, Challenge Accounts, Deals, Blog Articles, Page Builder, and Media Library.
  3. *Moderator*: Moderate Trader Reviews, State Hall Social Posts, Creator Applications, and Payout Proofs.
  4. *Support Agent*: Handle Two-Way Support Tickets, manage referral inquiries, and view user account records.

### 5.2 Executive Admin Dashboard (`/admin`)
- **Live Platform KPI Grid**:
  - Total Listed Prop Firms count.
  - Active Challenge Accounts count.
  - Active Promo Deals & Coupons count.
  - Verified Payout Proofs count.
  - Community Reviews count.
  - Total Registered Traders count.
- **Quick Action Bar**: Shortcuts to create new firm, launch batch challenge generator, publish announcement, or audit pending payouts.
- **System Health & Sync Status**: Real-time status monitors for Firestore connections, Firebase Storage, and Google Sheets sync webhooks.

### 5.3 Prop Firms Management Desk (`/admin/firms`)
- **Full CRUD Operations**: Create, Read, Update, Delete prop firm documents.
- **Profile Configuration Fields**:
  - Firm Name, URL Slug, Firm Type (`prop_firm` vs `broker`).
  - Logo URL (with direct upload to Firebase Storage).
  - Rating & Review count manual overrides.
  - Trust Score (0–100), Founded Year, Headquarters, Country.
  - Max Allocation, Profit Split custom label, Payout schedule SLA.
  - Discount label, active coupon code, discount percentage.
  - Supported platforms checklist (`cTrader`, `MT5`, `TradeLocker`, `Match-Trader`, etc.).
  - Market category (`forex`, `futures`, `crypto`, `instant-funding`, `all`).
  - Feature Flags: `is_featured`, `is_verified`, `is_popular`.
  - Rich Text Editors: Consistency rules content, General firm rules content.
  - Restricted Jurisdictions pill selector.
  - Payout Scaling Roadmap table builder.
- **Relational Cascade Engine**: Editing a firm's name or logo automatically updates all associated challenges, deals, and payouts across Firestore.

### 5.4 Challenge Accounts Desk & Batch Portal (`/admin/challenges`)
- **Single Challenge CRUD**: Form for configuring individual challenge tiers.
- **Batch Challenge Portal (`BatchChallengePortal.tsx`)**:
  - High-productivity bulk generator designed to create complete evaluation catalogs in seconds.
  - **Account Size Presets**: Quick-toggle presets for `$5K`, `$10K`, `$15K`, `$25K`, `$50K`, `$100K`, `$200K`, `$300K`, `$500K`, and `$1M`.
  - **Uniform Rules Configuration**: Define steps, leverage, daily drawdown, max drawdown, and profit targets once; they automatically propagate across all selected account sizes.
  - **Global Discount Slider**: Set a discount percentage (e.g. 20% OFF); original prices and discounted prices calculate automatically across all tiers.
  - **Spreadsheet Import / Export**: Export entire challenge matrices to CSV/JSON or import external spreadsheets for batch creation.
  - **Transactional Batch Writing**: Writes dozens of challenge documents to Firestore in a single atomic batch operation.

### 5.5 Deals & Promo Codes CMS (`/admin/deals`)
- **Deal Management**: Add, edit, disable, or delete discount coupons and BOGO offers.
- **Offer Types**: `discount` (Direct percentage), `bogo` (Buy One Get One/Two Free), `cashback` (Cash rebate), `refund` (Fee reimbursement).
- **Engagement Telemetry**: View live click tracking counts for every individual deal to measure conversion efficacy.
- **Expiration Date Picker**: Schedule automated deal expiration with live frontend countdowns.

### 5.6 Forensic Payouts Audit Desk (`/admin/payouts`)
- **Audit Queue**: Centralized desk reviewing public trader payout submissions.
- **Verification Actions**:
  - *Approve & Verify*: Marks payout as verified with public audit badge.
  - *Reject / Delete*: Removes fraudulent or unverified submissions.
  - *Metadata Edit*: Modify payout amount, trader display name, region, trading concept, and payment rail.
  - *Receipt Uploader*: Upload verified transaction receipts and bank proofs to Firebase Storage.

### 5.7 Reviews Moderation Desk & Firm Replies (`/admin/reviews`)
- **Moderation Workflow**: Filter reviews by `Pending`, `Published`, or `Flagged`.
- **Review Verification**: Toggle `is_verified_trader` badge based on audited proof of purchase.
- **Official Firm Reply Desk**: Author and attach official company responses directly below trader reviews.

### 5.8 State Hall & Creator Verification Desk (`/admin/social`)
- **Creator Verification Queue**: Review applications submitted by traders, educators, and analysts seeking verified creator checkmarks.
- **Moderation Actions**: Approve badge, reject application, or revoke existing creator status.
- **Announcement Broadcaster**: Compose and publish high-priority pinned announcements across the State Hall social feed.
- **Post Moderation**: Pin quality discussions to the top or delete spam posts.

### 5.9 Tournaments & Events Manager (`/admin/events`)
- **Event Creation**: Schedule tournaments, giveaways, bootcamps, and gaming combines.
- **Prize Breakdown Editor**: Configure structured reward tiers (1st Place, 2nd Place, 3rd Place, Top 50).
- **Task Verification Rules**: Configure required Discord joins, follow actions, and screenshot proof uploads.
- **Participant Inspector**: View registered trader roster and export participant ticket passports.

### 5.10 Industry Awards Manager (`/admin/awards`)
- **Category Configuration**: Create and edit award categories for the annual Trader Choice Awards.
- **Nominee Management**: Add/remove nominated prop firms, assign official brand logos, and initialize voting.
- **Vote Tallying & Auditing**: Monitor live vote tallies, inspect voter user IDs to prevent vote manipulation, and open/close voting.

### 5.11 Blog & Strategy CMS (`/admin/blog`)
- **Full Markdown Authoring Suite**: Rich text editor with live split-screen markdown preview.
- **Metadata Management**: Set custom URL slugs, title, excerpt, read time, and category tags.
- **Author Assignment**: Assign articles to specific platform mentors or ANURAJ FX with custom avatars.
- **Cover Image Uploader**: Upload high-resolution blog banners directly to Firebase Storage.

### 5.12 Live Broker Spreads Desk (`/admin/spreads`)
- **Real-Time Spread Editor**: Update live spreads in pips (e.g. `0.1 pips` on EURUSD, `0.9 pips` on Gold) and commissions ($/lot).
- **Effective Cost Calculator**: Instant preview of recalculated effective cost per lot before publishing live.
- **Feed Toggle**: Enable/disable live feed status badges per instrument.

### 5.13 Market Ticker Rate Editor (`/admin/market-ticker`)
- **Live Price Controls**: Directly update the ticker prices and 24h percentage movements for `EURUSD`, `GBPUSD`, `USDJPY`, `XAUUSD`, `BTCUSD`, and `US30`.
- **Indicator Toggle**: Switch between positive (green) and negative (red) display modes.

### 5.14 Two-Way Support Ticket Inbox (`/admin/messages`)
- **Centralized Helpdesk**: Consolidates all support conversations initiated by traders in their profile hub.
- **Filtering**: View tickets by `Open`, `In Progress`, or `Resolved`.
- **Live Chat Interface**: Real-time two-way messaging exchanging responses, attachments, and resolution notes with traders.

### 5.15 Referrals & Rewards Approval Desk (`/admin/referrals`)
- **Referral Network Audit**: Inspect referral attribution trees, track user invitation links, and audit commission claims.
- **Reward Fulfillment**: View points redemption requests for challenge vouchers, cash reimbursements, and merchandise; mark vouchers as issued or fulfilled.
- **Points Ledger Adjustments**: Manually credit or debit trader loyalty point balances.

### 5.16 Page Builder CMS (`/admin/page-builder`)
- **Homepage Copy CMS**: Edit hero headlines, subheadings, primary CTA button labels, and target URLs without deploying code.
- **Verified Firms Marquee Manager**: Add, reorder, or remove partner logos displayed in the infinite scroll marquee.
- **Testimonials Manager**: Create, edit, and reorder homepage testimonials.
- **FAQ Accordion Editor**: Manage questions, answers, and display order in the FAQ section.
- **Footer CMS**: Modify brand tagline, copyright text, and social media URLs.

### 5.17 Media & Storage Library (`/admin/media`)
- **Visual File Manager**: Browse, upload, organize, and delete assets stored in Firebase Storage.
- **Dedicated Folders**: `/logos`, `/posters`, `/proofs`, `/banners`, `/avatars`.
- **Asset Utilities**: One-click copy of public CDN URLs for use in firm profiles, challenges, and blog posts.

### 5.18 Audit Logs & Telemetry Viewer (`/admin/logs`)
- **Comprehensive Activity Ledger**: Automatically logs every administrative action with timestamp, admin email, IP address, and affected collection.
- **Log Filtering**: Filter activity logs by action type (`CREATE`, `UPDATE`, `DELETE`, `MODERATE`) or admin user.

### 5.19 Global Settings & Offer Popup Controller (`/admin/settings`)
- **Global Settings**: Configure platform brand name, default currency, and support contact details.
- **Emergency Maintenance Mode**: Global toggle displaying a branded maintenance screen across public routes while preserving admin access.
- **Welcome Offer Poster Controller**:
  - Global Enable / Disable toggle.
  - Layout Selector (`side-by-side` vs `stacked`).
  - Title, Subtitle, and Flash Sale Badge text.
  - Coupon Code and Discount Percentage Tag.
  - Direct Button Label and Target Affiliate URL.
  - Poster Artwork Uploader.
  - Benefit Bullet Points list manager.

---

## 6. DATA ARCHITECTURE & EXTERNAL INTEGRATIONS

### 6.1 Firestore Database Schema Overview
The database comprises **17 top-level collections** and **3 user subcollections**:

```
firestore-root
 ├── admins/                       # Admin user whitelists & role permissions
 ├── users/                        # Trader profiles & credentials
 │    ├── {uid}/purchasedAccounts/ # Tracked evaluation & funded accounts
 │    ├── {uid}/referrals/         # Referral invitees & commissions ledger
 │    └── {uid}/redeemedRewards/   # Loyalty store redemption history
 ├── siteSettings/                 # Global site configuration (Document: 'main')
 ├── partnerLogos/                 # Marquee logo assets & links
 ├── pricingPlans/                 # Homepage & /pricing subscription plans
 ├── testimonials/                 # Trader testimonials & star ratings
 ├── faqs/                         # Platform FAQ questions & answers
 ├── firms/                        # Prop Firm master profiles & rules
 ├── challenges/                   # 13-parameter evaluation challenge tiers
 ├── deals/                        # Promo codes, BOGO specials, discounts
 ├── payouts/                      # Forensic payout proof receipts
 ├── brokerSpreads/                # Broker liquidity & spread benchmarks
 ├── events/                       # Tournaments, gaming & bootcamps
 ├── eventRegistrations/           # User event registrations & ticket passes
 ├── awards/                       # Trader Choice Awards categories & votes
 ├── blogPosts/                    # Markdown articles & strategy guides
 ├── socialPosts/                  # State Hall social feed posts & link previews
 ├── verificationApplications/     # Creator badge requests & proof links
 ├── communityPosts/               # Forum discussions & nested comments
 ├── loyaltyRewards/               # Rewards store catalog & stock
 ├── supportTickets/               # Two-way support message threads
 └── marketTickers/                # Financial ticker rates & 24h change
```

### 6.2 Firebase Storage Folder Architecture
- `firms/{firmId}/logos/`: High-resolution vector and PNG partner logos.
- `events/{eventId}/posters/`: Tournament and giveaway banner artwork.
- `events/{eventId}/proofs/`: Trader task submission screenshots and Discord proofs.
- `payouts/{payoutId}/`: Trader payout receipts and banking verification screenshots.
- `blog/{slug}/`: Article cover images and inline diagrams.
- `social/{postId}/`: Community post media attachments.
- `avatars/{uid}/`: Trader user profile avatars.
- `media/general/`: General CMS graphics and background light rays.

### 6.3 External Services & Webhook Integrations
1. **Google Sheets Webhook Sync (`/api/auth/sync-sheet`)**:
   - Asynchronously dispatches new user registrations, phone numbers, and referral conversions to Google Sheets via secure webhook, enabling automated CRM marketing.
2. **Discord OAuth2 Gateway (`/api/auth/discord`)**:
   - Enables seamless login with Discord, retrieves guild membership status, and synchronizes Discord usernames for tournament passport generation.
3. **Prop Partner Gateways**:
   - Deep-linking engine formatting affiliate tracking query parameters and enforcing copy-code-first safeguards.

---

## 7. SEO, SOCIAL GRAPH & TELEMETRY SPECIFICATIONS

### 7.1 Search Engine Optimization (SEO)
- **Dynamic Metadata Generation**: Implemented across all dynamic Next.js App Router routes (`/firms/[slug]`, `/blog/[slug]`, `/[category]`).
- **Canonical URLs & Robots**:
  - `app/sitemap.ts`: Automatically compiles XML sitemaps indexing all prop firms, challenges, deals, and blog guides.
  - `app/robots.ts`: Allows indexing on public routes while explicitly disallowing `/admin/*` and private profile sub-routes.
- **OpenGraph & Twitter Cards**: Generates high-definition social sharing cards with firm logos, trust scores, and discount tags.
- **Structured JSON-LD Data**: Injects Schema.org structured data (`Organization`, `Product`, `Review`, `FAQPage`, `BreadcrumbList`) into document headers for rich Google search snippets.

### 7.2 Telemetry & Interaction Analytics
- **Deal Click Tracking**: Real-time counter incrementing `clicks_count` whenever a trader copies a promo code or clicks through to a firm.
- **Social Engagement Metrics**: Tracks upvotes, downvotes, post views, and link click-throughs across the State Hall.
- **Voting Integrity Engine**: Deduplicates Industry Award votes by storing authenticated user IDs in a `voted_user_ids` array.

---

## 8. FEATURE MATRIX BY USER PERSONA

| Feature Capability | Anonymous Trader | Registered Trader | Verified Creator | Admin / Moderator | Super Admin |
|-------------------|:----------------:|:-----------------:|:----------------:|:-----------------:|:-----------:|
| Browse Firms & Compare Challenges | ✅ | ✅ | ✅ | ✅ | ✅ |
| Copy Promo Codes & Claim BOGO Deals | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Payout Proofs & Zoom Receipts | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Live Broker Spreads Matrix | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read State Hall & Blog Guides | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit Trader Review | ❌ | ✅ | ✅ | ✅ | ✅ |
| Vote in Industry Awards | ❌ | ✅ (1 per cat) | ✅ (1 per cat) | ✅ | ✅ |
| Submit Payout Proof for Audit | ❌ | ✅ | ✅ | ✅ | ✅ |
| Register for Tournaments & Passports | ❌ | ✅ | ✅ | ✅ | ✅ |
| Open Two-Way Support Tickets | ❌ | ✅ | ✅ | ✅ | ✅ |
| Earn 15% Referrals & Redeem Rewards | ❌ | ✅ | ✅ | ✅ | ✅ |
| Track Purchased Accounts | ❌ | ✅ | ✅ | ✅ | ✅ |
| Post to State Hall with Link Previews | ❌ | ❌ | ✅ | ✅ | ✅ |
| Receive Verified Author Role Badges | ❌ | ❌ | ✅ | ✅ | ✅ |
| Access Admin Panel (`/admin`) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Moderate Reviews, Proofs & Posts | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Prop Firms, Challenges & Deals| ❌ | ❌ | ❌ | ✅ (Editor) | ✅ |
| Batch Challenge Generation Portal | ❌ | ❌ | ❌ | ✅ (Editor) | ✅ |
| Manage Admin Roles & View Audit Logs | ❌ | ❌ | ❌ | ❌ | ✅ |
| Emergency Maintenance Mode Toggle | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## CONCLUSION

EMPIRIAL 2.0 represents the new gold standard in proprietary trading auditing, deal intelligence, and trader community ecosystems. By combining rigorous mathematical scoring, physical copy-to-claim safeguards, forensic payout verification, and an institutional content management system, EMPIRIAL 2.0 empowers traders with uncompromised clarity and authority.

*Document maintained by ANURAJ FX & The EMPIRIAL 2.0 Engineering Team.*  
*Hashtag: `#BuildingEmpires`*
