/goal # MASTER BACKEND & ADMIN SPECIFICATION — EMPIRIAL 2.0

> **DOCUMENT PURPOSE & IMPLEMENTATION DIRECTIVE**  
> This specification is the single source of truth for engineering the complete **Firebase Backend (Firestore, Storage, Authentication, Cloud Functions, Security Rules)**, **Data Layer**, and **Full-Featured Admin Panel / CMS** for the **EMPIRIAL 2.0** prop trading intelligence platform.
> 
> **CRITICAL ENVIRONMENT NOTE**:  
> No backend code is to be implemented on this machine. This specification has been compiled by analyzing the live source code across all pages, layouts, components, modals, stores, and mock data. Another developer or AI on a separate system will build the backend and Admin Panel using strictly this document and their own Firebase environment credentials.
>
> **DESIGN PRESERVATION MANDATE**:  
> The existing frontend UI design (monochrome black/white theme, typography, cards, badges, radar charts, modals, haptic animations, glowing light beams) must remain pixel-perfect and unmodified. The backend integration replaces mock states behind the existing components.

---

## TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Current Technology Stack](#2-current-technology-stack)
3. [Complete Route List](#3-complete-route-list)
4. [Complete Page Inventory & UI Breakdown](#4-complete-page-inventory--ui-breakdown)
5. [Complete Component Analysis](#5-complete-component-analysis)
6. [Hardcoded Content Audit & Classification](#6-hardcoded-content-audit--classification)
7. [Dynamic Content & Editability Architecture](#7-dynamic-content--editability-architecture)
8. [User Features & Interaction Flow Diagrams](#8-user-features--interaction-flow-diagrams)
9. [Firestore Database Collections Directory](#9-firestore-database-collections-directory)
10. [Exhaustive Firestore Document Schemas](#10-exhaustive-firestore-document-schemas)
11. [Entity Relationship Architecture](#11-entity-relationship-architecture)
12. [Firebase Storage Architecture](#12-firebase-storage-architecture)
13. [Authentication Architecture](#13-authentication-architecture)
14. [Authorization & Role-Based Access Control (RBAC)](#14-authorization--role-based-access-control-rbac)
15. [Firestore Security Rules Specification](#15-firestore-security-rules-specification)
16. [Firebase Storage Security Rules Specification](#16-firebase-storage-security-rules-specification)
17. [Admin Panel Sitemap & Route Directory](#17-admin-panel-sitemap--route-directory)
18. [Admin Panel CRUD & Action Specifications](#18-admin-panel-crud--action-specifications)
19. [Homepage & Custom Page Builder CMS Specification](#19-homepage--custom-page-builder-cms-specification)
20. [Media & Asset Manager Specification](#20-media--asset-manager-specification)
21. [SEO & Metadata Manager Specification](#21-seo--metadata-manager-specification)
22. [Public Page to Firestore Data Mapping](#22-public-page-to-firestore-data-mapping)
23. [Admin to Firebase to Public UI Data Flows](#23-admin-to-firebase-to-public-ui-data-flows)
24. [User to Firebase Data Flows](#24-user-to-firebase-data-flows)
25. [Frontend API & Data Service Layer Requirements](#25-frontend-api--data-service-layer-requirements)
26. [Input Validation & Sanitization Specifications](#26-input-validation--sanitization-specifications)
27. [Error Handling & Fallback Strategy](#27-error-handling--fallback-strategy)
28. [Loading & Skeleton States](#28-loading--skeleton-states)
29. [Responsive & Mobile Behavior Constraints](#29-responsive--mobile-behavior-constraints)
30. [Production Security Requirements](#30-production-security-requirements)
31. [Performance, Caching & Scalability Strategy](#31-performance-caching--scalability-strategy)
32. [Safe Sequential Implementation Roadmap](#32-safe-sequential-implementation-roadmap)
33. [Automated & Manual Verification Requirements](#33-automated--manual-verification-requirements)
34. [Deployment & Environment Configuration](#34-deployment--environment-configuration)
35. [Comprehensive Admin Field Matrix](#35-comprehensive-admin-field-matrix)

---

## 1. PROJECT OVERVIEW
**EMPIRIAL 2.0** is an institutional-grade proprietary trading intelligence platform engineered by **ANURAJ FX**. It provides retail and professional prop traders with:
- Forensic evaluation challenge auditing (13+ comparison parameters: profit targets, daily loss, max trailing/static drawdowns, profit splits, refund policies, consistency rules, news restrictions).
- Verified coupon aggregator and BOGO/cashback flash deal telemetry with copy-to-claim safeguards.
- Forensic payout verification system with cryptographic transaction hash checks and payment receipt audits.
- Multi-broker raw spread monitoring matrix across major forex pairs, metals, indices, and crypto.
- Annual Trader Choice Awards with authentic community voting.
- Community Social Feed ("State Hall") with category filtering, creator verification badges, pinned announcements, and upvote/downvote mechanics.
- Complete Trader Profile Hub with purchased account trackers, review submission, tournament pass registration, real-time two-way support messaging, and a referral reward redemption store.
- High-converting session welcome modal ("Offer Poster Modal") for limited-time flash sales.

---

## 2. CURRENT TECHNOLOGY STACK
- **Framework**: Next.js 15.2.1 (App Router)
- **Runtime / UI Library**: React 19.0.0 & React DOM 19
- **Language**: TypeScript 5.8.2
- **Styling**: Tailwind CSS 3.4.17 with custom monochrome theme tokens (`elevation-base`, `elevation-surface`, `elevation-card`, `elevation-overlay`)
- **Theme**: `next-themes` (Dark Mode default with toggle support)
- **Motion & UI Primitives**: 
  - Framer Motion 13.1.1 (Smooth transitions, exit animations, shake vibrations)
  - Radix UI (@radix-ui/react-accordion, dialog, dropdown-menu, navigation-menu, separator, slot, tooltip, icons)
  - Lucide React 1.16.0 (Icons)
  - NumberFlow (@number-flow/react 0.6.2 for animated statistics counters)
- **Backend Services**: Firebase JS SDK 12.18.0 (Client) & Firebase Admin 14.3.0 (Server/Admin)

---

## 3. COMPLETE ROUTE LIST

### 3.1 Public User Routes
| Path | File Location | Purpose |
|------|--------------|---------|
| `/` | `app/page.tsx` | Main Homepage (Hero, Verified Firms marquee, Pricing table, Stats, Testimonials, FAQs, Footer) |
| `/firms` | `app/firms/page.tsx`, `app/firms/FirmsClient.tsx` | Prop Firms Directory with category filters, platforms, allocation slider, and copy-first claim |
| `/firms/[slug]` | `app/firms/[slug]/page.tsx`, `FirmProfileClient.tsx` | Prop Firm Profile Hub (5 tabs: Rules & Specs, Challenges, Promo Deals, Reviews, Payouts) |
| `/challenges` | `app/challenges/page.tsx`, `ChallengesClient.tsx` | 13-Column Evaluation Challenge Matrix with account size filters, multi-firm selector, and sorting |
| `/deals` | `app/deals/page.tsx`, `DealsClient.tsx` | Verified Discount Codes & BOGO Offers Catalog with haptic copy buttons and affiliate redirects |
| `/offers` | `app/offers/page.tsx` | Alias/Redirect to Deals catalog |
| `/events` | `app/events/page.tsx`, `EventsClient.tsx` | Tournaments, Gaming & Bootcamps Hub with task registration, screenshot proofs, and ticket passport |
| `/compare` | `app/compare/page.tsx`, `CompareClient.tsx` | Side-by-side comparison engine with Radar Chart scoring (up to 4 firms/challenges) |
| `/reviews` | `app/reviews/page.tsx`, `ReviewsClient.tsx` | Verified Trader Reviews with multi-rating criteria (Trading, Support, Payout, Usability) and submission |
| `/payouts` | `app/payouts/page.tsx`, `PayoutsClient.tsx` | Forensic Payout Proofs Grid with modal image zoom, regional/concept filters, and user upload form |
| `/spreads` | `app/spreads/page.tsx`, `SpreadsClient.tsx` | Live Broker Spreads Matrix with raw pips, commissions, and effective lot cost calculation |
| `/awards` | `app/awards/page.tsx`, `AwardsClient.tsx` | Annual Industry Awards voting hub with authenticated live vote incrementing |
| `/blog` | `app/blog/page.tsx` | State Hall (Trader Social Feed & Knowledge Hub) |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Single Blog Post / Strategic Guide with author bios and markdown content |
| `/community` | `app/community/page.tsx`, `CommunityClient.tsx` | Community Discussions Forum with nested comments and voting |
| `/profile` | `app/profile/page.tsx`, `ProfileClient.tsx` | Trader Dashboard (Accounts, Reviews, Event Passes, Support Tickets, Referrals & Rewards Store) |
| `/about` | `app/about/page.tsx` | Platform Mission, Audit Methodology, and Executive Leadership |
| `/affiliate-program` | `app/affiliate-program/page.tsx` | 15% Partner Commission Program details |
| `/announcements` | `app/announcements/page.tsx` | Official announcements feed (maps to State Hall) |
| `/contact` | `app/contact/page.tsx` | Contact & Audit Request form with topic categorization |
| `/demo-accounts` | `app/demo-accounts/page.tsx` | Free 14-day practice trial combine links |
| `/how-it-works` | `app/how-it-works/page.tsx` | 3-Step Trader Roadmap guide |
| `/leaderboard` | `app/leaderboard/page.tsx` | Performance Hall of Fame (Top 8 audited traders with podium rankings) |
| `/loyalty` | `app/loyalty/page.tsx` | Trader Points & Rewards Catalog with milestone tier progress |
| `/pricing` | `app/pricing/page.tsx` | 3-tier membership plan selection (Hobby, Pro, Enterprise) |
| `/privacy-policy` | `app/privacy-policy/page.tsx` | Data protection and legal compliance policy |
| `/rule-changes` | `app/rule-changes/page.tsx` | Prop firm historical rule modification changelog |
| `/rules` | `app/rules/page.tsx` | Compliance guide (Balance vs Equity drawdown, lot limits, news rules) |
| `/terms-and-conditions` | `app/terms-and-conditions/page.tsx` | Terms of service |
| `/transparency` | `app/transparency/page.tsx` | 4 Fundamental Commitments & Anti-Bias standards |
| `/[category]` | `app/[category]/page.tsx` | Dynamic Category Landing Page (forex, futures, crypto, instant-funding) |
| `/[category]/challenges` | `app/[category]/challenges/page.tsx` | Filtered challenge table by category |
| `/[category]/deals` | `app/[category]/deals/page.tsx` | Filtered promo deals by category |
| `not-found` | `app/not-found.tsx` | 404 Error page with return home CTA |

### 3.2 Admin Routes
| Path | File Location | Purpose |
|------|--------------|---------|
| `/admin/login` | `app/admin/login/page.tsx` | Secure Admin Authentication with email/password and session lock |
| `/admin` | `app/admin/page.tsx` | Admin Dashboard metrics (Firms, Challenges, Deals, Payouts, Reviews counters) |
| `/admin/firms` | `app/admin/firms/page.tsx` | Prop Firms Directory CRUD, featured toggles, rules & scaling management |
| `/admin/challenges` | `app/admin/challenges/page.tsx` | Challenge Account Catalog CRUD (pricing, drawdown parameters, buy URLs) |
| `/admin/deals` | `app/admin/deals/page.tsx` | Promo Deals & BOGO coupons manager (clicks tracking, expiration, discount tags) |
| `/admin/payouts` | `app/admin/payouts/page.tsx` | Payout Proofs Audit Queue (approve/verify, delete, amount, proof image) |
| `/admin/reviews` | `app/admin/reviews/page.tsx` | Reviews Moderation Desk (publish/unpublish, reply to review, verify trader) |
| `/admin/social` | `app/admin/social/page.tsx` | State Hall Creator Verification Desk & Broadcast Publisher (approve/reject creators, pin/delete posts) |
| `/admin/events` | `app/admin/events/page.tsx` | Tournaments, Giveaways & Bootcamps manager (tasks, prize breakdown, registrations) |
| `/admin/awards` | `app/admin/awards/page.tsx` | Annual Awards Manager (nominate firms, toggle voting, manual vote tallying) |
| `/admin/blog` | `app/admin/blog/page.tsx` | Blog / Strategy Guide CMS (markdown editor, cover image, category, author) |
| `/admin/loyalty` | `app/admin/loyalty/page.tsx` | Loyalty Rewards Store inventory (vouchers, merch, coaching stock & points cost) |
| `/admin/spreads` | `app/admin/spreads/page.tsx` | Live Broker Spreads editor (pips, commissions, status per pair) |
| `/admin/market-ticker` | `app/admin/market-ticker/page.tsx` | Live Ticker editor (EUR/USD, Gold, BTC, US30 prices and 24h change) |
| `/admin/messages` | `app/admin/messages/page.tsx` | Two-Way Trader Support Ticket Inbox (view message history, reply, set ticket status) |
| `/admin/page-builder` | `app/admin/page-builder/page.tsx` | Homepage & Section Copy CMS (hero headlines, CTAs, trust stats) |
| `/admin/media` | `app/admin/media/page.tsx` | Firebase Storage Media Library (upload logos, banners, receipts, copy URLs) |
| `/admin/settings` | `app/admin/settings/page.tsx` | Global Settings, Brand Name, Maintenance mode, and Offer Popup toggle |

---

## 4. COMPLETE PAGE INVENTORY & UI BREAKDOWN

### 4.1 Homepage (`/`)
- **File**: `app/page.tsx`
- **Sections**:
  1. `Hero` (`components/hero.tsx`): Main heading with gradient text, subtitle, Primary CTA button ("GRAB OFFERS"), Secondary CTA button ("Join Discord"), decorative tilted blue atmospheric light beam.
  2. `Partners` (`components/partners.tsx`): "Verified Firms" logo marquee grid with tooltip company names (Alpha Capital, CK Capital, GTF, NYS Capital, Pipstone, Shark Funded, Sure Leverage, etc.).
  3. `Pricing` (`components/pricing.tsx`): 3-column pricing/deal comparison card with shake animation warning if user clicks "Buy Challenge" before copying code, profit split, drawdowns, discount tags, and active coupon codes.
  4. `Stats` (`components/stats.tsx`): 4-column animated counter using `@number-flow/react` (Active Traders: 50K+, Listed Firms: 40+, Community Reviews: 12K+, Active Challenges: 150+).
  5. `Testimonials` (`components/testimonials.tsx`): Expandable grid of trader reviews with avatar initials, company/role, star ratings, and full feedback.
  6. `Faq` (`components/faq.tsx`): 5-item accordion answering key user questions (Verification methodology, coupon guarantee, drawdown calculations, loyalty points, Discord community).
  7. `Footer` (`components/footer.tsx`): Brand logo, tagline, quick links, social media buttons (Twitter, GitHub), copyright year, and hashtag `#BuildingEmpires`.
  8. `OfferPosterModal` (`components/offer-poster-modal.tsx`): Triggered once per browser session with countdown, discount badge, coupon code, benefit bullet points, and affiliate enrollment button.
- **Admin Requirements**:
  - Edit hero headline, subtitle, and CTA button text/links.
  - Upload and manage partner firm logos in the marquee.
  - Edit featured pricing cards, account size options, drawdown types, and discount coupons.
  - Edit numerical stats counters and suffixes.
  - Add, edit, reorder, and remove testimonials.
  - Add, edit, reorder, and remove FAQ accordion items.
  - Manage footer brand text, social URLs, and copyright strings.
  - Toggle and customize the session Welcome Offer Poster Modal (image, title, coupon, link, benefits list).

### 4.2 Prop Firms Directory (`/firms`)
- **File**: `app/firms/page.tsx`, `app/firms/FirmsClient.tsx`
- **Sections**:
  1. Top Banner: Title ("Prop Firms Directory"), subtitle, search bar.
  2. Filter Drawer & Toolbar: Category tabs (All, Forex, Futures, Crypto, Instant Funding), sorting dropdown (Popular, Best Value, Rating), platform filter (MT5, cTrader, Match-Trader, TradeLocker, NinjaTrader, Tradovate, TradingView, Bookmap, ATAS, Deepcharts, MultiCharts), trading model filter (1-Step, 2-Step, Instant), min allocation slider ($0 to $2.5M).
  3. Firm Cards Grid:
     - Firm Logo, Name, Trust Score badge (e.g. 99/100), Audited badge, Founded year, HQ country.
     - Metrics: Max Allocation, Profit Split (e.g. Up to 90%), Payout Frequency (e.g. Bi-Weekly / 6hr SLA), Rating & Review Count.
     - Interactive Features: Expandable details drawer, Copy Code button with vibration, "Claim Offer" / "View Challenges" button (enforces copy-code-first interaction).
- **Admin Requirements**:
  - Full CRUD on Prop Firms (Name, slug, logo URL, rating, review count, trust score, max allocation, profit split, payout schedule, discount badge, coupon code, platforms, category, featured/popular/verified flags, HQ, rules text, restricted countries, scaling programs).

### 4.3 Prop Firm Profile Hub (`/firms/[slug]`)
- **File**: `app/firms/[slug]/page.tsx`, `app/firms/[slug]/FirmProfileClient.tsx`
- **Sections**:
  1. Identity Header: Large Firm Logo, Name, Audited badge, Description, HQ, Platforms list, Trust score badge, Copy Coupon button, "Compare Specs" link.
  2. Highlight Ribbon: 4 quick metrics (Max Allocation, Profit Split, Payout Schedule, Rating).
  3. 5-Tab Navigation:
     - **Tab 1 (Rules & Specs Overview)**: Consistency & Risk Policies card, Drawdown & Evaluation rules card, Payout Scaling Program table, Restricted Jurisdictions pill list, Active Promo highlight card.
     - **Tab 2 (Challenges)**: Grid of all challenges tied to this firm (Name, Steps badge, Profit split gauge, Max loss, Profit target, Strike price, Buy Challenge CTA).
     - **Tab 3 (Promo Deals)**: Grid of discount promo codes, BOGO deals, and cashback badges with Copy buttons.
     - **Tab 4 (Reviews & Ratings)**: Trader reviews specifically for this firm with star ratings, verified badges, and dates.
     - **Tab 5 (Payout Proofs)**: Audited payout proofs for this firm with trader name, amount, date, payment method, and trading concept.
- **Admin Requirements**:
  - Update all firm master details, rules text, scaling tables, and restricted countries.
  - Link/unlink challenges, deals, reviews, and payouts to this firm.

### 4.4 Evaluation Challenges Matrix (`/challenges`)
- **File**: `app/challenges/page.tsx`, `app/challenges/ChallengesClient.tsx`
- **Sections**:
  1. Matrix Header: Title, subtitle, search input.
  2. Filter Sidebar / Drawer: Multi-select firm checklist with firm logos, account size pills ($5K, $10K, $25K, $50K, $100K, $200K, $300K, $500K+), steps selector (1-Step, 2-Step, 3-Step, Instant), category tabs, and sort dropdown (Lowest Price, Highest Allocation, Best Value, Popular).
  3. 13-Column Comparison Table / Cards:
     - Firm Logo & Name
     - Account Size
     - Challenge Name & Steps
     - Price & Strike Original Price
     - Profit Split Percentage (with gauge)
     - Daily Loss Limit Percentage
     - Max Loss Limit Percentage (Trailing vs Static)
     - Profit Target Percentage (Phase 1 & Phase 2)
     - Min Trading Days & Max Trading Days
     - Payout Frequency (e.g. 5 Days, Bi-Weekly, Daily)
     - Leverage (e.g. 1:100, 1:30)
     - Refundable Fee Indicator
     - Action: Copy Code + Buy Challenge button (with copy safeguard)
- **Admin Requirements**:
  - Full CRUD on Challenges (firm_id, name, account_size, steps, price, original_price, profit_split_pct, daily_loss_limit_pct, max_loss_limit_pct, profit_target_pct, phase_2_target_pct, min_trading_days, max_trading_days, payout_frequency, leverage, refundable_fee, buy_url, coupon_code, discount_pct, category, is_featured, is_best_seller, loss_type, rules).

### 4.5 Verified Deals & Promo Codes (`/deals` & `/offers`)
- **File**: `app/deals/page.tsx`, `app/deals/DealsClient.tsx`
- **Sections**:
  1. Header & Live Telemetry Badge: "100% VERIFIED DISCOUNTS AUDITED HOURLY".
  2. Filter Tabs: All Deals, BOGO Deals, Cashback, Fee Refunds, Direct Discounts.
  3. Deals Grid:
     - Firm Logo, Name, Rating & Reviews.
     - Discount Label & Percentage Badge (e.g. `BOGO: Buy One Get Two Free`, `200% Refund on First Payout`, `-25% OFF`).
     - Description of promo terms and expiration date countdown.
     - Coupon Code box with haptic Copy button.
     - "Claim Offer" button (enforces copy-first interaction before redirecting to affiliate link).
- **Admin Requirements**:
  - Full CRUD on Deals (firm_id, code, discount_label, discount_pct, description, category, affiliate_url, expires_at, is_featured, is_verified, offer_type: 'bogo'|'cashback'|'refund'|'discount', offer_badge, refund_pct, cashback_pct, is_bogo, account_size, eval_type, profit_target, drawdown, profit_split, original_price, offered_price, payout_frequency).
  - Telemetry: Track and view `clicks_count`.

### 4.6 Tournaments, Events & Giveaways (`/events`)
- **File**: `app/events/page.tsx`, `app/events/EventsClient.tsx`
- **Sections**:
  1. Top Banner: Title ("Trader Tournaments & Event Hub"), Category Tabs (All, Giveaways, Events).
  2. Sub-Category Pills: Tournaments, Gaming, Learn & Crack, Live Sessions, Bootcamps.
  3. Event Cards Grid:
     - Poster Image / Firm Banner.
     - Firm Logo & Host Name (e.g. "NYS Capital & EMPIRIAL").
     - Prize Pool Highlight (e.g. "$250,000 in Accounts + $50,000 Cash").
     - Start / End Date with live countdown label (e.g. "Starts in 4 Days").
     - Entry Fee Badge ("FREE" or Paid with amount).
     - Participant count counter.
     - Description, Prize Breakdown list (1st, 2nd, 3rd, Top 50 rewards), Rules list, Schedule.
     - Discord Verification Task checklist (e.g. "Join Discord", "Submit cTrader ID").
     - Screenshot Proof Upload input.
     - "Register Now" / "Get Passport" CTA with flying trophy celebration animation and email confirmation toast.
- **Admin Requirements**:
  - Full CRUD on Events (title, slug, category, sub_category, type, entry_type, entry_fee, is_firm_sponsored, firm_id, host_name, host_firm, prize_pool, prize_amount_usd, start_date, end_date, countdown_label, participants_count, max_participants, popularity_score, registration_url, poster_url, is_active, is_featured, description, rules, schedule, prizes_breakdown, requires_discord, discord_url, registration_tasks).

### 4.7 Comparison Engine (`/compare`)
- **File**: `app/compare/page.tsx`, `app/compare/CompareClient.tsx`
- **Sections**:
  1. Mode Selector: Compare Firms vs Compare Challenges.
  2. Up to 4-Slot Multi-Selector with firm search dropdown.
  3. Interactive SVG Radar Chart visualizing 5 core metrics (Drawdown Safety, Payout Speed, Profit Split, Spread Efficiency, Trust Score).
  4. Deep Comparison Table comparing 20+ parameters side-by-side.
- **Admin Requirements**:
  - Data is derived from `firms` and `challenges` collections. No separate collection needed; updating firm/challenge documents automatically recalculates comparison metrics.

### 4.8 Verified Trader Reviews (`/reviews`)
- **File**: `app/reviews/page.tsx`, `app/reviews/ReviewsClient.tsx`
- **Sections**:
  1. Header with "Submit Review" action button (opens auth modal if disconnected).
  2. Multi-Select Firm filter bar.
  3. Reviews Grid:
     - Review Title, 5-Star Rating, Date, Upvotes counter.
     - Breakdown ratings: Trading Conditions, Customer Care, Usability, Payout Process.
     - User Full Name & Verified Trader Badge.
     - Review text body.
  4. Write Review Modal:
     - Firm selector, Full name, Review Title, Body text, 4 Star rating sliders (1-5), Submit button.
- **Admin Requirements**:
  - Full CRUD & Moderation on Reviews (Approve/Publish, Edit, Delete, add Official Firm Reply).

### 4.9 Forensic Payout Proofs (`/payouts`)
- **File**: `app/payouts/page.tsx`, `app/payouts/PayoutsClient.tsx`
- **Sections**:
  1. Header with Total Audited Payouts Counter ($15.2M+) and "Upload Proof" button.
  2. Filters: Region (India, UAE, USA, Europe, Asia, Global), Trading Concept (ICT/SMC, Price Action, Scalping, Algorithmic EA, Swing), Firm selector.
  3. Payout Proofs Grid:
     - Firm Logo, Trader Name, Payout Amount ($), Payout Date.
     - Region, Concept, Account Size, Payment Method (Rise, Crypto, Wire).
     - Proof Image Preview with full-screen zoom modal on click.
     - Verified audit badge.
  4. Upload Proof Modal:
     - Trader Name, Payout Amount, Firm Name, Region, Trading Concept, Payment Proof Image file uploader.
- **Admin Requirements**:
  - Moderate payout submission queue (approve/verify, reject/delete, edit metadata, upload audited proof screenshots).

### 4.10 Live Broker Spreads Matrix (`/spreads`)
- **File**: `app/spreads/page.tsx`, `app/spreads/SpreadsClient.tsx`
- **Sections**:
  1. Header: Live Liquidity & Execution Benchmarks badge, description.
  2. Instrument Filter Tabs: All, EURUSD, GBPUSD, XAUUSD, BTCUSD, US30.
  3. Spreads Table:
     - Broker / Liquidity Feed name
     - Symbol / Pair
     - Raw Spread (Pips)
     - Commission ($/Lot)
     - Calculated Effective Cost per Standard Lot: `(spread_pips * 10) + commission_per_lot`
     - Account Type (Raw Spread, Zero Commission, High Stakes)
     - Platform (cTrader, MT5, Match-Trader)
     - Status badge (Active Live Feed)
- **Admin Requirements**:
  - Full CRUD on Broker Spreads (broker_name, pair, spread_pips, commission_per_lot, account_type, platform, is_active).

### 4.11 Industry Awards 2026 (`/awards`)
- **File**: `app/awards/page.tsx`, `app/awards/AwardsClient.tsx`
- **Sections**:
  1. Header: Annual Trader Choice Awards 2026.
  2. Award Categories Grid:
     - Category Title (e.g. "Best Overall Prop Firm of the Year 2026", "Fastest & Most Reliable Payouts 2026", "Best Futures Prop Firm 2026").
     - Description.
     - Nominated Firms list with Logos, Live Vote Counters, and percentage vote share progress bars.
     - Interactive "Vote" button (enforces 1 vote per category per authenticated user session with live incrementing).
- **Admin Requirements**:
  - Full CRUD on Awards (category_name, description, nominated_firms list with firm_id, firm_name, logo_url, votes, year, is_voting_open).

### 4.12 State Hall / Blog (`/blog` & `/blog/[slug]`)
- **File**: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `components/social/social-feed-client.tsx`
- **Sections**:
  - **State Hall Feed (`/blog`)**:
    1. Filter Tabs: All, Prop Firm Offers, Trading Knowledge, Trading Psychology, Account Rules, Trader Insights, Community.
    2. Sort Toggle: Popular (Upvote algorithm) vs Latest.
    3. Post Composer (for verified creators/admins): Text input, image uploader, link preview card generator, category selector.
    4. Post Card: Author Avatar, Name, Handle, Verified Badge, Role Badge (Prop Firm Official, Funded Trader, Market Analyst), Firm Logo, Content, Image attachments, Rich Link Preview, Upvote/Downvote buttons, Share button.
    5. "Apply for Creator Verification" modal.
  - **Article Guide (`/blog/[slug]`)**:
    1. Article Header: Category badge, Read time, Published date, Title, Subtitle, Author avatar/name/role.
    2. Cover Image.
    3. Full Markdown Content formatted with subheadings, formulas, and bullet points.
    4. Bottom Challenge Matrix CTA card.
- **Admin Requirements**:
  - Social Feed Moderation: Pin posts, delete spam, approve/reject verification applications, revoke creator badges, broadcast official announcements.
  - Blog Article CMS: Create, edit, and publish long-form markdown articles, assign authors, upload cover images, and define slugs for SEO.

### 4.13 Community Discussions (`/community`)
- **File**: `app/community/page.tsx`, `app/community/CommunityClient.tsx`
- **Sections**:
  1. Category Filters (All, Offers, Knowledge, Psychology, General, Rules).
  2. "Create Discussion" button & modal.
  3. Discussion Thread Cards with Upvotes, Downvotes, Views, Comment counts.
  4. Expanded Discussion View: Full post body, Comment thread, Comment submission box.
- **Admin Requirements**:
  - Moderate community posts and comments (delete inappropriate content, pin valuable discussions).

### 4.14 Trader Profile Hub (`/profile`)
- **File**: `app/profile/page.tsx`, `app/profile/ProfileClient.tsx`
- **Sections**:
  1. Header Card: Trader Avatar, Display Name, Trader ID (e.g. `EMP-90428`), Country, Discord handle, Bio, Points balance (e.g. `4,850 pts`), Edit Profile modal.
  2. 5 Hub Tabs:
     - **Dashboard**: Active purchased accounts list (NYS Capital $100K 1-Step, Topstep $150K Combine, Alpha Capital $100K 2-Step, FundedNext $50K, Shark Funded $25K) with account status (Active, Passed, Scaling, Funded), account numbers, order IDs, platform, and purchase dates.
     - **My Reviews**: Filter submitted reviews by Published, Pending, or Replied; view official firm responses and upvotes.
     - **Registered Events**: Active tournament passes (e.g. `PASS: REG-2026-X01`), Discord task verification status, event countdowns, and printable ticket passports.
     - **Support Tickets**: Support ticket list, create new ticket with priority & category, live two-way message chat with Admin Desk.
     - **Referrals & Rewards**: Unique referral code and share link, referral stats (total referrals, points earned, commission earned), referral invitees table (name, email, joined date, status: account created vs challenge purchased, commission), points redemption store for $100 challenge fee reimbursements, free 25K evaluation vouchers, and trader merch hoodies.
- **Admin Requirements**:
  - View all registered trader accounts, manage support tickets (reply & change status), manually credit/debit loyalty points, approve referral reward payouts, and provision purchased account records.

---

## 5. COMPLETE COMPONENT ANALYSIS

| Component File | Location | Purpose & Props / State Managed |
|----------------|----------|--------------------------------|
| `Navbar` | `components/navbar.tsx` | Sticky desktop/mobile header, links to all main routes, Browse dropdown (Reviews, Events), ThemeSwitcher, Connect/Profile dropdown with user avatar, unread badges, and signout. |
| `Footer` | `components/footer.tsx` | Brand name, dynamic tagline, quick links, social media buttons, copyright text, `#BuildingEmpires` hashtag. |
| `Hero` | `components/hero.tsx` | Main homepage hero, heading, subtitle, primary/secondary CTAs, connects to Firestore `siteSettings/main.hero`. |
| `Partners` | `components/partners.tsx` | Verified firms logo marquee grid with tooltip names, connects to Firestore `partnerLogos`. |
| `Pricing` | `components/pricing.tsx` | 3-card homepage pricing & deal showcase with copy-code safeguard, vibrating shake animation, profit splits, drawdowns. |
| `Stats` | `components/stats.tsx` | Animated 4-metric statistics grid using `@number-flow/react`, connects to Firestore `siteSettings/main.stats`. |
| `Testimonials` | `components/testimonials.tsx` | Expandable trader testimonials grid with star ratings, avatars, and show more/less toggle. |
| `Faq` | `components/faq.tsx` | 5-item accordion answering key platform questions, connects to Firestore `faqs`. |
| `OfferPosterModal` | `components/offer-poster-modal.tsx` | Session welcome modal with flash sale countdown, coupon copy, and affiliate redirect; connects to `offerPosterConfig`. |
| `AuthModal` | `components/auth-modal.tsx` | Modal supporting Google, Discord, and Email connect/sign-in flows with instant state dispatch. |
| `ThemeSwitcher` | `components/theme-switcher.tsx` | Toggles between Dark and Light mode using `next-themes`. |
| `ThemeProvider` | `components/theme-provider.tsx` | Next-themes provider wrapper for root layout. |
| `RatingBadge` | `components/ui/rating-badge.tsx` | Formatted star rating badge component with color coding. |
| `CopyButton` | `components/ui/copy-button.tsx` | Copy-to-clipboard button with haptic feedback and copied state checkmark. |
| `ProfitSplitGauge` | `components/ui/profit-split-gauge.tsx` | SVG circular gauge indicating profit split percentage (e.g. 80%, 90%, 100%). |
| `StrikePrice` | `components/ui/strike-price.tsx` | Displays current discounted price alongside strikethrough original price. |
| `RadarChart` | `components/ui/radar-chart.tsx` | 5-axis SVG radar chart for multi-firm/challenge metric visualization. |
| `SocialFeedClient` | `components/social/social-feed-client.tsx` | State Hall feed controller with category filtering, search, sorting, and modal triggers. |
| `PostCard` | `components/social/post-card.tsx` | Renders individual social post with badges, images, link preview, upvote/downvote, and share. |
| `PostComposer` | `components/social/post-composer.tsx` | Creator post authoring box with markdown preview, media upload, and link preview fetcher. |
| `VerificationModal` | `components/social/verification-modal.tsx` | Creator verification application form with experience level, category, and proof links. |

---

## 6. HARDCODED CONTENT AUDIT & CLASSIFICATION

Every element in the codebase has been audited and classified into 5 operational categories:

- **[A] ADMIN EDITABLE**: Content stored in Firestore that administrators must modify from the Admin Panel without touching code.
- **[B] DATABASE DATA**: Dynamic records created, queried, and updated in collections (Firms, Challenges, Deals, Events, Reviews, Payouts, Awards, Spreads, Posts).
- **[C] USER GENERATED DATA**: Created by public users (Reviews, Payout submissions, Event registrations, Support tickets, Forum posts/comments, Profile updates, Referral invites).
- **[D] CONFIGURATION**: Environment variables and Firebase initialization configs.
- **[E] STATIC UI / DECORATIVE**: Structural layout, SVG icons, background gradients, light beams, and fixed table column headers.

### Detailed Content Classification Table

| Section / Page | Content Element | Current Location | Classification | Target Firebase Destination |
|----------------|-----------------|------------------|----------------|-----------------------------|
| **Homepage** | Hero Title & Subtitle | `components/hero.tsx` | [A] ADMIN EDITABLE | `siteSettings/main.hero.title`, `subtitle` |
| **Homepage** | Hero CTA Button 1 & 2 Text/URLs | `components/hero.tsx` | [A] ADMIN EDITABLE | `siteSettings/main.hero.cta1Text`, `cta1Url`, etc. |
| **Homepage** | Partner Logos in Marquee | `components/partners.tsx` | [A] ADMIN EDITABLE | `partnerLogos` collection |
| **Homepage** | Featured Pricing Cards Data | `components/pricing.tsx` | [A] ADMIN EDITABLE | `pricingPlans` collection |
| **Homepage** | Trust Statistics Numbers & Labels | `components/stats.tsx` | [A] ADMIN EDITABLE | `siteSettings/main.stats` array |
| **Homepage** | Testimonials List | `components/testimonials.tsx` | [A] ADMIN EDITABLE | `testimonials` collection |
| **Homepage** | FAQs List | `components/faq.tsx` | [A] ADMIN EDITABLE | `faqs` collection |
| **Homepage** | Session Welcome Offer Poster | `components/offer-poster-modal.tsx` | [A] ADMIN EDITABLE | `siteSettings/main.offerPoster` object |
| **Footer** | Brand Name, Tagline, Copyright | `components/footer.tsx` | [A] ADMIN EDITABLE | `siteSettings/main.footer` object |
| **Firms** | Prop Firm Profiles (All fields) | `lib/data/firms-data.ts` | [B] DATABASE DATA | `firms` collection |
| **Challenges** | Evaluation Challenges (All fields) | `lib/data/challenges-data.ts` | [B] DATABASE DATA | `challenges` collection |
| **Deals** | Discount Promo Deals & BOGO | `lib/data/deals-data.ts` | [B] DATABASE DATA | `deals` collection |
| **Events** | Tournaments & Bootcamps | `lib/data/events-data.ts` | [B] DATABASE DATA | `events` collection |
| **Payouts** | Verified Payout Proofs | `lib/data/payouts-data.ts` | [B] + [C] USER/DB | `payouts` collection |
| **Spreads** | Broker Spreads Matrix | `lib/data/spreads-data.ts` | [B] DATABASE DATA | `brokerSpreads` collection |
| **Awards** | Awards Categories & Nominees | `lib/data/awards-data.ts` | [B] DATABASE DATA | `awards` collection |
| **State Hall** | Social Posts & Announcements | `lib/utils/social-store.ts` | [B] + [C] USER/DB | `socialPosts` collection |
| **State Hall** | Creator Verification Applications | `lib/utils/social-store.ts` | [C] USER GENERATED | `verificationApplications` collection |
| **Blog** | Strategic Markdown Articles | `lib/data/blog-data.ts` | [B] DATABASE DATA | `blogPosts` collection |
| **Community** | Discussion Forum Posts & Comments | `lib/data/community-data.ts` | [C] USER GENERATED | `communityPosts` collection |
| **Profile** | User Account & Purchased Challenges | `lib/utils/auth-store.ts` | [C] USER GENERATED | `users/{uid}/purchasedAccounts` subcollection |
| **Profile** | Support Tickets & Two-Way Messages | `lib/utils/auth-store.ts` | [C] + [A] USER/ADMIN | `supportTickets` collection |
| **Profile** | Referral Stats & Reward Redemptions | `lib/utils/auth-store.ts` | [C] USER GENERATED | `users/{uid}/referrals` & `redeemedRewards` |
| **Loyalty** | Rewards Store Catalog | `lib/data/loyalty-data.ts` | [A] ADMIN EDITABLE | `loyaltyRewards` collection |
| **Ticker** | Live Market Ticker Prices | `lib/data/site-data.ts` | [A] ADMIN EDITABLE | `marketTickers` collection |

---

## 7. DYNAMIC CONTENT & EDITABILITY ARCHITECTURE
To ensure that all website content can be managed dynamically from the Admin Panel without modifying frontend code:

1. **Global Site Settings Document (`siteSettings/main`)**:
   - Contains single-source configurations for `hero`, `footer`, `stats`, `offerPoster`, `maintenanceMode`, and `eventPopupEnabled`.
2. **Dedicated Entity Collections**:
   - Independent Firestore collections for `firms`, `challenges`, `deals`, `events`, `reviews`, `payouts`, `brokerSpreads`, `awards`, `blogPosts`, `loyaltyRewards`, `testimonials`, `partnerLogos`, and `faqs`.
3. **Denormalized Relational Cascade**:
   - When an administrator updates a firm's name or logo URL in `/admin/firms`, a Firestore batch update automatically updates `firm_name` and `firm_logo` across all related documents in `challenges`, `deals`, and `payouts`.
4. **Instant Invalidation & Reactive Fetching**:
   - Public frontend pages fetch live Firestore data on load with fallback to initial static cache.

---

## 8. USER FEATURES & INTERACTION FLOW DIAGRAMS

### 8.1 Copy Discount Code & Safeguarded Affiliate Claim Flow
```
User clicks "COPY" or "Buy Challenge"
  ↓
Frontend checks if coupon code has been copied into memory
  ├── IF NOT COPIED:
  │     Trigger vibrating shake animation on Copy button + display warning banner
  │     (Prevents user from buying challenge without discount)
  └── IF COPIED:
        Trigger navigator.clipboard.writeText(couponCode)
        Trigger haptic vibration (40ms, 50ms, 40ms)
        Set copied state checkmark icon (2000ms timeout)
        Open affiliate_url in new tab (window.open with noopener, noreferrer)
        Trigger incrementDealClicks(dealId) in Firestore
```

### 8.2 User Review Submission & Moderation Flow
```
Trader clicks "Submit Review" on /reviews or in Profile
  ↓
Frontend verifies authentication (Opens AuthModal if unauthenticated)
  ↓
Trader selects Firm, enters Title, Body, and 4 rating sliders (1-5)
  ↓
Frontend sends createReview() payload to Firestore 'reviews' collection
  ├── status: 'pending' (if moderation required) or 'published'
  ├── is_verified_trader: true (if user owns a verified purchasedAccount for that firm)
  ↓
Firestore creates document 'reviews/{reviewId}'
  ↓
Admin views pending review in /admin/reviews -> Clicks "Approve & Publish" or adds "Official Firm Reply"
  ↓
Review appears live on /reviews and /firms/[slug]
```

### 8.3 Tournament Registration & Proof Upload Flow
```
Trader opens Event Card on /events -> Clicks "Register for Tournament"
  ↓
Frontend verifies authentication -> Loads trader profile
  ↓
Trader joins Discord & uploads cTrader ID screenshot proof
  ↓
Screenshot uploaded to Firebase Storage ('events/{eventId}/proofs/{fileName}')
  ↓
Registration document written to 'eventRegistrations' with status: 'confirmed'
  ↓
Frontend triggers flying trophy celebration animation + generates Ticket Passport PASS: REG-2026-X01
  ↓
Registration appears under Trader Profile -> "Registered Events" tab
```

### 8.4 Support Ticket & Two-Way Live Chat Flow
```
Trader creates ticket on /profile -> "Contact Support" tab
  ↓
Firestore document created in 'supportTickets/{ticketId}' with initial message
  ↓
Admin receives ticket in /admin/messages inbox with 'open' status badge
  ↓
Admin types reply -> Calls replyToSupportTicket() -> Appends message object to 'messages' array
  ↓
Ticket status transitions to 'in_progress'
  ↓
Trader sees admin reply instantly in profile ticket thread
```

### 8.5 Annual Award Voting Flow
```
Trader visits /awards -> Clicks "Vote" on Nominated Firm
  ↓
Frontend verifies authentication & checks if user has already voted in this category
  ↓
Firestore triggers submitAwardVote(awardId, firmId)
  ↓
Firestore transaction increments nominated_firm.votes by 1
  ↓
User ID added to award's 'voted_user_ids' array (preventing duplicate votes)
  ↓
UI immediately updates vote count and recalculated percentage progress bar
```

---

## 9. FIRESTORE DATABASE COLLECTIONS DIRECTORY

The Firestore database is structured into 17 top-level collections and 3 user subcollections:

```
firestore-root
 ├── admins/                       (Admin users whitelist and role permissions)
 ├── users/                        (Registered trader accounts)
 │    ├── {uid}/purchasedAccounts/ (Accounts purchased by user)
 │    ├── {uid}/referrals/         (Trader referral invitees and commissions)
 │    └── {uid}/redeemedRewards/   (Points redemption history)
 ├── siteSettings/                 (Singleton document: 'main' containing global copy)
 ├── partnerLogos/                 (Logos displayed in verified firms marquee)
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

## 10. EXHAUSTIVE FIRESTORE DOCUMENT SCHEMAS

### 10.1 `siteSettings/main`
```typescript
{
  hero: {
    title: string;              // "EMPIRIAL\nBuilding Empires"
    subtitle: string;           // "Compare prop firms, grab verified discount codes..."
    cta1Text: string;           // "GRAB OFFERS"
    cta1Url: string;            // "/deals"
    cta2Text: string;           // "Join Discord"
    cta2Url: string;            // "https://discord.gg/ww4dkeeZdp"
  },
  stats: Array<{
    value: number;              // 50
    suffix: string;             // "K+"
    label: string;              // "Active Traders"
  }>,
  footer: {
    brandName: string;          // "EMPIRIAL"
    tagline: string;            // "Prop Trading Intelligence & Evaluation Platform."
    copyrightText: string;      // "© 2026 EMPIRIAL. All rights reserved."
  },
  offerPoster: {
    enabled: boolean;           // true
    layoutStructure: string;    // "side-by-side" | "stacked"
    badge: string;              // "VERY LIMITED DEAL + 1 FREE ACCOUNT ‼️"
    title: string;              // "Funded Futures Family Flash Sale"
    subtitle: string;           // "Get Discount of up to 80%..."
    discountTag: string;        // "UP TO 80% OFF"
    couponCode: string;         // "ANURAJ"
    buttonText: string;         // "Claim 80% Discount & Buy Challenge"
    buttonLink: string;         // "https://app.fundedfuturesfamily.com/..."
    posterImageUrl: string;     // "/posters/funded-futures-family.jpg"
    benefits: string[];         // ["Payout Protection Guarantee", "Special Accounts (100% OFF)"]
    extraNote: string;          // "Valid till Friday 5 PM EST."
  },
  maintenanceMode: boolean;     // false
  eventPopupEnabled: boolean;   // true
  updated_at: string;           // ISO 8601 string
}
```

### 10.2 `firms/{firmId}`
```typescript
{
  id: string;                          // "nys" | "ck-capital" | "alpha-capital"
  name: string;                        // "NYS Capital"
  slug: string;                        // "nys-capital"
  type: "prop_firm" | "broker";        // "prop_firm"
  logo_url: string;                    // "/logos/nys.png" or Storage URL
  rating: number;                      // 4.9
  review_count: number;                // 2430
  max_allocation: string;              // "$1,500,000"
  profit_split_custom: string;         // "Up to 85%"
  payout_custom: string;               // "Bi-Weekly / 6hr SLA"
  discount_label_custom: string;       // "20% OFF"
  coupon_code_custom: string;          // "EMPIRE"
  discount_pct: number;                // 20
  badge_custom?: string;               // "Verified Leader"
  platforms: string;                   // "cTrader, TradeLocker"
  platform_ids: string[];              // ["ctrader", "tradelocker"]
  category: "forex" | "futures" | "crypto" | "instant-funding" | "all";
  is_featured: boolean;                // true
  is_verified: boolean;                // true
  is_popular: boolean;                 // true
  trust_score: number;                 // 99 (out of 100)
  founded_year: number;                // 2022
  headquarters: string;                // "New York, USA"
  country: string;                     // "United States"
  years_working: string;               // "3+ Years"
  total_payouts: string;               // "$16,400,000+"
  avg_payout_time: string;             // "6 Hours"
  models: string[];                    // ["1-Step Challenge", "2-Step Evaluation", "Instant Funding"]
  max_loss_pct: number;                // 6
  daily_loss_pct: number;              // 4
  profit_target_pct: number;           // 6
  min_price: number;                   // 119
  buy_url: string;                     // "https://discord.gg/ww4dkeeZdp"
  consistency_rules_content: string;   // "Trailing drawdown calculated on closed equity..."
  firm_rules_content: string;          // "No minimum trading days required..."
  restricted_countries: string[];      // ["IR", "KP", "SY", "CU"]
  payout_programs: Array<{
    name: string;                      // "Standard Scaling"
    schedule: string;                  // "14 Days"
    split: string;                     // "80% - 85%"
  }>;
  description: string;                 // "Institutional forex prop firm with ultra-low latency..."
  created_at: string;                  // ISO 8601 string
  updated_at: string;                  // ISO 8601 string
}
```

### 10.3 `challenges/{challengeId}`
```typescript
{
  id: string;                          // "ch-nys-100k"
  firm_id: string;                     // "nys"
  firm_name: string;                   // "NYS Capital"
  firm_slug: string;                   // "nys-capital"
  firm_logo: string;                   // "/logos/nys.png"
  name: string;                        // "$100K 1-Step Evaluation"
  account_size: number;                // 100000
  steps: number;                       // 1 (0=Instant, 1=1-Step, 2=2-Step, 3=3-Step)
  price: number;                       // 499
  original_price: number;              // 599
  profit_split_pct: number;            // 85
  daily_loss_limit_pct: number;        // 4
  max_loss_limit_pct: number;          // 6
  profit_target_pct: number;           // 6
  phase_2_target_pct?: number;         // 0
  min_trading_days: number;            // 0
  max_trading_days: string;            // "Unlimited"
  payout_frequency: string;            // "Bi-Weekly (6hr SLA)"
  leverage: string;                    // "1:100"
  refundable_fee: boolean;             // true
  buy_url: string;                     // "https://nyscapital.com/..."
  coupon_code: string;                 // "EMPIRE"
  discount_pct: number;                // 20
  is_featured: boolean;                // true
  is_best_seller: boolean;             // true
  category: "forex" | "futures" | "crypto" | "instant-funding";
  rating?: number;                     // 4.9
  review_count?: number;               // 2430
  loss_type?: "Trailing" | "Static";   // "Trailing"
  consistency_rule?: string;           // "No lot size consistency limits"
  news_trading?: string;               // "Permitted"
  overnight_weekend?: string;          // "Permitted on Swing"
  ea_algo_trading?: string;            // "Permitted"
  created_at: string;
  updated_at: string;
}
```

### 10.4 `deals/{dealId}`
```typescript
{
  id: string;                          // "deal-ck-capital-bogo"
  firm_id: string;                     // "ck-capital"
  firm_name: string;                   // "CK Capital"
  firm_slug: string;                   // "ck-capital"
  firm_logo: string;                   // "/logos/ck-capital.avif
<truncated 49366 bytes>

NOTE: The output was truncated because it was too long. Use a more targeted query or a smaller range to get the information you need.
