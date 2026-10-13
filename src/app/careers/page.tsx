import React from 'react';
import { Metadata } from 'next';
import { CareersClient } from './CareersClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Join EMPIRIAL — Prop Analyst, Quantitative & Community Careers',
  description: "Explore open roles at EMPIRIAL and help build the world's most transparent prop trading intelligence matrix and audit desk.",
  alternates: {
    canonical: 'https://www.empirialprops.com/careers',
  },
  openGraph: {
    title: 'Join EMPIRIAL — Prop Analyst, Quantitative & Community Careers',
    description: "Explore open roles at EMPIRIAL and help build the world's most transparent prop trading intelligence matrix and audit desk.",
    url: 'https://www.empirialprops.com/careers',
  },
};

export default function CareersPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Careers & Opportunities', url: 'https://www.empirialprops.com/careers' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <CareersClient />
    </>
  );
}
