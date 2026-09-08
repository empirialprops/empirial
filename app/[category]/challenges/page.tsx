import React from 'react';
import { Metadata } from 'next';
import { ChallengesClient } from '@/app/challenges/ChallengesClient';
import { JsonLd, getBreadcrumbSchema } from '@/components/seo/json-ld';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${catTitle} Prop Firm Challenges Compared — Rules, Targets & Limits`,
    description: `Compare ${catTitle} evaluation challenge rules across top prop firms: profit targets, drawdown types, and time limits.`,
    alternates: {
      canonical: `https://www.empirialprops.com/${category}/challenges`,
    },
  };
}

export default async function CategoryChallengesPage({ params }: PageProps) {
  const { category } = await params;
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: `${catTitle} Sector`, url: `https://www.empirialprops.com/${category}` },
    { name: 'Challenges Table', url: `https://www.empirialprops.com/${category}/challenges` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ChallengesClient />
    </>
  );
}
