'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { recordPageDwell, recordClickEvent } from '@/lib/utils/analytics-store';

export function TelemetryTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const currentPathRef = useRef<string>(pathname);

  // 1. Page dwell time tracking
  useEffect(() => {
    startTimeRef.current = Date.now();
    currentPathRef.current = pathname;

    const handleBeforeUnload = () => {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      recordPageDwell(currentPathRef.current, elapsed);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      recordPageDwell(currentPathRef.current, elapsed);
    };
  }, [pathname]);

  // 2. Global click telemetry listener (captures clicks on buttons, links, copy coupons, and interactive elements)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if target or parent has a tracking label or standard interactive attributes
      const trackElem = target.closest<HTMLElement>(
        '[data-track], button, a, [role="button"], input[type="search"]'
      );
      if (!trackElem) return;

      const explicitName = trackElem.getAttribute('data-track');
      const text = trackElem.innerText?.trim() || trackElem.getAttribute('aria-label') || trackElem.getAttribute('title');
      const href = trackElem.getAttribute('href') || undefined;

      if (explicitName) {
        recordClickEvent(explicitName, 'cta', href);
      } else if (text && text.length > 0 && text.length < 50) {
        let category: 'cta' | 'firm_deal' | 'coupon_copy' | 'navigation' | 'filter' | 'search' = 'cta';
        const lower = text.toLowerCase();

        if (lower.includes('copy') || lower.includes('coupon') || lower.includes('code')) {
          category = 'coupon_copy';
        } else if (lower.includes('filter') || lower.includes('step') || lower.includes('instant')) {
          category = 'filter';
        } else if (href && (href.startsWith('/') || href.startsWith('#'))) {
          category = 'navigation';
        } else if (href && href.startsWith('http')) {
          category = 'firm_deal';
        }

        recordClickEvent(text, category, href);
      }
    };

    document.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, []);

  return null;
}
