'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Tag, ArrowRight, Check, Copy } from 'lucide-react';
import {
  OfferPosterConfig,
  getStoredOfferPoster,
  DEFAULT_OFFER_POSTER,
} from '@/lib/utils/offer-popup-store';

const SESSION_DISMISSED_KEY = 'empirial_offer_poster_session_seen';

export function OfferPosterModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<OfferPosterConfig>(DEFAULT_OFFER_POSTER);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    // 1. Load initial local config
    const currentConfig = getStoredOfferPoster();
    setConfig(currentConfig);

    const handleConfigChange = (e: CustomEvent) => {
      if (e.detail) setConfig(e.detail);
    };

    window.addEventListener('offer-poster-changed' as any, handleConfigChange);

    // 2. Initial Session Check: shows once per session unless updated by admin
    if (typeof window !== 'undefined' && currentConfig.enabled) {
      const alreadySeen = sessionStorage.getItem(SESSION_DISMISSED_KEY);
      if (!alreadySeen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 500);
      }
    }

    // 3. Real-time Firestore Subscription for Instant Mobile & Desktop Sync
    let unsubFirestore: (() => void) | undefined;
    import('@/lib/firebase/services').then(({ subscribeToOfferPoster }) => {
      unsubFirestore = subscribeToOfferPoster((remoteConfig) => {
        if (!remoteConfig) return;
        
        setConfig((prev) => {
          // If remote config has a newer timestamp or different content
          const prevTime = prev.updatedAt || 0;
          const remoteTime = remoteConfig.updatedAt || 0;

          if (remoteTime > prevTime || JSON.stringify(prev) !== JSON.stringify(remoteConfig)) {
            // Save to localStorage for offline cache
            try {
              localStorage.setItem('empirial_offer_poster_config', JSON.stringify(remoteConfig));
            } catch (_) {}

            // Re-open popup for users if new admin update is pushed
            if (remoteConfig.enabled) {
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem(SESSION_DISMISSED_KEY);
              }
              setIsOpen(true);
            }
            return remoteConfig;
          }
          return prev;
        });
      });
    }).catch((err) => console.warn('Failed to connect real-time offer poster listener:', err));

    return () => {
      window.removeEventListener('offer-poster-changed' as any, handleConfigChange);
      if (unsubFirestore) unsubFirestore();
    };
  }, []);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
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

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 18 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className={`relative w-full max-h-[94vh] overflow-y-auto rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] p-5 sm:p-7 md:p-8 shadow-2xl z-10 ${
            isStacked ? 'max-w-2xl' : 'max-w-4xl lg:max-w-5xl'
          }`}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close offer modal"
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 rounded-full text-muted-foreground hover:text-foreground bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer z-30"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Pill Badge */}
          <div className="flex items-center justify-start pr-12 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-black dark:border-white bg-zinc-100 dark:bg-zinc-900 text-xs font-semibold text-foreground tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{config.badge || 'SPECIAL OFFER'}</span>
            </div>
          </div>

          {/* STRUCTURE 1: SIDE-BY-SIDE (Big Portrait Poster Left, Details Right) */}
          {!isStacked ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Left Column: Big Prominent Portrait Poster */}
              {config.posterImageUrl && (
                <div className="md:col-span-6 flex justify-center">
                  <div className="relative w-full max-w-[340px] md:max-w-none rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl bg-zinc-950">
                    <img
                      src={config.posterImageUrl}
                      alt={config.title}
                      className="w-full h-auto object-cover max-h-[460px] md:max-h-[540px] rounded-2xl"
                    />
                  </div>
                </div>
              )}

              {/* Right Column: Big Typography & Details */}
              <div className={`${config.posterImageUrl ? 'md:col-span-6' : 'md:col-span-12'} space-y-4 text-left`}>
                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                    {config.title}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {config.subtitle}
                  </p>
                </div>

                {/* Big Highlighted Discount & One-Click Coupon */}
                <div className="p-4 rounded-2xl border-2 border-black dark:border-white bg-[#f4f4f5] dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Max Discount
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {config.discountTag}
                    </span>
                  </div>

                  {config.couponCode && (
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs sm:text-sm font-mono font-bold text-foreground shadow-xs shrink-0"
                    >
                      <Tag className="w-4 h-4 text-muted-foreground" />
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

                {/* Benefits List with Larger Readable Text */}
                {config.benefits && config.benefits.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      🎁 Additional Benefits:
                    </span>
                    <div className="space-y-1.5">
                      {config.benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
                          <div className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px] font-extrabold shrink-0">
                            {i + 1}
                          </div>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extra Draw Note */}
                {config.extraNote && (
                  <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-muted-foreground">
                    {config.extraNote}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleEnrollClick}
                    className="w-full flex-1 py-3.5 px-6 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm sm:text-base transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{config.buttonText || 'Claim Deal & Buy Challenge'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full sm:w-auto py-3.5 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STRUCTURE 2: STACKED (Big Centered Portrait Poster Top, Details Downside) */
            <div className="space-y-5 text-center">
              {/* Centered Big Portrait Poster */}
              {config.posterImageUrl && (
                <div className="flex justify-center">
                  <div className="relative w-full max-w-[360px] sm:max-w-[420px] rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl bg-zinc-950">
                    <img
                      src={config.posterImageUrl}
                      alt={config.title}
                      className="w-full h-auto object-cover max-h-[440px] sm:max-h-[500px] rounded-2xl"
                    />
                  </div>
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {config.title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  {config.subtitle}
                </p>
              </div>

              {/* Discount Box & Code */}
              <div className="p-4 rounded-2xl border-2 border-black dark:border-white bg-[#f4f4f5] dark:bg-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs max-w-md mx-auto">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Exclusive Reward
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {config.discountTag}
                  </span>
                </div>

                {config.couponCode && (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs sm:text-sm font-mono font-bold text-foreground shadow-xs"
                  >
                    <Tag className="w-4 h-4 text-muted-foreground" />
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
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block text-center">
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
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleEnrollClick}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm sm:text-base transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <span>{config.buttonText || 'Claim Deal & Buy Challenge'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors cursor-pointer"
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
