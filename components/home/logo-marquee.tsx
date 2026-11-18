'use client';

import React from 'react';
import Link from 'next/link';
import { PARTNER_LOGOS } from '@/lib/data/site-data';

export function LogoMarquee() {
  // Duplicate array for seamless continuous loop
  const logos = [...PARTNER_LOGOS, ...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <section className="py-12 border-b border-white/5 bg-[#08090D] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Our Audited Prop Partners
        </span>
      </div>

      {/* Infinite scrolling ribbon */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="animate-infinite-marquee flex items-center gap-6 py-2">
          {logos.map((partner, index) => (
            <Link
              key={index}
              href={`/firms/${partner.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-elevation-surface/80 hover:bg-elevation-raised border border-white/5 hover:border-cyan-500/40 transition-all group shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors">
                {partner.name.substring(0, 3).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {partner.name}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  {partner.badge}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
