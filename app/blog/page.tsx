import React from 'react';
import { Metadata } from 'next';
import { SocialFeedClient } from '@/components/social/social-feed-client';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'State Hall — Prop Trading Insights & Guides | EMPIRIAL',
  description: 'Live prop firm announcements, institutional trade ideas, challenge discounts, and psychological frameworks.',
  alternates: {
    canonical: 'https://www.empirialprops.com/blog',
  },
  openGraph: {
    title: 'State Hall — Prop Trading Insights & Guides | EMPIRIAL',
    description: 'Live prop firm announcements, institutional trade ideas, challenge discounts, and psychological frameworks.',
    url: 'https://www.empirialprops.com/blog',
  },
};

export default function BlogPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'State Hall Blog', url: 'https://www.empirialprops.com/blog' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <SocialFeedClient />
    </>
  );
}
