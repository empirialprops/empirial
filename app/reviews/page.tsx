import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ReviewsClient } from './ReviewsClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Prop Trader Reviews — Real Trader Feedback | EMPIRIAL',
  description: 'Read verified reviews from funded traders on top prop firms — payouts, support, and rule enforcement.',
  alternates: {
    canonical: 'https://www.empirialprops.com/reviews',
  },
  openGraph: {
    title: 'Prop Trader Reviews — Real Trader Feedback | EMPIRIAL',
    description: 'Read verified reviews from funded traders on top prop firms — payouts, support, and rule enforcement.',
    url: 'https://www.empirialprops.com/reviews',
  },
};

export default function ReviewsPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Trader Reviews', url: 'https://www.empirialprops.com/reviews' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Trader Reviews...</div>}>
        <ReviewsClient />
      </Suspense>
    </>
  );
}
