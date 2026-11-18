'use client';

import React from 'react';
import { PricingSection } from '@/components/home/pricing-section';
import { FaqAccordion } from '@/components/home/faq-accordion';
import { Sparkles } from 'lucide-react';

export function PricingClient() {
  return (
    <div className="w-full">
      {/* Top Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TRANSPARENT MEMBERSHIP TIERS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Choose the Perfect Intelligence Plan
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Gain institutional-grade drawdown alarms, live broker spread telemetry, and exclusive high-tier discounts.
        </p>
      </div>

      {/* 3-Tier Pricing Component */}
      <PricingSection />

      {/* FAQs */}
      <FaqAccordion />
    </div>
  );
}
