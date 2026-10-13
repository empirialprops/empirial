import React from 'react';
import { Metadata } from 'next';
import { DealsClient } from '@/app/deals/DealsClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${catTitle} Prop Firm Discount Codes & Promo Offers — EMPIRIAL`,
    description: `Verified, up-to-date ${catTitle} discount codes for top prop trading firms. Tested daily.`,
    alternates: {
      canonical: `https://www.empirialprops.com/${category}/deals`,
    },
  };
}

export default function CategoryDealsPage({ category }: { category: string }) {
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: `${catTitle} Sector`, url: `https://www.empirialprops.com/${category}` },
    { name: 'Discount Codes', url: `https://www.empirialprops.com/${category}/deals` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <DealsClient />
    </>
  );
}
