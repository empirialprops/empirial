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
┌────────────────────────────────────────────────────────────────────────┐
│                        EMPIRIAL 2.0 ECOSYSTEM                          │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ FORENSIC AUDITING │ VERIFIED SAVINGS  │ COMMUNITY & COMPETITIONS       │
│ • 13-Col Matrix   │ • Hourly Audited  │ • State Hall Social Feed       │
│ • Drawdown Math   │ • Copy Safeguard  │ • Annual Trader Choice Awards  │
│ • Scaling Plans   │ • BOGO Aggregator │ • Tournament Passports         │
│ • Live Spreads    │ • 15% Referrals   │ • Two-Way Support Desk         │
└───────────────────┴───────────────────┴────────────────────────────────┘
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

### 3.2 Tailwind Config Tokens (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        light: 'var(--light)',
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
      },
      borderRadius: {
        lg: 'var(--radius)',               // 12px
        md: 'calc(var(--radius) - 2px)',  // 10px
        sm: 'calc(var(--radius) - 4px)',  // 8px
        xl: '12px',
        '2xl': '16px',
        '24px': '24px',
        '3xl': '24px',
        '32px': '32px',
      },
      boxShadow: {
        '2xs': '0 1px 2px rgba(0,0,0,0.04)',
        'xs': '0 1px 3px rgba(0,0,0,0.06)',
        'hover-light': '0 0 18px rgba(0,0,0,0.10)',
        'hover-dark': '0 0 22px rgba(255,255,255,0.14)',
        'featured-light': '0 0 20px rgba(0,0,0,0.14)',
        'featured-dark': '0 0 25px rgba(255,255,255,0.18)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

---

## 4. ATMOSPHERIC TILTED LIGHT RAY (SIGNATURE VISUAL EFFECT)

The signature visual element of EMPIRIAL 2.0 is an ambient diagonal electric blue beam slicing through the dark background. It provides visual elevation and depth without chromatic noise:

```
┌────────────────────────────────────────────────────────┐
│ [EMPIRIAL CANVAS]                                      │
│             \                                          │
│              \  <-- Atmospheric Beam (Rotated ~30°)   │
│               \     Color: #016fee                     │
│                \    Blur: 70px - 85px                  │
│                 \   Width: 140px, Length: 200vw        │
│                  \                                     │
└────────────────────────────────────────────────────────┘
```

### Component Implementation (`components/ui/atmospheric-beam.tsx`)
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

All floating headers, modal overlays, filter toolbars, and preview drawers utilize the liquid glass pattern:

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

### Exact Text Hierarchy Scale
1. **Hero Main Headline**:
   - `text-4xl font-medium tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl`
   - Gradient Text Effect: `bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text`
2. **Section Titles**:
   - `text-xl font-semibold sm:text-2xl md:text-3xl tracking-tight bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text`
   - *Rule*: Never make section headings all-caps or extrabold. Keep them refined and clean.
3. **Subheadings & Descriptions**:
   - `text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed`
4. **Card / Item Headings**:
   - `text-lg font-semibold tracking-tight text-foreground`
5. **Numbers & Metrics**:
   - `text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground`

---

## 7. BUTTON SYSTEM & COPY-TO-CLAIM VIBRATION ENGINE

### 7.1 Button Token Styles
1. **Primary Button** (Main Conversion Action):
   ```tsx
   className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-200"
   ```
2. **Secondary / Outline Button** (Exploration & Navigation):
   ```tsx
   className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-2xs transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800/60"
   ```
3. **Ghost / Action Button**:
   ```tsx
   className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
   ```

### 7.2 Copy-to-Claim Physical Vibration Engine
Prevents traders from buying challenges without copying their exclusive discount code:
```tsx
import { motion } from 'framer-motion';

// Vibration shake animation trigger
const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [-6, 6, -6, 6, -3, 3, 0],
    transition: { duration: 0.45, ease: 'easeInOut' }
  }
};

// Clipboard copy with mobile haptic feedback
async function handleCopy(code: string) {
  await navigator.clipboard.writeText(code);
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([40, 50, 40]); // Physical tactile buzz
  }
}
```

---

## 8. CARD HIERARCHY & CONTAINER SPECIFICATIONS

EMPIRIAL 2.0 strictly separates standard cards from featured/popular cards:

### 8.1 Standard Card Container
```tsx
className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-2xs transition-all duration-300 hover:border-zinc-400 hover:shadow-hover-light dark:border-zinc-800 dark:bg-card dark:hover:border-zinc-600 dark:hover:shadow-hover-dark"
```

### 8.2 Featured / Most Popular Card Container
Featured cards receive a subtle zinc tint (`#f4f4f5` in light mode), a prominent 2px solid border, and glowing hover shadows:
```tsx
className="relative rounded-[24px] border-2 border-black bg-[#f4f4f5] p-6 shadow-featured-light transition-all duration-300 dark:border-white dark:bg-card dark:shadow-featured-dark"
```

---

## 9. MATHEMATICAL CALCULATION ENGINES & ALGORITHMS

### 9.1 Bayesian Multi-Criteria Review Rating & Trust Score Engine
Located in `lib/utils/rating-calculator.ts`:

$$\text{Review Overall Score} = \frac{\text{Trading Conditions} + \text{Customer Care} + \text{Payout Process} + \text{User Friendliness}}{4}$$

- **Weighted Trust Score Calculation (0 to 100)**:
  $$\text{Trust Score} = \min\left(100, \operatorname{round}\left((\text{Overall Rating} \times 16) + (\text{Years Working} \times 3) + (\log_{10}(\text{Payouts USD}) \times 2)\right)\right)$$
- **SLF / Alias Resolver**: Automatically resolves aliases across multi-brand names:
  ```typescript
  const isFirmSlf = ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(id) || name.includes('sure leverage');
  ```

### 9.2 Comparison & 5-Axis Dynamic SVG Radar Chart Engine
Located in `lib/utils/comparison-calc.ts`:

```
                 Max Allocation / Drawdown (100)
                              ▲
                             / \
                            /   \
     Min Trading Days (100) ───── Payout Speed (100)
                          \     /
                           \   /
                            ▼
              Profit Split (100) ── Consistency (100)
```

1. **Max Allocation Score**:
   - $\ge \$4,000,000 \to 100$
   - $\ge \$2,500,000 \to 95$
   - $\ge \$2,000,000 \to 90$
   - $\ge \$1,500,000 \to 80$
   - $\ge \$1,000,000 \to 70$
   - $<\$1,000,000 \to \max(30, \operatorname{round}((\text{Allocation} / 1,000,000) \times 70))$
2. **Profit Split Score**:
   - $100\% \to 100$
   - $\ge 90\% \to 92$
   - $\ge 85\% \to 82$
   - $\ge 80\% \to 72$
   - $<80\% \to 55$
3. **Max Drawdown Limit**:
   - $\ge 12\% \to 100$
   - $\ge 10\% \to 90$
   - $\ge 8\% \to 78$
   - $\ge 6\% \to 60$
   - $<6\% \to 45$
4. **Consistency Rule**: No Rule / Balanced = $100$ (Best); Restrictive rule = $75$.
5. **Min Trading Days**: 0 Days = $100$ (Instant); $\le 3$ Days = $85$; $\le 5$ Days = $70$; $>5$ Days = $50$.
6. **Payout Frequency**: 6hr SLA / On-Demand = $100$; Weekly = $90$; Bi-Weekly = $80$; Monthly = $60$.

### 9.3 Broker Raw Spreads & Effective Lot Cost Engine
Located in `app/spreads/SpreadsClient.tsx`:
$$\text{Effective Round-Turn Cost per Standard Lot} = (\text{Spread in Pips} \times 10) + \text{Commission per Lot}$$
*Example: Raw spread 0.2 pips with $3.00 commission $\to (0.2 \times 10) + 3.00 = \$5.00$ total cost per lot.*

### 9.4 Session-Capped Welcome Offer Modal Engine
Located in `components/offer-poster-modal.tsx` & `lib/utils/offer-popup-store.ts`:
- **Frequency Capping Logic**:
  ```typescript
  const hasSeenModal = sessionStorage.getItem('empirial_offer_seen_v2');
  if (!hasSeenModal) {
    // Open modal and set timestamp
    sessionStorage.setItem('empirial_offer_seen_v2', 'true');
  }
  ```
- **Countdown Engine**: Dynamic countdown calculating days, hours, minutes, and seconds until `expiresAt`.

### 9.5 Referral Attribution & 15% Commission Engine
Located in `components/referral-tracker.tsx`:
- Listens to URL query parameter: `?ref=CODE`.
- Validates code against Firestore `users` collection.
- Records attribution in `localStorage` for 30-day persistence.
- **Conversion Points**:
  - Registration conversion: Referrer and invitee each receive $+100$ Loyalty Points.
  - Evaluation purchase conversion: Credits 15% partner commission ledger or equivalent challenge refund points.

### 9.6 VIP Phone Capture & Dual-Channel Sync Engine
Located in `components/ui/phone-capture-modal.tsx`:
- Prompts newly registered Google/Discord traders for their WhatsApp/SMS number.
- **Dual-Channel Dispatch**:
  1. Updates Firestore `users/{uid}.phoneNumber`.
  2. Dispatches asynchronous webhook to Google Sheets via `lib/firebase/auth-sync.ts` (`dispatchUserToSheet`).

---

## 10. VISUAL ASSETS & IMAGE MANIFEST

The platform includes a dedicated library of institutional brand graphics, partner emblems, and promotional posters:

### 10.1 Platform Brand Assets & Emblems
- **EMPIRIAL Dark Logo**: `public/logos/empirial-dark-logo.png`
- **EMPIRIAL Light Logo**: `public/logos/empirial-light-logo.png`
- **EMPIRIAL Trident Emblem (Dark)**: `public/logos/empirial-trident-dark.png`
- **EMPIRIAL Trident Emblem (Light)**: `public/logos/empirial-trident-light.png`

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EMPIRIAL BRAND MARKS                            │
│  [Dark Logo]     public/logos/empirial-dark-logo.png                   │
│  [Light Logo]    public/logos/empirial-light-logo.png                  │
│  [Dark Trident]  public/logos/empirial-trident-dark.png                │
│  [Light Trident] public/logos/empirial-trident-light.png               │
└────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Official Partner Prop Firm Logos
All partner logos must be rendered using their authentic original corporate colors with smooth `rounded-md` or `rounded-lg` corners:
- **Alpha Capital**: `public/logos/alpha-capital.png`
- **NYS Capital**: `public/logos/nys.png`
- **CK Capital**: `public/logos/ck-capital.avif`
- **Pipstone**: `public/logos/pipstone.png`
- **Shark Funded**: `public/logos/shark-funded.webp`
- **Sure Leverage Funding**: `public/logos/sure-leverage.jpg`
- **GTF**: `public/logos/gtf.svg`
- **FundedNext**: `public/logos/fundednext.svg`
- **Funding Pips**: `public/logos/funding-pips.svg`
- **Topstep**: `public/logos/topstep.svg`
- **The5ers**: `public/logos/the5ers.svg`
- **FTMO**: `public/logos/ftmo.svg`
- **Apex Trader Funding**: `public/logos/apex.svg`
- **Dolvero**: `public/logos/dolvero.svg`

### 10.3 Supported Trading Platform Badges
- **cTrader**: `public/platforms/ctrader.svg`
- **MetaTrader 5 (MT5)**: `public/platforms/mt5.png`
- **Match-Trader**: `public/platforms/match-trader.svg`
- **TradeLocker**: `public/platforms/tradelocker.jpeg`
- **NinjaTrader**: `public/platforms/ninjatrader.svg`
- **Tradovate**: `public/platforms/tradovate.png`
- **TradingView**: `public/platforms/tradingview.png`
- **Bookmap**: `public/platforms/bookmap.jpeg`
- **ATAS**: `public/platforms/atas.jpeg`
- **Deepcharts**: `public/platforms/deepcharts.jpeg`
- **MultiCharts**: `public/platforms/multicharts.svg`

### 10.4 Promotional Banners & Posters
- **Funded Futures Family Flash Sale**: `public/posters/funded-futures-family.jpg` (Used inside the Welcome Offer Poster Modal).

---

## 11. COMPLETE PUBLIC USER PAGES & FEATURE BREAKDOWN

### 11.1 Homepage (`/`)
- **Hero Section**: Headline gradient, atmospheric tilted light ray, Primary CTA *"GRAB OFFERS"*, Secondary CTA *"Join Discord"*.
- **Live Market Ticker**: Financial rates for `EURUSD`, `GBPUSD`, `USDJPY`, `XAUUSD`, `BTCUSD`, and `US30` with real-time green/red 24h percentage movements.
- **Bento Dashboard Grid**: Multi-panel interactive showcase of platform features.
- **Verified Prop Firms Marquee**: Infinite auto-scrolling partner logo grid with tooltip company names.
- **Home Challenges Showcase**: Interactive category selector with direct challenge tier pricing and discount tags.
- **Featured Deals & BOGO Showcase**: 3 highlighted flash promotions with expiration clocks.
- **3-Tier Pricing & Challenge Cards**: 3-column pricing comparison card with copy-code safeguard and shaking vibration animation.
- **Animated Statistics Counter**: `@number-flow/react` counters (50K+ Active Traders, 40+ Listed Firms, 12K+ Reviews, 150+ Challenges).
- **Testimonials Grid**: Expandable grid of trader reviews with avatars, star ratings, and firm associations.
- **FAQ Accordion**: 5-item accordion answering key platform evaluation questions.
- **Welcome Offer Poster Modal**: Flash sale popup with copy-first discount enforcement.

### 11.2 Prop Firms Directory (`/firms`)
- **Search Bar**: Real-time fuzzy text search filtering firms by name, country, or supported platform.
- **Category Tabs**: All, Forex, Futures, Crypto, Instant Funding.
- **11-Platform Filter**: Checklist for `cTrader`, `MT5`, `MT4`, `TradeLocker`, `Match-Trader`, `NinjaTrader`, `Tradovate`, `TradingView`, `Bookmap`, `ATAS`, `Deepcharts`, `MultiCharts`.
- **Model Filter**: 1-Step, 2-Step, 3-Step, Instant Funding.
- **Allocation Slider**: Range slider filtering minimum max capital from `$0` to `$2.5M+`.
- **Sorting Options**: Popularity, Trust Score, Max Allocation, Best Value, Rating.
- **Firm Cards**:
  - Official brand logo with preserved corporate colors.
  - Trust Score badge (e.g. `99/100`), Audited badge, HQ country, Founded year.
  - Metrics: Max Allocation, Profit Split gauge, Payout frequency (`Bi-Weekly / 6hr SLA`).
  - Expandable Specifications Drawer.
  - Copy-to-Claim safeguard button with coupon clipboard copy and direct affiliate routing.

### 11.3 Deep Prop Firm Profile Hub (`/firms/[slug]`)
5 dedicated sub-hub tabs:
1. **Rules & Specs Overview**: Consistency & risk policies, drawdown mechanics (trailing vs static), payout scaling roadmap, restricted jurisdictions list, active promo highlight.
2. **Challenges Catalog**: Filterable grid of all challenge tiers provided by this firm with prices, targets, drawdowns, and buy CTAs.
3. **Promo Deals & Coupons**: Catalog of all active discount coupons, BOGO vouchers, and cashback rates for this firm.
4. **Verified Trader Reviews**: Firm-specific review feed with 4 sub-ratings, verified buyer badges, and official firm executive replies.
5. **Forensic Payout Proofs**: Audited payout gallery belonging specifically to traders funded by this firm.

### 11.4 13-Column Evaluation Challenges Matrix (`/challenges`)
Forensic comparison matrix auditing challenges across 13 parameters:
1. Firm Logo & Name.
2. Account Size ($5K to $1M).
3. Challenge Name & Step Type (1-Step, 2-Step, Instant).
4. Effective Price & Strikethrough Original Price.
5. Profit Split Percentage (with circular SVG gauge).
6. Daily Loss Limit Percentage (3% to 5%).
7. Maximum Loss Limit & Loss Type (`Trailing Equity` vs `Static Balance`).
8. Profit Target Percentage (Phase 1 & Phase 2).
9. Minimum & Maximum Trading Days.
10. Payout Frequency (Bi-Weekly, 5-Day, Daily, 6hr SLA).
11. Leverage (1:100, 1:30, 1:2).
12. Refundable Fee Status (100% or 200% fee refund on first payout).
13. Safeguarded Action: Copy Code + Buy Challenge CTA with vibration check.

### 11.5 Verified Deals & BOGO Catalog (`/deals` & `/offers`)
- Hourly verified telemetry banner.
- Filter tabs: All Deals, BOGO Deals, Cashback, Fee Refunds, Direct Discounts.
- Deal cards displaying clicks telemetry, expiration countdown, discount tag, and haptic copy button.

### 11.6 Side-by-Side Comparison Engine (`/compare`)
- Compare Prop Firms mode vs Compare Challenges mode.
- Up to 4-slot multi-selector.
- Interactive 5-Axis Dynamic SVG Radar Chart plotting Drawdown Safety, Payout Speed, Profit Split, Spread Efficiency, and Trust Score.
- 20+ parameter side-by-side comparison table with winning cells highlighted.

### 11.7 Forensic Payout Proofs Registry (`/payouts`)
- Audited payout volume rollup counter (`$15,280,000+`).
- Regional filtering (India, UAE, USA, Europe, Asia, Global).
- Trading Concept filtering (ICT/SMC, Price Action, Scalping, Algorithmic EA, Swing).
- Lightbox modal with high-definition screenshot inspection.
- Public payout submission modal with image upload.

### 11.8 Live Broker Spreads & Liquidity Matrix (`/spreads`)
- Multi-instrument feed: `EURUSD`, `GBPUSD`, `USDJPY`, `XAUUSD`, `BTCUSD`, `US30`.
- Raw spread in pips, commissions per lot, and effective round-turn lot cost.
- Platform and account type classification with live feed status badges.

### 11.9 Industry Trader Choice Awards 2026 (`/awards`)
- Annual voting hub for prop trading categories.
- Authenticated session checking: **1 vote per category per user**.
- Real-time percentage vote-share progress bars and live vote tallies.

### 11.10 State Hall Community Feed (`/blog`)
- Trader social network categorized by: Offers, Knowledge, Psychology, Rules, Insights, Community.
- Sorting: Popular (algorithmic engagement) vs Latest.
- Post Composer for verified creators (Markdown, image upload, rich link preview generator).
- Author role badges: `Prop Firm Official`, `Funded Trader`, `Market Analyst`, `Admin`.
- Creator verification application modal.

### 11.11 Strategic Knowledge Guides (`/blog/[slug]`)
- Long-form markdown articles authored by market mentors and ANURAJ FX.
- Reading time, author bio, table of contents, and embedded contextual challenge matrix CTAs.

### 11.12 Community Discussion Forums (`/community`)
- Threaded discussions categorized by tags.
- Nested comment threads, upvotes, downvotes, and view counters.

### 11.13 Trader Command Center (`/profile`)
- **Trader ID Card**: Avatar, display name, Trader ID (`EMP-XXXXX`), points balance, Discord handle.
- **5 Sub-Dashboards**:
  1. *Dashboard*: Purchased account tracker with status badges (`Active`, `Passed`, `Scaling`, `Funded`).
  2. *My Reviews*: Submitted reviews, approval status, firm replies, and upvotes.
  3. *Registered Events*: Tournament passes, verification status, printable ticket passports.
  4. *Support Tickets*: Real-time two-way chat desk exchanging messages with admin desk.
  5. *Referrals & Rewards*: Referral link, invitees table, commission statistics, and points redemption store.

### 11.14 Trader Tournaments & Event Hub (`/events`)
- Tournaments, gaming combines, educational hackathons, live bootcamps.
- Prize pool breakdown (1st, 2nd, 3rd, Top 50).
- Discord task verification and screenshot proof uploader.
- Flying trophy celebration animation and printable ticket passport generation.

### 11.15 Dynamic Market Category Hubs (`/[category]`)
- Dynamic routes for `/forex`, `/futures`, `/crypto`, and `/instant-funding`.
- Sub-routes for `/[category]/challenges` and `/[category]/deals`.

### 11.16 Institutional Informational Pages
- `/about`: Platform history, leadership, audit methodology.
- `/how-it-works`: 3-step trader roadmap.
- `/rules`: Comprehensive rule encyclopedia (equity drawdowns, news rules, EA rules).
- `/rule-changes`: Real-time historical prop firm policy modification changelog.
- `/transparency`: 4 Fundamental Commitments & anti-bias declarations.
- `/leaderboard`: Performance Hall of Fame (Top 8 audited traders podium).
- `/loyalty`: Milestone tier progression (`Novice`, `Pro`, `Elite`, `Sovereign`).
- `/affiliate-program`: 15% partner commission structure.
- `/demo-accounts`: Curated free 14-day practice combine links.
- `/contact`: Multi-topic inquiry routing.
- `/careers`: Employment opportunities.
- `/privacy-policy` & `/terms-and-conditions`: Full legal compliance documents.

---

## 12. TRADER AUTHENTICATION & IDENTITY ARCHITECTURE

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

## 13. INSTITUTIONAL ADMIN PANEL & FULL CMS PLATFORM (`/admin`)

### 13.1 Role-Based Access Control (RBAC) & Audit Logs
- **4 Admin Roles** (`/admin/roles`):
  1. *Super Admin*: Complete control over roles, settings, and database wipes.
  2. *Editor*: Full CRUD over Prop Firms, Challenges, Deals, Blog, and CMS Page Builder.
  3. *Moderator*: Review moderation, State Hall creator approvals, and payout audits.
  4. *Support Agent*: Handles Support Tickets and referral inquiries.
- **Audit Logs** (`/admin/logs`): Complete audit ledger logging every admin action with timestamps, admin email, IP, and affected collection.

### 13.2 Executive Admin Dashboard (`/admin`)
- Live KPI counter cards for Listed Firms, Active Challenges, Deals, Payouts, Reviews, and Users.
- Quick action triggers and system health monitors.

### 13.3 Prop Firms Desk (`/admin/firms`)
- Full CRUD over prop firm master documents.
- Relational Cascade: Updating firm name or logo URL automatically cascades updates to all linked challenges, deals, and payouts.

### 13.4 Challenge Accounts & Batch Portal (`/admin/challenges`)
- Single challenge form.
- **Batch Challenge Portal (`BatchChallengePortal.tsx`)**:
  - $5K to $1M size presets.
  - Uniform rules cloning across selected sizes.
  - Global discount percentage slider calculating effective prices automatically.
  - CSV/JSON spreadsheet import and export.
  - Atomic batch write to Firestore.

### 13.5 Deals & Promo Codes CMS (`/admin/deals`)
- CRUD over discount coupons, BOGO deals, cashback offers, and fee refunds.
- Live click telemetry counters and expiration date pickers.

### 13.6 Forensic Payouts Audit Desk (`/admin/payouts`)
- Moderation queue for user payout submissions (Approve/Verify, Reject, Edit).
- Proof screenshot inspection and Storage file uploader.

### 13.7 Reviews Moderation Desk & Firm Replies (`/admin/reviews`)
- Moderation desk for approving/rejecting user reviews.
- Official Firm Reply authoring box appending company responses directly below reviews.

### 13.8 State Hall & Creator Verification Desk (`/admin/social`)
- Creator badge application queue (Approve, Reject, Revoke).
- Pinned announcement composer broadcasting alerts to the top of the feed.

### 13.9 Tournaments & Events Manager (`/admin/events`)
- Tournament scheduler, prize breakdown editor, Discord task configuration, participant manager.

### 13.10 Industry Awards Manager (`/admin/awards`)
- Category CRUD, firm nominee manager, live vote tallies, and voting toggles.

### 13.11 Blog & Strategy CMS (`/admin/blog`)
- Split-screen markdown authoring suite, reading time calculator, cover image uploader, author assignment.

### 13.12 Live Broker Spreads Desk (`/admin/spreads`)
- Raw spread and commission editor with instant effective cost calculation preview.

### 13.13 Market Ticker Rate Editor (`/admin/market-ticker`)
- Real-time price and 24h change values editor for ticker bar instruments.

### 13.14 Two-Way Support Ticket Inbox (`/admin/messages`)
- Unified helpdesk inbox for responding to trader support conversations in real time.

### 13.15 Referrals & Rewards Approval Desk (`/admin/referrals`)
- Referral network audit, commission approval, and loyalty reward redemption fulfillment.

### 13.16 Page Builder CMS (`/admin/page-builder`)
- Homepage hero text, CTA buttons, partner logo marquee, testimonials, FAQs, and footer manager.

### 13.17 Media & Asset Library (`/admin/media`)
- Visual file manager for Firebase Storage with folder organization and public CDN URL copy.

### 13.18 Global Site Settings & Offer Popup Controller (`/admin/settings`)
- Global maintenance mode toggle, brand settings, and Welcome Offer Poster Modal controls.

---

## 14. DATABASE ARCHITECTURE & COMPLETE FIRESTORE SCHEMAS

The database structure consists of **17 top-level collections** and **3 user subcollections**:

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

### Complete TypeScript Interfaces (`lib/types/index.ts`)
```typescript
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
  firm_rules_content?: string;
  restricted_countries?: string[];
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
  loss_type?: 'Trailing' | 'Static';
  rules?: string;
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
  offer_type?: 'bogo' | 'cashback' | 'refund' | 'discount';
  offer_badge?: string;
  refund_pct?: number;
  cashback_pct?: number;
  is_bogo?: boolean;
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

export interface Event {
  id: string;
  title: string;
  slug?: string;
  category: 'giveaway' | 'event';
  sub_category: string;
  type?: string;
  entry_type: 'free' | 'paid';
  entry_fee?: number;
  is_firm_sponsored: boolean;
  firm_id?: string;
  firm_name?: string;
  firm_logo?: string;
  host_name: string;
  prize_pool: string;
  start_date: string;
  end_date: string;
  participants_count: number;
  max_participants?: number;
  registration_url: string;
  poster_url?: string;
  is_active: boolean;
  is_featured?: boolean;
  description: string;
  rules?: string[];
  schedule?: string;
  prizes_breakdown?: Array<{ place: string; reward: string }>;
  requires_discord?: boolean;
  discord_url?: string;
  registration_tasks?: Array<{
    id: string;
    title: string;
    type: 'discord' | 'follow' | 'form' | 'submit_id';
    action_url?: string;
  }>;
}

export interface Award {
  id: string;
  category_name: string;
  description: string;
  nominated_firms: Array<{ firm_id: string; firm_name: string; votes: number; logo_url?: string }>;
  year: number;
  is_voting_open: boolean;
  voted_user_ids?: string[];
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
  official_reply?: {
    firm_name: string;
    body: string;
    replied_at: string;
  };
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
  link_preview?: {
    url: string;
    title?: string;
    description?: string;
    domain?: string;
    image?: string;
  };
  category: 'PROP FIRM OFFERS' | 'TRADING KNOWLEDGE' | 'TRADING PSYCHOLOGY' | 'ACCOUNT RULES' | 'TRADER INSIGHTS' | 'COMMUNITY';
  upvotes: number;
  downvotes: number;
  upvoted_by: string[];
  downvoted_by: string[];
  created_at: string;
  is_pinned?: boolean;
}

export interface UserPurchasedAccount {
  id: string;
  firm_id: string;
  firm_name: string;
  firm_logo?: string;
  account_name: string;
  account_size: number;
  account_number: string;
  order_id: string;
  platform: string;
  status: 'Active Evaluation' | 'Phase 2 In Progress' | 'Passed / KYC' | 'Funded Account' | 'Scaling Active';
  purchased_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  category: 'Evaluation Query' | 'Affiliate Discount' | 'Payout Issue' | 'Technical Bug';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  messages: Array<{
    sender: 'user' | 'admin';
    sender_name: string;
    text: string;
    timestamp: string;
  }>;
}
```

---

## 15. FIREBASE STORAGE ARCHITECTURE

```
storage-bucket-root
 ├── firms/
 │    └── {firmId}/
 │         └── logo.png                # High-res partner logo
 ├── events/
 │    └── {eventId}/
 │         ├── poster.jpg              # Tournament poster artwork
 │         └── proofs/                 # User submitted cTrader/Discord proofs
 ├── payouts/
 │    └── {payoutId}/
 │         └── proof.jpg               # Audited payout receipt screenshot
 ├── blog/
 │    └── {slug}/
 │         └── cover.jpg               # Article cover image
 ├── posters/
 │    └── flash-sales/                 # Offer poster modal artwork
 └── avatars/
      └── {uid}/
           └── avatar.png              # User profile photo
```

---

## 16. SECURITY RULES SPECIFICATION (FIRESTORE & STORAGE)

### Firestore Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Public Readable Entities
    match /firms/{id} { allow read: if true; allow write: if isAdmin(); }
    match /challenges/{id} { allow read: if true; allow write: if isAdmin(); }
    match /deals/{id} { allow read: if true; allow write: if isAdmin(); }
    match /brokerSpreads/{id} { allow read: if true; allow write: if isAdmin(); }
    match /events/{id} { allow read: if true; allow write: if isAdmin(); }
    match /awards/{id} { allow read: if true; allow write: if isAdmin(); }
    match /blogPosts/{id} { allow read: if true; allow write: if isAdmin(); }
    match /siteSettings/{id} { allow read: if true; allow write: if isAdmin(); }
    match /testimonials/{id} { allow read: if true; allow write: if isAdmin(); }
    match /faqs/{id} { allow read: if true; allow write: if isAdmin(); }
    match /partnerLogos/{id} { allow read: if true; allow write: if isAdmin(); }
    match /marketTickers/{id} { allow read: if true; allow write: if isAdmin(); }
    match /loyaltyRewards/{id} { allow read: if true; allow write: if isAdmin(); }

    // User Profile & Private Data
    match /users/{userId} {
      allow read: if true;
      allow write: if isOwner(userId) || isAdmin();
      
      match /purchasedAccounts/{accId} {
        allow read, write: if isOwner(userId) || isAdmin();
      }
      match /referrals/{refId} {
        allow read, write: if isOwner(userId) || isAdmin();
      }
      match /redeemedRewards/{rewId} {
        allow read, write: if isOwner(userId) || isAdmin();
      }
    }

    // User Submissions with Moderation
    match /reviews/{id} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin() || (isAuthenticated() && resource.data.user_id == request.auth.uid);
    }
    
    match /payouts/{id} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    match /eventRegistrations/{id} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    match /supportTickets/{id} {
      allow read, create, update: if isAuthenticated();
      allow delete: if isAdmin();
    }

    match /socialPosts/{id} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (resource.data.author_id == request.auth.uid || isAdmin());
    }

    match /admins/{id} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 17. SEO, SOCIAL GRAPH & TELEMETRY SPECIFICATIONS

