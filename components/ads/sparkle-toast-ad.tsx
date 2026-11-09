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

// 14 Staggered Star Particles positioned around card perimeter for the Instagram / YouTube like burst
const SPARKLE_BURST_PARTICLES = [
  { id: 1, top: '-10px', left: '12%', size: 16, delay: 0.12, rotate: 20, type: 'diamond' },
  { id: 2, top: '-14px', right: '18%', size: 20, delay: 0.22, rotate: -25, type: 'twinkle' },
  { id: 3, top: '-8px', right: '45%', size: 11, delay: 0.35, rotate: 15, type: 'diamond' },
  { id: 4, top: '22%', right: '-12px', size: 14, delay: 0.28, rotate: 45, type: 'diamond' },
  { id: 5, top: '55%', right: '-10px', size: 17, delay: 0.18, rotate: -15, type: 'twinkle' },
  { id: 6, bottom: '15%', right: '-11px', size: 13, delay: 0.32, rotate: 30, type: 'diamond' },
  { id: 7, bottom: '-10px', right: '22%', size: 18, delay: 0.2, rotate: -10, type: 'twinkle' },
  { id: 8, bottom: '-12px', left: '42%', size: 12, delay: 0.38, rotate: 25, type: 'diamond' },
  { id: 9, bottom: '-10px', left: '16%', size: 16, delay: 0.15, rotate: -35, type: 'twinkle' },
  { id: 10, bottom: '25%', left: '-11px', size: 15, delay: 0.25, rotate: 40, type: 'diamond' },
  { id: 11, top: '40%', left: '-12px', size: 18, delay: 0.16, rotate: -20, type: 'twinkle' },
  { id: 12, top: '15%', left: '-9px', size: 12, delay: 0.3, rotate: 15, type: 'diamond' },
  { id: 13, top: '-12px', left: '-6px', size: 16, delay: 0.14, rotate: -45, type: 'twinkle' },
  { id: 14, bottom: '-10px', right: '-8px', size: 15, delay: 0.24, rotate: 55, type: 'diamond' },
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
  const remainingTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

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
    if (forcePreviewConfig) return;
    if (pathname?.startsWith('/admin')) return;

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
      }, 3500);
      return () => clearTimeout(showTimer);
    }

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
    }, 40);

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

  // Responsive Positioning: Docked cleanly on mobile without viewport overflow; corner on desktop
  const positionClass =
    adConfig.toastPosition === 'bottom-left'
      ? 'bottom-4 left-3 right-3 sm:right-auto sm:left-6 sm:bottom-6 sm:max-w-[360px]'
      : 'bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-[360px]';

  const renderIcon = () => {
    if (adConfig.logoUrl) {
      return (
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-xs">
          <img
            src={adConfig.logoUrl}
            alt={adConfig.firmName || 'Partner'}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }
    const iconProps = { className: 'w-4 h-4 sm:w-5 sm:h-5 text-white' };
    switch (adConfig.graphicIcon) {
      case 'shield':
        return <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Shield {...iconProps} /></div>;
      case 'flame':
        return <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Flame {...iconProps} /></div>;
      case 'gift':
        return <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Gift {...iconProps} /></div>;
      case 'bell':
        return <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Bell {...iconProps} /></div>;
      case 'trophy':
        return <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Trophy {...iconProps} /></div>;
      default:
        return <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0"><Sparkles {...iconProps} /></div>;
    }
  };

  // Filter particles based on density setting
  const activeParticles =
    adConfig.sparkleDensity === 'minimal'
      ? SPARKLE_BURST_PARTICLES.slice(0, 6)
      : SPARKLE_BURST_PARTICLES;

  return (
    <AnimatePresence>
      {isVisible && (
        <aside
          aria-label="Promotional announcement"
          className={`fixed ${positionClass} z-50 w-auto`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated Sparkling Stars Burst around perimeter (Instagram / YouTube like effect) */}
          {adConfig.sparkleAnimation && (
            <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
              {activeParticles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ scale: 0, opacity: 0, rotate: 0 }}
                  animate={{
                    scale: [0, 1.35, 0.9, 1],
                    opacity: [0, 1, 0.95, 0.75],
                    rotate: [0, p.rotate, p.rotate * 1.6],
                  }}
                  transition={{
                    duration: 1.15,
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
                  className="text-white drop-shadow-[0_0_9px_rgba(255,255,255,0.95)]"
                >
                  {p.type === 'diamond' ? (
                    /* 4-point Diamond Star */
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full fill-white">
                      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                    </svg>
                  ) : (
                    /* 8-point Twinkling Star */
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full fill-white">
                      <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" />
                    </svg>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Solid Non-Translucent Card Surface with Refined Spring Physics */}
          <motion.div
            initial={{ y: 55, opacity: 0, scale: 0.93 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 35, opacity: 0, scale: 0.92, transition: { duration: 0.22 } }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="relative bg-zinc-950 dark:bg-black border border-zinc-800 text-white rounded-2xl p-4 sm:p-4.5 shadow-2xl overflow-hidden"
          >
            {/* Top Bar: Badge, Tag & Close Button */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide bg-zinc-800 text-zinc-100 border border-zinc-700">
                  {adConfig.badge}
                </span>
                {adConfig.discountTag && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-white text-black">
                    {adConfig.discountTag}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-800 shrink-0 cursor-pointer"
                aria-label="Close promotion"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Middle Content Stack */}
            <div className="flex items-start gap-3">
              {renderIcon()}

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug line-clamp-2">
                  {adConfig.title}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {adConfig.subtitle}
                </p>
              </div>
            </div>

            {/* Bottom Action Row (Mobile-optimized flex row) */}
            <div className="mt-3.5 pt-3 border-t border-zinc-800/80 flex items-center gap-2">
              {adConfig.couponCode ? (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                  title="Click to copy coupon code"
                >
                  <span>{adConfig.couponCode}</span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-zinc-500 font-mono truncate px-1">
                  {adConfig.firmName || 'Verified Partner'}
                </span>
              )}

              <a
                href={adConfig.ctaLink}
                target={adConfig.ctaLink.startsWith('http') ? '_blank' : '_self'}
                rel={adConfig.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-colors shadow-xs shrink-0 cursor-pointer text-center"
              >
                <span>{adConfig.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
