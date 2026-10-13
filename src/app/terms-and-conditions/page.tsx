import React from 'react';
import { Metadata } from 'next';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Terms and Conditions & Risk Disclaimer — EMPIRIAL',
  description: 'Terms of service and financial risk disclaimers for EMPIRIAL / ANURAJ FX Platform.',
  alternates: {
    canonical: 'https://www.empirialprops.com/terms-and-conditions',
  },
  openGraph: {
    title: 'Terms and Conditions & Risk Disclaimer — EMPIRIAL',
    description: 'Terms of service and financial risk disclaimers for EMPIRIAL / ANURAJ FX Platform.',
    url: 'https://www.empirialprops.com/terms-and-conditions',
  },
};

export default function TermsAndConditionsPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Terms and Conditions', url: 'https://www.empirialprops.com/terms-and-conditions' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">Terms and Conditions</h1>
          <p className="text-xs text-muted-foreground">Last updated: August 2026</p>
        </div>

        <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 sm:p-10 space-y-6 text-muted-foreground text-xs sm:text-sm leading-relaxed shadow-xs">
          <h2 className="text-base font-bold text-foreground">1. Platform Service Nature</h2>
          <p>
            EMPIRIAL (operated under ANURAJ FX) provides comparison, analytical intelligence, discount aggregation, and educational community features. We are not a broker-dealer, financial advisor, or proprietary trading evaluation provider.
          </p>

          <h2 className="text-base font-bold text-foreground">2. High-Risk Trading Warning</h2>
          <p>
            Trading leveraged forex, commodities, futures, and cryptographic assets entails extreme financial risk and the potential loss of capital. Simulated evaluation accounts do not guarantee live trading profitability.
          </p>

          <h2 className="text-base font-bold text-foreground">3. Third-Party Links & Affiliate Disclosures</h2>
          <p>
            Some coupon links redirect to independent third-party prop firms where we may receive an affiliate referral commission at zero additional cost to you.
          </p>
        </div>
      </div>
    </>
  );
}
