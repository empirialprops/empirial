
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Plus,
  ArrowRight,
  ExternalLink,
  Flame,
  BookOpen,
  UserCheck,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import { SocialPost, SocialCategory } from '@/lib/types';
import {
  getStoredSocialPosts,
  isUserFollowing,
  toggleFollowUser,
} from '@/lib/utils/social-store';
import {
  getStoredUser,
  UserProfile,
  openAuthModal,
} from '@/lib/utils/auth-store';
import { PostCard } from '@/components/social/post-card';
import { PostComposer } from '@/components/social/post-composer';
import { VerificationModal } from '@/components/social/verification-modal';

export function SocialFeedClient() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [sortMode, setSortMode] = useState<'popular' | 'latest'>('popular');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const loadData = () => {
    setPosts(getStoredSocialPosts());
    setCurrentUser(getStoredUser());
  };

  useEffect(() => {
    loadData();

    const handleAuthChange = () => setCurrentUser(getStoredUser());
    const handlePostsChange = () => setPosts(getStoredSocialPosts());

    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('social-posts-changed', handlePostsChange);
    window.addEventListener('verification-apps-changed', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('social-posts-changed', handlePostsChange);
      window.removeEventListener('verification-apps-changed', handleAuthChange);
    };
  }, []);

  // Filter & Sort Logic
  const filteredPosts = posts
    .filter((p) => {
      // Category filter
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesContent = p.content.toLowerCase().includes(q);
        const matchesAuthor = p.author_name.toLowerCase().includes(q) || p.author_handle.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        if (!matchesContent && !matchesAuthor && !matchesCategory) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Pinned posts always stay on top
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      if (sortMode === 'popular') {
        const scoreA = a.upvotes * 2 - a.downvotes;
        const scoreB = b.upvotes * 2 - b.downvotes;
        return scoreB - scoreA;
      } else {
        // Latest first
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const categories = [
    'ALL',
    'PROP FIRM OFFERS',
    'TRADING KNOWLEDGE',
    'TRADING PSYCHOLOGY',
    'ACCOUNT RULES',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            <span>EMPIRIAL State Hall</span>
          </div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            State Hall
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Live prop firm announcements, institutional trade ideas, challenge discounts, and psychological frameworks.
          </p>
        </div>

        {/* Action Button: Apply for Verification or Connect */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!currentUser ? (
            <button
              type="button"
              onClick={openAuthModal}
              className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            >
              Connect Account to Post
            </button>
          ) : !currentUser.is_verified ? (
            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <span>
                {currentUser.verification_status === 'pending'
                  ? 'Verification Pending'
                  : 'Apply for Verification'}
              </span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-foreground">
              <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <span>Verified Creator Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Feed (Left/Center) + Discovery Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Feed Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Post Composer if Verified */}
          {currentUser && currentUser.is_verified && (
            <PostComposer currentUser={currentUser} onPostCreated={loadData} />
          )}

          {/* Unverified prompt banner if logged in without verification */}
          {currentUser && !currentUser.is_verified && currentUser.verification_status !== 'pending' && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <h3 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                  <span>Want to publish prop offers and trading knowledge?</span>
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Apply for Verified Creator status to share promo codes and educational breakdowns.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-medium text-xs transition-all shrink-0 cursor-pointer"
              >
                Apply Now
              </button>
            </div>
          )}

          {/* Feed Controls: [POPULAR] [LATEST] & Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800">
            {/* Sort Tabs (RULE:BW) */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSortMode('popular')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sortMode === 'popular'
                    ? 'bg-white dark:bg-zinc-950 text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>POPULAR</span>
              </button>

              <button
                type="button"
                onClick={() => setSortMode('latest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sortMode === 'latest'
                    ? 'bg-white dark:bg-zinc-950 text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>LATEST</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, prop codes, rules..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Feed Posts List */}
          <div className="space-y-3.5">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onPostUpdated={loadData}
                />
              ))
            ) : (
              <div className="p-8 text-center bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-semibold text-foreground">No posts found</h4>
                <p className="text-xs text-muted-foreground">
                  No social posts match your current search or category filter.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Discovery / Spotlight / Top Creators (4 cols) — Independent Sticky Scroll */}
        <aside className="lg:col-span-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto space-y-4 pr-1 pb-4">
          {/* Card 1: Featured Prop Firm Offers */}
          <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-foreground">
                  Verified Prop Offers
                </h3>
              </div>
              <Link
                href="/deals"
                className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-3.5">
              {/* NYS Deal */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center gap-3">
                  {/* Big Firm Logo */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
                    <Image
                      src="/logos/nys.png"
                      alt="NYS Capital"
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-foreground">NYS Capital</span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black">
                        BOGO FREE
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">1-Step & 2-Step Challenges</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Buy $100K 1-Step, Get $50K Free. Code: <strong className="text-foreground font-bold">EMPIRIALBOGO</strong>
                </p>

                <Link
                  href="/deals"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-foreground hover:underline pt-1"
                >
                  <span>Claim deal allocation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Shark Funded Deal */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center gap-3">
                  {/* Big Firm Logo */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
                    <Image
                      src="/logos/shark.png"
                      alt="Shark Funded"
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-foreground">Shark Funded</span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black">
                        20% OFF
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">1-Step & 2-Step Challenges</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Exclusive 20% discount on all evaluation accounts. Code: <strong className="text-foreground font-bold">EMPIRIAL20</strong>
                </p>

                <Link
                  href="/deals"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-foreground hover:underline pt-1"
                >
                  <span>Claim deal allocation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Top Verified Creators Spotlight */}
          <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
              <UserCheck className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-foreground">
                Verified Creators
              </h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 'author-firm-1',
                  name: 'NYS Capital',
                  handle: '@nyscapital',
                  avatar: '/logos/nys.png',
                  badge: 'Prop Firm Official',
                },
                {
                  id: 'author-trader-1',
                  name: 'Anuraj FX Trader',
                  handle: '@anuraj_trader',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  badge: '$250K Funded Trader',
                },
                {
                  id: 'author-firm-shark',
                  name: 'Shark Funded Official',
                  handle: '@sharkfunded',
                  avatar: '/logos/shark.png',
                  badge: 'Prop Firm Official',
                },
              ].map((creator) => {
                const following = currentUser ? isUserFollowing(creator.id, currentUser) : false;
                const isSelf = currentUser?.uid === creator.id;

                return (
                  <div
                    key={creator.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Big Creator Avatar (48px) */}
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
                        <Image
                          src={creator.avatar}
                          alt={creator.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm sm:text-base text-foreground truncate max-w-[130px] sm:max-w-[160px]">
                            {creator.name}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                        </div>
                        <span className="text-xs text-muted-foreground block truncate">
                          {creator.badge}
                        </span>
                      </div>
                    </div>

                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUser) openAuthModal();
                          else {
                            toggleFollowUser(creator.id);
                            loadData();
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                          following
                            ? 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground'
                            : 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                        }`}
                      >
                        {following ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Trader Risk Rule of the Day */}
          <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Daily Rule Preservation
            </span>
            <h4 className="text-sm sm:text-base font-bold text-foreground leading-snug">
              &quot;Never risk more than 3.5% of your max drawdown cushion on a single trade setup.&quot;
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Preserving your daily equity floor is mathematically twice as important as profit acceleration during evaluation phases.
            </p>
          </div>
        </aside>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        currentUser={currentUser}
        onApplicationSubmitted={loadData}
      />
    </div>
  );
}
