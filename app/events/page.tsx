import React from 'react';
import { Metadata } from 'next';
import { EventsClient } from './EventsClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Prop Trading Tournaments, Bootcamps & Live Events | EMPIRIAL',
  description: 'Compete in trading championships for $100k+ in cash and free 100K challenge accounts, or join institutional masterclasses.',
  alternates: {
    canonical: 'https://www.empirialprops.com/events',
  },
  openGraph: {
    title: 'Prop Trading Tournaments, Bootcamps & Live Events | EMPIRIAL',
    description: 'Compete in trading championships for $100k+ in cash and free 100K challenge accounts, or join institutional masterclasses.',
    url: 'https://www.empirialprops.com/events',
  },
};

export default function EventsPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Events & Tournaments', url: 'https://www.empirialprops.com/events' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <EventsClient />
    </>
  );
}
