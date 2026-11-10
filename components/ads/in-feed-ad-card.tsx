'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
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
  const [isDismissed, setIsDismissed] = useState(false);

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
  if (isDismissed) return null;

  const isEmpirial =
    adConfig.useEmpirialLogo ||
    adConfig.firmName?.toLowerCase() === 'empirial' ||
    adConfig.logoUrl?.includes('empirial');

  const renderIcon = () => {
    if (isEmpirial) {
      return (
        <div className="shrink-0 w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center p-2 overflow-hidden shadow-xs">
          <img
            src="/logos/empirial-trident-dark.png"
            alt="EMPIRIAL"
            className="hidden dark:block w-full h-full object-contain"
          />
          <img
            src="/logos/empirial-trident-light.png"
            alt="EMPIRIAL"
            className="block dark:hidden w-full h-full object-contain"
          />
        </div>
      );
    }

    if (adConfig.logoUrl) {
      return (
        <div className="shrink-0 w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center p-1.5 overflow-hidden shadow-xs">
          <img
            src={adConfig.logoUrl}
            alt={adConfig.firmName || 'Sponsored Partner'}
            className="h-8 w-auto max-w-[40px] object-contain rounded-md"
          />
        </div>
      );
    }
    const iconClass = 'w-5 h-5 text-zinc-900 dark:text-white';
    let iconEl = <Sparkles className={iconClass} />;
    if (adConfig.graphicIcon === 'shield') iconEl = <ShieldCheck className={iconClass} />;
    if (adConfig.graphicIcon === 'flame') iconEl = <Flame className={iconClass} />;
    if (adConfig.graphicIcon === 'gift') iconEl = <Gift className={iconClass} />;
    if (adConfig.graphicIcon === 'bell') iconEl = <Bell className={iconClass} />;
    if (adConfig.graphicIcon === 'trophy') iconEl = <Trophy className={iconClass} />;
    if (adConfig.graphicIcon === 'zap') iconEl = <Zap className={iconClass} />;

    return (
      <div className="shrink-0 w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-xs">
        {iconEl}
      </div>
    );
  };

  let rawBg = adConfig.backgroundImageUrl || '/images/ads/lucid-trident-head.png';
  if (rawBg === '/images/ads/lucid-trident-bg.png') {
    rawBg = '/images/ads/lucid-trident-head.png';
  }
  const bgImage = rawBg;
  const glassOpacity = (adConfig.glassOpacity ?? 20) / 100;
  const bgPos = adConfig.backgroundPosition || 'watermark-right';
  const maskFade = adConfig.backgroundMaskFade !== false;

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          layout="position"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, height: 0, marginTop: 0, marginBottom: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl p-4 sm:p-5 my-3.5 overflow-hidden transition-all font-sans
            bg-white/80 dark:bg-zinc-950/75 backdrop-blur-xl
            border border-zinc-200/90 dark:border-white/10
            hover:border-zinc-400 dark:hover:border-zinc-700
            text-zinc-900 dark:text-white
            shadow-[0_4px_6px_rgba(0,0,0,0.02),0_12px_30px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.7)]
            dark:shadow-[0_4px_8px_rgba(0,0,0,0.25),0_12px_36px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)]"
        >
          {/* Subtle Ambient Mesh Gradient Refraction Layer */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl
            bg-[radial-gradient(ellipse_at_25%_15%,rgba(255,255,255,0.9),transparent_60%),radial-gradient(ellipse_at_85%_85%,rgba(228,228,231,0.5),transparent_50%)]
            dark:bg-[radial-gradient(ellipse_at_25%_15%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(ellipse_at_85%_85%,rgba(255,255,255,0.03),transparent_50%)]" />

          {/* Background Graphic Layer — Properly Adjusted with Non-Overlapping Watermark */}
          {bgImage && (
            <>
              {bgPos === 'watermark-right' && (
                <div
                  className="absolute right-0 top-0 bottom-0 w-[35%] md:w-[26%] lg:w-[20%] overflow-hidden pointer-events-none rounded-r-2xl flex items-center justify-end pr-2"
                  style={
                    maskFade
                      ? {
                          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                          maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                        }
                      : undefined
                  }
                >
                  <img
                    src={bgImage}
                    alt=""
                    className="max-h-[90%] max-w-full object-contain object-right pointer-events-none select-none transition-opacity dark:invert-0 invert"
                    style={{ opacity: glassOpacity }}
                  />
                </div>
              )}

              {bgPos === 'watermark-center' && (
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
                  style={
                    maskFade
                      ? {
                          WebkitMaskImage: 'radial-gradient(circle at center, black 35%, transparent 75%)',
                          maskImage: 'radial-gradient(circle at center, black 35%, transparent 75%)',
                        }
                      : undefined
                  }
                >
                  <img
                    src={bgImage}
                    alt=""
                    className="h-full w-auto max-w-[60%] object-contain object-center pointer-events-none select-none transition-opacity dark:invert-0 invert"
                    style={{ opacity: glassOpacity }}
                  />
                </div>
              )}

              {bgPos === 'cover' && (
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
                  style={
                    maskFade
                      ? {
                          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 45%)',
                          maskImage: 'linear-gradient(to right, transparent 0%, black 45%)',
                        }
                      : undefined
                  }
                >
                  <img
                    src={bgImage}
                    alt=""
                    className="w-full h-full object-cover object-center pointer-events-none select-none transition-opacity dark:invert-0 invert"
                    style={{ opacity: glassOpacity }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-white/20 dark:from-black/90 dark:via-black/60 dark:to-transparent pointer-events-none" />
                </div>
              )}
            </>
          )}

          {/* Top-Right: SPONSORED Tag & Hide Ad Control */}
          <div className="absolute top-0 right-0 z-10 flex items-center">
            <span className="inline-block px-3 py-0.5 rounded-bl-xl text-[9px] font-mono font-bold tracking-widest uppercase
              bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-b border-l border-zinc-200 dark:border-zinc-700">
              SPONSORED
            </span>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer mr-1"
              title="Hide this announcement"
              aria-label="Hide sponsored card"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Desktop 12-Column Row Layout (matches /challenges and /firms headers) */}
          <div className="relative z-10 hidden lg:grid grid-cols-12 gap-3 items-center">
            {/* Col 1-4: Firm Logo, Name, Badge & Subtitle */}
            <div className="col-span-4 flex items-center gap-3">
              {renderIcon()}
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white hover:underline truncate">
                    {adConfig.firmName || 'EMPIRIAL Featured'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold
                    bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    {adConfig.badge}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mt-0.5" title={adConfig.title}>
                  {adConfig.title}
                </p>
              </div>
            </div>

            {/* Col 5-7: Key Highlights / Benefits Checklist */}
            <div className="col-span-3 flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
              {(adConfig.benefits || []).slice(0, 2).map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg
                    bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-[11px] truncate"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                  <span className="truncate">{benefit}</span>
                </div>
              ))}
              {adConfig.discountTag && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold font-mono
                  bg-black dark:bg-white text-white dark:text-black shrink-0 shadow-xs">
                  {adConfig.discountTag}
                </span>
              )}
            </div>

            {/* Col 8-9: Mini Fintech Metric Widget */}
            <div className="col-span-2 hidden xl:flex items-center border-l border-zinc-200/80 dark:border-zinc-800/80 pl-3">
              <div>
                <span className="text-xs font-mono font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-1">
                  ⚡ VERIFIED PARTNER
                </span>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                  Audited Payouts
                </p>
              </div>
            </div>

            {/* Col 10-12: Coupon Code & Direct CTA Action */}
            <div className="col-span-3 xl:col-span-3 flex items-center justify-end gap-2.5">
              {adConfig.couponCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl
                    bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800
                    border border-zinc-200 dark:border-zinc-700
                    text-zinc-900 dark:text-zinc-100 text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs"
                  title="Click to copy coupon code"
                >
                  <span>{adConfig.couponCode}</span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </button>
              )}

              <a
                href={adConfig.ctaLink}
                target={adConfig.ctaLink.startsWith('http') ? '_blank' : '_self'}
                rel={adConfig.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl
                  bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200
                  text-xs font-semibold transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <span>{adConfig.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Mobile & Tablet Card Layout */}
          <div className="relative z-10 lg:hidden space-y-3">
            <div className="flex items-center gap-3">
              {renderIcon()}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {adConfig.firmName || 'EMPIRIAL Featured'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold
                    bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    {adConfig.badge}
                  </span>
                </div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mt-0.5 line-clamp-1">
                  {adConfig.title}
                </p>
              </div>
            </div>

            {/* Benefits on Mobile */}
            {adConfig.benefits && adConfig.benefits.length > 0 && (
              <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                {adConfig.benefits.slice(0, 2).map((b, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded
                    bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <ShieldCheck className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                    {b}
                  </span>
                ))}
                {adConfig.discountTag && (
                  <span className="px-2 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black font-bold font-mono text-[10px]">
                    {adConfig.discountTag}
                  </span>
                )}
              </div>
            )}

            {/* Action Row on Mobile */}
            <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-2">
              {adConfig.couponCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
                    bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800
                    border border-zinc-200 dark:border-zinc-700
                    text-zinc-900 dark:text-zinc-100 text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  <span>{adConfig.couponCode}</span>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                </button>
              )}

              <a
                href={adConfig.ctaLink}
                target={adConfig.ctaLink.startsWith('http') ? '_blank' : '_self'}
                rel={adConfig.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl
                  bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200
                  text-xs font-semibold transition-colors shadow-xs cursor-pointer text-center"
              >
                <span>{adConfig.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
