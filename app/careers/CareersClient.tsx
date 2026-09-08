'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Ticket, ExternalLink, ShieldCheck, ArrowRight, Building2, Users } from 'lucide-react';
import { getSiteSettings } from '@/lib/firebase/services';

const DEFAULT_POSITIONS = [
  {
    id: 'pos-1',
    title: 'Senior Prop Firm Auditor',
    type: 'Full-Time / Remote',
    department: 'Forensic Audit Desk',
    desc: 'Audit drawdown algorithms, hidden breach terms, and spread markups across leading proprietary trading firms.',
  },
  {
    id: 'pos-2',
    title: 'Quantitative Data Analyst',
    type: 'Full-Time / Remote',
    department: 'Market Data Engineering',
    desc: 'Maintain real-time liquidity benchmarking feeds, broker spread feeds, and slippage calculations.',
  },
  {
    id: 'pos-3',
    title: 'Discord Community & Support Manager',
    type: 'Part-Time / Remote',
    department: 'Community Management',
    desc: 'Manage Discord support tickets, assist traders with evaluation queries, and verify cryptographic payout receipts.',
  },
  {
    id: 'pos-4',
    title: 'Full-Stack Frontend Engineer (Next.js)',
    type: 'Contract / Remote',
    department: 'Engineering',
    desc: 'Build high-performance web applications, interactive evaluation matrixes, and monochrome B&W UI design systems.',
  },
];

export function CareersClient() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSiteSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.error('Failed to load settings on Careers page:', err);
      }
    }
    loadData();
  }, []);

  const careersData = settings?.careersPage || {};
  const pageTitle = careersData.title || 'Join the EMPIRIAL Team';
  const pageSubtitle = careersData.subtitle || 'Help us build the world’s most transparent proprietary trading intelligence platform. We are seeking passionate traders, quantitative analysts, and engineers.';
  const discordTicketUrl = careersData.discordUrl || settings?.discordUrl || 'https://discord.gg/ww4dkeeZdp';
  const positionsList = careersData.positions || DEFAULT_POSITIONS;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* 1. HERO HEADER (Strict RULE:BW Monochrome Theme) */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground text-xs font-semibold">
          <Briefcase className="w-3.5 h-3.5" />
          <span>CAREERS & OPPORTUNITIES</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {pageSubtitle}
        </p>
      </div>

      {/* 2. FEATURED DISCORD TICKET CARD */}
      <div className="bg-black text-white dark:bg-card dark:text-foreground border border-zinc-800 dark:border-border rounded-3xl p-6 sm:p-10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
              <Ticket className="w-4 h-4 text-white dark:text-foreground" />
              <span>DIRECT RECRUITMENT TICKET</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white dark:text-foreground">
              Apply Instantly via Discord Ticket
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              Create a private recruitment ticket directly on our official Discord server to apply and chat live with our core team.
            </p>
          </div>

          <a
            href={discordTicketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
          >
            <span>Create Ticket in Discord</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 3. OPEN POSITIONS GRID */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Open Positions</h2>
            <p className="text-xs text-muted-foreground">Select a role below to open a recruitment ticket on Discord.</p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground">
            {positionsList.length} Roles Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {positionsList.map((pos: any) => (
            <div
              key={pos.id || pos.title}
              className="p-6 rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border space-y-4 shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground">
                    {pos.department || 'General'}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">{pos.type}</span>
                </div>
                <h3 className="text-base font-bold text-foreground">{pos.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{pos.desc}</p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <a
                  href={discordTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <Ticket className="w-4 h-4" />
                  <span>APPLY IN DISCORD TICKET</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
