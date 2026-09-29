'use client';

import { SocialPost, VerificationApplication, SocialCategory } from '@/lib/types';
import { getStoredUser, saveUser, UserProfile } from '@/lib/utils/auth-store';

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'sp-1',
    author_id: 'author-firm-1',
    author_name: 'NYS Capital',
    author_handle: '@nyscapital',
    author_avatar: '/logos/nys.png',
    is_verified: true,
    author_role: 'firm',
    firm_badge: 'Prop Firm Official',
    firm_logo: '/logos/nys.png',
    content: `⚡ **EXCLUSIVE FLASH BOGO WEEKEND ACTIVATED**

For the next 48 hours, purchase any $100K 1-Step or 2-Step Evaluation Challenge on NYS Capital and receive an identical $50K Evaluation Account completely **FREE**.

Use Coupon Code: **EMPIRIALBOGO**
✓ Sub-6 hour on-chain crypto and bank payouts
✓ No hidden lot size consistency traps
✓ Raw institutional cTrader execution on Gold, Indices & FX

Claim your allocation on EMPIRIAL Deals or via the link below.`,
    media_urls: [
      'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
    ],
    link_preview: {
      url: 'https://nyscapital.com/empirial-deal',
      title: 'NYS Capital BOGO Flash Event — 100K & 50K Challenge Bundle',
      description: 'Zero commission indices, rapid payouts, and institutional cTrader platform.',
      domain: 'nyscapital.com',
      image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
    },
    category: 'PROP FIRM OFFERS',
    upvotes: 142,
    downvotes: 4,
    upvoted_by: ['trader-001'],
    downvoted_by: [],
    created_at: '2026-08-27T18:30:00Z',
    is_pinned: true,
  },
  {
    id: 'sp-2',
    author_id: 'author-trader-1',
    author_name: 'Anuraj FX Trader',
    author_handle: '@anuraj_trader',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    is_verified: true,
    author_role: 'trader',
    firm_badge: '$250K Funded Trader',
    content: `📊 **The Asymmetric Drawdown Framework for 100K & 200K Challenges**

Most traders fail evaluations not due to technical strategy, but because they risk 1% of total starting balance rather than **0.35%–0.50% of the true loss cushion**.

Here is my core risk blueprint:
1. **True Risk Pool**: On a $100K account with 10% ($10K) max drawdown, your working risk capital is $10,000, NOT $100,000.
2. **Trade Risk**: Cap per-trade risk at **$350–$500** (0.35%–0.50% balance).
3. **Daily Circuit Breaker**: Stop terminal execution immediately at -$1,050 in a single session.
4. **Target Expectancy**: With 1:2.5 RR on winning SMC sweeps, a 38% win rate passes Phase 1 comfortably within 14 trading days.

Stay disciplined and preserve your daily floor!`,
    media_urls: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'TRADING KNOWLEDGE',
    upvotes: 218,
    downvotes: 6,
    upvoted_by: [],
    downvoted_by: [],
    created_at: '2026-08-27T16:15:00Z',
  },
  {
    id: 'sp-5',
    author_id: 'author-firm-3',
    author_name: 'Alpha Capital Group',
    author_handle: '@alphacapital',
    author_avatar: '/logos/alpha.png',
    is_verified: true,
    author_role: 'firm',
    firm_badge: 'Prop Firm Official',
    firm_logo: '/logos/alpha.png',
    content: `🔥 **Zero Commissions on US30 & NAS100 cTrader Evaluation**

All Alpha Pro 2-Step evaluations now feature **0.0 pip raw spreads** and **$0 commission fees** across major indices during London & New York session crossovers.

✓ 80% default profit split scaling automatically to 90%
✓ Bi-weekly on-demand payouts
✓ High-speed ACG Execution Server in LD4`,
    media_urls: [
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'PROP FIRM OFFERS',
    upvotes: 88,
    downvotes: 1,
    upvoted_by: [],
    downvoted_by: [],
    created_at: '2026-08-26T20:10:00Z',
  },
];

export const INITIAL_VERIFICATION_APPLICATIONS: VerificationApplication[] = [];

// Helper Storage Keys
const POSTS_KEY = 'empirial_social_posts';
const APPS_KEY = 'empirial_verification_apps';

// --- Social Posts API ---

