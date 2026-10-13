import React from 'react';
import Link from 'next/link';
import { Tag, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { MOCK_DEALS } from '@/lib/data/deals-data';
import { CopyButton } from '@/components/ui/copy-button';

export function FeaturedDeals() {
  const deals = MOCK_DEALS.slice(0, 4);

  return (
    <section className="py-20 bg-[#0B0C10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <Tag className="w-3.5 h-3.5" />
              <span>EXCLUSIVE VERIFIED COUPONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Trending Prop Discounts & Promo Codes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              One-click instant copy codes tested and verified every 15 minutes. Save up to 80% on challenge evaluation fees.
            </p>
          </div>

          <Link
            href="/deals"
            className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All Verified Promo Codes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-elevation-surface border border-white/10 hover:border-cyan-500/40 rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl group"
            >
              {/* Discount Tag Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {deal.firm_name}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  -{deal.discount_pct}% OFF
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {deal.discount_label}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {deal.description}
                </p>
              </div>

              {/* Code Box & One-Click Copy */}
              <div className="p-3 rounded-xl bg-elevation-card border border-white/5 flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Promo Code</span>
                  <span className="text-sm font-mono font-black text-cyan-400 tracking-wider">
                    {deal.code}
                  </span>
                </div>
                <CopyButton textToCopy={deal.code} label="COPY" size="sm" />
              </div>

              {/* Footer Affiliate Direct Button */}
              <a
                href={deal.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <span>Apply Code & Visit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
