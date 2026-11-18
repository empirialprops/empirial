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
} from 'lucide-react';
import { AdvertisementConfig } from '@/lib/types/advertisement';
import { getStoredAdConfig, DEFAULT_AD_CONFIG } from '@/lib/utils/ad-store';
import { subscribeToAdvertisement } from '@/lib/firebase/services';

export function HomepageSpotlightCard({
  forceConfig,
}: {
  forceConfig?: AdvertisementConfig;
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
      setTimeout(() => setCopied(false), 2200);
    }
  };

  if (!adConfig.enabled && !forceConfig) return null;
  if (!adConfig.showSpotlightCard && !forceConfig) return null;

  const isEmpirial =
    adConfig.useEmpirialLogo ||
    adConfig.firmName?.toLowerCase() === 'empirial' ||
    adConfig.logoUrl?.includes('empirial');

  const renderGraphic = () => {
    if (isEmpirial) {
      return (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center p-2.5 overflow-hidden shadow-xs shrink-0">
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
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center p-2 overflow-hidden shadow-xs shrink-0">
          <img
            src={adConfig.logoUrl}
            alt={adConfig.firmName || 'Spotlight'}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }
    const iconClass = 'w-6 h-6 text-zinc-900 dark:text-white';
    let iconEl = <Sparkles className={iconClass} />;
    if (adConfig.graphicIcon === 'shield') iconEl = <ShieldCheck className={iconClass} />;
    if (adConfig.graphicIcon === 'flame') iconEl = <Flame className={iconClass} />;
    if (adConfig.graphicIcon === 'gift') iconEl = <Gift className={iconClass} />;
    if (adConfig.graphicIcon === 'bell') iconEl = <Bell className={iconClass} />;
    if (adConfig.graphicIcon === 'trophy') iconEl = <Trophy className={iconClass} />;
    if (adConfig.graphicIcon === 'zap') iconEl = <Zap className={iconClass} />;

    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-xs">
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
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 z-10 font-sans">
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative rounded-3xl p-6 sm:p-8 md:p-9 overflow-hidden transition-colors
          bg-white/80 dark:bg-zinc-950/75 backdrop-blur-xl
          border border-zinc-200/90 dark:border-white/10
          text-zinc-900 dark:text-white
          shadow-[0_4px_6px_rgba(0,0,0,0.02),0_16px_45px_rgba(0,0,0,0.08),0_30px_70px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.7)]
          dark:shadow-[0_4px_8px_rgba(0,0,0,0.3),0_20px_60px_rgba(0,0,0,0.55),0_40px_80px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.12)]"
      >
        {/* Subtle Ambient Mesh Gradient Refraction Layer */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl
          bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.9),transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(228,228,231,0.5),transparent_50%)]
          dark:bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(255,255,255,0.03),transparent_50%)]" />

        {/* Background Graphic Layer — Properly Adjusted Non-Overlapping Watermark */}
        {bgImage && (
          <>
            {bgPos === 'watermark-right' && (
              <div
                className="absolute right-0 top-0 bottom-0 w-[38%] md:w-[28%] lg:w-[22%] overflow-hidden pointer-events-none rounded-r-3xl flex items-center justify-end pr-2"
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
                  className="max-h-[92%] max-w-full object-contain object-right pointer-events-none select-none transition-opacity dark:invert-0 invert"
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
                  className="h-full w-auto max-w-[65%] object-contain object-center pointer-events-none select-none transition-opacity dark:invert-0 invert"
                  style={{ opacity: glassOpacity }}
                />
              </div>
            )}

            {bgPos === 'cover' && (
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
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

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          {/* Left Column: Badge, Logo, Title & Subtitle */}
          <div className="flex-1 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide
                bg-zinc-100 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/80 shadow-xs">
                {adConfig.badge}
              </span>
              {adConfig.discountTag && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono
                  bg-black dark:bg-white text-white dark:text-black shadow-xs">
                  {adConfig.discountTag}
                </span>
              )}
              {adConfig.firmName && (
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  • {adConfig.firmName}
                </span>
              )}
            </div>

            <div className="flex items-start sm:items-center gap-4">
              {renderGraphic()}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
                  {adConfig.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  {adConfig.subtitle}
                </p>
              </div>
            </div>

            {/* Checklist Benefits */}
            {adConfig.benefits && adConfig.benefits.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                {adConfig.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Actions & Coupon Code */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-3 shrink-0">
            {adConfig.couponCode && (
              <div className="flex items-center justify-between sm:justify-start gap-2 p-2 rounded-xl
                bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 px-1">Coupon:</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg
                    bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700
                    text-zinc-900 dark:text-white font-mono text-xs font-bold transition-colors
                    border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                  title="Click to copy coupon code"
                >
                  <span>{adConfig.couponCode}</span>
                  {copied ? (
                    <span className="text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1 font-sans">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-400" />
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={adConfig.ctaLink}
                target={adConfig.ctaLink.startsWith('http') ? '_blank' : '_self'}
                rel={adConfig.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                  bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200
                  text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <span>{adConfig.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {adConfig.secondaryCtaText && adConfig.secondaryCtaLink && (
                <a
                  href={adConfig.secondaryCtaLink}
                  target={adConfig.secondaryCtaLink.startsWith('http') ? '_blank' : '_self'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl
                    border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground
                    text-sm font-medium transition-colors cursor-pointer"
                >
                  <span>{adConfig.secondaryCtaText}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
