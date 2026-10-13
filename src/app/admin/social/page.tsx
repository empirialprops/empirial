
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

export default function AdminSocialPage() {
  const [activeTab, setActiveTab] = useState<'applications' | 'creators' | 'posts' | 'broadcast'>('applications');
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Broadcast state
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<SocialCategory>('PROP FIRM OFFERS');
  const [broadcastImageUrl, setBroadcastImageUrl] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const loadData = () => {
    setApplications(getStoredVerificationApplications());
    setPosts(getStoredSocialPosts());
    setCurrentUser(getStoredUser() || DEMO_ADMIN);
  };

  useEffect(() => {
    loadData();

    const handleApps = () => setApplications(getStoredVerificationApplications());
    const handlePosts = () => setPosts(getStoredSocialPosts());

    window.addEventListener('verification-apps-changed', handleApps);
    window.addEventListener('social-posts-changed', handlePosts);

    return () => {
      window.removeEventListener('verification-apps-changed', handleApps);
      window.removeEventListener('social-posts-changed', handlePosts);
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
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-purple-500 text-white shadow'
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
              ? 'bg-purple-500 text-white shadow'
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
              ? 'bg-purple-500 text-white shadow'
              : 'bg-elevation-card text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Admin Broadcast</span>
        </button>
      </div>

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
