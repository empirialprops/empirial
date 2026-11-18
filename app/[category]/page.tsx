import React from 'react';
import { Metadata } from 'next';
import { CategoryClient } from './CategoryClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${catTitle} Prop Trading Firms & Evaluation Challenges — EMPIRIAL`,
    description: `Compare audited ${catTitle} prop trading challenges, drawdown rules, maximum allocations, and exclusive coupon codes.`,
    alternates: {
      canonical: `https://www.empirialprops.com/${category}`,
    },
    openGraph: {
      title: `${catTitle} Prop Trading Firms & Evaluation Challenges — EMPIRIAL`,
      description: `Compare audited ${catTitle} prop trading challenges, drawdown rules, maximum allocations, and exclusive coupon codes.`,
      url: `https://www.empirialprops.com/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: `${catTitle} Prop Sector`, url: `https://www.empirialprops.com/${category}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <CategoryClient initialCategory={category} />
    </>
  );
}
