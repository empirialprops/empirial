import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, User, Share2, Sparkles, ShieldCheck } from 'lucide-react';
import { MOCK_BLOG_POSTS } from '@/lib/data/blog-data';
import { adminDb } from '@/lib/firebase/admin';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { JsonLd, getBreadcrumbSchema, getArticleSchema } from '@/components/seo/json-ld';
import { BlogPost } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let post = MOCK_BLOG_POSTS.find((p) => p.slug === slug);

  if (adminDb) {
    try {
      const snap = await adminDb.collection('blogPosts').where('slug', '==', slug).limit(1).get();
      if (!snap.empty) {
        post = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
      }
    } catch (_) {}
  }

  if (!post) {
    return {
      title: 'Article Not Found | EMPIRIAL State Hall',
    };
  }

  const excerpt = post.excerpt && post.excerpt.length > 160 
    ? `${post.excerpt.substring(0, 157)}...` 
    : post.excerpt;

  return {
    title: `${post.title} — EMPIRIAL State Hall`,
    description: excerpt,
    alternates: {
      canonical: `https://www.empirialprops.com/blog/${slug}`,
    },
    openGraph: {
      title: `${post.title} — EMPIRIAL State Hall`,
      description: excerpt,
      url: `https://www.empirialprops.com/blog/${slug}`,
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author?.name || 'EMPIRIAL'],
      images: [
        {
          url: post.cover_image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} — EMPIRIAL State Hall`,
      description: excerpt,
      creator: '@anuraj_fx',
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post = MOCK_BLOG_POSTS.find((p) => p.slug === slug);

  if (adminDb) {
    try {
      const snap = await adminDb.collection('blogPosts').where('slug', '==', slug).limit(1).get();
      if (!snap.empty) {
        post = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
      }
    } catch (err) {
      console.error('Failed to fetch blog post:', err);
    }
  }

  if (!post) {
    notFound();
  }

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: 'https://www.empirialprops.com' },
    { name: 'State Hall', url: 'https://www.empirialprops.com/blog' },
    { name: post.title, url: `https://www.empirialprops.com/blog/${slug}` },
  ]);

  const articleSchema = getArticleSchema(post as BlogPost);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <JsonLd data={articleSchema} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Education Hub</span>
        </Link>

        {/* Header */}
        <div className="space-y-4 border-b border-white/10 pb-8">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase">
              {post.category}
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.read_time}</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {post.published_at}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            {post.excerpt}
          </p>

          {/* Author Card */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                {post.author.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{post.author.name}</h3>
                <p className="text-xs text-slate-400">{post.author.role}</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Guide
            </span>
          </div>
        </div>

        {/* Post Markdown Content */}
        <div className="bg-elevation-surface border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line shadow-2xl">
          {post.content}
        </div>

        {/* Bottom CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 to-elevation-surface border border-cyan-500/30 text-center space-y-4 shadow-xl">
          <h3 className="text-xl font-bold text-white">Ready to Put This Strategy into Practice?</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Explore our audited 13-column evaluation matrix and find the challenge tailored to your risk model.
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95"
          >
            <span>Explore 500+ Challenges Matrix</span>
          </Link>
        </div>
      </article>
    </>
  );
}
