import React from 'react';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { MOCK_CHALLENGES } from '@/lib/data/challenges-data';
import { MOCK_DEALS } from '@/lib/data/deals-data';
import { MOCK_REVIEWS } from '@/lib/data/reviews-data';
import { MOCK_PAYOUTS } from '@/lib/data/payouts-data';
import { FirmProfileClient } from './FirmProfileClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getFirmBySlug,
  getChallengesByFirm,
  getDealsByFirm,
  getReviewsByFirm,
  getPayoutsByFirm,
} from '@/lib/firebase/services';
import { Challenge, Deal, Review, Payout } from '@/lib/types';
import { JsonLd, getBreadcrumbSchema, getFirmReviewSchema } from '@/components/seo/json-ld';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let firmName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  try {
    const firm = await getFirmBySlug(slug) || MOCK_FIRMS.find((f) => f.slug === slug || f.id === slug);
    if (firm) {
      firmName = firm.name;
    }
  } catch (_) {}

  return {
    title: `${firmName} Review 2026 — Rules, Payout Proof & Discount Code`,
    description: `${firmName} evaluation rules, profit split, drawdown limits, verified payout proof and the latest discount code, reviewed by real traders.`,
    alternates: {
      canonical: `https://www.empirialprops.com/firms/${slug}`,
    },
    openGraph: {
      title: `${firmName} Review 2026 — Rules, Payout Proof & Discount Code`,
      description: `${firmName} evaluation rules, profit split, drawdown limits, verified payout proof and the latest discount code.`,
      url: `https://www.empirialprops.com/firms/${slug}`,
    },
  };
}

export default async function FirmProfilePage({ params }: PageProps) {
  const { slug } = await params;
  
  let firm = null;
  let firmChallenges: Challenge[] = [];
  let firmDeals: Deal[] = [];
  let firmReviews: Review[] = [];
  let firmPayouts: Payout[] = [];

  try {
    firm = await getFirmBySlug(slug);
    if (firm) {
      const [challs, deals, revs, payouts] = await Promise.all([
        getChallengesByFirm(firm.id),
        getDealsByFirm(firm.id),
        getReviewsByFirm(firm.id),
        getPayoutsByFirm(firm.id),
      ]);
      firmChallenges = challs;
      firmDeals = deals;
      firmReviews = revs;
      firmPayouts = payouts;
    }
  } catch (err) {
    console.error('Failed to load firm profile dynamically:', err);
  }

  // Fallback to static mock datasets if Firestore has no records
  if (!firm) {
    firm = MOCK_FIRMS.find((f) => f.slug === slug || f.id === slug);
  }
  if (!firm) {
    notFound();
  }
  if (firmChallenges.length === 0) {
    firmChallenges = MOCK_CHALLENGES.filter((c) => c.firm_slug === firm!.slug || c.firm_id === firm!.id);
  }
  if (firmDeals.length === 0) {
    firmDeals = MOCK_DEALS.filter((d) => d.firm_slug === firm!.slug || d.firm_id === firm!.id);
  }
  const isSlf =
    ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(firm.id.toLowerCase()) ||
    ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(firm.slug.toLowerCase()) ||
    firm.name.toLowerCase().includes('sure leverage') ||
    firm.name.toLowerCase().includes('slf');

  if (firmReviews.length === 0) {
    firmReviews = MOCK_REVIEWS.filter((r) => {
      if (r.firm_id === firm!.id) return true;
      if (isSlf) {
        const rId = (r.firm_id || '').toLowerCase();
        const rName = (r.firm_name || '').toLowerCase();
        return (
          ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(rId) ||
          rName.includes('sure leverage') ||
          rName.includes('slf')
        );
      }
      return false;
    });
  }
  if (firmPayouts.length === 0) {
    firmPayouts = MOCK_PAYOUTS.filter((p) => p.firm_id === firm!.id);
  }

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'Verified Firms', url: 'https://www.empirialprops.com/firms' },
    { name: firm.name, url: `https://www.empirialprops.com/firms/${firm.slug || slug}` },
  ]);

  const productSchema = getFirmReviewSchema(firm, firmReviews);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <JsonLd data={productSchema} />
      <FirmProfileClient
        firm={firm}
        firmChallenges={firmChallenges}
        firmDeals={firmDeals}
        firmReviews={firmReviews}
        firmPayouts={firmPayouts}
      />
    </>
  );
}
