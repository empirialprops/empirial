'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Tag, ArrowRight, Check, Copy } from 'lucide-react';
import {
  OfferPosterConfig,
  getStoredOfferPoster,
  fetchOfferPoster,
  DEFAULT_OFFER_POSTER,
} from '@/lib/utils/offer-popup-store';

const SEEN_POSTER_VERSION_KEY = 'empirial_offer_poster_seen_version';

export function OfferPosterModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<OfferPosterConfig>(DEFAULT_OFFER_POSTER);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;

    let isMounted = true;

    // Checks whether this exact version of the poster has already been dismissed during the current session
    const hasSeenThisPoster = (c: OfferPosterConfig) => {
      if (typeof window === 'undefined') return false;
      const seenVer = sessionStorage.getItem(SEEN_POSTER_VERSION_KEY);
      const currentVer = String(c.updatedAt || c.title || '1');
      return seenVer === currentVer;
    };

    // 1. Initial cached config from localStorage
    const currentConfig = getStoredOfferPoster();
    setConfig(currentConfig);

    if (currentConfig.enabled && !hasSeenThisPoster(currentConfig)) {
      const timer = setTimeout(() => {
        if (isMounted) setIsOpen(true);
      }, 500);
      // clean up timer on unmount
      () => clearTimeout(timer);
    }

    // 2. Fetch live config from Firestore on initial mount to guarantee freshest cloud settings
    fetchOfferPoster().then((liveConfig) => {
      if (!isMounted || !liveConfig) return;
      setConfig(liveConfig);
      if (!liveConfig.enabled) {
        setIsOpen(false);
      } else if (!hasSeenThisPoster(liveConfig)) {
        setIsOpen(true);
      }
    }).catch(() => {});

    // 3. Custom local browser event listener (for instant updates within same browser / tabs)
    const handleConfigChange = (e: any) => {
      if (!isMounted || !e.detail) return;
      const updated = e.detail as OfferPosterConfig;
      setConfig(updated);
      if (!updated.enabled) {
        setIsOpen(false);
      } else if (!hasSeenThisPoster(updated)) {
        setIsOpen(true);
      }
    };
    window.addEventListener('offer-poster-changed', handleConfigChange as EventListener);

    // 4. Real-time Firestore Subscription for Instant Mobile & Desktop Sync across devices
    let unsubFirestore: (() => void) | undefined;
    import('@/lib/firebase/services').then(({ subscribeToOfferPoster }) => {
      if (!isMounted) return;
      unsubFirestore = subscribeToOfferPoster((remoteConfig) => {
        if (!isMounted || !remoteConfig) return;

        const liveConfig: OfferPosterConfig = {
          ...DEFAULT_OFFER_POSTER,
          ...remoteConfig,
        };

        // Cache locally for instant next loads
        try {
          localStorage.setItem('empirial_offer_poster_config', JSON.stringify(liveConfig));
        } catch (_) {}

        setConfig(liveConfig);

        if (!liveConfig.enabled) {
          // If admin toggled popup off, dismiss immediately
          setIsOpen(false);
        } else {
          // If admin published a new poster (different updatedAt / title), open for user
          if (!hasSeenThisPoster(liveConfig)) {
            setIsOpen(true);
          }
        }
      });
    }).catch((err) => console.warn('Failed to connect real-time offer poster listener:', err));

    return () => {
      isMounted = false;
      window.removeEventListener('offer-poster-changed', handleConfigChange as EventListener);
      if (unsubFirestore) unsubFirestore();
    };
  }, [pathname]);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      const currentVer = String(config.updatedAt || config.title || '1');
      sessionStorage.setItem(SEEN_POSTER_VERSION_KEY, currentVer);
    }
    setIsOpen(false);
  };

  const handleCopyCode = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined' && config.couponCode) {
      navigator.clipboard.writeText(config.couponCode);
      setCopied(true);
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([40, 50, 40]);
        } catch (_) {}
      }
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleEnrollClick = () => {
    if (config.couponCode && typeof navigator !== 'undefined') {
      try {
        navigator.clipboard.writeText(config.couponCode);
      } catch (_) {}
    }
    handleDismiss();
    if (config.buttonLink) {
      window.open(config.buttonLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen || pathname?.startsWith('/admin')) return null;

  const isStacked = config.layoutStructure === 'stacked';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container (RULE:BW - Clean white/card bg, border, rounded-3xl) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className={`relative w-full max-h-[92vh] overflow-y-auto rounded-[24px] sm:rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-4 sm:p-6 md:p-8 shadow-2xl z-10 ${
            isStacked ? 'max-w-xl' : 'max-w-4xl lg:max-w-5xl'
          }`}
        >
          {/* Close Button (Touch-friendly 40x40 on mobile) */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close offer modal"
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-9 h-9 sm:w-10 sm:h-10 rounded-full text-muted-foreground hover:text-foreground bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer z-30 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Pill Badge (RULE:BW - pill badge with border) */}
          <div className="flex items-center justify-start pr-12 mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black dark:border-white bg-zinc-100 dark:bg-zinc-900 text-[10px] sm:text-xs font-semibold text-foreground tracking-wide uppercase">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              <span>{config.badge || 'SPECIAL OFFER'}</span>
            </div>
          </div>

          {/* STRUCTURE 1: SIDE-BY-SIDE (Responsive: compact on mobile, side-by-side on md+) */}
          {!isStacked ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
              {/* Left Column: Poster Graphic (Capped on mobile to keep actions above fold) */}
              {config.posterImageUrl && (
                <div className="md:col-span-5 lg:md:col-span-6 flex justify-center">
                  <div className="relative w-full max-w-[220px] sm:max-w-[280px] md:max-w-none rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-xl bg-zinc-950 flex items-center justify-center">
                    <img
                      src={config.posterImageUrl}
                      alt={config.title}
                      className="w-full h-auto object-cover max-h-[220px] sm:max-h-[300px] md:max-h-[500px] rounded-2xl"
                    />
                  </div>
                </div>
              )}

              {/* Right Column: Copy, Code, Benefits & Actions */}
              <div className={`${config.posterImageUrl ? 'md:col-span-7 lg:col-span-6' : 'md:col-span-12'} space-y-3 sm:space-y-4 text-left`}>
                <div className="space-y-1 sm:space-y-1.5">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                    {config.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {config.subtitle}
                  </p>
                </div>

                {/* Big Highlighted Discount & One-Click Coupon (RULE:BW - bg-[#f4f4f5], border-2 border-black) */}
                <div className="p-3 sm:p-4 rounded-2xl border-2 border-black dark:border-white bg-[#f4f4f5] dark:bg-zinc-900/80 flex flex-wrap items-center justify-between gap-2.5 shadow-xs">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Max Discount
                    </span>
                    <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                      {config.discountTag}
                    </span>
                  </div>

                  {config.couponCode && (
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs sm:text-sm font-mono font-bold text-foreground shadow-xs shrink-0"
                    >
                      <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span>{config.couponCode}</span>
                      {copied ? (
                        <span className="text-xs font-sans font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Copied
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>

                {/* Benefits List (Compact & Readable on Mobile) */}
                {config.benefits && config.benefits.length > 0 && (
                  <div className="space-y-1.5 pt-0.5">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      🎁 Additional Benefits:
                    </span>
                    <div className="space-y-1 sm:space-y-1.5">
                      {config.benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[9px] sm:text-[10px] font-extrabold shrink-0">
                            {i + 1}
                          </div>
                          <span className="truncate sm:whitespace-normal">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extra Note / Urgency */}
                {config.extraNote && (
                  <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] sm:text-xs font-medium text-muted-foreground leading-snug">
                    {config.extraNote}
                  </div>
                )}

                {/* Action Buttons (RULE:BW - Primary solid black, secondary outline) */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleEnrollClick}
                    className="w-full flex-1 py-3 px-5 sm:py-3.5 sm:px-6 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{config.buttonText || 'Claim Deal & Buy Challenge'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full sm:w-auto py-3 px-4 sm:py-3.5 sm:px-5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STRUCTURE 2: STACKED (Centered portrait poster top, details below) */
            <div className="space-y-4 sm:space-y-5 text-center">
              {/* Centered Portrait Poster */}
              {config.posterImageUrl && (
                <div className="flex justify-center">
                  <div className="relative w-full max-w-[220px] sm:max-w-[320px] md:max-w-[420px] rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-xl bg-zinc-950 flex items-center justify-center">
                    <img
                      src={config.posterImageUrl}
                      alt={config.title}
                      className="w-full h-auto object-cover max-h-[200px] sm:max-h-[280px] md:max-h-[440px] rounded-2xl"
                    />
                  </div>
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                  {config.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {config.subtitle}
                </p>
              </div>

              {/* Discount Box & Code */}
              <div className="p-3 sm:p-4 rounded-2xl border-2 border-black dark:border-white bg-[#f4f4f5] dark:bg-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-xs max-w-md mx-auto">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Exclusive Reward
                  </span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                    {config.discountTag}
                  </span>
                </div>

                {config.couponCode && (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs sm:text-sm font-mono font-bold text-foreground shadow-xs"
                  >
                    <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span>{config.couponCode}</span>
                    {copied ? (
                      <span className="text-xs font-sans font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>

              {/* Benefits */}
              {config.benefits && config.benefits.length > 0 && (
                <div className="space-y-1.5 max-w-md mx-auto text-left">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block text-center">
                    🎁 Additional Benefits:
                  </span>
                  <div className="space-y-1">
                    {config.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                        <div className="w-4 h-4 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[9px] font-bold shrink-0">
                          {i + 1}
                        </div>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleEnrollClick}
                  className="w-full sm:flex-1 py-3 px-5 sm:py-3.5 sm:px-6 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>{config.buttonText || 'Claim Deal & Buy Challenge'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto py-3 px-4 sm:py-3.5 sm:px-5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}