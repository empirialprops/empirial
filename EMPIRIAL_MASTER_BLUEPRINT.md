# EMPIRIAL 2.0 — MASTER ARCHITECTURE, DESIGN SYSTEM & PLATFORM BLUEPRINT
**Universal Single-Prompt Blueprint: Visual Design Tokens, Complete Feature Specifications, Calculation Engines, Production Scripts, Asset Manifest & Platform Transformation Guide**  
**Version:** 5.0.0 (Canonical Master Edition)  
**Lead Architect & Founder:** ANURAJ FX  
**Official Hashtag:** `#BuildingEmpires`  
**Target:** Drop-in Construction of EMPIRIAL 2.0 or 100% Morphing of Any Pre-Made Platform (Next.js 15 / React 19 / Tailwind CSS / Firebase)

---

## 🎯 HOW TO USE THIS MASTER BLUEPRINT

> **AI AGENT & DEVELOPER DIRECTIVE:**  
> This document is the ultimate, all-inclusive single source of truth (SSOT) for the entire **EMPIRIAL 2.0** proprietary trading intelligence platform. It fuses the **Complete Institutional Visual Design System**, the **Exhaustive Platform Feature Specifications**, **Mathematical Calculation Engines**, **Production Scripts**, **Asset Manifests with Image Embeds**, **Firestore Schemas**, **Admin Panel / CMS**, and **Data Interaction Flows**.
>
> **TWO OPERATIONAL MODES:**
> 1. **Greenfield Generation (Build from Scratch)**: Provide [Section 22: The Ultimate Single Master Bootstrap Prompt](#22-the-ultimate-single-master-bootstrap-prompt) to any frontier AI coding assistant to scaffold, configure, and code the entire EMPIRIAL 2.0 platform from zero.
> 2. **Platform Reshaping (Morph Any Existing Codebase)**: Follow [Section 21: The Platform Transformation & Reshaping Guide](#21-the-platform-transformation--reshaping-guide) to take any pre-made SaaS, directory, dashboard, or e-commerce codebase and systematically shape it into EMPIRIAL 2.0 without leaving legacy design artifacts.

---

## TABLE OF CONTENTS

1. [Executive Platform Identity & Vision](#1-executive-platform-identity--vision)
2. [Technology Stack Manifest](#2-technology-stack-manifest)
3. [Visual Philosophy & Monochrome Design Tokens](#3-visual-philosophy--monochrome-design-tokens)
4. [Atmospheric Tilted Light Ray (Signature Visual Effect)](#4-atmospheric-tilted-light-ray-signature-visual-effect)
5. [Liquid Glass & Dual-Mode Surface Architecture](#5-liquid-glass--dual-mode-surface-architecture)
6. [Typography, Hierarchy & Metric Formatting](#6-typography-hierarchy--metric-formatting)
7. [Button System & Copy-to-Claim Vibration Engine](#7-button-system--copy-to-claim-vibration-engine)
8. [Card Hierarchy & Container Specifications](#8-card-hierarchy--container-specifications)
9. [Mathematical Calculation Engines & Algorithms](#9-mathematical-calculation-engines--algorithms)
   - 9.1 [Bayesian Multi-Criteria Review Rating & Trust Score Engine](#91-bayesian-multi-criteria-review-rating--trust-score-engine)
   - 9.2 [Comparison & 5-Axis Dynamic SVG Radar Chart Engine](#92-comparison--5-axis-dynamic-svg-radar-chart-engine)
   - 9.3 [Broker Raw Spreads & Effective Lot Cost Engine](#93-broker-raw-spreads--effective-lot-cost-engine)
   - 9.4 [Session-Capped Welcome Offer Modal Engine](#94-session-capped-welcome-offer-modal-engine)
   - 9.5 [Referral Attribution & 15% Commission Engine](#95-referral-attribution--15-commission-engine)
   - 9.6 [VIP Phone Capture & Dual-Channel Sync Engine](#96-vip-phone-capture--dual-channel-sync-engine)
10. [Visual Assets & Image Manifest](#10-visual-assets--image-manifest)
   - 10.1 [Platform Brand Assets & Emblems](#101-platform-brand-assets--emblems)
   - 10.2 [Official Partner Prop Firm Logos](#102-official-partner-prop-firm-logos)
   - 10.3 [Supported Trading Platform Badges](#103-supported-trading-platform-badges)
   - 10.4 [Promotional Banners & Posters](#104-promotional-banners--posters)
11. [Complete Public User Pages & Feature Breakdown](#11-complete-public-user-pages--feature-breakdown)
   - 11.1 [Homepage (`/`)](#111-homepage-)
   - 11.2 [Prop Firms Directory (`/firms`)](#112-prop-firms-directory-firms)
   - 11.3 [Deep Prop Firm Profile Hub (`/firms/[slug]`)](#113-deep-prop-firm-profile-hub-firmsslug)
   - 11.4 [13-Column Evaluation Challenges Matrix (`/challenges`)](#114-13-column-evaluation-challenges-matrix-challenges)
   - 11.5 [Verified Deals & BOGO Catalog (`/deals` & `/offers`)](#115-verified-deals--bogo-catalog-deals--offers)
   - 11.6 [Side-by-Side Comparison Engine (`/compare`)](#116-side-by-side-comparison-engine-compare)
   - 11.7 [Forensic Payout Proofs Registry (`/payouts`)](#117-forensic-payout-proofs-registry-payouts)
   - 11.8 [Live Broker Spreads & Liquidity Matrix (`/spreads`)](#118-live-broker-spreads--liquidity-matrix-spreads)
   - 11.9 [Industry Trader Choice Awards 2026 (`/awards`)](#119-industry-trader-choice-awards-2026-awards)
   - 11.10 [State Hall Community Feed (`/blog`)](#1110-state-hall-community-feed-blog)
   - 11.11 [Strategic Knowledge Guides (`/blog/[slug]`)](#1111-strategic-knowledge-guides-blogslug)
   - 11.12 [Community Discussion Forums (`/community`)](#1112-community-discussion-forums-community)
   - 11.13 [Trader Command Center (`/profile`)](#1113-trader-command-center-profile)
   - 11.14 [Trader Tournaments & Event Hub (`/events`)](#1114-trader-tournaments--event-hub-events)
   - 11.15 [Dynamic Market Category Hubs (`/[category]`)](#1115-dynamic-market-category-hubs-category)
   - 11.16 [Institutional Informational Pages](#1116-institutional-informational-pages)
12. [Trader Authentication & Identity Architecture](#12-trader-authentication--identity-architecture)
13. [Institutional Admin Panel & Full CMS Platform (`/admin`)](#13-institutional-admin-panel--full-cms-platform-admin)
   - 13.1 [Role-Based Access Control (RBAC) & Audit Logs](#131-role-based-access-control-rbac--audit-logs)
   - 13.2 [Executive Admin Dashboard (`/admin`)](#132-executive-admin-dashboard-admin)
   - 13.3 [Prop Firms Desk (`/admin/firms`)](#133-prop-firms-desk-adminfirms)
   - 13.4 [Challenge Accounts & Batch Portal (`/admin/challenges`)](#134-challenge-accounts--batch-portal-adminchallenges)
   - 13.5 [Deals & Promo Codes CMS (`/admin/deals`)](#135-deals--promo-codes-cms-admindeals)
   - 13.6 [Forensic Payouts Audit Desk (`/admin/payouts`)](#136-forensic-payouts-audit-desk-adminpayouts)
   - 13.7 [Reviews Moderation Desk & Firm Replies (`/admin/reviews`)](#137-reviews-moderation-desk--firm-replies-adminreviews)
   - 13.8 [State Hall & Creator Verification Desk (`/admin/social`)](#138-state-hall--creator-verification-desk-adminsocial)
   - 13.9 [Tournaments & Events Manager (`/admin/events`)](#139-tournaments--events-manager-adminevents)
   - 13.10 [Industry Awards Manager (`/admin/awards`)](#1310-industry-awards-manager-adminawards)
   - 13.11 [Blog & Strategy CMS (`/admin/blog`)](#1311-blog--strategy-cms-adminblog)
   - 13.12 [Live Broker Spreads Desk (`/admin/spreads`)](#1312-live-broker-spreads-desk-adminspreads)
   - 13.13 [Market Ticker Rate Editor (`/admin/market-ticker`)](#1313-market-ticker-rate-editor-adminmarket-ticker)
   - 13.14 [Two-Way Support Ticket Inbox (`/admin/messages`)](#1314-two-way-support-ticket-inbox-adminmessages)
   - 13.15 [Referrals & Rewards Approval Desk (`/admin/referrals`)](#1315-referrals--rewards-approval-desk-adminreferrals)
   - 13.16 [Page Builder CMS (`/admin/page-builder`)](#1316-page-builder-cms-adminpage-builder)
   - 13.17 [Media & Asset Library (`/admin/media`)](#1317-media--storage-library-adminmedia)
   - 13.18 [Global Site Settings & Offer Popup Controller (`/admin/settings`)](#1318-global-site-settings--offer-popup-controller-adminsettings)
14. [Database Architecture & Complete Firestore Schemas](#14-database-architecture--complete-firestore-schemas)
15. [Firebase Storage Architecture](#15-firebase-storage-architecture)
16. [Security Rules Specification (Firestore & Storage)](#16-security-rules-specification-firestore--storage)
17. [SEO, Social Graph & Telemetry Specifications](#17-seo-social-graph--telemetry-specifications)
18. [Production Scripts & Automations](#18-production-scripts--automations)
   - 18.1 [Universal Firestore Database Seeder Script](#181-universal-firestore-database-seeder-script)
   - 18.2 [Super Admin Provisioning & Whitelist Script](#182-super-admin-provisioning--whitelist-script)
   - 18.3 [Google Apps Script Full Sync Webhook](#183-google-apps-script-full-sync-webhook)
   - 18.4 [Discord OAuth2 API Endpoint Handler](#184-discord-oauth2-api-endpoint-handler)
19. [Drop-in Ready React 19 / TypeScript Components](#19-drop-in-ready-react-19--typescript-components)
20. [Component & Prop Inventory Reference Table](#20-component--prop-inventory-reference-table)
21. [The Platform Transformation & Reshaping Guide](#21-the-platform-transformation--reshaping-guide)
22. [The Ultimate Single Master Bootstrap Prompt](#22-the-ultimate-single-master-bootstrap-prompt)

---

## 1. EXECUTIVE PLATFORM IDENTITY & VISION

**EMPIRIAL 2.0** is an institutional-grade proprietary trading evaluation and intelligence platform engineered by **ANURAJ FX**.
- **Core Mission**: To eliminate predatory evaluation rules, hidden drawdown traps, unverified promo codes, and liquidity manipulation through forensic auditing, mathematical transparency, and verified trader proof.
- **Brand Aesthetic**: High-contrast luxury monochrome (Pure Black, Pure White, Zinc Neutrals) energized by a single atmospheric tilted electric blue beam (`#016fee`).
- **Core Tagline**: *"Building Empires"* (`#BuildingEmpires`).
- **Target Audience**: Retail traders seeking prop funding, funded traders scaling to $2M+ allocations, EA/algorithmic developers, futures combine participants, and institutional prop firm executives.

```
┌────────────────────────────────────────────────────────┐
│               EMPIRIAL 2.0 BRAND MARKS                 │
│  [Dark Logo]     public/logos/empirial-dark-logo.png   │
│  [Light Logo]    public/logos/empirial-light-logo.png  │
│  [Dark Trident]  public/logos/empirial-trident-dark.png│
│  [Light Trident] public/logos/empirial-trident-light.png│
└────────────────────────────────────────────────────────┘
```

---

## 2. TECHNOLOGY STACK MANIFEST

- **Frontend Framework**: Next.js 15.2.1 (App Router architecture with React Server Components).
- **Core UI Runtime**: React 19.0.0 & React DOM 19.
- **Language**: TypeScript 5.8.2 in strict mode (`tsconfig.json` with strict type checking).
- **Styling Architecture**: Tailwind CSS 3.4.17 with `@tailwindcss/typography` and custom monochrome CSS custom properties.
- **Theme Manager**: `next-themes@0.4.6` (OLED Dark mode default with smooth transitions).
- **Motion & Dynamics**: `framer-motion@13.1.1` (modal animations, slide transitions, 7-frame vibration shakes).
- **Metric Rollup Counters**: `@number-flow/react@0.6.2` (smooth digit rollups).
- **UI Primitives**: Radix UI (`@radix-ui/react-accordion`, `dialog`, `dropdown-menu`, `navigation-menu`, `separator`, `slot`, `tooltip`).
- **Icons**: `lucide-react@1.16.0` and Radix Icons.
- **Backend Services**: Firebase JS SDK 12.18.0 (Client Firestore, Auth, Storage) and Firebase Admin SDK 14.3.0 (Server/Admin).
- **External Gateways**: Discord OAuth2, Google Sheets Automation Webhook, Partner Affiliate Gateways.

---

## 3. VISUAL PHILOSOPHY & MONOCHROME DESIGN TOKENS

### 3.1 CSS Custom Properties (`app/globals.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #ffffff;
    --foreground: #131316;
    --card: #ffffff;
    --card-foreground: #131316;
    --popover: #ffffff;
    --popover-foreground: #131316;

    --primary: #131316;
    --primary-foreground: #ffffff;
    --secondary: #f4f4f5;
    --secondary-foreground: #18181b;
    --muted: #f4f4f5;
    --muted-foreground: #71717a;
    --accent: #f4f4f5;
    --accent-foreground: #18181b;

    --light: #5ba8ff;
    --destructive: #ef4444;
    --destructive-foreground: #ffffff;

    --border: #e5e5e5;
    --input: #e5e5e5;
    --ring: #131316;
    --radius: 0.75rem;
  }

  .dark {
    --background: #0A0A0A;
    --foreground: #ffffff;
    --card: #141414;
    --card-foreground: #ffffff;
    --popover: #141414;
    --popover-foreground: #ffffff;

    --primary: #ffffff;
    --primary-foreground: #0A0A0A;
    --secondary: #1a1a1a;
    --secondary-foreground: #ffffff;
    --muted: #1a1a1a;
    --muted-foreground: #a1a1aa;
    --accent: #1a1a1a;
    --accent-foreground: #ffffff;

    --light: #016fee;
    --destructive: #7f1d1d;
    --destructive-foreground: #ffffff;

    --border: #242424;
    --input: #242424;
    --ring: #ffffff;
  }
}

* {
  box-sizing: border-box;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  overflow-x: hidden;
  min-height: 100vh;
  transition: background-color 0.2s ease, color 0.2s ease;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--background);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--muted-foreground);
}
```

---

## 4. ATMOSPHERIC TILTED LIGHT RAY (SIGNATURE VISUAL EFFECT)

```tsx
export function AtmosphericBeam() {
  return (
    <div 
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden" 
      aria-hidden="true"
    >
      <div
        className="absolute -top-[40%] left-1/2 h-[220vh] w-[140px] sm:w-[220px] -translate-x-1/2 rotate-[30deg] opacity-20 dark:opacity-25"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, #016fee 35%, #5ba8ff 65%, transparent 100%)',
          filter: 'blur(75px)',
          transform: 'rotate(30deg) translate3d(0, 0, 0)',
        }}
      />
    </div>
  );
}
```

---

## 5. LIQUID GLASS & DUAL-MODE SURFACE ARCHITECTURE

```tsx
// Floating Navigation Glass
className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/70 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/70 dark:backdrop-blur-xl"

// Modal Backdrop Overlay
className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md dark:bg-black/80"

// Elevated Floating Card
className="rounded-[24px] border border-zinc-200/90 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800/90 dark:bg-zinc-900/60"
```

---

## 6. TYPOGRAPHY, HIERARCHY & METRIC FORMATTING

1. **Hero Headline**: `text-4xl font-medium tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text`
2. **Section Headings**: `text-xl font-semibold sm:text-2xl md:text-3xl tracking-tight bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text`
3. **Descriptions**: `text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed`
4. **Numbers & Stats**: `text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground`

---

## 7. BUTTON SYSTEM & COPY-TO-CLAIM VIBRATION ENGINE

```tsx
// Primary Button
className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200"

// Secondary Outline Button
className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-2xs transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800/60"
```

### 7-Frame Vibration Shake Animation
```typescript
export const copyShakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [-6, 6, -6, 6, -3, 3, 0],
    transition: { duration: 0.45, ease: 'easeInOut' }
  }
};
```

---

## 8. CARD HIERARCHY & CONTAINER SPECIFICATIONS

- **Standard Card Container**: `rounded-[24px] border border-zinc-200 bg-white p-6 shadow-2xs transition-all duration-300 hover:border-zinc-400 hover:shadow-hover-light dark:border-zinc-800 dark:bg-card dark:hover:border-zinc-600 dark:hover:shadow-hover-dark`
- **Featured Card Container**: `relative rounded-[24px] border-2 border-black bg-[#f4f4f5] p-6 shadow-featured-light transition-all duration-300 dark:border-white dark:bg-card dark:shadow-featured-dark`

---

## 9. MATHEMATICAL CALCULATION ENGINES & ALGORITHMS

### 9.1 Bayesian Multi-Criteria Review Rating & Trust Score Engine
$$\text{Review Score} = \frac{\text{Trading Conditions} + \text{Customer Care} + \text{Payout Process} + \text{User Friendliness}}{4}$$
$$\text{Trust Score (0-100)} = \min\left(100, \operatorname{round}\left((\text{Overall Rating} \times 16) + (\text{Years Working} \times 3) + (\log_{10}(\text{Payouts USD}) \times 2)\right)\right)$$

### 9.2 Comparison & 5-Axis Dynamic SVG Radar Chart Engine
Scores normalized from 0 to 100 across:
1. *Max Allocation*: $\ge \$4M \to 100$; $\$2.5M \to 95$; $\$2M \to 90$; $\$1.5M \to 80$; $\$1M \to 70$.
2. *Profit Split*: $100\% \to 100$; $\ge 90\% \to 92$; $\ge 85\% \to 82$; $\ge 80\% \to 72$; $<80\% \to 55$.
3. *Max Drawdown Limit*: $\ge 12\% \to 100$; $\ge 10\% \to 90$; $\ge 8\% \to 78$; $\ge 6\% \to 60$.
4. *Consistency Rule*: No Rule / Balanced = 100; Restrictive = 75.
5. *Min Trading Days*: 0 Days = 100; $\le 3$ Days = 85; $\le 5$ Days = 70; $>5$ Days = 50.
6. *Payout Speed*: 6hr SLA / On-Demand = 100; Weekly = 90; Bi-Weekly = 80; Monthly = 60.

### 9.3 Broker Raw Spreads & Effective Lot Cost Engine
$$\text{Effective Round-Turn Cost per Standard Lot} = (\text{Spread in Pips} \times 10) + \text{Commission per Lot}$$

### 9.4 Session-Capped Welcome Offer Modal Engine
Frequency-capped via `sessionStorage.getItem('empirial_offer_seen_v2')`.

### 9.5 Referral Attribution & 15% Commission Engine
URL query parameter listener: `?ref=CODE`. Awards +100 Loyalty Points on signup and 15% commission ledger on evaluation purchase.

### 9.6 VIP Phone Capture & Dual-Channel Sync Engine
Dispatches to Firestore `users/{uid}.phoneNumber` and Google Sheets webhook (`dispatchUserToSheet`).

---

## 10. VISUAL ASSETS & IMAGE MANIFEST

### 10.1 Platform Brand Assets & Emblems
- **EMPIRIAL Dark Logo**: `public/logos/empirial-dark-logo.png`
- **EMPIRIAL Light Logo**: `public/logos/empirial-light-logo.png`
- **EMPIRIAL Trident Emblem (Dark)**: `public/logos/empirial-trident-dark.png`
- **EMPIRIAL Trident Emblem (Light)**: `public/logos/empirial-trident-light.png`

### 10.2 Official Partner Prop Firm Logos
Rendered with 100% authentic corporate brand colors and `rounded-md` / `rounded-lg`:
- Alpha Capital: `public/logos/alpha-capital.png`
- NYS Capital: `public/logos/nys.png`
- CK Capital: `public/logos/ck-capital.avif`
- Pipstone: `public/logos/pipstone.png`
- Shark Funded: `public/logos/shark-funded.webp`
- Sure Leverage Funding: `public/logos/sure-leverage.jpg`
- GTF: `public/logos/gtf.svg`
- FundedNext: `public/logos/fundednext.svg`
- Funding Pips: `public/logos/funding-pips.svg`
- Topstep: `public/logos/topstep.svg`
- The5ers: `public/logos/the5ers.svg`
- FTMO: `public/logos/ftmo.svg`
- Apex Trader Funding: `public/logos/apex.svg`
- Dolvero: `public/logos/dolvero.svg`

### 10.3 Supported Trading Platform Badges
- cTrader: `public/platforms/ctrader.svg`
- MetaTrader 5 (MT5): `public/platforms/mt5.png`
- Match-Trader: `public/platforms/match-trader.svg`
- TradeLocker: `public/platforms/tradelocker.jpeg`
- NinjaTrader: `public/platforms/ninjatrader.svg`
- Tradovate: `public/platforms/tradovate.png`
- TradingView: `public/platforms/tradingview.png`
- Bookmap: `public/platforms/bookmap.jpeg`
- ATAS: `public/platforms/atas.jpeg`
- Deepcharts: `public/platforms/deepcharts.jpeg`
- MultiCharts: `public/platforms/multicharts.svg`

### 10.4 Promotional Banners & Posters
- Funded Futures Family Flash Sale: `public/posters/funded-futures-family.jpg`

---

## 11. COMPLETE PUBLIC USER PAGES & FEATURE BREAKDOWN

- **Homepage (`/`)**: Hero gradient, live ticker (`EURUSD`, `GBPUSD`, `USDJPY`, `XAUUSD`, `BTCUSD`, `US30`), bento dashboard, partner marquee, home challenges, flash deals, 3-tier pricing with vibration shake, number counters, testimonials, and FAQs.
- **Prop Firms Directory (`/firms`)**: 11-platform filter, 4 trading models, $0–$2.5M allocation slider, sorting, preview drawers, and copy-first safeguard.
- **Deep Firm Profile Hub (`/firms/[slug]`)**: 5 tabs: *Rules & Specs Overview*, *Challenges Catalog*, *Promo Deals*, *Verified Reviews*, and *Payout Proofs*.
- **13-Column Evaluation Challenge Matrix (`/challenges`)**: All 13 forensic parameters audited side-by-side with SVG circular profit split gauges.
- **Verified Deals & BOGO Catalog (`/deals` & `/offers`)**: Hourly audited promo codes, BOGO vouchers, fee refunds, and click tracking telemetry.
- **Side-by-Side Comparison Engine (`/compare`)**: Up to 4-slot comparison with 5-axis dynamic SVG radar chart and 20+ parameter table.
- **Forensic Payout Proofs Registry (`/payouts`)**: Total payout rollup ($15.2M+), regional/concept filters, screenshot zoom lightbox, and user submission modal.
- **Live Broker Spreads Matrix (`/spreads`)**: Raw pips, commissions, and effective lot costs across major FX, metals, crypto, and indices.
- **Trader Choice Awards 2026 (`/awards`)**: Annual voting categories with session-deduplicated 1-vote-per-category mechanics.
- **State Hall Community Feed (`/blog`) & Strategy Guides (`/blog/[slug]`)**: Verified author role badges, markdown composer, rich link preview cards, and long-form guides.
- **Community Forums (`/community`)**: Category-tagged discussion threads, comments, and upvoting.
- **Trader Command Center (`/profile`)**: Trader ID card, purchased accounts monitor, reviews desk, active event passes, two-way support chat, and 15% referral/loyalty store.
- **Tournaments Hub (`/events`)**: Gamified challenges, Discord task verification, screenshot proof upload, flying trophy celebrations, and ticket passports.
- **Dynamic Market Category Hubs (`/[category]`)**: Dynamic portals for `/forex`, `/futures`, `/crypto`, and `/instant-funding`.
- **Institutional Knowledge Hub**: `/about`, `/rules`, `/rule-changes`, `/transparency`, `/leaderboard`, `/loyalty`, `/pricing`, `/affiliate-program`, `/demo-accounts`, `/contact`.

---

## 12. TRADER AUTHENTICATION & IDENTITY ARCHITECTURE

Multi-provider authentication supporting:
1. Google One-Tap Sign-In (`GoogleAuthProvider`).
2. Discord OAuth2 Gateway (`/api/auth/discord`).
3. Email Magic Link / Password.
4. Development Sandbox Mock for testing.

---

## 13. INSTITUTIONAL ADMIN PANEL & FULL CMS PLATFORM (`/admin`)

- **Role-Based Access Control (RBAC)**: Super Admin, Editor, Moderator, Support Agent + Complete Audit Log Ledger (`/admin/logs`).
- **Batch Challenge Portal (`BatchChallengePortal.tsx`)**: $5K–$1M size presets, uniform rule inheritance, global discount slider, CSV/JSON spreadsheet import/export, and transactional batch writes.
- **Firms Desk**: CRUD with relational cascade updating across challenges, deals, and payouts.
- **Deals CMS, Payout Audit Queue, Reviews Moderation with Official Firm Replies**.
- **State Hall Social & Creator Verification Desk, Events Manager, Awards Manager, Spreads Manager, Market Ticker Rate Editor**.
- **Two-Way Support Ticket Inbox, Referrals & Rewards Approval Desk, Page Builder CMS, Media Storage Library, and Offer Popup Controller**.

---

## 14. DATABASE ARCHITECTURE & COMPLETE FIRESTORE SCHEMAS

17 Top-Level Collections + 3 User Subcollections:
```
firestore-root
 ├── admins/                       (Admin users whitelist and role permissions)
 ├── users/                        (Registered trader accounts)
 │    ├── {uid}/purchasedAccounts/ (Accounts purchased by user)
 │    ├── {uid}/referrals/         (Trader referral invitees and commissions)
 │    └── {uid}/redeemedRewards/   (Points redemption history)
 ├── siteSettings/                 (Singleton document: 'main')
 ├── partnerLogos/                 (Logos displayed in verified marquee)
 ├── pricingPlans/                 (Homepage & /pricing subscription tiers)
 ├── testimonials/                 (Customer testimonials on homepage)
 ├── faqs/                         (FAQ accordion questions and answers)
 ├── firms/                        (Master Prop Firm profiles)
 ├── challenges/                   (Evaluation challenge account tiers)
 ├── deals/                        (Promo codes, BOGO specials, discounts)
 ├── payouts/                      (Verified payout proof receipts)
 ├── brokerSpreads/                (Liquidity & spread benchmark feeds)
 ├── events/                       (Tournaments, gaming, and bootcamps)
 ├── eventRegistrations/           (User event registrations and ticket passes)
 ├── awards/                       (Annual Industry Awards categories & votes)
 ├── blogPosts/                    (Long-form strategic guides and articles)
 ├── socialPosts/                  (State Hall community feed posts)
 ├── verificationApplications/     (Creator badge requests)
 ├── communityPosts/               (Discussion forum posts & comments)
 ├── loyaltyRewards/               (Rewards store catalog)
 ├── supportTickets/               (Trader-to-admin support conversations)
 └── marketTickers/                (Live financial ticker bar rates)
```

---

## 15. FIREBASE STORAGE ARCHITECTURE

- `firms/{firmId}/logos/`
- `events/{eventId}/posters/`
- `events/{eventId}/proofs/`
- `payouts/{payoutId}/`
- `blog/{slug}/`
- `posters/flash-sales/`
- `avatars/{uid}/`

---

## 16. SECURITY RULES SPECIFICATION (FIRESTORE & STORAGE)

Full read/write isolation based on authentication, ownership (`request.auth.uid == userId`), and admin role verification in `/databases/$(database)/documents/admins/$(request.auth.uid)`.

---

## 17. SEO, SOCIAL GRAPH & TELEMETRY SPECIFICATIONS

- Automated dynamic sitemap (`app/sitemap.ts`).
- Search crawler policy (`app/robots.ts`).
- Schema.org structured data for `Organization`, `Product`, `Review`, and `FAQPage`.
- Click telemetry tracking (`clicks_count`) on all coupons and deals.

---

## 18. PRODUCTION SCRIPTS & AUTOMATIONS

### 18.1 Universal Firestore Database Seeder Script (`lib/firebase/seeder.ts`)
```typescript
import { db } from './config';
import { doc, writeBatch } from 'firebase/firestore';
import { MOCK_FIRMS } from '../data/firms-data';
import { MOCK_CHALLENGES } from '../data/challenges-data';
import { MOCK_DEALS } from '../data/deals-data';
import { MOCK_PAYOUTS } from '../data/payouts-data';
import { MOCK_REVIEWS } from '../data/reviews-data';
import { MOCK_SPREADS } from '../data/spreads-data';
import { MOCK_EVENTS } from '../data/events-data';
import { MOCK_AWARDS } from '../data/awards-data';
import { MOCK_BLOG_POSTS } from '../data/blog-data';
import { MOCK_POSTS } from '../data/community-data';
import { MOCK_REWARDS } from '../data/loyalty-data';

export async function seedDatabase() {
  if (!db) throw new Error('Firestore is not initialized.');

  const batchWrite = async (items: any[], getDocRef: (item: any) => any) => {
    let batch = writeBatch(db);
    let count = 0;

    for (const item of items) {
      const docRef = getDocRef(item);
      const cleanItem = JSON.parse(JSON.stringify(item));
      batch.set(docRef, {
        ...cleanItem,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      count++;

      if (count === 400) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
    if (count > 0) await batch.commit();
  };

  await batchWrite(MOCK_FIRMS, (f) => doc(db, 'firms', f.id));
  await batchWrite(MOCK_CHALLENGES, (c) => doc(db, 'challenges', c.id));
  await batchWrite(MOCK_DEALS, (d) => doc(db, 'deals', d.id));
  await batchWrite(MOCK_PAYOUTS, (p) => doc(db, 'payouts', p.id));
  await batchWrite(MOCK_REVIEWS, (r) => doc(db, 'reviews', r.id));
  await batchWrite(MOCK_SPREADS, (s) => doc(db, 'brokerSpreads', s.id));
  await batchWrite(MOCK_EVENTS, (e) => doc(db, 'events', e.id));
  await batchWrite(MOCK_AWARDS, (a) => doc(db, 'awards', a.id));
  await batchWrite(MOCK_BLOG_POSTS, (b) => doc(db, 'blogPosts', b.id));
  await batchWrite(MOCK_POSTS, (p) => doc(db, 'communityPosts', p.id));
  await batchWrite(MOCK_REWARDS, (r) => doc(db, 'loyaltyRewards', r.id));
  console.log('✅ Firestore Database Seeding Completed!');
}
```

### 18.2 Super Admin Provisioning & Whitelist Script (`scripts/create-admin.js`)
```javascript
require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function createAdmin() {
  const email = 'admin@anurajfx.com';
  const password = process.env.ADMIN_INITIAL_PASSWORD || 'Anuraj@admin12145';

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      userRecord = await auth.createUser({
        email,
        password,
        displayName: 'Anuraj Admin'
      });
    } else {
      throw error;
    }
  }

  await db.collection('admins').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    displayName: 'Anuraj Admin',
    role: 'super_admin',
    is_active: true,
    created_at: new Date().toISOString()
  });

  console.log('✅ Admin user provisioned and whitelisted successfully!');
}
createAdmin().catch(console.error);
```

### 18.3 Google Apps Script Full Sync Webhook (`scripts/google-apps-script.js`)
```javascript
const SPREADSHEET_ID = "1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA";
const SHEET_TAB_NAME = "Users";

const HEADERS = [
  "User ID (UID)", "Full Name", "Email Address", "Email Verified",
  "Phone Number", "Auth Provider", "Role", "Loyalty Points",
  "Account Status", "Created At", "Last Sign-In At", "Avatar URL", "Last Synced At"
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Server busy" })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_TAB_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_TAB_NAME);
      sheet.appendRow(HEADERS);
    }

    const uid = data.uid || "";
    const values = sheet.getDataRange().getValues();
    let rowIndex = -1;

    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === uid) {
        rowIndex = i + 1;
        break;
      }
    }

    const rowData = [
      uid, data.name || "", data.email || "", data.emailVerified ? "YES" : "NO",
      data.phone || "", data.provider || "email", data.role || "trader",
      data.loyaltyPoints || 0, "Active", data.createdAt || new Date().toISOString(),
      new Date().toISOString(), data.photoURL || "", new Date().toISOString()
    ];

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", uid })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

### 18.4 Discord OAuth2 API Endpoint Handler (`app/api/auth/discord/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?auth_error=missing_code', request.url));
  }

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/discord`,
      }),
    });

    const tokenData = await tokenResponse.json();
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const discordUser = await userResponse.json();

    return NextResponse.redirect(new URL(`/profile?discord_uid=${discordUser.id}&discord_username=${discordUser.username}`, request.url));
  } catch (error) {
    return NextResponse.redirect(new URL('/?auth_error=discord_failed', request.url));
  }
}
```

---

## 19. DROP-IN READY REACT 19 / TYPESCRIPT COMPONENTS

### 19.1 SVG Circular Profit Split Gauge (`components/ui/profit-split-gauge.tsx`)
```tsx
import React from 'react';

interface ProfitSplitGaugeProps {
  percentage: number;
  size?: number;
}

export function ProfitSplitGauge({ percentage, size = 44 }: ProfitSplitGaugeProps) {
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-zinc-200 dark:stroke-zinc-800"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-black transition-all duration-700 ease-out dark:stroke-white"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <span className="absolute text-[11px] font-bold tracking-tight text-foreground">
        {percentage}%
      </span>
    </div>
  );
}
```

### 19.2 Dynamic 5-Axis SVG Radar Chart (`components/ui/radar-chart.tsx`)
```tsx
import React from 'react';
import { ComparisonMetricScore } from '@/lib/utils/comparison-calc';

interface RadarChartProps {
  entities: Array<{
    name: string;
    scores: ComparisonMetricScore[];
    strokeColor?: string;
    fillColor?: string;
  }>;
  size?: number;
}

export function DynamicRadarChart({ entities, size = 320 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 40;
  const totalAxes = 5;

  const getCoordinates = (axisIndex: number, score: number) => {
    const angle = (Math.PI * 2 / totalAxes) * axisIndex - Math.PI / 2;
    const distance = (score / 100) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  const axisLabels = entities[0]?.scores.map(s => s.subject) || [
    'Drawdown', 'Payout Speed', 'Profit Split', 'Consistency', 'Min Days'
  ];

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <svg width={size} height={size} className="overflow-visible">
        {[0.25, 0.5, 0.75, 1].map((scale, levelIdx) => (
          <polygon
            key={levelIdx}
            points={Array.from({ length: totalAxes }).map((_, i) => {
              const { x, y } = getCoordinates(i, scale * 100);
              return `${x},${y}`;
            }).join(' ')}
            className="fill-transparent stroke-zinc-200 dark:stroke-zinc-800"
            strokeWidth="1"
            strokeDasharray={levelIdx < 3 ? '3 3' : undefined}
          />
        ))}

        {Array.from({ length: totalAxes }).map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-zinc-200 dark:stroke-zinc-800"
              strokeWidth="1"
            />
          );
        })}

        {entities.map((entity, idx) => {
          const points = entity.scores.map((s, i) => {
            const { x, y } = getCoordinates(i, s.score);
            return `${x},${y}`;
          }).join(' ');

          const isPrimary = idx === 0;
          return (
            <g key={entity.name}>
              <polygon
                points={points}
                className={isPrimary ? 'fill-black/10 stroke-black dark:fill-white/10 dark:stroke-white' : 'fill-zinc-500/10 stroke-zinc-500'}
                strokeWidth="2"
              />
              {entity.scores.map((s, i) => {
                const { x, y } = getCoordinates(i, s.score);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3.5"
                    className={isPrimary ? 'fill-black dark:fill-white' : 'fill-zinc-500'}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
        {axisLabels.map((label, i) => (
          <span key={i} className="font-medium text-foreground">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
```

---

## 20. COMPONENT & PROP INVENTORY REFERENCE TABLE

| Component | File Path | Props & State Managed |
|---|---|---|
| `Navbar` | `components/navbar.tsx` | Sticky liquid glass header, dynamic route links, theme switch, auth modal trigger, user avatar. |
| `AtmosphericBeam` | `components/ui/atmospheric-beam.tsx` | Ambient 30-degree electric blue lighting ray (`#016fee`). |
| `OfferPosterModal` | `components/offer-poster-modal.tsx` | Welcome flash sale modal with countdown, benefits bullets, haptic copy, and frequency cap. |
| `BatchChallengePortal`| `components/admin/BatchChallengePortal.tsx` | Presets ($5K-$1M), uniform rules cloning, global discount slider, CSV import/export, atomic batch writes. |
| `DynamicRadarChart` | `components/ui/radar-chart.tsx` | 5-axis SVG polygon comparison chart for firms and challenges. |
| `ProfitSplitGauge` | `components/ui/profit-split-gauge.tsx` | Animated SVG circular percentage gauge. |
| `CopyButton` | `components/ui/copy-button.tsx` | 7-frame Framer Motion vibration shake, mobile haptics (`[40, 50, 40]ms`), clipboard API. |
| `ReferralTracker` | `components/referral-tracker.tsx` | Listens for `?ref=CODE`, validates against Firestore, sets 30-day cookie attribution. |
| `PhoneCaptureModal` | `components/ui/phone-capture-modal.tsx` | VIP WhatsApp/SMS capture modal with dual-channel sync to Firestore and Google Sheets. |
| `RatingBadge` | `components/ui/rating-badge.tsx` | Formatted star rating badge with Bayesian smoothing. |

---

## 21. THE PLATFORM TRANSFORMATION & RESHAPING GUIDE

If you possess a pre-made template, directory, SaaS, or admin dashboard and wish to reshape it into EMPIRIAL 2.0, execute these sequential phases:

```
┌────────────────────────────────────────────────────────┐
│             PHASE 1: DESIGN TOKENS PURGE               │
│ • Remove all custom brand colors from globals.css      │
│ • Replace with pure monochrome tokens & #016fee beam   │
│ • Force next-themes dark mode with OLED #0A0A0A base   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             PHASE 2: SURFACE RESTYLING                 │
│ • Convert all card corners to rounded-[24px]           │
│ • Convert featured cards to bg-[#f4f4f5] border-2      │
│ • Re-wrap navigation with backdrop-blur-xl liquid glass│
│ • Embed AtmosphericBeam into app/layout.tsx            │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             PHASE 3: INTERACTION LOGIC                 │
│ • Wire Framer Motion 7-frame shake on affiliate clicks │
│ • Enforce clipboard copy before redirecting to links   │
│ • Add @number-flow/react to all stats and metrics      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             PHASE 4: DATA & ROUTE HYDRATION            │
│ • Map database models to lib/types/index.ts            │
│ • Implement 13-column challenge matrix table           │
│ • Mount BatchChallengePortal into /admin/challenges    │
│ • Wire two-way support chat and referral tracking      │
└───────────────────────────┘
```

---

## 22. THE ULTIMATE SINGLE MASTER BOOTSTRAP PROMPT

> **PROMPT COPY INSTRUCTION:**  
> Copy and paste the entire prompt below into any frontier AI agent (Gemini, Claude, GPT, Antigravity) to build or transform your platform into EMPIRIAL 2.0 in a single execution.

```markdown
You are the Principal Systems Architect and Frontend Engineer tasked with building (or completely reshaping this project into) EMPIRIAL 2.0, an institutional-grade proprietary trading evaluation and intelligence platform created by ANURAJ FX (#BuildingEmpires).

You must adhere strictly to these non-negotiable rules:

1. VISUAL DESIGN LANGUAGE (STRICT MONOCHROME):
   - Pure blacks (#000000, #0A0A0A, #131316), pure whites (#FFFFFF), and zinc neutrals.
   - The ONLY chromatic accent is the Atmospheric Tilted Light Ray (Color: #016fee with 75px Gaussian blur, rotated 30 degrees across the canvas).
   - Dual-state liquid glass: High-translucency frosted white (bg-white/70 backdrop-blur-md) in light mode, deep OLED (bg-black/70 backdrop-blur-xl) in dark mode.
   - Card Geometry: Default cards use rounded-[24px], border border-zinc-200 (dark:border-zinc-800), bg-white (dark:bg-card). Featured cards use bg-[#f4f4f5] (dark:bg-card) with a solid 2px black (dark:white) border and glowing shadow.
   - Typography: Hero uses font-medium tracking-tighter with bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text. Section headings use text-xl font-semibold sm:text-2xl. Numbers and metrics use bold tracking-tight with @number-flow/react.
   - Partner Logos: Preserve 100% of authentic original brand colors with rounded-md/rounded-lg corners. NEVER grayscale partner logos.

2. CORE INTERACTION MECHANICS:
   - Copy-to-Claim Safeguard: Clicking "Buy Challenge" or "Claim Offer" without copying the code MUST trigger a 7-frame horizontal vibration shake (x: [-6, 6, -6, 6, -3, 3, 0]), display an alert toast, trigger mobile haptics (40ms, 50ms, 40ms), copy code to clipboard, and only then open the affiliate URL in a new tab.
   - Bayesian Rating Engine: Calculate firm ratings using the 4-criteria weighted formula: (Trading Conditions + Customer Care + Payout Process + User Friendliness) / 4. Include alias resolution for "Sure Leverage" / "SLF".
   - Radar Chart Engine: Calculate 5 normalized scores (0-100) for Max Allocation, Profit Split, Max Drawdown, Consistency, and Min Trading Days, rendered on a dynamic SVG polygon radar chart.
   - Spreads Cost Formula: Effective Cost = (Spread Pips * 10) + Commission per lot.
   - Offer Poster Modal: Display once per session with countdown timer, discount tag, coupon copy, and affiliate redirect.
   - Dual-Channel Lead Capture: Capture phone number post-login and dispatch to both Firestore and Google Sheets webhook.

3. ROUTING & FEATURE SURFACE:
   - Public: Homepage (/), Prop Firms Directory (/firms), Firm Profile Hub (/firms/[slug] with 5 tabs), 13-Column Challenges Matrix (/challenges), Verified Deals (/deals), Side-by-Side Comparison (/compare), Forensic Payout Proofs (/payouts with lightbox zoom), Live Spreads Matrix (/spreads), Industry Awards (/awards with 1-vote-per-category logic), State Hall Social Feed (/blog with creator badges & link previews), Blog Article (/blog/[slug]), Community Forums (/community), Trader Profile Hub (/profile with purchased accounts tracker, reviews, passes, two-way support chat, and 15% referral store), Tournaments Hub (/events with flying trophy celebration and ticket passport), Dynamic Categories (/[category]), and Institutional Informational pages (/about, /rules, /rule-changes, /transparency, /leaderboard, /loyalty, /pricing, /affiliate-program, /demo-accounts, /contact).
   - Admin Panel (/admin): Role-Based Access Control (Super Admin, Editor, Moderator, Support Agent), Executive Dashboard, Firms CRUD with relational cascade, Batch Challenge Portal (presets $5K to $1M, uniform rules cloning, global discount slider, CSV/JSON spreadsheet import/export, atomic batch writes), Deals CMS with click telemetry, Payouts Audit Desk, Reviews Moderation with Official Firm Replies, State Hall Creator Verification Desk, Events Manager, Awards Manager, Spreads Manager, Market Ticker Editor, Two-Way Support Ticket Inbox, Referrals & Rewards Approval Desk, Page Builder CMS, Media Storage Library, and Offer Popup Controller.

4. BACKEND & DATA CONTRACT:
   - Use Cloud Firestore with 17 top-level collections and 3 user subcollections (purchasedAccounts, referrals, redeemedRewards).
   - Use Firebase Storage for logos, posters, proofs, and avatars.
   - Implement Discord OAuth2 and Google Sheets sync webhooks.
   - Ensure pixel-perfect adherence to the TypeScript definitions in lib/types/index.ts and the master specification.

Build or reshape the codebase now with complete fidelity, robust typing, clean architecture, and zero placeholders.
```

---

*Canonical Master Blueprint maintained by ANURAJ FX & The EMPIRIAL 2.0 Core Engineering Team.*  
*Hashtag: `#BuildingEmpires`*