export function getStoredSocialPosts(): SocialPost[] {
  if (typeof window === 'undefined') return INITIAL_SOCIAL_POSTS;
  const saved = localStorage.getItem(POSTS_KEY);
  if (!saved) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(INITIAL_SOCIAL_POSTS));
    return INITIAL_SOCIAL_POSTS;
  }
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      // Purge any legacy dummy posts
      const filtered = parsed.filter(
        (p) =>
          p &&
          p.author_name !== 'Topstep' &&
          p.author_name !== 'Elena Vance' &&
          !p.content?.toLowerCase().includes('ftmo')
      );
      if (filtered.length !== parsed.length) {
        localStorage.setItem(POSTS_KEY, JSON.stringify(filtered));
      }
      return filtered.length > 0 ? filtered : INITIAL_SOCIAL_POSTS;
    }
    return INITIAL_SOCIAL_POSTS;
  } catch (e) {
    return INITIAL_SOCIAL_POSTS;
  }
}

export function saveSocialPosts(posts: SocialPost[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  window.dispatchEvent(new CustomEvent('social-posts-changed', { detail: posts }));
}

export function createSocialPost(
  author: UserProfile,
  content: string,
  category: SocialCategory,
  mediaUrls?: string[],
  linkPreview?: SocialPost['link_preview']
): SocialPost | null {
  if (!author.is_verified) {
    console.error('Only verified users can create social posts.');
    return null;
  }

  const posts = getStoredSocialPosts();
  const newPost: SocialPost = {
    id: `sp-${Date.now()}`,
    author_id: author.uid,
    author_name: author.displayName,
    author_handle: author.discordHandle || `@${author.displayName.toLowerCase().replace(/\s+/g, '_')}`,
    author_avatar: author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    is_verified: true,
    author_role: author.role === 'admin' ? 'admin' : (author.firm_badge ? 'firm' : 'trader'),
    firm_badge: author.firm_badge || 'Verified Trader',
    firm_logo: author.firm_logo,
    content: content.trim(),
    media_urls: mediaUrls && mediaUrls.length > 0 ? mediaUrls : undefined,
    link_preview: linkPreview,
    category,
    upvotes: 1,
    downvotes: 0,
    upvoted_by: [author.uid],
    downvoted_by: [],
    created_at: new Date().toISOString(),
  };

  const updated = [newPost, ...posts];
  saveSocialPosts(updated);
  return newPost;
}

export function deleteSocialPost(postId: string): boolean {
  const posts = getStoredSocialPosts();
  const filtered = posts.filter((p) => p.id !== postId);
  if (filtered.length === posts.length) return false;
  saveSocialPosts(filtered);
  return true;
}

export function pinSocialPost(postId: string): boolean {
  const posts = getStoredSocialPosts();
  const updated = posts.map((p) => ({
    ...p,
    is_pinned: p.id === postId ? !p.is_pinned : p.is_pinned,
  }));
  saveSocialPosts(updated);
  return true;
}

// --- Atomic Upvote / Downvote (Mutually Exclusive) ---

export function voteSocialPost(postId: string, voteType: 'up' | 'down', userId: string): SocialPost | null {
  if (!userId) return null;
  const posts = getStoredSocialPosts();
  const postIndex = posts.findIndex((p) => p.id === postId);
  if (postIndex === -1) return null;

  const post = { ...posts[postIndex] };
  const hasUpvoted = post.upvoted_by.includes(userId);
  const hasDownvoted = post.downvoted_by.includes(userId);

  if (voteType === 'up') {
    if (hasUpvoted) {
      // Toggle off
      post.upvoted_by = post.upvoted_by.filter((id) => id !== userId);
      post.upvotes = Math.max(0, post.upvotes - 1);
    } else {
      // Add upvote
      post.upvoted_by = [...post.upvoted_by, userId];
      post.upvotes += 1;
      // Remove downvote if previously downvoted (Mutually exclusive)
      if (hasDownvoted) {
        post.downvoted_by = post.downvoted_by.filter((id) => id !== userId);
        post.downvotes = Math.max(0, post.downvotes - 1);
      }
    }
  } else if (voteType === 'down') {
    if (hasDownvoted) {
      // Toggle off
      post.downvoted_by = post.downvoted_by.filter((id) => id !== userId);
      post.downvotes = Math.max(0, post.downvotes - 1);
    } else {
      // Add downvote
      post.downvoted_by = [...post.downvoted_by, userId];
      post.downvotes += 1;
      // Remove upvote if previously upvoted (Mutually exclusive)
      if (hasUpvoted) {
        post.upvoted_by = post.upvoted_by.filter((id) => id !== userId);
        post.upvotes = Math.max(0, post.upvotes - 1);
      }
    }
  }

  posts[postIndex] = post;
  saveSocialPosts(posts);
  return post;
}

// --- Following System ---

export function isUserFollowing(targetAuthorId: string, currentUser?: UserProfile | null): boolean {
  if (!currentUser || !currentUser.following_ids) return false;
  return currentUser.following_ids.includes(targetAuthorId);
}

export function toggleFollowUser(targetAuthorId: string): boolean {
  const currentUser = getStoredUser();
  if (!currentUser) return false;
  if (currentUser.uid === targetAuthorId) return false; // Prevent self follow

  const following = currentUser.following_ids || [];
  let isNowFollowing = false;
  let updatedFollowing: string[];

  if (following.includes(targetAuthorId)) {
    updatedFollowing = following.filter((id) => id !== targetAuthorId);
    isNowFollowing = false;
  } else {
    updatedFollowing = [...following, targetAuthorId];
    isNowFollowing = true;
  }

  const updatedUser: UserProfile = {
    ...currentUser,
    following_ids: updatedFollowing,
  };
  saveUser(updatedUser);
  return isNowFollowing;
}

// --- Verification Applications & Admin Review ---

export function getStoredVerificationApplications(): VerificationApplication[] {
  if (typeof window === 'undefined') return INITIAL_VERIFICATION_APPLICATIONS;
  const saved = localStorage.getItem(APPS_KEY);
  if (!saved) {
    localStorage.setItem(APPS_KEY, JSON.stringify(INITIAL_VERIFICATION_APPLICATIONS));
    return INITIAL_VERIFICATION_APPLICATIONS;
  }
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(
        (a) => a && a.id !== 'vapp-101' && a.id !== 'vapp-102' && !a.trading_experience?.toLowerCase().includes('ftmo')
      );
      if (filtered.length !== parsed.length) {
        localStorage.setItem(APPS_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
    return INITIAL_VERIFICATION_APPLICATIONS;
  } catch (e) {
    return INITIAL_VERIFICATION_APPLICATIONS;
  }
}

export function saveVerificationApplications(apps: VerificationApplication[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  window.dispatchEvent(new CustomEvent('verification-apps-changed', { detail: apps }));
}

export function submitVerificationApplication(
  user: UserProfile,
  tradingExperience: string,
  category: VerificationApplication['category'],
  proofLinks?: string
): VerificationApplication {
  const apps = getStoredVerificationApplications();
  const newApp: VerificationApplication = {
    id: `vapp-${Date.now()}`,
    user_id: user.uid,
    user_name: user.displayName,
    user_email: user.email,
    user_avatar: user.avatarUrl,
    trading_experience: tradingExperience.trim(),
    category,
    proof_links: proofLinks?.trim(),
    applied_at: new Date().toISOString(),
    status: 'pending',
  };

  const updated = [newApp, ...apps];
  saveVerificationApplications(updated);

  // Update current user's verification_status to 'pending'
  const updatedUser: UserProfile = {
    ...user,
    verification_status: 'pending',
  };
  saveUser(updatedUser);

  return newApp;
}

export function approveVerificationApplication(appId: string): boolean {
  const apps = getStoredVerificationApplications();
  const appIndex = apps.findIndex((a) => a.id === appId);
  if (appIndex === -1) return false;

  const app = { ...apps[appIndex], status: 'approved' as const };
  apps[appIndex] = app;
  saveVerificationApplications(apps);

  // If the approved user is currently logged in, update their profile
  const currentUser = getStoredUser();
  if (currentUser && currentUser.uid === app.user_id) {
    saveUser({
      ...currentUser,
      is_verified: true,
      verification_status: 'approved',
    });
  }

  // Also update any posts by this author to is_verified = true
  const posts = getStoredSocialPosts();
  const updatedPosts = posts.map((p) => (p.author_id === app.user_id ? { ...p, is_verified: true } : p));
  saveSocialPosts(updatedPosts);

  return true;
}

export function rejectVerificationApplication(appId: string, notes?: string): boolean {
  const apps = getStoredVerificationApplications();
  const appIndex = apps.findIndex((a) => a.id === appId);
  if (appIndex === -1) return false;

  const app = { ...apps[appIndex], status: 'rejected' as const, admin_notes: notes };
  apps[appIndex] = app;
  saveVerificationApplications(apps);

  // If the rejected user is logged in, update status
  const currentUser = getStoredUser();
  if (currentUser && currentUser.uid === app.user_id) {
    saveUser({
      ...currentUser,
      is_verified: false,
      verification_status: 'rejected',
    });
  }

  return true;
}

export function revokeUserVerification(userId: string): boolean {
  const currentUser = getStoredUser();
  if (currentUser && currentUser.uid === userId) {
    saveUser({
      ...currentUser,
      is_verified: false,
      verification_status: 'not_applied',
    });
  }

  // Update posts authored by this user
  const posts = getStoredSocialPosts();
  const updatedPosts = posts.map((p) => (p.author_id === userId ? { ...p, is_verified: false } : p));
  saveSocialPosts(updatedPosts);

  return true;
}
