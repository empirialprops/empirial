'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Link2,
  Tag,
  Send,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SocialCategory } from '@/lib/types';
import { createSocialPost } from '@/lib/utils/social-store';
import { UserProfile } from '@/lib/utils/auth-store';

interface PostComposerProps {
  currentUser: UserProfile;
  onPostCreated?: () => void;
}

const CATEGORIES: SocialCategory[] = [
  'TRADING KNOWLEDGE',
  'PROP FIRM OFFERS',
  'TRADING PSYCHOLOGY',
  'ACCOUNT RULES',
  'TRADER INSIGHTS',
  'COMMUNITY',
];

export function PostComposer({ currentUser, onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<SocialCategory>('TRADING KNOWLEDGE');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!currentUser.is_verified) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('Please write some content for your post.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const mediaUrls = imageUrl.trim() ? [imageUrl.trim()] : undefined;
      const linkPreview = linkUrl.trim()
        ? {
            url: linkUrl.trim(),
            domain: new URL(linkUrl.trim().startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`).hostname,
            title: linkUrl.trim(),
          }
        : undefined;

      createSocialPost(currentUser, content, category, mediaUrls, linkPreview);

      // Reset Form
      setContent('');
      setImageUrl('');
      setLinkUrl('');
      setShowImageInput(false);
      setShowLinkInput(false);

      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to publish post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Top Author Status */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 flex items-center justify-center font-bold text-xs text-foreground">
          {currentUser.avatarUrl ? (
            <Image
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              fill
              className="object-cover"
              sizes="36px"
            />
          ) : (
            <span>{currentUser.displayName.slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-xs text-foreground">{currentUser.displayName}</span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground">
            <CheckCircle2 className="w-3 h-3 text-zinc-900 dark:text-zinc-100" />
            <span>Verified Creator</span>
          </span>
        </div>
      </div>

      {/* Main Composer Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Content Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share prop firm promo codes, risk calculation models, consistency rules, or psychological insights..."
          rows={3}
          className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors resize-y min-h-[90px]"
        />

        {/* Optional Image Input */}
        {showImageInput && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste Image URL (e.g. Unsplash or chart screenshot link)"
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                setShowImageInput(false);
              }}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Image Preview if provided */}
        {imageUrl && (
          <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 h-32 w-full bg-zinc-100 dark:bg-zinc-900">
            <Image src={imageUrl} alt="Attached Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 text-white hover:bg-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Optional Link Input */}
        {showLinkInput && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Attach URL link (e.g. https://nyscapital.com/deal)"
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setLinkUrl('');
                setShowLinkInput(false);
              }}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Controls Row: Category Dropdown, Attachment Buttons & Submit */}
        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
          {/* Left: Attachments & Category */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Select */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SocialCategory)}
              className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Attach Image Toggle */}
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                showImageInput || imageUrl
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-900 text-foreground'
                  : 'border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900'
              }`}
              title="Attach Image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Image</span>
            </button>

            {/* Attach Link Toggle */}
            <button
              type="button"
              onClick={() => setShowLinkInput(!showLinkInput)}
              className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                showLinkInput || linkUrl
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-900 text-foreground'
                  : 'border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-900'
              }`}
              title="Attach URL"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Link</span>
            </button>
          </div>

          {/* Right: Publish Post Button */}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>Publish Post</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
