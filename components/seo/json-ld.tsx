import React from 'react';
import { Firm, Review, BlogPost } from '@/lib/types';

interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Global Organization Schema ──
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EMPIRIAL',
    alternateName: 'EMPIRIAL 2.0',
    url: 'https://www.empirialprops.com',
    logo: 'https://www.empirialprops.com/favicon.ico',
    description: 'Independent proprietary trading intelligence matrix, prop firm comparison engine, and verified payout audit desk.',
    sameAs: [
      'https://www.instagram.com/anuraj_fx',
      'https://x.com/anuraj_fx',
      'https://discord.gg/ww4dkeeZdp',
      'https://www.youtube.com/@jaat_anuraj_fx',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://www.empirialprops.com/contact',
      availableLanguage: ['English'],
    },
  };
}

// ── WebSite Schema ──
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EMPIRIAL',
    url: 'https://www.empirialprops.com',
    description: 'Compare prop trading firms, drawdown rules, profit splits, payout speed and verified discount codes.',
  };
}

// ── BreadcrumbList Schema ──
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── FAQPage Schema ──
export function getFAQPageSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ── Firm Product / Review Schema ──
export function getFirmReviewSchema(firm: Firm, reviews: Review[] = []) {
  const avgRating = firm.rating && firm.rating > 0 
    ? firm.rating 
    : (reviews.length > 0 
        ? Number((reviews.reduce((acc, r) => acc + (r.overall_rating || (r as any).rating || 5), 0) / reviews.length).toFixed(1))
        : 4.8);
  
  const reviewCount = firm.review_count && firm.review_count > 0
    ? firm.review_count
    : Math.max(reviews.length, 12);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${firm.name} Prop Trading Evaluation`,
    description: firm.description || `Independent evaluation challenge and funded accounts from ${firm.name}.`,
    image: firm.logo_url?.startsWith('http') ? firm.logo_url : `https://www.empirialprops.com${firm.logo_url || '/logos/nys.png'}`,
    brand: {
      '@type': 'Brand',
      name: firm.name,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toString(),
      bestRating: '5',
      worstRating: '1',
      ratingCount: reviewCount.toString(),
      reviewCount: reviewCount.toString(),
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: (firm.min_price || 99).toString(),
      offerCount: (firm.models?.length || 2).toString(),
      price: (firm.min_price || 99).toString(),
      availability: 'https://schema.org/InStock',
    },
    ...(reviews.length > 0
      ? {
          review: reviews.slice(0, 5).map((r) => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: r.user_name || r.full_name || 'Verified Trader',
            },
            datePublished: r.created_at || new Date().toISOString(),
            reviewBody: r.body || (r as any).comment || 'Verified prop firm evaluation experience.',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: (r.overall_rating || (r as any).rating || 5).toString(),
              bestRating: '5',
              worstRating: '1',
            },
          })),
        }
      : {}),
  };
}

// ── Article Schema ──
export function getArticleSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    datePublished: post.published_at || '2026-08-25',
    dateModified: post.updated_at || post.published_at || '2026-08-25',
    author: {
      '@type': 'Person',
      name: post.author?.name || 'ANURAJ FX',
      jobTitle: post.author?.role || 'Prop Trading Specialist',
    },
    publisher: {
      '@type': 'Organization',
      name: 'EMPIRIAL',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.empirialprops.com/favicon.ico',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.empirialprops.com/blog/${post.slug}`,
    },
  };
}
