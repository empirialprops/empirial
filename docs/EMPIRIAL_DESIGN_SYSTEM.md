# EMPIRIAL MASTER UI DESIGN SYSTEM & STYLE BLUEPRINT
**Transferable Visual Specification, Design Tokens, Component Anatomy & Animation Guide**  
**Version:** 3.0.0 (Universal Transfer Edition)  
**Target:** Drop-in Design System for Any Modern Web Application (Next.js / React / Tailwind CSS)  
**Status:** Canonical Visual Single Source of Truth (SSOT)

---

## 🎯 HOW TO USE THIS FILE FOR ANY FUTURE PROJECT
> **AI AGENT & DEVELOPER INSTRUCTION:**  
> When given this file for any new website or web application (whether SaaS, E-Commerce, Crypto, FinTech, Portfolio, Social, Directory, or Tool):
> 1. **Do NOT deviate from this visual language.** Reproduce the exact monochrome black-and-white theme, the atmospheric tilted light ray, the liquid-glass translucency, the precise button dimensions, the exact card corner radii (`rounded-[24px]`), the number counting format, and the Framer Motion interaction effects.
> 2. Adapt only the domain content, icons, and text copy while keeping 100% of the typography hierarchy, spacing scale, border widths, shadows, and color tokens identical.
> 3. Refer to [Section 18: Prompt Template for Future Projects](#18-prompt-template-for-future-projects) for the instant prompt to bootstrap new projects.

---

## TABLE OF CONTENTS
1. [Core Visual Philosophy & Brand Identity](#1-core-visual-philosophy--brand-identity)
2. [Color Palette & CSS Custom Properties](#2-color-palette--css-custom-properties)
3. [Tailwind CSS Configuration](#3-tailwind-css-configuration)
4. [Typography & Text Hierarchy Rules](#4-typography--text-hierarchy-rules)
5. [Atmospheric Tilted Light Ray (Signature Effect)](#5-atmospheric-tilted-light-ray-signature-effect)
6. [Liquid Glass & Glassmorphism Architecture](#6-liquid-glass--glassmorphism-architecture)
7. [Button System & Interactive States](#7-button-system--interactive-states)
8. [Card & Container Hierarchy](#8-card--container-hierarchy)
9. [Numbers, Metrics & Rollup Counter Animations](#9-numbers-metrics--rollup-counter-animations)
10. [Border, Radius & Shadow Tokens](#10-border-radius--shadow-tokens)
11. [Badges, Tags & Status Indicators](#11-badges-tags--status-indicators)
12. [Signature Animations & Micro-Interactions](#12-signature-animations--micro-interactions)
13. [Navigation, Header & Footer Anatomy](#13-navigation-header--footer-anatomy)
14. [Forms, Inputs & Validation States](#14-forms-inputs--validation-states)
15. [Third-Party & Partner Logo Guidelines](#15-third-party--partner-logo-guidelines)
16. [Responsive Spacing & Grid Layouts](#16-responsive-spacing--grid-layouts)
17. [Drop-in Ready React / TypeScript Components](#17-drop-in-ready-react--typescript-components)
18. [Prompt Template for Future Projects](#18-prompt-template-for-future-projects)

---

## 1. CORE VISUAL PHILOSOPHY & BRAND IDENTITY

The EMPIRIAL design system is an **institutional, high-contrast monochrome luxury aesthetic** engineered to convey precision, prestige, and forensic clarity:

1. **Monochrome Dominance:** Pure blacks (`#000000`, `#0A0A0A`, `#131316`), pure whites (`#FFFFFF`), and refined cool zinc neutrals (`#18181b`, `#27272a`, `#71717a`, `#a1a1aa`, `#f4f4f5`).
2. **Signature Atmospheric Accent:** A single continuous diagonal electric blue ray (`#016fee` with 70–85px blur, rotated 28°–32°) stretching across the page height. It provides organic visual depth without creating chromatic noise.
3. **Dual-State Liquid Glass:**
   - **Light Mode:** High-translucency frosted white glass (`bg-white/60` or `bg-white/70`, `backdrop-blur-md` or `backdrop-blur-xl`) with razor-thin zinc borders (`border-zinc-200/80`).
   - **Dark Mode:** Deep solid OLED elevation tones (`#141414`, `#0A0A0A`, or `dark:bg-card`) with crisp dark borders (`#242424`) and glowing white hover outlines.
4. **Authentic Brand Color Preservation:** While the UI is strictly monochrome, all partner logos, payment badges, and platform marks retain their 100% authentic corporate brand colors with slightly rounded corners (`rounded-md` / `rounded-lg`).
5. **Physical Micro-Interactions:** Safeguard actions (such as required inputs, uncopied discount codes, or invalid triggers) provide physical feedback via a high-frequency **7-frame horizontal vibration shake** (`x: [-6, 6, -6, 6, -3, 3, 0]`).

---

## 2. COLOR PALETTE & CSS CUSTOM PROPERTIES

Copy and place this block directly into your main `app/globals.css` (or `index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Canvas & Surfaces */
    --background: #ffffff;
    --foreground: #131316;
    --card: #ffffff;
    --card-foreground: #131316;
    --popover: #ffffff;
    --popover-foreground: #131316;

    /* Primary & Accents */
    --primary: #131316;
    --primary-foreground: #ffffff;
    --secondary: #f4f4f5;
    --secondary-foreground: #18181b;
    --muted: #f4f4f5;
    --muted-foreground: #71717a;
    --accent: #f4f4f5;
    --accent-foreground: #18181b;

    /* Atmospheric & Status */
    --light: #5ba8ff;
    --destructive: #ef4444;
    --destructive-foreground: #ffffff;

    /* Outlines & Focus */
    --border: #e5e5e5;
    --input: #e5e5e5;
    --ring: #131316;
    --radius: 0.75rem;
  }

  .dark {
    /* Canvas & Surfaces */
    --background: #0A0A0A;
    --foreground: #ffffff;
    --card: #141414;
    --card-foreground: #ffffff;
    --popover: #141414;
    --popover-foreground: #ffffff;

    /* Primary & Accents */
    --primary: #ffffff;
    --primary-foreground: #0A0A0A;
    --secondary: #1a1a1a;
    --secondary-foreground: #ffffff;
    --muted: #1a1a1a;
    --muted-foreground: #a1a1aa;
    --accent: #1a1a1a;
    --accent-foreground: #ffffff;

    /* Atmospheric & Status */
    --light: #016fee;
    --destructive: #7f1d1d;
    --destructive-foreground: #ffffff;

    /* Outlines & Focus */
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

/* Institutional Sleek Scrollbars */
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

### Semantic Accent Colors
| Intent | Light Mode Classes | Dark Mode Classes | Value | Purpose |
|---|---|---|---|---|
| **Atmospheric Glow** | `#5ba8ff` | `#016fee` | Vivid Cyan-Blue | Continuous diagonal lighting beam |
| **Verified / Rating** | `bg-emerald-50 border-emerald-300/40 text-emerald-600` | `dark:bg-emerald-950/40 dark:border-emerald-600/30 dark:text-emerald-400` | `#10b981` / `#22c55e` | Star rating pills, verified shields |
| **Warning / Alert** | `bg-black text-white border-black` | `dark:bg-white dark:text-black dark:border-white` | Monochrome inverted | Copy safeguard alert toasts |
| **Destructive / Error**| `bg-red-500 text-white` | `dark:bg-red-900 text-white` | `#ef4444` / `#7f1d1d` | Delete triggers, hard validation errors |

---

## 3. TAILWIND CSS CONFIGURATION

Place this configuration into `tailwind.config.js` (or `tailwind.config.ts`):

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
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
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
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
```

---

## 4. TYPOGRAPHY & TEXT HIERARCHY RULES

### 4.1 Font Stacks
1. **Primary UI & Body:** Zero-latency native system font stack:  
   `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
2. **Numbers & Financial Code:** Monospace font stack:  
   `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

---

### 4.2 Mandatory Heading & Text Styling Rules

> [!IMPORTANT]
> **RULE: SECTION HEADINGS MUST NEVER BE EXTRA BOLD OR ALL-CAPS.**  
> Section headings must always use the subtle gradient text pattern:  
> `text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text`

| Role | Tailwind Classes | Weight | Purpose |
|---|---|---|---|
| **Hero Title** | `text-4xl sm:text-5xl md:text-6xl font-medium tracking-tighter leading-[1.2] py-1 bg-gradient-to-b from-sky-800 dark:from-sky-100 to-foreground dark:to-foreground bg-clip-text text-transparent` | 500 (Medium) | Primary homepage headline |
| **Section Heading** | `text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text` | 600 (Semi-bold) | Section titles across all pages |
| **Section Eyebrow** | `inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-muted-foreground uppercase tracking-wider` | 600 (Semi-bold) | Pill badge above section title |
| **Subheadings & Descriptions** | `text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl` | 400 (Regular) | Explanatory copy below headings |
| **Card / Item Title** | `text-lg font-bold sm:text-xl text-foreground` | 700 (Bold) | Card headers, product names |
| **Headline Metric** | `text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground` | 800 (Extra Bold) | Live counters, KPI rollups |
| **Primary Account / Price** | `text-2xl font-extrabold sm:text-3xl text-foreground tracking-tight` | 800 (Extra Bold) | Card price, "$100K", "$299" |
| **Parameter Label** | `font-semibold text-muted-foreground uppercase text-[11px] tracking-wide` | 600 (Semi-bold) | Specification keys, specs |
| **Discount Highlight** | `text-xl sm:text-2xl font-extrabold text-foreground tracking-tight` | 800 (Extra Bold) | "20% DISCOUNT", "BOGO FREE" |
| **Discount Sub-label** | `text-xs text-muted-foreground font-medium` | 500 (Medium) | "( Max you can get )" |
| **Button Text (Primary)** | `text-xs sm:text-sm font-semibold` | 600 (Semi-bold) | Action triggers |
| **Micro Badges / Tags** | `text-[10px] sm:text-[11px] font-bold uppercase tracking-wider` | 700 (Bold) | Category chips, filter badges |
| **Monospace Codes** | `text-xs font-mono font-medium tracking-normal` | 500 (Medium) | Coupon codes, token IDs |

---

## 5. ATMOSPHERIC TILTED LIGHT RAY (SIGNATURE EFFECT)

The signature visual element of the EMPIRIAL aesthetic is the **Continuous Diagonal Cyan-Blue Light Ray** that spans the full height of the background without interfering with foreground clicks:

```tsx
// Insert directly inside your page wrapper above the content layer
<div className="absolute top-0 inset-x-0 w-full h-full pointer-events-none overflow-hidden z-0">
  <div className="relative w-full max-w-5xl mx-auto h-full flex justify-end">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.1, ease: "easeOut" }}
      className="absolute -top-12 sm:-top-20 right-0 sm:right-6 md:right-12 w-20 sm:w-28 md:w-36 h-[2400px] sm:h-[3200px] lg:h-[4000px] bg-gradient-to-b from-[#016fee] from-0% via-[#016fee]/65 via-35% to-transparent to-85% blur-[70px] sm:blur-[85px] rounded-full rotate-[28deg] sm:rotate-[32deg] origin-top will-change-transform opacity-80 dark:opacity-70"
    />
  </div>
</div>
```

### Atmospheric Beam Specifications:
- **Base Color:** `#016fee` (Vivid Electric Sky Blue).
- **Gradient Stoppages:** `from-[#016fee] from-0% via-[#016fee]/65 via-35% to-transparent to-85%`.
- **Blur Radius:** `blur-[70px]` on mobile, `blur-[85px]` on desktop.
- **Rotation Angle:** `rotate-[28deg]` on mobile, `rotate-[32deg]` on desktop.
- **Opacity:** `opacity-80` (Light mode), `dark:opacity-70` (Dark mode).
- **Z-Index:** Strictly `z-0` with `pointer-events-none`.

---

## 6. LIQUID GLASS & GLASSMORPHISM ARCHITECTURE

EMPIRIAL utilizes a dual-engine glass philosophy:

### 6.1 Light Mode Liquid Glass
In light mode, elements let the atmospheric blue ray filter through with milk-glass diffusion:
- **Background Fill:** `bg-white/60`, `bg-white/70`, or `bg-[#f4f4f5]/75`.
- **Backdrop Blur:** `backdrop-blur-md` (12px blur) or `backdrop-blur-xl` (20px blur).
- **Border Outline:** `border border-zinc-200/80`.
- **Shadow:** Minimal `shadow-none` or `shadow-xs`.

### 6.2 Dark Mode Liquid Glass
In dark mode, surfaces prioritize high-contrast OLED legibility:
- **Background Fill:** Solid deep charcoal `dark:bg-card` (`#141414`) or pitch black `dark:bg-[#0A0A0A]`.
- **Border Outline:** `dark:border-border` (`#242424`) or `dark:border-zinc-800`.
- **Hover Outline:** `dark:hover:border-white hover:shadow-[0_0_22px_rgba(255,255,255,0.14)]`.

```tsx
// Standard Universal Glass Card Pattern:
"border border-zinc-200/80 dark:border-border bg-white/60 dark:bg-card backdrop-blur-md shadow-none"

// Featured / Most Popular Card Glass Pattern:
"border-2 border-black dark:border-white bg-[#f4f4f5]/75 dark:bg-card backdrop-blur-md shadow-sm"

// Sticky Floating Navbar Glass Pattern:
"backdrop-blur-md bg-background/80 border-b border-border"
```

---

## 7. BUTTON SYSTEM & INTERACTIVE STATES

### 7.1 Master Button Variants

```tsx
// 1. PRIMARY ACTION BUTTON (The Signature B&W Action)
// In light mode: Pure black fill with white text. In dark mode: Pure white fill with black text.
className="rounded-xl font-semibold bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-xs flex items-center justify-center h-10 px-6 sm:px-7 py-2.5 text-xs sm:text-sm"

// 2. SECONDARY / OUTLINE BUTTON
// Clean white surface with crisp neutral border in light mode; dark elevated card in dark mode.
className="rounded-xl font-medium border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs h-10 px-5 py-2.5 text-xs sm:text-sm"

// 3. MICRO-ACTION BUTTON (e.g., "Read Review", "Inspect", "Details")
className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"

// 4. ACTIVE FILTER PILL
className="rounded-xl text-xs font-semibold bg-black text-white dark:bg-white dark:text-black shadow-xs px-3.5 py-1.5 transition-colors"

// 5. INACTIVE FILTER PILL
className="rounded-xl text-xs font-medium bg-zinc-100/70 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border border-transparent hover:bg-zinc-200/80 hover:text-foreground dark:hover:bg-zinc-800 px-3.5 py-1.5 transition-colors"

// 6. PROMO CODE / COPY BUTTON (Dual-State)
// Uncopied State:
className="flex-1 font-semibold rounded-xl h-10 text-xs sm:text-sm border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800 shadow-xs transition-colors cursor-pointer flex items-center justify-center"
// Copied State (Active for 2000ms):
className="border-black dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-black font-bold"
```

### 7.2 Button Sizes Matrix
- **Small (`size="sm"`):** `h-8 px-3 gap-1.5 text-xs rounded-xl`.
- **Default (`size="default"`):** `h-9 px-4 py-2 text-xs sm:text-sm rounded-xl`.
- **Large (`size="lg"`):** `h-10 px-6 sm:px-7 py-2.5 text-sm rounded-xl`.
- **Icon Button:** `size-9 rounded-md flex items-center justify-center hover:bg-accent`.

---

## 8. CARD & CONTAINER HIERARCHY

### 8.1 Primary Card Archetypes

```
┌────────────────────────────────────────────────────────────┐
│                    "Most Popular" Pill                     │
│                  (rounded-full border-2)                   │
├────────────────────────────────────────────────────────────┤
│                       CARD HEADER                          │
│          Title + Logo (rounded-md) + Micro Button          │
├────────────────────────────────────────────────────────────┤
│                    PRIMARY HEADLINE                        │
│            "$100K" / "$299" (font-extrabold)               │
├────────────────────────────────────────────────────────────┤
│                 ─── Thin Divider Line ───                  │
├────────────────────────────────────────────────────────────┤
│                   SPECIFICATION MATRIX                     │
│    Metric Label (uppercase 11px) ──── Value (font-bold)   │
│    Metric Label (uppercase 11px) ──── Value (font-bold)   │
├────────────────────────────────────────────────────────────┤
│                 DISCOUNT / OFFER CALLOUT                   │
│        "20% DISCOUNT" (font-extrabold text-2xl)            │
│                 "( Max you can get )"                      │
├────────────────────────────────────────────────────────────┤
│                     DUAL ACTION CTA                        │
│   [ Copy Code Button ]    [ Primary Black/White Action ]   │
└────────────────────────────────────────────────────────────┘
```

#### 1. Standard Content Card
- **Radius:** `rounded-[24px]` (24px).
- **Padding:** `p-6 sm:p-7`.
- **Surface:** `border border-zinc-200/80 dark:border-border bg-white/60 dark:bg-card backdrop-blur-md shadow-none`.
- **Hover:** `hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200`.

#### 2. Featured / "Most Popular" Card
- **Radius:** `rounded-[24px]`.
- **Padding:** `p-6 sm:p-7`.
- **Surface:** `border-2 border-black dark:border-white bg-[#f4f4f5]/75 dark:bg-card backdrop-blur-md shadow-sm`.
- **Offset:** `md:-translate-y-1 z-10`.
- **Floating Badge:** Positioned `-top-3.5 left-1/2 -translate-x-1/2` with `rounded-full border border-black dark:border-white bg-white dark:bg-card px-4 py-0.5 text-xs font-semibold text-foreground whitespace-nowrap`.

#### 3. Data / Matrix Row Card
- **Radius:** `rounded-2xl` (16px).
- **Padding:** `p-4 sm:p-5`.
- **Surface:** `bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border`.
- **Hover:** `hover:border-black dark:hover:border-white hover:shadow-[0_0_18px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_0_22px_rgba(255,255,255,0.16)]`.

#### 4. Testimonial / Review Card
- **Radius:** `rounded-2xl`.
- **Padding:** `p-5 sm:p-6`.
- **Surface:** `border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#121215] shadow-xs`.
- **Hover:** `hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300`.

#### 5. Card Dividers
- **Class:** `my-5 h-[1px] w-full bg-zinc-200/80 dark:bg-border`.

---

## 9. NUMBERS, METRICS & ROLLUP COUNTER ANIMATIONS

All numeric metrics, live telemetry, and financial statistics use **tight tracking and extra bold weights**:

### 9.1 CSS Styling for Numbers
```tsx
// Hero Counter / Statistics Rollup
<div className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-1.5 flex items-center justify-center">
  <NumberFlow value={count} format={{ maximumFractionDigits: 1 }} />
  <span>+</span>
</div>
<div className="text-xs sm:text-sm text-muted-foreground font-medium">
  Active Members
</div>
```

### 9.2 Number Formatting Conventions
- Thousands abbreviation: `1,000` → `1K+`, `50,000` → `50K+`.
- Currency formatting: `$100K`, `$250K`, `$1,000,000`.
- Percentages: `80%`, `90%`, `10%`.
- Ratio formatting: `8% | 5%` or `5% | 10%`.
- Strikethrough comparison: `<span className="line-through text-muted-foreground text-xs">$399</span> <span className="font-bold text-foreground">$199</span>`.

---

## 10. BORDER, RADIUS & SHADOW TOKENS

### 10.1 Corner Radius Scale
| Class | Pixel Value | Dedicated UI Purpose |
|---|---|---|
| `rounded-md` | `6px` | Third-party partner logos, platform chips, sub-pills |
| `rounded-lg` | `8px` | Form inputs, search fields, user avatars |
| `rounded-xl` | `12px` | **All primary & secondary action buttons**, textareas, dropdown menus |
| `rounded-2xl` | `16px` | Row cards, testimonial cards, accordion drawers, dialog inner panels |
| `rounded-[24px]` | `24px` | **All standard & featured pricing, product, and deal cards** |
| `rounded-[32px]` | `32px` | Large promotional modals and hero containers |
| `rounded-full` | `9999px` | Rating badges, category pill chips, floating "Most Popular" pills |

### 10.2 Shadows & Glows
- **Resting Element Elevation:** `shadow-xs` (`0 1px 3px rgba(0,0,0,0.06)`).
- **Micro Button Elevation:** `shadow-2xs` (`0 1px 2px rgba(0,0,0,0.04)`).
- **Light Mode Glow:** `shadow-[0_0_18px_rgba(0,0,0,0.10)]` (applied on hover over rows/cards).
- **Dark Mode Glow:** `dark:shadow-[0_0_22px_rgba(255,255,255,0.14)]` (neon white perimeter on hover).
- **Featured Card Glow:** `shadow-[0_0_20px_rgba(0,0,0,0.14)] dark:shadow-[0_0_25px_rgba(255,255,255,0.18)]`.
- **Flyout Navigation Menus:** `shadow-xl`.
- **Modals & Dialog Overlays:** `shadow-2xl`.

---

## 11. BADGES, TAGS & STATUS INDICATORS

```tsx
// 1. STAR RATING PILL
<div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 dark:border-emerald-600/30 px-2.5 py-0.5 rounded-full text-emerald-600 dark:text-emerald-400 font-medium">
  <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500 shrink-0" />
  <span className="text-xs font-bold">4.8</span>
  <span className="text-[10px] text-muted-foreground font-normal">(125 reviews)</span>
</div>

// 2. "MOST POPULAR" FLOATING PILL
<span className="rounded-full border border-black dark:border-white bg-white dark:bg-card px-4 py-0.5 text-xs font-semibold text-foreground whitespace-nowrap shadow-none">
  Most Popular
</span>

// 3. MARKET / CATEGORY MICRO CHIP
<span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100/90 dark:bg-zinc-900 text-foreground border border-zinc-200/80 dark:border-zinc-800">
  INSTANT
</span>

// 4. KNOWLEDGE / SECTION EYEBROW
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
  <span>KNOWLEDGE BASE</span>
</div>

// 5. VERIFIED SHIELD ICON
<ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
```

---

## 12. SIGNATURE ANIMATIONS & MICRO-INTERACTIONS

All animations leverage `framer-motion`:

### 12.1 The 7-Frame Safeguard Vibration Shake
Triggers whenever an unpermitted or prerequisite action is attempted (e.g., clicking checkout before copying promo code, submitting empty forms):

```tsx
<motion.button
  animate={isShaking ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
  transition={{ duration: 0.4 }}
  onClick={handleAction}
>
  Copy Code
</motion.button>
```

### 12.2 Warning Toast Popup
Accompanies the shake animation:

```tsx
<AnimatePresence>
  {showWarning && (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="w-full text-center text-[11px] sm:text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-md flex items-center justify-center gap-1"
    >
      <span>⚠️ Please complete action before continuing</span>
    </motion.div>
  )}
</AnimatePresence>
```

### 12.3 Scroll-Triggered Section Entrance
```tsx
<motion.div
  initial={{ y: 20, opacity: 0 }}
  whileInView={{ y: 0, opacity: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  {/* Content */}
</motion.div>
```

### 12.4 Staggered Grid Item Entrance
```tsx
<motion.div
  key={item.id}
  initial={{ y: 20, opacity: 0 }}
  whileInView={{ y: 0, opacity: 1 }}
  viewport={{ once: true }}
  transition={{
    duration: 0.8,
    delay: index * 0.08,
    type: "spring",
    bounce: 0,
  }}
>
  {/* Grid Item */}
</motion.div>
```

### 12.5 Spring Modal Dialog Transition
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.93, y: 18 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.93, y: 18 }}
  transition={{ type: "spring", damping: 28, stiffness: 320 }}
  className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0e0e12] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl"
>
  {/* Modal Content */}
</motion.div>
```

---

## 13. NAVIGATION, HEADER & FOOTER ANATOMY

### 13.1 Desktop Navigation Bar
- **Positioning:** Sticky top (`sticky top-0 z-50 w-full`).
- **Dimensions:** Fixed height `h-16` (64px).
- **Surface:** `backdrop-blur-md bg-background/80 border-b border-border transition-[background-color,backdrop-filter] duration-300 ease-out`.
- **Links:** Ghost style with `font-medium text-muted-foreground hover:text-foreground text-sm transition-colors`.
- **Dropdown Flyout:** `w-72 p-1.5 rounded-2xl bg-white dark:bg-[#141414] backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-0.5`. Item hover: `p-2.5 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80`.
- **Right Action Area:** Theme switcher button + Primary B&W button.

### 13.2 Mobile Hamburger Menu
- Smooth 90-degree rotate icon into close cross:  
  `animate={{ rotate: isMenuOpen ? 90 : 0 }} transition={{ duration: 0.3 }}`.
- Animated slide-down accordion drawer with full-width stacked navigation links.

### 13.3 Global Footer
- **Surface:** `border-t border-border bg-card/50 py-12 px-4`.
- **Layout:** 3-column responsive layout (Brand + Tagline, Quick Navigation, Social Icon buttons).
- **Brand Slogan:** Direct hashtag format: `#BuildingEmpires` or `#YourBrandTagline`.

---

## 14. FORMS, INPUTS & VALIDATION STATES

```tsx
// 1. STANDARD TEXT / SEARCH INPUT
<div className="relative w-full">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <input
    type="text"
    placeholder="Search products, firms, or rules..."
    className="w-full bg-zinc-50/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
  />
</div>

// 2. TEXTAREA
<textarea
  rows={4}
  className="w-full bg-zinc-50/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
/>

// 3. INVALID INPUT ERROR STATE
className="border-red-500 focus:border-red-500 ring-2 ring-red-500/20"
// Message:
<p className="text-xs text-rose-500 font-medium mt-1">Please enter a valid email address</p>
```

---

## 15. THIRD-PARTY & PARTNER LOGO GUIDELINES

> [!IMPORTANT]
> **RULE: NEVER APPLY MONOCHROME GRAYSCALE TO THIRD-PARTY BRAND LOGOS.**  
> Third-party partner and provider logos MUST retain their authentic brand colors.

1. **Corner Radius Standard:** Always apply `rounded-md` (6px) or `rounded-lg` (8px). **Never leave raw sharp 0px corners.**
2. **Card Hero Logo Container:**  
   `h-11 sm:h-12 w-auto max-w-[140px] sm:max-w-[160px] object-contain rounded-md`
3. **Marquee / Partner Grid Logo:**  
   `h-8 sm:h-10 max-w-[110px] object-contain rounded-md hover:scale-105 transition-transform duration-200`
4. **Table / Row Logo Box:**  
   `w-11 h-11 p-1 rounded-lg bg-white/60 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center` with inner image `h-8 w-auto max-w-[40px] object-contain`.

---

## 16. RESPONSIVE SPACING & GRID LAYOUTS

### 16.1 Max-Width Container Hierarchy
- Global Page Container: `max-w-7xl` (`1280px`) with `mx-auto px-4 sm:px-6 lg:px-8`.
- Section Container (Pricing, FAQ, Partners): `max-w-6xl` (`1152px`).
- Atmospheric Beam Container: `max-w-5xl` (`1024px`).
- Hero Text Wrapper: `max-w-4xl` (`896px`).
- Accordion & FAQ Stack: `max-w-2xl` (`672px`).
- Auth / Form Dialog: `max-w-md` (`384px`).

### 16.2 Vertical Rhythm
- **Hero Section:** `py-20 sm:py-28`.
- **Standard Content Sections:** `py-16 sm:py-20` (Partners, Pricing, Stats, Testimonials, FAQ).
- **Card Grids:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch`.
- **Partner Grids:** `grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6 sm:gap-8 place-items-center`.

---

## 17. DROP-IN READY REACT / TYPESCRIPT COMPONENTS

### 17.1 Section Heading Component (`SectionHeading.tsx`)
```tsx
import React from "react";
import { motion } from "framer-motion";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-3 justify-center items-center text-center mb-10 sm:mb-12"
    >
      {eyebrow && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-xl text-muted-foreground text-center text-xs sm:text-sm leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
```

---

### 17.2 Pricing / Product Card (`FeaturedProductCard.tsx`)
```tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface CardFeature {
  label: string;
  value: string;
}

interface ProductCardProps {
  name: string;
  logoSrc: string;
  priceHeadline: string;
  tierSubtext: string;
  features: CardFeature[];
  discountText: string;
  promoCode?: string;
  isFeatured?: boolean;
  onSelect: () => void;
}

export function FeaturedProductCard({
  name,
  logoSrc,
  priceHeadline,
  tierSubtext,
  features,
  discountText,
  promoCode = "PROMO20",
  isFeatured = false,
  onSelect,
}: ProductCardProps) {
  const [copied, setCopied] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setShowWarning(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = () => {
    if (!copied) {
      setShaking(true);
      setShowWarning(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    onSelect();
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative flex flex-col ${isFeatured ? "md:-translate-y-1 z-10" : ""}`}
    >
      <div
        className={`relative h-full rounded-[24px] flex flex-col justify-between p-6 sm:p-7 transition-all duration-200 ${
          isFeatured
            ? "border-2 border-black dark:border-white bg-[#f4f4f5]/75 dark:bg-card backdrop-blur-md shadow-sm"
            : "border border-zinc-200/80 dark:border-border bg-white/60 dark:bg-card backdrop-blur-md shadow-none"
        }`}
      >
        {isFeatured && (
          <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 z-20">
            <span className="rounded-full border border-black dark:border-white bg-white dark:bg-card px-4 py-0.5 text-xs font-semibold text-foreground whitespace-nowrap shadow-none">
              Most Popular
            </span>
          </div>
        )}

        <div>
          {/* Header */}
          <div className="text-center flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold sm:text-xl text-foreground">{name}</h3>

            <div className="my-2.5 flex items-center justify-center h-12 w-full">
              <img
                src={logoSrc}
                alt={name}
                className="h-11 sm:h-12 w-auto max-w-[140px] sm:max-w-[160px] object-contain rounded-md"
              />
            </div>

            <button
              type="button"
              className="mb-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <span>Inspect Details</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </button>

            {/* Price Headline */}
            <div className="mt-2 flex flex-col items-center">
              <span className="text-2xl font-extrabold sm:text-3xl text-foreground tracking-tight">
                {priceHeadline}
              </span>
              <span className="mt-1 text-xs font-semibold text-muted-foreground">
                {tierSubtext}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="my-5 h-[1px] w-full bg-zinc-200/80 dark:bg-border" />

          {/* Specs List */}
          <div className="space-y-3 text-xs sm:text-sm">
            {features.map((feat, i) => (
              <div
                key={i}
                className={`flex justify-between items-center py-1 ${
                  i < features.length - 1 ? "border-b border-zinc-200/50 dark:border-border/40" : ""
                }`}
              >
                <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wide">
                  {feat.label}
                </span>
                <span className="font-bold text-foreground">{feat.value}</span>
              </div>
            ))}
          </div>

          {/* Discount Block */}
          <div className="mt-5 pt-3 border-t border-zinc-200/70 dark:border-border/70 flex flex-col items-center justify-center text-center">
            <span className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {discountText}
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground font-medium">
              ( Max you can get )
            </span>
          </div>
        </div>

        {/* Buttons & Validation Safeguard */}
        <div className="mt-5 pt-1 flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2 w-full">
            <motion.button
              type="button"
              animate={shaking ? { x: [-6, 6, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
              onClick={handleCopy}
              className={`flex-1 font-semibold rounded-xl h-10 text-xs sm:text-sm border transition-colors cursor-pointer flex items-center justify-center shadow-xs ${
                copied
                  ? "border-black dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-black font-bold"
                  : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground dark:hover:bg-zinc-800"
              }`}
            >
              {copied ? "Code Copied ✓" : promoCode}
            </motion.button>

            <button
              type="button"
              onClick={handleAction}
              className="flex-1 font-semibold rounded-xl h-10 text-xs sm:text-sm bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors cursor-pointer flex items-center justify-center shadow-xs"
            >
              Get Started
            </button>
          </div>

          <AnimatePresence>
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="w-full text-center text-[11px] sm:text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-md flex items-center justify-center gap-1"
              >
                <span>⚠️ Kindly Copy code for Max Discount</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
```

---

## 18. PROMPT TEMPLATE FOR FUTURE PROJECTS

When starting any new web application, paste the following prompt along with this file to your AI assistant:

```markdown
You are building [Project Name], a [brief description: e.g., AI Workflow Automation Platform / Crypto Exchange / Developer Analytics Dashboard / E-commerce Luxury Store].

I am providing you with our Canonical Master UI Design System & Style Blueprint in `EMPIRIAL_DESIGN_SYSTEM.md`.

You MUST adhere 100% to this visual system:
1. THEME: Strict institutional monochrome black-and-white theme with pure black, pure white, and zinc grayscale.
2. ATMOSPHERIC BEAM: Implement the continuous 28°/32° tilted electric blue atmospheric light ray (#016fee, 70-85px blur) across the page background.
3. LIQUID GLASS: In light mode, use translucent backdrop-blur-md with white/60 and zinc-200/80 borders; in dark mode, use solid OLED charcoal (#141414, #0A0A0A) surfaces.
4. TYPOGRAPHY: Native OS sans-serif font stack. Hero heading must use font-medium tracking-tighter leading-[1.2]. Section headings MUST use `text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text`. Numbers must be font-extrabold tracking-tight.
5. BUTTONS: Primary buttons must be solid black with white text in light mode, and solid white with black text in dark mode (`rounded-xl font-semibold shadow-xs`). Secondary buttons must use clean white border outlines.
6. CARDS: Standard cards use `rounded-[24px]` with `border border-zinc-200/80 dark:border-border`. Featured cards must use `border-2 border-black dark:border-white bg-[#f4f4f5]/75` with a floating pill badge.
7. ANIMATIONS: Framer Motion in-view reveals (`y: 20 -> 0`), spring modals, and the 7-frame vibration shake effect (`x: [-6, 6, -6, 6, -3, 3, 0]`) for safeguards and uncopied codes.
8. PARTNER LOGOS: Retain authentic brand colors with rounded-md/rounded-lg corners.

Implement all screens and components according to these exact specifications.
```

---
*End of Master UI Design System Specification (EMPIRIAL v3.0.0 Universal Edition)*
