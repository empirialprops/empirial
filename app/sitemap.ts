import { MetadataRoute } from 'next';
import { getFirms, getBlogPosts } from '@/lib/firebase/services';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { MOCK_BLOG_POSTS } from '@/lib/data/blog-data';

const BASE_URL = 'https://www.empirialprops.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Core Static Routes ──
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/firms`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/deals`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/challenges`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/compare`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/reviews`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/careers`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // ── Dynamic Prop Firm Detail Pages ──
  let firmsList: any[] = [];
  try {
    const fetched = await getFirms();
    if (fetched && fetched.length > 0) {
      firmsList = fetched;
    }
  } catch (_) {}

  if (firmsList.length === 0) {
    firmsList = MOCK_FIRMS;
  }

  const firmRoutes: MetadataRoute.Sitemap = firmsList.map((firm) => {
    const slug = firm.slug || firm.id;
    return {
      url: `${BASE_URL}/firms/${slug}`,
      lastModified: firm.updated_at ? new Date(firm.updated_at) : (firm.created_at ? new Date(firm.created_at) : now),
      changeFrequency: 'daily',
      priority: 0.85,
    };
  });

  // ── Dynamic Blog Post Pages ──
  let blogList: any[] = [];
  try {
    const fetchedPosts = await getBlogPosts();
    if (fetchedPosts && fetchedPosts.length > 0) {
      blogList = fetchedPosts;
    }
  } catch (_) {}

  if (blogList.length === 0) {
    blogList = MOCK_BLOG_POSTS;
  }

  const blogRoutes: MetadataRoute.Sitemap = blogList.map((post) => {
    return {
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at
        ? new Date(post.updated_at)
        : post.published_at
        ? new Date(post.published_at)
        : now,
      changeFrequency: 'weekly',
      priority: 0.75,
    };
  });

  return [...staticRoutes, ...firmRoutes, ...blogRoutes];
}
