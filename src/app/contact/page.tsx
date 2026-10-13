import React from 'react';
import { Metadata } from 'next';
import { ContactClient } from './ContactClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Contact EMPIRIAL Desk — Audits, Support & Partnership Inquiries',
  description: 'Get in touch with the EMPIRIAL analyst desk for prop firm audit requests, verified payout support, or community inquiries.',
  alternates: {
    canonical: 'https://www.empirialprops.com/contact',
  },
  openGraph: {
    title: 'Contact EMPIRIAL Desk — Audits, Support & Partnership Inquiries',
    description: 'Get in touch with the EMPIRIAL analyst desk for prop firm audit requests, verified payout support, or community inquiries.',
    url: 'https://www.empirialprops.com/contact',
  },
};

export default function ContactPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Contact Us', url: 'https://www.empirialprops.com/contact' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ContactClient />
    </>
  );
}
