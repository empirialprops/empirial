
import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  ExternalLink,
  Share2,
  MoreHorizontal,
  Trash2,
  Pin,
  Sparkles,
  Building2,
  UserCheck,
  Check,
} from 'lucide-react';
import { SocialPost } from '@/lib/types';
import {
  voteSocialPost,
  toggleFollowUser,
  isUserFollowing,
  deleteSocialPost,
  pinSocialPost,
} from '@/lib/utils/social-store';
import { UserProfile, openAuthModal } from '@/lib/utils/auth-store';

interface PostCardProps {
  post: SocialPost;
  currentUser: UserProfile | null;
  onPostUpdated?: () => void;
}

export function PostCard({ post, currentUser, onPostUpdated }: PostCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const isSelf = currentUser?.uid === post.author_id;
  const isFollowing = currentUser ? isUserFollowing(post.author_id, currentUser) : false;
  const hasUpvoted = currentUser ? post.upvoted_by.includes(currentUser.uid) : false;
  const hasDownvoted = currentUser ? post.downvoted_by.includes(currentUser.uid) : false;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  const handleVote = (type: 'up' | 'down') => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    voteSocialPost(post.id, type, currentUser.uid);
    if (onPostUpdated) onPostUpdated();
  };

  const handleFollow = () => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    if (isSelf) return;
    toggleFollowUser(post.author_id);
    if (onPostUpdated) onPostUpdated();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteSocialPost(post.id);
      if (onPostUpdated) onPostUpdated();
    }
  };

  const handlePin = () => {
    pinSocialPost(post.id);
    if (onPostUpdated) onPostUpdated();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/blog#${post.id}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Format relative timestamp
  const formatTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <article
      id={post.id}
      className={`bg-white dark:bg-[#0A0A0A] border rounded-2xl p-4 sm:p-5 transition-all space-y-3.5 shadow-xs relative ${
        post.is_pinned
          ? 'border-zinc-900 dark:border-zinc-200'
          : 'border-zinc-200 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      {/* Pinned Indicator */}
      {post.is_pinned && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 pb-1 border-b border-zinc-100 dark:border-zinc-800">
          <Pin className="w-3.5 h-3.5 fill-current" />
          <span>Pinned Announcement</span>
        </div>
      )}

      {/* Header: Author Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Author Logo/Avatar */}
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 flex items-center justify-center font-bold text-xs text-foreground">
            {post.author_avatar ? (
              <Image
                src={post.author_avatar}
                alt={post.author_name}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <span>{post.author_name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          {/* Author Meta */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-foreground truncate max-w-[180px] sm:max-w-[240px]">
                {post.author_name}
              </span>

              {/* Verified Badge */}
              {post.is_verified && (
                <span
                  title="Verified Trader / Official Partner"
                  className="inline-flex items-center gap-0.5 text-zinc-900 dark:text-zinc-100"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white dark:text-black stroke-zinc-900 dark:stroke-zinc-100" />
                </span>
              )}

              {/* Role / Firm Badge */}
              {post.firm_badge && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-muted-foreground">
                  {post.firm_badge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{post.author_handle}</span>
              <span>•</span>
              <time dateTime={post.created_at}>{formatTime(post.created_at)}</time>
            </div>
          </div>
        </div>

        {/* Top Right: Follow Button & More Options */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isSelf && (
            <button
              type="button"
              onClick={handleFollow}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isFollowing
                  ? 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-foreground'
                  : 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          {/* More options menu (Admin / Owner) */}
          {(isAdmin || isSelf) && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showOptions && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 shadow-lg z-20 space-y-0.5 text-xs">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowOptions(false);
                        handlePin();
                      }}
                      className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center gap-2 text-foreground"
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>{post.is_pinned ? 'Unpin Post' : 'Pin to Top'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptions(false);
                      handleDelete();
                    }}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Post</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed font-normal">
        {post.content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={i} className="font-bold text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>

      {/* Media / Image Attachments */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 max-h-96 relative group cursor-pointer">
          <div
            onClick={() => setImageModalOpen(true)}
            className="relative w-full h-64 sm:h-80"
          >
            <Image
              src={post.media_urls[0]}
              alt="Post attachment"
              fill
              className="object-cover group-hover:scale-101 transition-transform duration-300"
              sizes="(max-w-768px) 100vw, 700px"
            />
          </div>
        </div>
      )}

      {/* Link Preview Card */}
      {post.link_preview && (
        <a
          href={post.link_preview.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <span>{post.link_preview.domain || 'External Resource'}</span>
                <ExternalLink className="w-3 h-3 group-hover:text-foreground transition-colors" />
              </span>
              <h4 className="text-xs font-semibold text-foreground group-hover:underline line-clamp-1">
                {post.link_preview.title || post.link_preview.url}
              </h4>
              {post.link_preview.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  {post.link_preview.description}
                </p>
              )}
            </div>
          </div>
        </a>
      )}

      {/* Bottom Interaction Row: Upvotes, Downvotes, Category Pill, Share */}
      <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
        {/* Votes Group */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          {/* Upvote Button */}
          <button
            type="button"
            onClick={() => handleVote('up')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
              hasUpvoted
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
            }`}
            title="Upvote post"
          >
            <ArrowUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'stroke-[2.5]' : ''}`} />
            <span className="font-bold tracking-tight">{post.upvotes}</span>
          </button>

          {/* Downvote Button */}
          <button
            type="button"
            onClick={() => handleVote('down')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium text-xs transition-all cursor-pointer ${
              hasDownvoted
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
            }`}
            title="Downvote post"
          >
            <ArrowDown className={`w-3.5 h-3.5 ${hasDownvoted ? 'stroke-[2.5]' : ''}`} />
            {post.downvotes > 0 && <span className="text-[11px] font-bold">{post.downvotes}</span>}
          </button>
        </div>

        {/* Right side: Category tag & Share */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-muted-foreground uppercase tracking-wider">
            {post.category}
          </span>

          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Copy link to post"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-foreground" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </article>
  );
}
