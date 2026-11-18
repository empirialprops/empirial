import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { CompareClient } from './CompareClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Compare Prop Firms Side-by-Side — EMPIRIAL',
  description: 'Put top prop firms head-to-head on rules, pricing, splits and payout speed.',
  alternates: {
    canonical: 'https://www.empirialprops.com/compare',
  },
  openGraph: {
    title: 'Compare Prop Firms Side-by-Side — EMPIRIAL',
    description: 'Put top prop firms head-to-head on rules, pricing, splits and payout speed.',
    url: 'https://www.empirialprops.com/compare',
  },
};

export default function ComparePage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Side-by-Side Comparator', url: 'https://www.empirialprops.com/compare' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Comparator Terminal...</div>}>
        <CompareClient />
      </Suspense>
    </>
  );
}
