import React from 'react';
import { Metadata } from 'next';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Privacy Policy — EMPIRIAL',
  description: 'Learn how EMPIRIAL handles and protects user account information and audit telemetry.',
  alternates: {
    canonical: 'https://www.empirialprops.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy — EMPIRIAL',
    description: 'Learn how EMPIRIAL handles and protects user account information and audit telemetry.',
    url: 'https://www.empirialprops.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Privacy Policy', url: 'https://www.empirialprops.com/privacy-policy' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: August 2026</p>
        </div>

        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-10 space-y-6 text-muted-foreground text-xs sm:text-sm leading-relaxed shadow-xs">
          <h2 className="text-base font-bold text-foreground">1. Information We Collect</h2>
          <p>
            We collect basic user registration data (email, display username) and optional user-submitted payout proof screenshots and community forum contributions.
          </p>

          <h2 className="text-base font-bold text-foreground">2. Use of Telemetry & Cookies</h2>
          <p>
            We use anonymized cookies to track affiliate discount code click-through rates and verify coupon efficacy. We never sell personal information to third parties.
          </p>

          <h2 className="text-base font-bold text-foreground">3. Data Security & GDPR Compliance</h2>
          <p>
            All account information and submitted receipts are stored behind encrypted security barriers. Users may request full account and data deletion at any time.
          </p>
        </div>
      </div>
    </>
  );
}
