import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/firms',
          '/deals',
          '/challenges',
          '/compare',
          '/blog',
          '/reviews',
          '/about',
          '/contact',
          '/careers',
          '/pricing',
          '/events',
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/dashboard/',
          '/account/',
          '/login',
          '/signup',
          '/cart',
          '/checkout',
          '/*?*sort=',
          '/*?*filter=',
          '/*?*utm_',
          '/search',
          '/*.json$',
        ],
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'PerplexityBot'],
        allow: '/',
      },
    ],
    sitemap: 'https://www.empirialprops.com/sitemap.xml',
    host: 'https://www.empirialprops.com',
  };
}
