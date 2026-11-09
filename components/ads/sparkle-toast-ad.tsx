'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Shield,
  Flame,
  Gift,
  Bell,
  Trophy,
  Zap,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { AdvertisementConfig } from '@/lib/types/advertisement';
import { getStoredAdConfig, DEFAULT_AD_CONFIG } from '@/lib/utils/ad-store';
import { subscribeToAdvertisement } from '@/lib/firebase/services';

const SEEN_AD_KEY = 'empirial_seen_ad_version';

// 8 Particle coordinates positioned around the perimeter of the card
const SPARKLE_BURST_PARTICLES = [
  { id: 1, top: '-8px', left: '15%', size: 14, delay: 0.15, rotate: 20 },
  { id: 2, top: '-12px', right: '22%', size: 18, delay: 0.25, rotate: -15 },
  { id: 3, top: '25%', right: '-12px', size: 12, delay: 0.3, rotate: 45 },
  { id: 4, bottom: '20%', right: '-10px', size: 16, delay: 0.2, rotate: -30 },
  { id: 5, bottom: '-10px', right: '30%', size: 13, delay: 0.35, rotate: 10 },
  { id: 6, bottom: '-8px', left: '25%', size: 15, delay: 0.18, rotate: -25 },
  { id: 7, top: '40%', left: '-10px', size: 14, delay: 0.28, rotate: 35 },
  { id: 8, top: '-6px', right: '10%', size: 10, delay: 0.4, rotate: 50 },
];

