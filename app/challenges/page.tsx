import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ChallengesClient } from './ChallengesClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Prop Firm Challenges Compared — Rules, Targets & Time Limits',
  description: 'Compare evaluation challenge rules across top prop firms: profit targets, drawdown type, time limits and reset policies.',
  alternates: {
    canonical: 'https://www.empirialprops.com/challenges',
  },
  openGraph: {
    title: 'Prop Firm Challenges Compared — Rules, Targets & Time Limits',
    description: 'Compare evaluation challenge rules across top prop firms: profit targets, drawdown type, time limits and reset policies.',
    url: 'https://www.empirialprops.com/challenges',
  },
};

export default function ChallengesPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Challenges Matrix', url: 'https://www.empirialprops.com/challenges' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ChallengesClient />
      </Suspense>
    </>
  );
}
