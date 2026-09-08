import React from 'react';
import { Metadata } from 'next';
import { AboutClient } from './AboutClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'About EMPIRIAL 2.0 — Independent Prop Firm Audits & Intelligence',
  description: "Learn about EMPIRIAL's mission to bring forensic transparency to prop trading through independent audits, spread telemetry, and verified payout proofs.",
  alternates: {
    canonical: 'https://www.empirialprops.com/about',
  },
  openGraph: {
    title: 'About EMPIRIAL 2.0 — Independent Prop Firm Audits & Intelligence',
    description: "Learn about EMPIRIAL's mission to bring forensic transparency to prop trading through independent audits, spread telemetry, and verified payout proofs.",
    url: 'https://www.empirialprops.com/about',
  },
};

export default function AboutPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'About Us', url: 'https://www.empirialprops.com/about' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <AboutClient />
    </>
  );
}