export function SparkleToastAd({
  forcePreviewConfig,
  triggerPreview = false,
}: {
  forcePreviewConfig?: AdvertisementConfig;
  triggerPreview?: boolean;
}) {
  const pathname = usePathname();
  const [adConfig, setAdConfig] = useState<AdvertisementConfig>(forcePreviewConfig || DEFAULT_AD_CONFIG);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(0);

  // Sync when forcePreviewConfig changes (in Admin preview)
  useEffect(() => {
    if (forcePreviewConfig) {
      setAdConfig(forcePreviewConfig);
      if (triggerPreview) {
        setIsVisible(true);
        setProgress(100);
      }
    }
  }, [forcePreviewConfig, triggerPreview]);

  // Load configuration & subscribe to real-time changes
  useEffect(() => {
    if (forcePreviewConfig) return; // In preview mode, parent controls state
    if (pathname?.startsWith('/admin')) return; // Do not show floating ad on admin pages

    let isMounted = true;
    const initial = getStoredAdConfig();
    setAdConfig(initial);

    const hasSeenThisVersion = (cfg: AdvertisementConfig) => {
      if (typeof window === 'undefined') return false;
      const seen = sessionStorage.getItem(SEEN_AD_KEY);
      const currentVer = String(cfg.updatedAt || cfg.title || '1');
      return seen === currentVer;
    };

    if (initial.enabled && initial.showSlideToast && !hasSeenThisVersion(initial)) {
      const showTimer = setTimeout(() => {
        if (isMounted) setIsVisible(true);
      }, 3500); // Trigger smoothly after 3.5s of browsing
      return () => clearTimeout(showTimer);
    }

    // Subscribe to cloud updates from Firestore
    const unsubscribe = subscribeToAdvertisement((remoteConfig) => {
      if (!isMounted || !remoteConfig) return;
      const merged: AdvertisementConfig = {
        ...DEFAULT_AD_CONFIG,
        ...remoteConfig,
      };
      setAdConfig(merged);
      if (!merged.enabled || !merged.showSlideToast) {
        setIsVisible(false);
      } else if (!hasSeenThisVersion(merged)) {
        setIsVisible(true);
      }
    });

    // Listen to local tab events
    const handleLocalChange = (e: any) => {
      if (!isMounted || !e.detail) return;
      const updated = e.detail as AdvertisementConfig;
      setAdConfig(updated);
      if (!updated.enabled || !updated.showSlideToast) {
        setIsVisible(false);
      } else if (!hasSeenThisVersion(updated)) {
        setIsVisible(true);
      }
    };
    window.addEventListener('empirial-ad-changed', handleLocalChange as EventListener);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('empirial-ad-changed', handleLocalChange as EventListener);
    };
  }, [pathname, forcePreviewConfig]);

  // Countdown timer logic with pause-on-hover
  useEffect(() => {
    if (!isVisible || adConfig.autoDismissSeconds <= 0) {
      setProgress(100);
      return;
    }

    const durationMs = adConfig.autoDismissSeconds * 1000;
    remainingTimeRef.current = durationMs;
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      if (isHovered) {
        startTimeRef.current = Date.now();
        return;
      }
      const elapsed = Date.now() - startTimeRef.current;
      const newRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      const pct = (newRemaining / durationMs) * 100;
      setProgress(pct);

      if (newRemaining <= 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isVisible, isHovered, adConfig.autoDismissSeconds]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined' && !forcePreviewConfig) {
      sessionStorage.setItem(SEEN_AD_KEY, String(adConfig.updatedAt || adConfig.title || '1'));
    }
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!adConfig.couponCode) return;
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(adConfig.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!adConfig.enabled && !forcePreviewConfig) return null;

  const positionClass =
    adConfig.toastPosition === 'bottom-left'
      ? 'bottom-5 left-5 sm:bottom-6 sm:left-6'
      : 'bottom-5 right-5 sm:bottom-6 sm:right-6';

  const renderIcon = () => {
    if (adConfig.logoUrl) {
      return (
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center p-1 overflow-hidden shrink-0">
          <img src={adConfig.logoUrl} alt={adConfig.firmName || 'Ad'} className="w-full h-full object-contain" />
        </div>
      );
    }
    const iconProps = { className: 'w-4 h-4 text-white' };
    switch (adConfig.graphicIcon) {
      case 'shield':
        return <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Shield {...iconProps} /></div>;
      case 'flame':
        return <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Flame {...iconProps} /></div>;
      case 'gift':
        return <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Gift {...iconProps} /></div>;
      case 'bell':
        return <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Bell {...iconProps} /></div>;
      case 'trophy':
        return <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Trophy {...iconProps} /></div>;
      default:
        return <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Sparkles {...iconProps} /></div>;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <aside
          aria-label="Promotional announcement"
          className={`fixed ${positionClass} z-50 max-w-[360px] w-[calc(100vw-2.5rem)]`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated Sparkling Stars Burst around perimeter (Instagram / YouTube like effect) */}
          {adConfig.sparkleAnimation && (
            <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
              {SPARKLE_BURST_PARTICLES.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ scale: 0, opacity: 0, rotate: 0 }}
                  animate={{
                    scale: [0, 1.3, 0.9, 1],
                    opacity: [0, 1, 0.9, 0.7],
                    rotate: [0, p.rotate, p.rotate * 1.5],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: p.delay,
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    top: p.top,
                    bottom: (p as any).bottom,
                    left: p.left,
                    right: (p as any).right,
                    width: p.size,
                    height: p.size,
                  }}
                  className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                >
                  {/* 4-point Diamond Star SVG */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-full h-full fill-white"
                  >
                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                  </svg>
                </motion.div>
              ))}
            </div>
          )}

          {/* Solid Non-Translucent Card Surface */}
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 35, opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="relative bg-zinc-950 dark:bg-black border border-zinc-800 text-white rounded-2xl p-4 shadow-2xl overflow-hidden"
          >
            {/* Top Bar: Badge & Close Button */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide bg-zinc-800 text-zinc-100 border border-zinc-700">
                  {adConfig.badge}
                </span>
                {adConfig.discountTag && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono bg-white text-black">
                    {adConfig.discountTag}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-800"
                aria-label="Close promotion"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Middle Content Stack */}
            <div className="flex items-start gap-3">
              {renderIcon()}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white tracking-tight leading-snug line-clamp-2">
                  {adConfig.title}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {adConfig.subtitle}
                </p>
              </div>
            </div>

            {/* Bottom Action Row */}
            <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              {adConfig.couponCode ? (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-mono transition-colors font-semibold"
                  title="Click to copy coupon code"
                >
                  <span>{adConfig.couponCode}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-400" />
                  )}
                </button>
              ) : (
                <span className="text-[10px] text-zinc-500 font-mono">
                  {adConfig.firmName || 'Verified Partner'}
                </span>
              )}

              <a
                href={adConfig.ctaLink}
                target={adConfig.ctaLink.startsWith('http') ? '_blank' : '_self'}
                rel={adConfig.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors shadow-xs shrink-0"
              >
                <span>{adConfig.ctaText}</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Auto-Dismiss Progress Bar at Bottom */}
            {adConfig.autoDismissSeconds > 0 && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-zinc-800">
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
}

