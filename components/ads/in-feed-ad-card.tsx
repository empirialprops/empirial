'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Flame,
  Gift,
  Bell,
  Trophy,
  Zap,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { AdvertisementConfig } from '@/lib/types/advertisement';
import { getStoredAdConfig, DEFAULT_AD_CONFIG } from '@/lib/utils/ad-store';
import { subscribeToAdvertisement } from '@/lib/firebase/services';

export function InFeedAdCard({
  forceConfig,
  variant = 'challenge',
}: {
  forceConfig?: AdvertisementConfig;
  variant?: 'challenge' | 'firm';
}) {
  const [adConfig, setAdConfig] = useState<AdvertisementConfig>(forceConfig || DEFAULT_AD_CONFIG);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (forceConfig) {
      setAdConfig(forceConfig);
      return;
    }

    let isMounted = true;
    setAdConfig(getStoredAdConfig());

    const unsubscribe = subscribeToAdvertisement((remote) => {
      if (!isMounted || !remote) return;
      setAdConfig({ ...DEFAULT_AD_CONFIG, ...remote });
    });

    const handleLocal = (e: any) => {
      if (!isMounted || !e.detail) return;
      setAdConfig(e.detail as AdvertisementConfig);
    };
    window.addEventListener('empirial-ad-changed', handleLocal as EventListener);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('empirial-ad-changed', handleLocal as EventListener);
    };
  }, [forceConfig]);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!adConfig.couponCode) return;
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(adConfig.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!adConfig.enabled && !forceConfig) return null;
  if (!adConfig.showInFeedCards && !forceConfig) return null;

  const renderIcon = () => {
    if (adConfig.logoUrl) {
      return (
        <div className="shrink-0 w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center p-1.5 overflow-hidden">
          <img
            src={adConfig.logoUrl}
            alt={adConfig.firmName || 'Sponsored Partner'}
            className="h-8 w-auto max-w-[40px] object-contain rounded-md"
          />
        </div>
      );
    }
    const iconClass = 'w-5 h-5 text-white';
    let iconEl = <Sparkles className={iconClass} />;
    if (adConfig.graphicIcon === 'shield') iconEl = <ShieldCheck className={iconClass} />;
    if (adConfig.graphicIcon === 'flame') iconEl = <Flame className={iconClass} />;
    if (adConfig.graphicIcon === 'gift') iconEl = <Gift className={iconClass} />;
    if (adConfig.graphicIcon === 'bell') iconEl = <Bell className={iconClass} />;
    if (adConfig.graphicIcon === 'trophy') iconEl = <Trophy className={iconClass} />;
    if (adConfig.graphicIcon === 'zap') iconEl = <Zap className={iconClass} />;

    return (
      <div className="shrink-0 w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
        {iconEl}
      </div>
    );
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl bg-zinc-950 dark:bg-black border border-zinc-800 hover:border-zinc-600 transition-all text-white p-4 sm:p-5 shadow-lg overflow-hidden my-3.5"
    >
      {/* Subtle top-right accent badge */}
      <div className="absolute top-0 right-0">
        <span className="inline-block px-3 py-0.5 rounded-bl-xl text-[9px] font-mono font-bold tracking-widest uppercase bg-zinc-800 text-zinc-300 border-b border-l border-zinc-700">
          SPONSORED PARTNER
        </span>
      </div>

      {/* Desktop 12-Column Row Layout (matches /challenges and /firms headers) */}
      <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
        {/* Col 1-4: Firm Logo, Name, Badge & Subtitle */}
        <div className="col-span-4 flex items-center gap-3">
          {renderIcon()}
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-white hover:underline truncate">
                {adConfig.firmName || 'EMPIRIAL Featured'}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                {adConfig.badge}
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5" title={adConfig.title}>
              {adConfig.title}
            </p>
          </div>
        </div>

        {/* Col 5-8: Key Highlights / Benefits Checklist */}
        <div className="col-span-4 flex items-center gap-3 text-xs text-zinc-300">
          {(adConfig.benefits || []).slice(0, 2).map((benefit, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] truncate"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{benefit}</span>
            </div>
          ))}
          {adConfig.discountTag && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold font-mono bg-white text-black shrink-0">
              {adConfig.discountTag}
            </span>
          )}
        </div>

        {/* Col 9-12: Coupon Code & Direct CTA Action */}
        <div className="col-span-4 flex items-center justify-end gap-2.5">
          {adConfig.couponCode && (
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-mono font-bold transition-colors cursor-pointer"
              title="Click to copy coupon code"
            >
              <span>{adConfig.couponCode}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          )}

          <a
            href={adConfig.ctaLink}
            target={adConfig.ctaLink.startsWith('http') ? '_blank' : '_self'}
            rel={adConfig.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <span>{adConfig.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Mobile & Tablet Card Layout */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-center gap-3">
          {renderIcon()}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-white truncate">
                {adConfig.firmName || 'EMPIRIAL Featured'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                {adConfig.badge}
              </span>
            </div>
            <p className="text-xs font-semibold text-zinc-200 mt-0.5 line-clamp-1">
              {adConfig.title}
            </p>
          </div>
        </div>

        {/* Benefits on Mobile */}
        {adConfig.benefits && adConfig.benefits.length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-300">
            {adConfig.benefits.slice(0, 2).map((b, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                <ShieldCheck className="w-3 h-3 text-zinc-400" />
                {b}
              </span>
            ))}
            {adConfig.discountTag && (
              <span className="px-2 py-0.5 rounded bg-white text-black font-bold font-mono text-[10px]">
                {adConfig.discountTag}
              </span>
            )}
          </div>
        )}

        {/* Action Row on Mobile */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
          {adConfig.couponCode && (
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              <span>{adConfig.couponCode}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            </button>
          )}

          <a
            href={adConfig.ctaLink}
            target={adConfig.ctaLink.startsWith('http') ? '_blank' : '_self'}
            rel={adConfig.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors shadow-xs cursor-pointer text-center"
          >
            <span>{adConfig.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

