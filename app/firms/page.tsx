import React from 'react';
import { Metadata } from 'next';
import { FirmsClient } from './FirmsClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Compare Prop Trading Firms 2026 | Rules, Splits & Reviews — EMPIRIAL',
  description: 'Browse and compare verified prop firms by drawdown rules, profit split, payout speed and trader reviews.',
  alternates: {
    canonical: 'https://www.empirialprops.com/firms',
  },
  openGraph: {
    title: 'Compare Prop Trading Firms 2026 | Rules, Splits & Reviews — EMPIRIAL',
    description: 'Browse and compare verified prop firms by drawdown rules, profit split, payout speed and trader reviews.',
    url: 'https://www.empirialprops.com/firms',
  },
};

export default function FirmsPage() {
  const breadcrumbData = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Verified Firms', url: 'https://www.empirialprops.com/firms' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <FirmsClient />
    </>
  );
}
