import React from 'react';
import { Metadata } from 'next';
import { HomeClient } from '@/components/home/HomeClient';
import { JsonLd, getWebSiteSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'EMPIRIAL — Compare Prop Trading Firms, Rules & Payout Proof',
  description: 'Compare prop trading firms side-by-side: drawdown rules, profit splits, payout speed and verified discount codes. Trusted by traders worldwide.',
  alternates: {
    canonical: 'https://www.empirialprops.com',
  },
  openGraph: {
    title: 'EMPIRIAL — Compare Prop Trading Firms, Rules & Payout Proof',
    description: 'Compare prop trading firms side-by-side: drawdown rules, profit splits, payout speed and verified discount codes. Trusted by traders worldwide.',
    url: 'https://www.empirialprops.com',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={getWebSiteSchema()} />
      <HomeClient />
    </>
  );
}
