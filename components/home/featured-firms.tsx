import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { RatingBadge } from '@/components/ui/rating-badge';

export function FeaturedFirms() {
  const firms = MOCK_FIRMS.filter(f => f.is_featured).slice(0, 4);

  return (
    <section className="py-20 bg-[#08090D] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>TOP-RANKED PROP INSTITUTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Verified Prop Firm Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Audited for financial solvency, regulatory structure, payout promptness, and fair consistency parameters.
            </p>
          </div>

          <Link
            href="/firms"
            className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All Prop Firms</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {firms.map((firm) => (
            <div
              key={firm.id}
              className="bg-elevation-surface border border-white/10 hover:border-cyan-500/40 rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all hover:shadow-2xl hover:shadow-cyan-950/20 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-elevation-card border border-white/10 flex items-center justify-center font-black text-lg text-white group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-all">
                  {firm.name.substring(0, 3).toUpperCase()}
                </div>
                <RatingBadge rating={firm.rating} reviewCount={firm.review_count} />
              </div>

              {/* Title & Trust Score */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {firm.name}
                  </h3>
                  {firm.is_verified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {firm.description}
                </p>
              </div>

              {/* Specs Breakdown */}
              <div className="space-y-2 py-3 border-y border-white/5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Allocation:</span>
                  <span className="font-bold text-white font-mono">{firm.max_allocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Profit Split:</span>
                  <span className="font-bold text-emerald-400 font-mono">{firm.profit_split_custom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payout Cycle:</span>
                  <span className="font-semibold text-slate-200">{firm.payout_custom}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/firms/${firm.slug}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-elevation-card hover:bg-elevation-overlay border border-white/10 text-white font-bold text-xs text-center transition-all"
                >
                  Full Profile
                </Link>
                <Link
                  href={`/compare?firms=${firm.slug}`}
                  className="py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
                >
                  Compare
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
