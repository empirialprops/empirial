import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import NavBar from '@/components/navbar';
import { OfferPosterModal } from '@/components/offer-poster-modal';
import { ReferralTracker } from '@/components/referral-tracker';
import { BrandingSync } from '@/components/branding-sync';

import { JsonLd, getOrganizationSchema } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.empirialprops.com'),
  title: {
    default: 'EMPIRIAL — Compare Prop Trading Firms, Rules & Payout Proof',
    template: '%s | EMPIRIAL',
  },
  description: 'Compare prop trading firms side-by-side: drawdown rules, profit splits, payout speed and verified discount codes. Trusted by traders worldwide.',
  applicationName: 'EMPIRIAL',
  authors: [{ name: 'EMPIRIAL' }, { name: 'ANURAJ FX' }],
  keywords: [
    'prop firm comparison',
    'best prop trading firms',
    'prop firm discount code',
    'prop firm review',
    'prop firm payout proof',
    'forex prop firms',
    'evaluation challenge rules',
    'funded trader accounts',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.empirialprops.com',
    siteName: 'EMPIRIAL',
    title: 'EMPIRIAL — Compare Prop Trading Firms, Rules & Payout Proof',
    description: 'Compare prop trading firms side-by-side: drawdown rules, profit splits, payout speed and verified discount codes.',
    images: [
      {
        url: '/favicon.ico',
        width: 512,
        height: 512,
        alt: 'EMPIRIAL Prop Trading Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EMPIRIAL — Compare Prop Trading Firms, Rules & Payout Proof',
    description: 'Compare prop trading firms side-by-side: drawdown rules, profit splits, payout speed and verified discount codes.',
    creator: '@anuraj_fx',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* Global Structured Data */}
          <JsonLd data={getOrganizationSchema()} />

          {/* Centralized Branding Synchronizer */}
          <BrandingSync />

          {/* Referral & Session Synchronizer */}
          <ReferralTracker />

          {/* Global Navigation */}
          <NavBar />

          {/* Session Welcome Offer Poster Modal */}
          <OfferPosterModal />

          {/* Main Content Area */}
          <main className="flex-1 w-full bg-background">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
