import { db } from './config';
import { doc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { MOCK_AWARDS } from '../data/awards-data';
import { MOCK_BLOG_POSTS } from '../data/blog-data';
import { MOCK_CHALLENGES } from '../data/challenges-data';
import { MOCK_POSTS } from '../data/community-data';
import { MOCK_DEALS } from '../data/deals-data';
import { MOCK_EVENTS } from '../data/events-data';
import { MOCK_FIRMS } from '../data/firms-data';
import { MOCK_REWARDS } from '../data/loyalty-data';
import { MOCK_PAYOUTS } from '../data/payouts-data';
import { MOCK_REVIEWS } from '../data/reviews-data';
import { MOCK_SPREADS } from '../data/spreads-data';
import { MOCK_TICKERS, TRUST_STATS, PARTNER_LOGOS, TESTIMONIALS, PRICING_PLANS, FAQ_ITEMS } from '../data/site-data';

export async function seedDatabase() {
  if (!db) {
    throw new Error('Firestore database is not initialized. Check your Firebase credentials.');
  }

  console.log('Starting Firestore database seeding...');

  // Helper to chunk batches (Firestore max writes per batch is 500)
  const batchWrite = async (items: any[], getDocRef: (item: any) => any) => {
    let batch = writeBatch(db);
    let count = 0;

    for (const item of items) {
      const docRef = getDocRef(item);
      // Clean undefined values since Firestore does not accept undefined
      const cleanItem = JSON.parse(JSON.stringify(item));
      batch.set(docRef, {
        ...cleanItem,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      count++;

      if (count === 400) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
  };

  try {
    // 1. Seed Firms
    console.log('Seeding firms...');
    await batchWrite(MOCK_FIRMS, (f) => doc(db, 'firms', f.id));

    // 2. Seed Challenges
    console.log('Seeding challenges...');
    await batchWrite(MOCK_CHALLENGES, (c) => doc(db, 'challenges', c.id));

    // 3. Seed Deals
    console.log('Seeding deals...');
    await batchWrite(MOCK_DEALS, (d) => doc(db, 'deals', d.id));

    // 4. Seed Payouts
    console.log('Seeding payouts...');
    await batchWrite(MOCK_PAYOUTS, (p) => doc(db, 'payouts', p.id));

    // 5. Seed Reviews
    console.log('Seeding reviews...');
    await batchWrite(MOCK_REVIEWS, (r) => doc(db, 'reviews', r.id));

    // 6. Seed Events
    console.log('Seeding events...');
    await batchWrite(MOCK_EVENTS, (e) => doc(db, 'events', e.id));

    // 7. Seed Blog Posts
    console.log('Seeding blog posts...');
    await batchWrite(MOCK_BLOG_POSTS, (b) => doc(db, 'blogPosts', b.id || b.slug));

    // 8. Seed Community Posts
    console.log('Seeding community posts...');
    await batchWrite(MOCK_POSTS, (p) => doc(db, 'communityPosts', p.id));

    // 9. Seed Awards
    console.log('Seeding awards...');
    await batchWrite(MOCK_AWARDS, (a) => doc(db, 'awards', a.id));

    // 10. Seed Loyalty Rewards
    console.log('Seeding loyalty rewards...');
    await batchWrite(MOCK_REWARDS, (r) => doc(db, 'loyaltyRewards', r.id));

    // 11. Seed Broker Spreads
    console.log('Seeding broker spreads...');
    await batchWrite(MOCK_SPREADS, (s) => doc(db, 'brokerSpreads', s.id));

    // 12. Seed Market Tickers
    console.log('Seeding market tickers...');
    await batchWrite(MOCK_TICKERS, (t) => doc(db, 'marketTickers', t.symbol.replace('/', '-')));

    // 13. Seed Testimonials
    console.log('Seeding testimonials...');
    await batchWrite(TESTIMONIALS, (t) => doc(db, 'testimonials', t.id));

    // 14. Seed Pricing Plans
    console.log('Seeding pricing plans...');
    await batchWrite(PRICING_PLANS, (p) => doc(db, 'pricingPlans', p.id));

    // 15. Seed FAQs
    console.log('Seeding FAQs...');
    await batchWrite(FAQ_ITEMS, (faq) => doc(db, 'faqs', faq.question.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)));

    // 16. Seed Partner Logos
    console.log('Seeding partner logos...');
    await batchWrite(PARTNER_LOGOS, (l) => doc(db, 'partnerLogos', l.name.toLowerCase().replace(/\s+/g, '-')));

    // 17. Seed Site Settings
    console.log('Seeding site settings...');
    const siteSettings = {
      hero: {
        title: 'EMPIRIAL\nBuilding Empires',
        subtitle: 'Compare prop firms, grab verified discount codes, and access our trading community',
        cta1Text: 'GRAB OFFERS',
        cta1Url: '/deals',
        cta2Text: 'Join Discord',
        cta2Url: 'https://discord.gg/ww4dkeeZdp',
      },
      stats: [
        { value: 0, suffix: '+', label: 'Active Traders' },
        { value: 40, suffix: '+', label: 'Firms Audited' },
        { value: 12000, suffix: 'K+', label: 'Trader Reviews' },
        { value: 150, suffix: '+', label: 'Specs Compared' },
      ],
      trustStats: TRUST_STATS,
      footer: {
        brandName: 'EMPIRIAL',
        tagline: 'Building Empires.',
        copyrightText: '© 2026 EMPIRIAL. All rights reserved.',
        socialLinks: [
          { name: 'Instagram', href: 'https://www.instagram.com/anuraj_fx' },
          { name: 'X', href: 'https://x.com/anuraj_fx' },
          { name: 'Discord', href: 'https://discord.gg/ww4dkeeZdp' },
          { name: 'YouTube', href: 'https://www.youtube.com/@jaat_anuraj_fx' },
        ],
        footerLinks: [
          { name: 'Privacy Policy', href: '/privacy-policy' },
          { name: 'Terms of Service', href: '/terms-and-conditions' },
        ],
      },
      navigation: {
        navItems: [
          { name: 'Firms', href: '/firms', order: 1 },
          { name: 'Challenges', href: '/challenges', order: 2 },
          { name: 'Deals', href: '/deals', order: 3 },
          { name: 'Payouts', href: '/payouts', order: 4 },
          { name: 'Reviews', href: '/reviews', order: 5 },
          { name: 'Spreads', href: '/spreads', order: 6 },
        ],
      },
      discordUrl: 'https://discord.gg/ww4dkeeZdp',
      siteTitle: 'EMPIRIAL 2.0',
      siteDescription: 'Aggregator and comparison platform for prop trading firms.',
      seo: {
        defaultTitle: 'EMPIRIAL 2.0 | Prop Trading Intelligence',
        defaultDescription: 'Compare audited prop trading firms.',
        ogImage: '/og.png',
      }
    };
    const settingsRef = doc(db, 'siteSettings', 'main');
    const batch = writeBatch(db);
    batch.set(settingsRef, {
      ...siteSettings,
      updated_at: new Date().toISOString(),
    });
    await batch.commit();

    // 18. Seed Initial / Demo User Profiles into Firestore
    console.log('Seeding user profiles...');
    const INITIAL_USERS = [
      {
        uid: 'user_alex_miller_001',
        displayName: 'Alex Miller',
        email: 'alex.miller@empirialtraders.com',
        phoneNumber: '+1 (555) 234-5678',
        role: 'trader',
        traderId: 'EMP-ALEX1',
        referral_code: 'EMP-ALEX1',
        points: 450,
        country: 'United States',
        discordHandle: '@alex_miller_fx',
        provider: 'google.com',
        created_at: '2026-01-15T10:00:00.000Z',
      },
      {
        uid: 'user_marcus_chen_002',
        displayName: 'Marcus Chen',
        email: 'marcus.chen@empirialtraders.com',
        phoneNumber: '+1 (555) 876-5432',
        role: 'trader',
        traderId: 'EMP-MARC1',
        referral_code: 'EMP-MARC1',
        points: 820,
        country: 'Singapore',
        discordHandle: '@marcus_chen_trader',
        provider: 'discord.com',
        created_at: '2026-02-01T14:30:00.000Z',
      },
      {
        uid: 'user_sarah_jenkins_003',
        displayName: 'Sarah Jenkins',
        email: 'sarah.jenkins@empirialtraders.com',
        phoneNumber: '+44 20 7946 0912',
        role: 'trader',
        traderId: 'EMP-SARA1',
        referral_code: 'EMP-SARA1',
        points: 1200,
        country: 'United Kingdom',
        discordHandle: '@sarah_j_fx',
        provider: 'password',
        created_at: '2026-02-18T09:15:00.000Z',
      },
      {
        uid: 'user_anuraj_admin_000',
        displayName: 'Anuraj (Empirial Admin)',
        email: 'anuraj@empirialprops.com',
        phoneNumber: '+91 98765 43210',
        role: 'admin',
        traderId: 'EMP-ADMIN',
        referral_code: 'EMP-ADMIN',
        points: 5000,
        country: 'India',
        discordHandle: '@jaat_anuraj_fx',
        provider: 'google.com',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ];
    await batchWrite(INITIAL_USERS, (u) => doc(db, 'users', u.uid));

    // 19. Auto-sync all seeded & existing users to Google Sheet Webhook
    console.log('Syncing users to Google Sheets webhook...');
    try {
      const { syncAllExistingUsersToGoogleSheet } = await import('./sheets-sync');
      await syncAllExistingUsersToGoogleSheet();
    } catch (sheetErr) {
      console.warn('Google Sheets auto-sync during seeding warning:', sheetErr);
    }

    console.log('Firestore database seeding & Google Sheet sync successfully completed!');
    return { success: true };
  } catch (error) {
    console.error('Seeding database failed:', error);
    throw error;
  }
}
