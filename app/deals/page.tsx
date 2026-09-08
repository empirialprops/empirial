import React from 'react';
import { Metadata } from 'next';
import { DealsClient } from './DealsClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Latest Prop Firm Discount Codes & Offers — EMPIRIAL',
  description: 'Verified, up-to-date discount codes for top prop trading firms. Updated daily.',
  alternates: {
    canonical: 'https://www.empirialprops.com/deals',
  },
  openGraph: {
    title: 'Latest Prop Firm Discount Codes & Offers — EMPIRIAL',
    description: 'Verified, up-to-date discount codes for top prop trading firms. Updated daily.',
    url: 'https://www.empirialprops.com/deals',
  },
};

export default function DealsPage() {
  const breadcrumbData = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Deals & Discounts', url: 'https://www.empirialprops.com/deals' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <DealsClient />
    </>
  );
}