### 17.1 Automated XML Sitemap (`app/sitemap.ts`)
Generates dynamic URLs for:
- Static pages: `/`, `/firms`, `/challenges`, `/deals`, `/compare`, `/payouts`, `/spreads`, `/awards`, `/blog`, `/community`, `/events`, `/about`, `/rules`.
- Dynamic categories: `/forex`, `/futures`, `/crypto`, `/instant-funding`.
- Dynamic firm profiles: `/firms/${firm.slug}` for all listed firms.
- Dynamic blog articles: `/blog/${post.slug}` for all published guides.

### 17.2 Robots Policy (`app/robots.ts`)
- Allows public indexing on all content hubs.
- Explicitly disallows `/admin/`, `/profile/`, and `/api/` endpoints.

### 17.3 JSON-LD Structured Schemas
- Injects `Organization` schema with ANURAJ FX leadership and official links.
- Injects `Product` schema on `/challenges` with price and ratings.
- Injects `Review` schema on `/reviews` for Google rich snippets.
- Injects `FAQPage` schema on `/` for accordion search results.

---

## 18. PRODUCTION SCRIPTS & AUTOMATIONS

### 18.1 Universal Firestore Database Seeder Script (`lib/firebase/seeder.ts`)
Seeds all 17 collections in batches of 400 with Firestore `writeBatch`:
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
import { MOCK_TICKERS, TRUST_STATS, PARTNER_LOGOS, TESTIMONIALS, PRICING_PLANS, FAQ_ITEMS } from '../data/site-data';

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
Provisions an admin user in Firebase Auth and registers role permissions in the `admins` collection:
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
Install into Google Sheets Apps Script editor to receive real-time trader lead dispatches:
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

    // Redirect to profile with token details or trigger custom session
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
  percentage: number; // e.g. 80, 90, 100
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
        {/* Concentric rings */}
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

        {/* Radial axes */}
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

        {/* Entity polygons */}
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
