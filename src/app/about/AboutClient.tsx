
import React, { useEffect, useState } from 'react';
import { Shield, Sparkles, Trophy, Users, CheckCircle2, HelpCircle, ChevronDown, ArrowRight, UserPlus, Target, Award, Building2 } from 'lucide-react';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/firebase/services';

const DEFAULT_ABOUT_FAQS = [
  {
    q: 'What is EMPIRIAL 2.0?',
    a: 'EMPIRIAL 2.0 is an independent proprietary trading intelligence matrix engineered by ANURAJ FX. We independently purchase, test, and audit evaluation challenges, calculate true spread & slippage costs, and verify real trader payment proofs.',
  },
  {
    q: 'How does EMPIRIAL verify prop firm payout proofs?',
    a: 'Every payout proof displayed on EMPIRIAL undergoes cryptographic hash verification, banking receipt checks, and direct confirmation from audited community traders to guarantee zero fake proofs.',
  },
  {
    q: 'How can I join the EMPIRIAL Analyst & Auditor Team?',
    a: 'We welcome seasoned traders, quantitative analysts, and community moderators. Check our Careers page or create a ticket on our Discord server to get in touch with our recruitment team.',
  },
  {
    q: 'Are prop firms able to pay to change their ratings on EMPIRIAL?',
    a: 'No. EMPIRIAL maintains strict forensic neutrality. Rankings, ratings, and spread scores are computed strictly through algorithmic metrics, real trader reviews, and verified payout data.',
  },
  {
    q: 'How can prop firms request an audit or listing on EMPIRIAL?',
    a: 'Prop firms can submit an audit request via our Contact Us page or open an official partner inquiry ticket in our Discord community.',
  },
];

export function AboutClient() {
  const [settings, setSettings] = useState<any>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSiteSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.error('Failed to load settings on About page:', err);
      }
    }
    loadData();
  }, []);

  const aboutData = settings?.aboutPage || {};
  const pageTitle = aboutData.title || 'About EMPIRIAL 2.0';
  const pageSubtitle = aboutData.subtitle || 'Pioneering forensic prop firm audits, real-time liquidity benchmarks, and transparent challenge evaluations for traders globally.';
  const whatAreWeText = aboutData.whatAreWe || 'The proprietary trading firm industry has grown exponentially, but with this expansion came misleading marketing, hidden drawdown thresholds, and unpredictable payout denials. EMPIRIAL (engineered by ANURAJ FX) was founded to bring absolute forensic clarity to the market.';
  const missionText = aboutData.mission || 'Our mission is to empower retail traders worldwide with unbiased data, verified discount deals, and mathematical evaluation models. We independently purchase, test, and audit evaluation challenges, calculate true effective spread costs, and verify real trader payment proofs through cryptographic hashes and verified receipts.';
  const joinTeamText = aboutData.joinTeam || 'We are constantly expanding our global network of prop analysts, quantitative auditors, community moderators, and frontend engineers. If you are passionate about market transparency and prop trading, explore our open positions or reach out directly through our Discord ticket system.';

  const stat1Label = aboutData.stat1Label || 'Payouts Audited';
  const stat1Val = aboutData.stat1Value || '$15.2M+';
  const stat2Label = aboutData.stat2Label || 'Programs Evaluated';
  const stat2Val = aboutData.stat2Value || '520+';
  const stat3Label = aboutData.stat3Label || 'Trader Members';
  const stat3Val = aboutData.stat3Value || '48,500+';

  const faqsList = aboutData.faqs || DEFAULT_ABOUT_FAQS;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* 1. HERO & TITLE (Monochrome B&W Theme) */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>OUR MISSION & INTEGRITY</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {pageSubtitle}
        </p>
      </div>

      {/* 2. CORE METRICS & IMPACT (B&W Typography) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border text-center space-y-1.5 shadow-xs hover:border-black dark:hover:border-white transition-colors">
          <div className="text-3xl font-extrabold tracking-tight text-foreground">{stat1Val}</div>
          <div className="text-xs font-medium text-muted-foreground">{stat1Label}</div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border text-center space-y-1.5 shadow-xs hover:border-black dark:hover:border-white transition-colors">
          <div className="text-3xl font-extrabold tracking-tight text-foreground">{stat2Val}</div>
          <div className="text-xs font-medium text-muted-foreground">{stat2Label}</div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border text-center space-y-1.5 shadow-xs hover:border-black dark:hover:border-white transition-colors">
          <div className="text-3xl font-extrabold tracking-tight text-foreground">{stat3Val}</div>
          <div className="text-xs font-medium text-muted-foreground">{stat3Label}</div>
        </div>
      </div>

      {/* 3. MAIN CONTENT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WHAT ARE WE */}
        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-foreground">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">What Are We</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {whatAreWeText}
          </p>
        </div>

        {/* OUR MISSION */}
        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-foreground">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Our Mission</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {missionText}
          </p>
        </div>
      </div>

      {/* 4. HOW TO JOIN TEAM SECTION */}
      <div className="bg-zinc-50 dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-10 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <UserPlus className="w-4 h-4 text-foreground" />
              <span>CAREERS & COMMUNITY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">How to Join Our Team</h2>
          </div>
          <Link
            href="/careers"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-colors"
          >
            <span>Explore Openings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {joinTeamText}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="text-xs font-semibold text-foreground">Prop Audit Analysts</div>
            <div className="text-[11px] text-muted-foreground">Audit challenge rules, slippage, & terms.</div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="text-xs font-semibold text-foreground">Quantitative Engineers</div>
            <div className="text-[11px] text-muted-foreground">Maintain live spread feed & latency algorithms.</div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <div className="text-xs font-semibold text-foreground">Discord Ticket Team</div>
            <div className="text-[11px] text-muted-foreground">Assist traders & verify payment proofs live.</div>
          </div>
        </div>
      </div>

      {/* 5. FREQUENTLY ASKED QUESTIONS (FAQ Accordion) */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold sm:text-2xl text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-base text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about EMPIRIAL audits, prop firm reviews, and our team.
          </p>
        </div>

        <div className="space-y-3">
          {faqsList.map((item: any, idx: number) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-medium text-xs sm:text-sm text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <span className="font-semibold">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-foreground' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
