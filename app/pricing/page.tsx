import React from 'react';
import { Metadata } from 'next';
import { PricingClient } from './PricingClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Membership Plans & Pricing — EMPIRIAL',
  description: 'Choose your EMPIRIAL intelligence tier for real-time drawdown monitors, institutional spread telemetry, and exclusive high-tier discounts.',
  alternates: {
    canonical: 'https://www.empirialprops.com/pricing',
  },
  openGraph: {
    title: 'Membership Plans & Pricing — EMPIRIAL',
    description: 'Choose your EMPIRIAL intelligence tier for real-time drawdown monitors, institutional spread telemetry, and exclusive high-tier discounts.',
    url: 'https://www.empirialprops.com/pricing',
  },
};

export default function PricingPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Pricing & Plans', url: 'https://www.empirialprops.com/pricing' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <PricingClient />
    </>
  );
}
