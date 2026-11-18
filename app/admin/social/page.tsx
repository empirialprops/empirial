'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Trash2,
  Pin,
  Clock,
  UserCheck,
  UserX,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Plus,
  Send,
  AlertCircle,
  Globe,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Phone,
  Link2,
} from 'lucide-react';
import {
  SocialPost,
  VerificationApplication,
  SocialCategory,
} from '@/lib/types';
import {
  getStoredSocialPosts,
  getStoredVerificationApplications,
  approveVerificationApplication,
  rejectVerificationApplication,
  revokeUserVerification,
  deleteSocialPost,
  pinSocialPost,
  createSocialPost,
} from '@/lib/utils/social-store';
import { getStoredUser, UserProfile, DEMO_ADMIN } from '@/lib/utils/auth-store';
import {
  getStoredSocialLinks,
  saveStoredSocialLinks,
  fetchRemoteSocialLinks,
  SocialLinksConfig,
  CustomSocialLink,
  DEFAULT_SOCIAL_LINKS,
} from '@/lib/utils/socials-store';

export default function AdminSocialPage() {
  const [activeTab, setActiveTab] = useState<'socials' | 'applications' | 'creators' | 'posts' | 'broadcast'>('socials');
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Official Socials State
  const [socialsConfig, setSocialsConfig] = useState<SocialLinksConfig>(DEFAULT_SOCIAL_LINKS);
  const [isSavingSocials, setIsSavingSocials] = useState(false);
  const [socialSaveSuccess, setSocialSaveSuccess] = useState<string | null>(null);
  const [socialSaveError, setSocialSaveError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Broadcast state
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<SocialCategory>('PROP FIRM OFFERS');
  const [broadcastImageUrl, setBroadcastImageUrl] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const loadData = () => {
    setApplications(getStoredVerificationApplications());
    setPosts(getStoredSocialPosts());
    setCurrentUser(getStoredUser() || DEMO_ADMIN);
    const initialSocials = getStoredSocialLinks();
    setSocialsConfig(initialSocials);
    fetchRemoteSocialLinks().then((remote) => {
      if (remote) setSocialsConfig(remote);
    });
  };

  useEffect(() => {
    loadData();

    const handleApps = () => setApplications(getStoredVerificationApplications());
    const handlePosts = () => setPosts(getStoredSocialPosts());
    const handleSocials = (e: any) => {
      if (e.detail) setSocialsConfig(e.detail);
      else setSocialsConfig(getStoredSocialLinks());
    };

    window.addEventListener('verification-apps-changed', handleApps);
    window.addEventListener('social-posts-changed', handlePosts);
    window.addEventListener('empirial-socials-updated', handleSocials);

    return () => {
      window.removeEventListener('verification-apps-changed', handleApps);
      window.removeEventListener('social-posts-changed', handlePosts);
      window.removeEventListener('empirial-socials-updated', handleSocials);
    };
  }, []);

  const handleApprove = (appId: string) => {
    approveVerificationApplication(appId);
    loadData();
  };

  const handleReject = (appId: string) => {
    const reason = prompt('Optional rejection reason / feedback for user:');
    rejectVerificationApplication(appId, reason || undefined);
    loadData();
  };

  const handleRevoke = (userId: string) => {
    if (confirm('Revoke verified creator permissions for this user?')) {
      revokeUserVerification(userId);
      loadData();
    }
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Delete this social post permanently?')) {
      deleteSocialPost(postId);
      loadData();
    }
  };

  const handlePinPost = (postId: string) => {
    pinSocialPost(postId);
    loadData();
  };

  // Official Socials Handlers
  const handleSaveSocials = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSocials(true);
    setSocialSaveSuccess(null);
    setSocialSaveError(null);

    try {
      await saveStoredSocialLinks(socialsConfig);
      setSocialSaveSuccess('✓ Official social links updated and synchronized across Footer, Contact page, and all live surfaces!');
      setTimeout(() => setSocialSaveSuccess(null), 4000);
    } catch (err: any) {
      console.error('Failed to save official social links:', err);
      setSocialSaveError(err.message || 'Failed to save social links. Please try again.');
    } finally {
      setIsSavingSocials(false);
    }
  };

  const handleCopySocial = (text: string, key: string) => {
    if (!text) return;
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedLink(key);
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  const handleAddCustomLink = () => {
    const newLink: CustomSocialLink = {
      id: `custom_${Date.now()}`,
      name: 'Custom Channel',
      url: 'https://',
      enabled: true,
    };
    setSocialsConfig((prev) => ({
      ...prev,
      customLinks: [...prev.customLinks, newLink],
    }));
  };

  const handleUpdateCustomLink = (id: string, updates: Partial<CustomSocialLink>) => {
    setSocialsConfig((prev) => ({
      ...prev,
      customLinks: prev.customLinks.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleDeleteCustomLink = (id: string) => {
    setSocialsConfig((prev) => ({
      ...prev,
      customLinks: prev.customLinks.filter((item) => item.id !== id),
    }));
  };

  const handleResetSocials = () => {
    if (confirm('Reset all official social links to default EMPIRIAL channels?')) {
      setSocialsConfig(DEFAULT_SOCIAL_LINKS);
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastContent.trim()) return;

    const adminUser = currentUser || DEMO_ADMIN;
    createSocialPost(
      {
        ...adminUser,
        is_verified: true,
        displayName: 'EMPIRIAL Admin Official',
        firm_badge: 'System Admin Desk',
      },
      broadcastContent,
      broadcastCategory,
      broadcastImageUrl.trim() ? [broadcastImageUrl.trim()] : undefined
    );

    setBroadcastContent('');
    setBroadcastImageUrl('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
    loadData();
  };

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const pastApps = applications.filter((a) => a.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Trader Social Desk & Verification Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 text-[11px] font-bold">
              {pendingApps.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review creator applications, manage verified publisher permissions, and moderate feed content.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('socials')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'socials'
              ? 'bg-white text-black shadow font-bold'
              : 'bg-elevation-card text-slate-400 hover:text-white'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Official Socials &amp; Sync</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-white text-black shadow font-bold'
              : 'bg-elevation-card text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verification Queue ({pendingApps.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-white text-black shadow font-bold'
              : 'bg-elevation-card text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feed Moderation ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'broadcast'
              ? 'bg-white text-black shadow font-bold'
              : 'bg-elevation-card text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Admin Broadcast</span>
        </button>
      </div>

      {/* Tab 0: Official Socials Manager & Real-Time Sync */}
      {activeTab === 'socials' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-elevation-surface border border-white/10 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Official Brand Socials &amp; Channels
                  </h2>
                  <p className="text-xs text-slate-400">
                    Manage and synchronize EMPIRIAL&apos;s verified social links across the Footer, Contact Desk, and public spaces in real time.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetSocials}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-elevation-base text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSaveSocials}
                  disabled={isSavingSocials}
                  className="px-4 py-2 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSavingSocials ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save &amp; Sync Everywhere</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {socialSaveSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{socialSaveSuccess}</span>
              </div>
            )}
            {socialSaveError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{socialSaveError}</span>
              </div>
            )}
          </div>

          {/* Social Channels Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discord */}
            <div className="p-4 rounded-xl bg-elevation-surface border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-white text-[11px] font-bold">
                    D
                  </span>
                  <span>Discord Community / Ticket Server</span>
                </label>
                {socialsConfig.discordUrl && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopySocial(socialsConfig.discordUrl, 'discord')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedLink === 'discord' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={socialsConfig.discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
              <input
                type="url"
                value={socialsConfig.discordUrl}
                onChange={(e) => setSocialsConfig({ ...socialsConfig, discordUrl: e.target.value })}
                placeholder="https://discord.gg/..."
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white font-mono"
              />
              <p className="text-[11px] text-slate-400">Syncs to: Footer Discord icon, Contact page ticket card &amp; network strip.</p>
            </div>

            {/* X / Twitter */}
            <div className="p-4 rounded-xl bg-elevation-surface border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white text-[11px] font-bold">
                    𝕏
                  </span>
                  <span>X / Twitter Official Handle</span>
                </label>
                {socialsConfig.twitterUrl && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopySocial(socialsConfig.twitterUrl, 'twitter')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedLink === 'twitter' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={socialsConfig.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
              <input
                type="url"
                value={socialsConfig.twitterUrl}
                onChange={(e) => setSocialsConfig({ ...socialsConfig, twitterUrl: e.target.value })}
                placeholder="https://x.com/..."
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white font-mono"
              />
              <p className="text-[11px] text-slate-400">Syncs to: Footer X icon, Contact page network pill.</p>
            </div>

            {/* Telegram */}
            <div className="p-4 rounded-xl bg-elevation-surface border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#229ED9]/20 border border-[#229ED9]/40 flex items-center justify-center text-white text-[11px] font-bold">
                    ✈
                  </span>
                  <span>Telegram Channel &amp; Updates</span>
                </label>
                {socialsConfig.telegramUrl && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopySocial(socialsConfig.telegramUrl, 'telegram')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedLink === 'telegram' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={socialsConfig.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
              <input
                type="url"
                value={socialsConfig.telegramUrl}
                onChange={(e) => setSocialsConfig({ ...socialsConfig, telegramUrl: e.target.value })}
                placeholder="https://t.me/..."
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white font-mono"
              />
              <p className="text-[11px] text-slate-400">Syncs to: Footer Telegram icon, Contact page network pill.</p>
            </div>

            {/* YouTube */}
            <div className="p-4 rounded-xl bg-elevation-surface border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#FF0000]/20 border border-[#FF0000]/40 flex items-center justify-center text-white text-[11px] font-bold">
                    ▶
                  </span>
                  <span>YouTube Channel</span>
                </label>
                {socialsConfig.youtubeUrl && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopySocial(socialsConfig.youtubeUrl, 'youtube')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedLink === 'youtube' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={socialsConfig.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
              <input
                type="url"
                value={socialsConfig.youtubeUrl}
                onChange={(e) => setSocialsConfig({ ...socialsConfig, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/@..."
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white font-mono"
              />
              <p className="text-[11px] text-slate-400">Syncs to: Footer YouTube icon, Contact page network pill.</p>
            </div>

            {/* Instagram */}
            <div className="p-4 rounded-xl bg-elevation-surface border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#E1306C]/20 border border-[#E1306C]/40 flex items-center justify-center text-white text-[11px] font-bold">
                    📷
                  </span>
                  <span>Instagram Profile</span>
                </label>
                {socialsConfig.instagramUrl && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopySocial(socialsConfig.instagramUrl, 'instagram')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedLink === 'instagram' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={socialsConfig.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
              <input
                type="url"
                value={socialsConfig.instagramUrl}
                onChange={(e) => setSocialsConfig({ ...socialsConfig, instagramUrl: e.target.value })}
                placeholder="https://www.instagram.com/..."
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white font-mono"
              />
              <p className="text-[11px] text-slate-400">Syncs to: Footer Instagram icon, Contact page network pill.</p>
            </div>

            {/* WhatsApp */}
            <div className="p-4 rounded-xl bg-elevation-surface border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-white text-[11px] font-bold">
                    💬
                  </span>
                  <span>WhatsApp Support Hotline / Group URL</span>
                </label>
                {socialsConfig.whatsappUrl && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopySocial(socialsConfig.whatsappUrl, 'whatsapp')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedLink === 'whatsapp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={socialsConfig.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
              <input
                type="url"
                value={socialsConfig.whatsappUrl}
                onChange={(e) => setSocialsConfig({ ...socialsConfig, whatsappUrl: e.target.value })}
                placeholder="https://wa.me/..."
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white font-mono"
              />
              <p className="text-[11px] text-slate-400">Syncs to: Footer WhatsApp icon, Contact page WhatsApp hotline card &amp; link.</p>
            </div>

            {/* LinkedIn */}
            <div className="p-4 rounded-xl bg-elevation-surface border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#0A66C2]/20 border border-[#0A66C2]/40 flex items-center justify-center text-white text-[11px] font-bold">
                    in
                  </span>
                  <span>LinkedIn Company / Organization Page</span>
                </label>
                {socialsConfig.linkedinUrl && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopySocial(socialsConfig.linkedinUrl, 'linkedin')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedLink === 'linkedin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={socialsConfig.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
              <input
                type="url"
                value={socialsConfig.linkedinUrl}
                onChange={(e) => setSocialsConfig({ ...socialsConfig, linkedinUrl: e.target.value })}
                placeholder="https://www.linkedin.com/company/..."
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white font-mono"
              />
              <p className="text-[11px] text-slate-400">Syncs to: Footer LinkedIn icon, Contact page network pill.</p>
            </div>
          </div>

          {/* Custom Channels Repeater */}
          <div className="p-5 rounded-2xl bg-elevation-surface border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-slate-400" />
                  <span>Custom Channels &amp; Alternate Links ({socialsConfig.customLinks.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Add optional additional community channels (e.g. Reddit, TikTok, Facebook, Twitch, Medium, GitHub).
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCustomLink}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-elevation-base hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Channel</span>
              </button>
            </div>

            {socialsConfig.customLinks.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                No custom channels added. Click &quot;Add Channel&quot; above to create a custom social link.
              </div>
            ) : (
              <div className="space-y-2.5">
                {socialsConfig.customLinks.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2.5 p-3 rounded-xl bg-elevation-base border border-white/10"
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateCustomLink(item.id, { name: e.target.value })}
                      placeholder="Platform Name (e.g. Reddit)"
                      className="sm:w-44 bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-semibold"
                    />
                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => handleUpdateCustomLink(item.id, { url: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 bg-elevation-surface border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono"
                    />
                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) => handleUpdateCustomLink(item.id, { enabled: e.target.checked })}
                          className="rounded border-white/20 bg-elevation-surface accent-white"
                        />
                        <span>Active</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomLink(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete channel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Preview Widget */}
          <div className="p-5 rounded-2xl bg-elevation-surface border border-white/10 space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Surface Preview</div>
              <h3 className="text-sm font-bold text-white mt-0.5">How Socials Render Across EMPIRIAL</h3>
            </div>

            {/* Footer Preview */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400">Footer Icon Strip Preview</span>
              <div className="flex items-center gap-2 flex-wrap">
                {socialsConfig.discordUrl && (
                  <div className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900 text-white flex items-center justify-center text-xs font-bold" title="Discord">
                    D
                  </div>
                )}
                {socialsConfig.twitterUrl && (
                  <div className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900 text-white flex items-center justify-center text-xs font-bold" title="Twitter / X">
                    𝕏
                  </div>
                )}
                {socialsConfig.telegramUrl && (
                  <div className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900 text-white flex items-center justify-center text-xs" title="Telegram">
                    ✈
                  </div>
                )}
                {socialsConfig.youtubeUrl && (
                  <div className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900 text-white flex items-center justify-center text-xs" title="YouTube">
                    ▶
                  </div>
                )}
                {socialsConfig.instagramUrl && (
                  <div className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900 text-white flex items-center justify-center text-xs" title="Instagram">
                    📷
                  </div>
                )}
                {socialsConfig.whatsappUrl && (
                  <div className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900 text-white flex items-center justify-center text-xs" title="WhatsApp">
                    💬
                  </div>
                )}
                {socialsConfig.linkedinUrl && (
                  <div className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900 text-white flex items-center justify-center text-xs font-bold" title="LinkedIn">
                    in
                  </div>
                )}
                {socialsConfig.customLinks.filter(l => l.enabled).map((link) => (
                  <div key={link.id} className="h-9 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white flex items-center justify-center text-xs font-medium">
                    {link.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveSocials}
                disabled={isSavingSocials}
                className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
              >
                {isSavingSocials ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save All Socials &amp; Sync Website</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Verification Queue */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Pending Creator Applications
            </h3>

            {pendingApps.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {pendingApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-elevation-surface border border-white/10 space-y-4 shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 relative shrink-0">
                          {app.user_avatar ? (
                            <Image
                              src={app.user_avatar}
                              alt={app.user_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white">
                              {app.user_name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{app.user_name}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                              {app.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{app.user_email}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(app.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Verify</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(app.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>

                    {/* Trading Experience */}
                    <div className="p-3.5 rounded-xl bg-elevation-base border border-white/5 space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Trading Background & Claim
                      </span>
                      <p className="text-slate-200 leading-relaxed">{app.trading_experience}</p>
                    </div>

                    {/* Proof Links */}
                    {app.proof_links && (
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="font-semibold text-slate-300">Proof / Links:</span>
                        <span className="font-mono text-cyan-400">{app.proof_links}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-elevation-surface border border-white/10 text-center text-xs text-slate-400">
                No pending verification applications in queue.
              </div>
            )}
          </div>

          {/* Previous History */}
          {pastApps.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Processed Applications History
              </h3>
              <div className="divide-y divide-white/5 bg-elevation-surface rounded-2xl border border-white/10 overflow-hidden text-xs">
                {pastApps.map((app) => (
                  <div key={app.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{app.user_name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            app.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{app.category} • {app.user_email}</p>
                    </div>

                    {app.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(app.user_id)}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        Revoke Verification
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Feed Moderation */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="bg-elevation-surface border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-elevation-card text-slate-400 uppercase font-bold text-[10px]">
                  <th className="p-4">Author</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Content Summary</th>
                  <th className="p-4">Votes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-elevation-raised/60">
                    <td className="p-4">
                      <div className="font-bold text-white">{p.author_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.author_handle}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-300">
                      {p.content}
                    </td>
                    <td className="p-4 font-mono">
                      <span className="text-emerald-400">+{p.upvotes}</span> /{' '}
                      <span className="text-rose-400">-{p.downvotes}</span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handlePinPost(p.id)}
                        className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                          p.is_pinned
                            ? 'bg-purple-500 text-white'
                            : 'bg-elevation-card text-slate-400 hover:text-white'
                        }`}
                        title={p.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePost(p.id)}
                        className="p-1.5 rounded bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Admin Broadcast */}
      {activeTab === 'broadcast' && (
        <form
          onSubmit={handleBroadcast}
          className="bg-elevation-surface border border-white/10 rounded-2xl p-6 space-y-4 max-w-2xl shadow-xl"
        >
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Publish Official System Announcement</h3>
            <p className="text-xs text-slate-400">
              Posts published from this panel will carry the verified EMPIRIAL Admin badge.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={broadcastCategory}
                onChange={(e) => setBroadcastCategory(e.target.value as SocialCategory)}
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="PROP FIRM OFFERS">PROP FIRM OFFERS</option>
                <option value="ACCOUNT RULES">ACCOUNT RULES</option>
                <option value="TRADING KNOWLEDGE">TRADING KNOWLEDGE</option>
                <option value="COMMUNITY">COMMUNITY</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Announcement Body</label>
              <textarea
                rows={5}
                required
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                placeholder="Write official update or partner offer details..."
                className="w-full bg-elevation-base border border-white/10 rounded-xl p-3 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Image URL (Optional)</label>
              <input
                type="url"
                value={broadcastImageUrl}
                onChange={(e) => setBroadcastImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-elevation-base border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          {broadcastSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              Announcement published to social feed successfully!
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-all shadow cursor-pointer flex items-center gap-1.5"
            >
              <span>Broadcast to Social Feed</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
