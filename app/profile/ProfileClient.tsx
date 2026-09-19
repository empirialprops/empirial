'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Trophy,
  Gift,
  Calendar,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Award,
  Clock,
  ChevronRight,
  ListTodo,
  Sparkles,
  Lock,
  Unlock,
  Edit3,
  Save,
  Check,
  Star,
  Ticket,
  Plus,
  Send,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Building2,
  X,
  FileText,
  HelpCircle,
  Gamepad2,
  GraduationCap,
  Radio,
  Layers,
  ChevronDown,
  Copy,
  Share2,
  DollarSign,
  Users,
  Percent,
  RotateCcw,
  Zap,
  CheckCircle,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';
import {
  UserProfile,
  DEMO_TRADER,
  getStoredUser,
  saveUser,
  UserProfileReview,
  getStoredUserReviews,
  addUserReview,
  UserSupportTicket,
  getStoredSupportTickets,
  saveSupportTickets,
  addSupportTicket,
  replyToSupportTicket,
  DEFAULT_PURCHASED_ACCOUNTS,
  UserReferralItem,
  UserRedeemedReward,
  getStoredReferrals,
  saveStoredReferrals,
  addReferralInvite,
  getStoredRedeemedRewards,
  addRedeemedReward,
} from '@/lib/utils/auth-store';
import { MOCK_EVENTS } from '@/lib/data/events-data';
import { MOCK_FIRMS } from '@/lib/data/firms-data';
import { db } from '@/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { getReferralStats, subscribeToUserSupportTickets, subscribeToSingleSupportTicket, getLoyaltyRewards } from '@/lib/firebase/services';

export function ProfileClient() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_TRADER);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reviews' | 'events' | 'support' | 'referrals'>('dashboard');

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDiscord, setEditDiscord] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Reviews state & filters
  const [reviewsList, setReviewsList] = useState<UserProfileReview[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'published' | 'pending' | 'replied'>('all');
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false);
  const [newReviewFirmId, setNewReviewFirmId] = useState('nys');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewBody, setNewReviewBody] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewConditions, setNewReviewConditions] = useState(5);
  const [newReviewSupport, setNewReviewSupport] = useState(5);
  const [newReviewEase, setNewReviewEase] = useState(5);
  const [newReviewPayouts, setNewReviewPayouts] = useState(5);

  // Events state & filters
  const [eventsFilter, setEventsFilter] = useState<'all' | 'tournament' | 'gaming' | 'learn-crack' | 'live-session'>('all');

  // Support Tickets state
  const [ticketsList, setTicketsList] = useState<UserSupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isOpenNewTicketModal, setIsOpenNewTicketModal] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<'payouts' | 'accounts' | 'events' | 'discounts' | 'general'>('payouts');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketToastMsg, setTicketToastMsg] = useState('');

  // Accounts Purchased Filter
  const [accountStatusFilter, setAccountStatusFilter] = useState<'all' | 'funded' | 'passed' | 'scaling' | 'active'>('all');

  // Refer & Earn state
  const [referralsList, setReferralsList] = useState<UserReferralItem[]>([]);
  const [redeemedRewardsList, setRedeemedRewardsList] = useState<UserRedeemedReward[]>([]);
  const [referralFilter, setReferralFilter] = useState<'all' | 'purchased' | 'signed_up'>('all');
  const [copiedRefLink, setCopiedRefLink] = useState(false);
  const [isSimulatingInvite, setIsSimulatingInvite] = useState(false);
  const [demoSimulate100, setDemoSimulate100] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{
    id: string;
    title: string;
    category: 'cash' | 'challenge' | 'commission';
    pointsCost: number;
    valueDisplay: string;
    description: string;
    tag?: string;
  } | null>(null);
  const [isLockedMilestoneModalOpen, setIsLockedMilestoneModalOpen] = useState(false);
  const [lockedModalReason, setLockedModalReason] = useState('');
  const [redeemPayoutMethod, setRedeemPayoutMethod] = useState<'bank' | 'crypto_usdt' | 'email_key'>('bank');
  const [redeemPayoutAddress, setRedeemPayoutAddress] = useState('');
  const [referralToastMsg, setReferralToastMsg] = useState('');

  // Live Firestore referral counters
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [liveRegistrations, setLiveRegistrations] = useState(0);
  const [liveConversionRate, setLiveConversionRate] = useState(0);
  const [catalogRewards, setCatalogRewards] = useState<any[]>([]);

  // Fetch live referral stats & loyalty rewards catalog from Firestore
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      getReferralStats(currentUser.uid).then((stats) => {
        setLiveVisitors(stats.visitorsCount);
        setLiveRegistrations(stats.registrationsCount);
        setLiveConversionRate(stats.conversionRate);
        setReferralsList(stats.referralsList);
      }).catch(err => console.error("Failed to fetch live referrals stats:", err));
    }

    getLoyaltyRewards().then((rewards) => {
      if (rewards && rewards.length > 0) {
        setCatalogRewards(rewards.filter((r: any) => r.is_active !== false));
      }
    }).catch(err => console.error("Failed to load loyalty rewards catalog:", err));
  }, [activeTab, currentUser.uid]);

  // Load initial data
  useEffect(() => {
    const user = getStoredUser() || DEMO_TRADER;
    setCurrentUser(user);
    setEditName(user.displayName);
    // Check URL search parameters for tab selection (e.g. /profile?tab=support)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['dashboard', 'reviews', 'events', 'support', 'referrals'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }

      const savedRefs = localStorage.getItem('empirial_user_referrals');
      if (savedRefs && (savedRefs.includes('Marcus Chen') || savedRefs.includes('Sarah Jenkins'))) {
        localStorage.removeItem('empirial_user_referrals');
      }
    }

    setReviewsList(getStoredUserReviews());
    setTicketsList(getStoredSupportTickets());
    setReferralsList(getStoredReferrals());
    setRedeemedRewardsList(getStoredRedeemedRewards());

    const handleAuthChange = (e: CustomEvent) => {
      if (e.detail) {
        setCurrentUser(e.detail);
        setEditName(e.detail.displayName);
        setEditPhone(e.detail.phoneNumber || '');
      }
    };

    const handleReviewsChange = (e: CustomEvent) => {
      if (e.detail) setReviewsList(e.detail);
    };

    const handleTicketsChange = (e: CustomEvent) => {
      if (e.detail) setTicketsList(e.detail);
    };

    const handleReferralsChange = (e: CustomEvent) => {
      if (e.detail) setReferralsList(e.detail);
    };

    const handleRedeemedRewardsChange = (e: CustomEvent) => {
      if (e.detail) setRedeemedRewardsList(e.detail);
    };

    window.addEventListener('auth-changed' as any, handleAuthChange);
    window.addEventListener('user-reviews-changed' as any, handleReviewsChange);
    window.addEventListener('support-tickets-changed' as any, handleTicketsChange);
    window.addEventListener('user-referrals-changed' as any, handleReferralsChange);
    window.addEventListener('redeemed-rewards-changed' as any, handleRedeemedRewardsChange);

    return () => {
      window.removeEventListener('auth-changed' as any, handleAuthChange);
      window.removeEventListener('user-reviews-changed' as any, handleReviewsChange);
      window.removeEventListener('support-tickets-changed' as any, handleTicketsChange);
      window.removeEventListener('user-referrals-changed' as any, handleReferralsChange);
      window.removeEventListener('redeemed-rewards-changed' as any, handleRedeemedRewardsChange);
    };
  }, []);

  const traderChatBottomRef = React.useRef<HTMLDivElement>(null);

  // Real-time Firestore support ticket subscription for trader
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeToUserSupportTickets(currentUser.uid, (remoteTickets) => {
      if (remoteTickets && remoteTickets.length > 0) {
        setTicketsList(remoteTickets);
        saveSupportTickets(remoteTickets);
      }
    });
    return () => unsubscribe();
  }, [currentUser?.uid]);

  const activeSelectedTicket = ticketsList.find((t) => t.id === selectedTicketId) || ticketsList[0];

  // Subscribe to real-time single ticket document live updates
  useEffect(() => {
    if (!activeSelectedTicket?.id) return;
    const unsubSingle = subscribeToSingleSupportTicket(activeSelectedTicket.id, (updatedTicketDoc) => {
      if (!updatedTicketDoc) return;
      setTicketsList((prev) =>
        prev.map((t) => (t.id === updatedTicketDoc.id ? { ...t, ...updatedTicketDoc } : t))
      );
    });
    return () => unsubSingle();
  }, [activeSelectedTicket?.id]);

  // Auto-scroll trader ticket chat thread to bottom on message updates
  useEffect(() => {
    if (traderChatBottomRef.current) {
      traderChatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSelectedTicket?.messages?.length, activeSelectedTicket?.id]);

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      displayName: editName.trim() || currentUser.displayName,
      phoneNumber: editPhone.trim() || currentUser.phoneNumber,
      discordHandle: editDiscord.trim() || currentUser.discordHandle,
      country: editCountry.trim() || currentUser.country,
    };
    saveUser(updated);
    setCurrentUser(updated);
    setIsEditingProfile(false);
    setProfileSuccessMsg('Profile information successfully updated.');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  // Submit New Review Handler
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewTitle.trim() || !newReviewBody.trim()) return;

    const firmObj = MOCK_FIRMS.find((f) => f.id === newReviewFirmId);
    const firmName = firmObj ? firmObj.name : 'Prop Firm';
    const firmLogo = firmObj ? firmObj.logo_url : '/logos/nys.png';

    addUserReview({
      firm_id: newReviewFirmId,
      firm_name: firmName,
      firm_logo: firmLogo,
      user_name: currentUser.displayName,
      title: newReviewTitle.trim(),
      body: newReviewBody.trim(),
      overall_rating: newReviewRating,
      trading_conditions: newReviewConditions,
      customer_care: newReviewSupport,
      user_friendliness: newReviewEase,
      payout_process: newReviewPayouts,
    });

    setReviewsList(getStoredUserReviews());
    setIsWriteReviewModalOpen(false);
    setNewReviewTitle('');
    setNewReviewBody('');
  };

  // Submit New Support Ticket Handler
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    const created = addSupportTicket({
      user_id: currentUser.uid,
      user_name: currentUser.displayName,
      user_email: currentUser.email,
      user_phone: currentUser.phoneNumber,
      subject: newTicketSubject.trim(),
      category: newTicketCategory,
      priority: newTicketPriority,
      initialMessage: newTicketMessage.trim(),
    });

    setTicketsList(getStoredSupportTickets());
    setSelectedTicketId(created.id);
    setIsOpenNewTicketModal(false);
    setNewTicketSubject('');
    setNewTicketMessage('');
    setTicketToastMsg(`Support Ticket ${created.id} opened. Telemetry sent to Admin Inbox.`);
    setTimeout(() => setTicketToastMsg(''), 4000);
  };

  // Reply to Ticket
  const handleSendTicketReply = (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    replyToSupportTicket(ticketId, ticketReplyText.trim(), 'user', currentUser.displayName);
    setTicketsList(getStoredSupportTickets());
    setTicketReplyText('');
  };

  // User-scoped Reviews & Tickets
  const userReviewsList = useMemo(() => {
    return reviewsList.filter((r) => r.user_name === currentUser.displayName || r.user_name === currentUser.email);
  }, [reviewsList, currentUser]);

  const userTicketsList = useMemo(() => {
    return ticketsList.filter((t) => t.user_id === currentUser.uid || t.user_email === currentUser.email);
  }, [ticketsList, currentUser]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return userReviewsList;
    return userReviewsList.filter((r) => r.status === reviewFilter);
  }, [userReviewsList, reviewFilter]);

  // Filtered Registered Events
  const registeredEvents = useMemo(() => {
    const list: any[] = [];
    if (eventsFilter === 'all') return list;
    return list.filter((e) => e.sub_category === eventsFilter);
  }, [eventsFilter]);

  // Filtered Purchased Accounts
  const filteredPurchasedAccounts = useMemo(() => {
    const list = currentUser.accountsPurchased || DEFAULT_PURCHASED_ACCOUNTS;
    if (accountStatusFilter === 'all') return list;
    return list.filter((a) => a.status === accountStatusFilter);
  }, [currentUser.accountsPurchased, accountStatusFilter]);

  // Dynamic Dashboard Metrics
  const userAccountsList = currentUser.accountsPurchased || [];
  const totalCapitalManagedVal = userAccountsList.reduce((acc, a) => acc + (a.account_size || 0), 0);
  const passedEvaluationsList = userAccountsList.filter((a) => a.status === 'passed' || a.status === 'funded' || a.status === 'scaling');
  const activeFirmsSet = new Set(userAccountsList.map((a) => a.firm_id));
  const successRatioVal = userAccountsList.length > 0 ? Math.round((passedEvaluationsList.length / userAccountsList.length) * 100) : 0;

  // Referral Calculations & Handlers
  const effectiveReferralsCount = liveRegistrations;
  const totalReferralPoints = effectiveReferralsCount * 100;
  const baseCommission = referralsList.reduce((acc, r) => acc + (r.commission_earned || 0), 0);
  const totalCommissionEarned = baseCommission + (demoSimulate100 ? 520.00 : 0);
  const milestoneTarget = 100;
  const isMilestoneUnlocked = effectiveReferralsCount >= milestoneTarget || demoSimulate100;
  const milestoneProgressPct = Math.min(100, Math.round((effectiveReferralsCount / milestoneTarget) * 100));
  const invitesRemaining = Math.max(0, milestoneTarget - effectiveReferralsCount);

  // Filtered Referrals
  const filteredReferrals = useMemo(() => {
    if (referralFilter === 'all') return referralsList;
    if (referralFilter === 'purchased') return referralsList.filter((r) => r.status === 'challenge_purchased');
    return referralsList.filter((r) => r.status === 'account_created');
  }, [referralsList, referralFilter]);

  // Unique Referral Link Generator
  const referralCode = currentUser.traderId || `EMP-${currentUser.uid?.substring(0, 5).toUpperCase() || 'TRADER'}`;
  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${referralCode}`
    : `https://empirial.com/?ref=${referralCode}`;

  const handleCopyReferralLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl);
      setCopiedRefLink(true);
      setReferralToastMsg('Unique referral link copied to clipboard!');
      setTimeout(() => {
        setCopiedRefLink(false);
        setReferralToastMsg('');
      }, 3000);
    }
  };

  const handleSimulateInvite = async () => {
    setIsSimulatingInvite(true);
    try {
      const mockNames = ['Jordan Vance', 'Aria Montgomery', 'Dominic T.', 'Kavita Patel', 'Mateo Fernandez', 'Lucas Thorne', 'Sophia Chen'];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)] + ` (${Math.floor(Math.random() * 900 + 100)})`;
      const randomEmail = `${randomName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tradingdesk.io`;

      const mockVisitorId = `VIS_TEST_${Date.now()}`;
      const mockUserId = `user_test_${Date.now()}`;

      // Write mock visitor to Firestore
      if (db) {
        await setDoc(doc(db, 'referralVisitors', mockVisitorId), {
          visitorId: mockVisitorId,
          referralCode: referralCode,
          referrerUserId: currentUser.uid,
          registeredUserId: mockUserId,
          landingPage: '/',
          visitedAt: new Date().toISOString(),
          registeredAt: new Date().toISOString(),
          status: 'registered'
        });

        // Write mock referred item to subcollection
        await setDoc(doc(db, 'users', currentUser.uid, 'referrals', mockUserId), {
          id: mockUserId,
          name: randomName,
          email: randomEmail,
          joined_at: new Date().toISOString(),
          status: 'account_created',
          points_earned: 100,
          commission_earned: 0
        });
      }

      // Update current user points and referrals_count in localStorage and Firestore
      const updatedUser = {
        ...currentUser,
        points: (currentUser.points || 0) + 100,
        referrals_count: (currentUser.referrals_count || 0) + 1,
        referral_points: ((currentUser.referrals_count || 0) + 1) * 100,
      };

      saveUser(updatedUser);
      setCurrentUser(updatedUser);

      // Trigger reload of stats
      const stats = await getReferralStats(currentUser.uid);
      setLiveVisitors(stats.visitorsCount);
      setLiveRegistrations(stats.registrationsCount);
      setLiveConversionRate(stats.conversionRate);
      setReferralsList(stats.referralsList);

      setReferralToastMsg(`🎉 Real Referral simulated! +100 Points added in Firestore for inviting ${randomName}!`);
      setTimeout(() => setReferralToastMsg(''), 5000);
    } catch (err) {
      console.error('Error simulating invite:', err);
    } finally {
      setIsSimulatingInvite(false);
    }
  };

  const handleOpenRewardRedeem = (reward: {
    id: string;
    title: string;
    category: 'cash' | 'challenge' | 'commission';
    pointsCost: number;
    valueDisplay: string;
    description: string;
    tag?: string;
  }) => {
    if (!isMilestoneUnlocked) {
      setLockedModalReason(`You currently have ${effectiveReferralsCount} verified referrals. 100 referrals are required to unlock Cash Payouts and Free Challenges. (${invitesRemaining} more invites to unlock!)`);
      setIsLockedMilestoneModalOpen(true);
      return;
    }

    if (reward.pointsCost > (currentUser.points || 0) && reward.category !== 'commission') {
      alert(`Insufficient points: You need ${reward.pointsCost.toLocaleString()} Points for this reward. Current balance: ${(currentUser.points || 0).toLocaleString()} Points.`);
      return;
    }

    setSelectedReward(reward);
    setIsRedeemModalOpen(true);
  };

  const handleConfirmRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReward) return;

    if (selectedReward.pointsCost > 0) {
      const updatedUser = {
        ...currentUser,
        points: Math.max(0, (currentUser.points || 0) - selectedReward.pointsCost),
      };
      saveUser(updatedUser);
      setCurrentUser(updatedUser);
    }

    addRedeemedReward({
      reward_title: selectedReward.title,
      category: selectedReward.category,
      points_spent: selectedReward.pointsCost,
      value_display: selectedReward.valueDisplay,
      delivery_info: redeemPayoutAddress.trim() || 'Direct settlement to registered trader account',
    });

    setRedeemedRewardsList(getStoredRedeemedRewards());
    setIsRedeemModalOpen(false);
    setSelectedReward(null);
    setRedeemPayoutAddress('');
    setReferralToastMsg(`✅ Redemption submitted! Your ${selectedReward.title} has been logged and is processing.`);
    setTimeout(() => setReferralToastMsg(''), 5000);
  };

  const selectedTicket = ticketsList.find((t) => t.id === selectedTicketId) || ticketsList[0];

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground transition-colors duration-200 overflow-x-clip py-8 px-4 sm:px-6 lg:px-8">
      {/* Continuous Atmospheric Tilted Blue Light Beam (Match Home hero) */}
      <div className="absolute top-0 inset-x-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="relative w-full max-w-5xl mx-auto h-full flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.1, ease: 'easeOut' }}
            className="absolute -top-12 sm:-top-20 right-0 sm:right-6 md:right-12 w-20 sm:w-28 md:w-36 h-[2400px] sm:h-[3200px] lg:h-[4000px] bg-gradient-to-b from-[#016fee] from-0% via-[#016fee]/65 via-35% to-transparent to-85% blur-[70px] sm:blur-[85px] rounded-full rotate-[28deg] sm:rotate-[32deg] origin-top will-change-transform opacity-80 dark:opacity-70"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Toast Alerts */}
        <AnimatePresence>
          {profileSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
              <button onClick={() => setProfileSuccessMsg('')} className="p-1 hover:opacity-70 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {ticketToastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black border border-white/20 dark:border-black/20 text-xs font-semibold flex items-center justify-between shadow-xl"
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
                <span>{ticketToastMsg}</span>
              </div>
              <button onClick={() => setTicketToastMsg('')} className="p-1 hover:opacity-70 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {referralToastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black border border-white/20 dark:border-black/20 text-xs font-semibold flex items-center justify-between shadow-xl"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400 dark:text-amber-500 shrink-0" />
                <span>{referralToastMsg}</span>
              </div>
              <button onClick={() => setReferralToastMsg('')} className="p-1 hover:opacity-70 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Main Profile Top Card (Translucent for White theme only: bg-white/60 dark:bg-card backdrop-blur-md) */}
        <div className="bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xl sm:text-2xl font-extrabold shadow-md shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-800">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.displayName.slice(0, 2).toUpperCase()}</span>
              )}
            </div>

            {/* Trader Info Header */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {currentUser.displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>Verified Trader</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{currentUser.email}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header CTA Actions */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              href="/challenges"
              className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Explore Challenges</span>
            </Link>
            <Link
              href="/events"
              className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold transition-all"
            >
              <Trophy className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. Navigation Tabs (Dashboard, Reviews, Events & Giveaway, Contact Support, Refer & Earn) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 w-full max-w-4xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>2. Reviews ({userReviewsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'events'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>3. Events & Giveaway</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`flex-1 min-w-[125px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'support'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>4. Contact Support ({userTicketsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('referrals')}
            className={`flex-1 min-w-[135px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'referrals'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>5. Refer & Earn ({effectiveReferralsCount})</span>
          </button>
        </div>

        {/* ======================= TAB 1: DASHBOARD ======================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Quick Metrics Bar (Strictly RULE:BW Numbers & Typography) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border shadow-xs space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Accounts Purchased</span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {(currentUser.accountsPurchased || DEFAULT_PURCHASED_ACCOUNTS).length}
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>All Verified via Webhooks</span>
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border shadow-xs space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Total Capital Managed</span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {totalCapitalManagedVal > 0 ? `$${totalCapitalManagedVal.toLocaleString()}` : '$0'}
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {activeFirmsSet.size > 0 ? `Across ${activeFirmsSet.size} Active Firm${activeFirmsSet.size > 1 ? 's' : ''}` : '0 Active Accounts'}
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border shadow-xs space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Passed Evaluations</span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {passedEvaluationsList.length} Passed
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {userAccountsList.length > 0 ? `${successRatioVal}% Success Ratio` : 'No active evaluations'}
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border shadow-xs space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Total Payouts Received</span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  $0
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">0 Verified Payouts</span>
              </div>
            </div>

            {/* Profile Information Card (Name, Number, Email Non-Editable) */}
            <div className="bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Trader Profile & Account Credentials
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Manage your personal details. Email is locked for passport identity integrity.
                  </p>
                </div>

                {!isEditingProfile ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="px-3.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-muted-foreground text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* 1. Name Field (Editable) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-foreground" />
                    <span>Full Name / Trader Name</span>
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 font-bold text-foreground">
                      {currentUser.displayName}
                    </div>
                  )}
                </div>

                {/* 2. Number Field (Editable) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-foreground" />
                    <span>Contact Number (WhatsApp / Phone)</span>
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Enter contact number (WhatsApp / Phone)..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 font-bold text-foreground">
                      {currentUser.phoneNumber && currentUser.phoneNumber.trim() ? (
                        currentUser.phoneNumber
                      ) : (
                        <span className="text-muted-foreground font-normal text-xs italic">
                          Not provided (click Edit Profile to add)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Email Field (NON EDITABLE per requirement) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-foreground" />
                      <span>Email Address</span>
                    </label>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-extrabold uppercase text-muted-foreground flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Non-Editable</span>
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 font-mono font-bold text-muted-foreground flex items-center justify-between cursor-not-allowed">
                    <span>{currentUser.email}</span>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Email address is verified & cryptographically bound to your EMPIRIAL Passport.
                  </p>
                </div>

                {/* 4. Discord Handle */}
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-foreground" />
                    <span>Discord Username / Handle</span>
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={editDiscord}
                      onChange={(e) => setEditDiscord(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 font-bold text-foreground">
                      {currentUser.discordHandle || '@anuraj_trader'}
                    </div>
                  )}
                </div>

                {isEditingProfile && (
                  <div className="col-span-full pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Purchased Accounts Section (Detailed List of Account Purchased) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Purchased Prop Evaluation & Combine Accounts ({filteredPurchasedAccounts.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Direct integration with registered firm trading webhooks, login credentials, and scaling credentials.
                  </p>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setAccountStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      accountStatusFilter === 'all'
                        ? 'bg-white dark:bg-zinc-800 text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All (5)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountStatusFilter('active')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      accountStatusFilter === 'active'
                        ? 'bg-white dark:bg-zinc-800 text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountStatusFilter('passed')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      accountStatusFilter === 'passed'
                        ? 'bg-white dark:bg-zinc-800 text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Passed
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountStatusFilter('funded')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      accountStatusFilter === 'funded'
                        ? 'bg-white dark:bg-zinc-800 text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Funded
                  </button>
                </div>
              </div>

              {/* Account Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPurchasedAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-6 rounded-3xl bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Logo & Status Badge */}
                      <div className="flex items-center justify-between">
                        <div className="h-9 w-auto max-w-[120px] flex items-center shrink-0">
                          {acc.firm_logo ? (
                            <img src={acc.firm_logo} alt={acc.firm_name} className="h-9 w-auto object-contain rounded-md" />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                              {acc.firm_name.slice(0, 2)}
                            </div>
                          )}
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          acc.status === 'funded'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : acc.status === 'passed'
                            ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                            : acc.status === 'scaling'
                            ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-foreground'
                        }`}>
                          {acc.status}
                        </span>
                      </div>

                      {/* Account Name & Type */}
                      <div>
                        <h4 className="text-base font-bold text-foreground leading-snug">{acc.account_type}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          Platform: <strong className="text-foreground">{acc.platform}</strong>
                        </p>
                      </div>

                      {/* Info Spec Box */}
                      <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Login / User ID:</span>
                          <span className="font-mono font-bold text-foreground">{acc.account_number}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Order Date:</span>
                          <span className="font-medium text-foreground">{acc.purchase_date}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-zinc-200/50 dark:border-zinc-800">
                          <span className="text-muted-foreground">Order Reference:</span>
                          <span className="font-mono text-[11px] font-semibold text-muted-foreground">{acc.order_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <Link
                        href={`/firms`}
                        className="w-full py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold text-center block transition-all shadow-2xs"
                      >
                        Launch Platform Dashboard →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================= TAB 2: REVIEWS ======================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            
            {/* Header & Sub-Category Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  My Authored Prop Firm Reviews & Ratings
                </h2>
                <p className="text-xs text-muted-foreground">
                  Categorized reviews shared by you, pending moderation reviews, and official firm replies.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteReviewModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write New Review</span>
                </button>
              </div>
            </div>

            {/* Sub-Category Filter Tabs (All / Verified / Pending / Firm Replied) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-foreground mr-1">Filter Reviews:</span>
              
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  reviewFilter === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                }`}
              >
                All Reviews ({reviewsList.length})
              </button>

              <button
                type="button"
                onClick={() => setReviewFilter('published')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  reviewFilter === 'published'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                }`}
              >
                Published & Verified ({reviewsList.filter((r) => r.status === 'published').length})
              </button>

              <button
                type="button"
                onClick={() => setReviewFilter('pending')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  reviewFilter === 'pending'
                    ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                }`}
              >
                Pending Moderation ({reviewsList.filter((r) => r.status === 'pending').length})
              </button>

              <button
                type="button"
                onClick={() => setReviewFilter('replied')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  reviewFilter === 'replied'
                    ? 'bg-sky-500/20 text-sky-800 dark:text-sky-300 font-bold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                }`}
              >
                Replied by Firm ({reviewsList.filter((r) => r.status === 'replied').length})
              </button>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-3xl bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Logo, Firm Name & Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {rev.firm_logo ? (
                          <img src={rev.firm_logo} alt={rev.firm_name} className="h-8 w-auto object-contain rounded-md" />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                            {rev.firm_name.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-foreground text-sm">{rev.firm_name}</h4>
                          <span className="text-[11px] text-muted-foreground">{rev.created_at}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        rev.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : rev.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                      }`}>
                        {rev.status === 'published' ? 'Verified & Live' : rev.status === 'pending' ? 'Pending Review' : 'Firm Responded'}
                      </span>
                    </div>

                    {/* Overall Rating & 4 Criteria */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < rev.overall_rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`}
                          />
                        ))}
                        <span className="font-bold text-xs text-foreground ml-1.5">{rev.overall_rating}.0 ★</span>
                      </div>

                      {/* 4 Criteria Scores Bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-[10px]">
                          <span className="text-muted-foreground block">Conditions</span>
                          <span className="font-extrabold text-foreground">{rev.trading_conditions}/5</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-[10px]">
                          <span className="text-muted-foreground block">Support</span>
                          <span className="font-extrabold text-foreground">{rev.customer_care}/5</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-[10px]">
                          <span className="text-muted-foreground block">Platform</span>
                          <span className="font-extrabold text-foreground">{rev.user_friendliness}/5</span>
                        </div>
                        <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-[10px]">
                          <span className="text-muted-foreground block">Payouts</span>
                          <span className="font-extrabold text-foreground">{rev.payout_process}/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Title & Body */}
                    <div className="space-y-1">
                      <h5 className="font-bold text-foreground text-sm leading-snug">{rev.title}</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rev.body}</p>
                    </div>

                    {/* Official Firm Reply Block if available */}
                    {rev.firm_reply && (
                      <div className="p-3.5 rounded-2xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                            <span>{rev.firm_reply.author}</span>
                          </span>
                          <span className="text-muted-foreground font-mono">{rev.firm_reply.replied_at}</span>
                        </div>
                        <p className="text-muted-foreground italic text-[11px] leading-relaxed">
                          "{rev.firm_reply.message}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{rev.upvotes} helpful trader votes</span>
                    <Link href="/reviews" className="underline hover:text-foreground font-semibold">
                      View Public Directory →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================= TAB 3: EVENTS & GIVEAWAY ======================= */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  My Active Registrations & Tournament Passports
                </h2>
                <p className="text-xs text-muted-foreground">
                  Access your tournament credentials, Discord rooms, proof verifications, and prize eligibility.
                </p>
              </div>

              <Link
                href="/events"
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Browse All Tournaments</span>
              </Link>
            </div>

            {/* Sub-Category Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-foreground mr-1">Category:</span>
              
              <button
                type="button"
                onClick={() => setEventsFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  eventsFilter === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                }`}
              >
                All Registrations (3)
              </button>

              <button
                type="button"
                onClick={() => setEventsFilter('tournament')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  eventsFilter === 'tournament'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                }`}
              >
                Trading Tournaments (2)
              </button>

              <button
                type="button"
                onClick={() => setEventsFilter('gaming')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  eventsFilter === 'gaming'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                }`}
              >
                Gaming Contests (1)
              </button>
            </div>

            {/* Events Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registeredEvents.map((ev, index) => (
                <div
                  key={ev.id}
                  className="rounded-3xl border border-zinc-200/80 dark:border-border bg-white/60 dark:bg-card backdrop-blur-md p-6 space-y-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Pill */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmed Registry</span>
                      </span>

                      <span className="font-mono text-[10px] font-bold text-muted-foreground">
                        PASS: REG-2026-X0{index + 1}
                      </span>
                    </div>

                    {/* Event Title & Host */}
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-snug">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Hosted by <strong className="text-foreground">{ev.host_name}</strong>
                      </p>
                    </div>

                    {/* Prize & Timing */}
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Prize Pool:</span>
                        <span className="font-extrabold tracking-tight text-foreground">{ev.prize_pool}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-zinc-200/50 dark:border-zinc-800">
                        <span className="text-muted-foreground">Timeline:</span>
                        <span className="font-mono font-bold text-foreground">{ev.countdown_label}</span>
                      </div>
                    </div>

                    {/* Email Notification Status */}
                    <div className="p-3 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Confirmation Email:</span>
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Delivered</span>
                    </div>

                    {/* Discord Channel Link */}
                    {ev.requires_discord && (
                      <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between text-xs">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Event Discord Server</span>
                        </span>
                        <a
                          href={ev.discord_url || 'https://discord.gg/empirial'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-500 transition-colors flex items-center gap-1"
                        >
                          <span>Join Room</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <Link
                      href="/events"
                      className="w-full py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold text-center block transition-all shadow-2xs"
                    >
                      View Event Hub Page →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ======================= TAB 4: CONTACT SUPPORT (TICKETING SYSTEM) ======================= */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Trader Support & Priority Ticket Desk
                </h2>
                <p className="text-xs text-muted-foreground">
                  Open support tickets for payouts, account verifications, and discount inquiries. All tickets sync directly to the Admin Panel.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpenNewTicketModal(true)}
                className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Open New Ticket</span>
              </button>
            </div>

            {/* Tickets Interface Layout: Left List + Right Thread Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Tickets List */}
              <div className="lg:col-span-5 space-y-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Your Tickets ({ticketsList.length})
                </span>

                <div className="space-y-3">
                  {ticketsList.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        (selectedTicketId === t.id || (!selectedTicketId && ticketsList[0]?.id === t.id))
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                          : 'bg-white/60 dark:bg-card backdrop-blur-md border-zinc-200/80 dark:border-border hover:border-zinc-400 text-foreground shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-extrabold">{t.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : t.status === 'in_progress'
                            ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs leading-snug line-clamp-1">{t.subject}</h4>
                      
                      <div className="flex items-center justify-between text-[11px] opacity-80 pt-1">
                        <span className="capitalize">{t.category}</span>
                        <span>{t.messages.length} message(s)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Ticket Conversation Thread */}
              <div className="lg:col-span-7 bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-3xl p-6 space-y-5 shadow-xs">
                {selectedTicket ? (
                  <>
                    {/* Thread Header */}
                    <div className="flex items-start justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-foreground">{selectedTicket.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-foreground">
                            {selectedTicket.category}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-foreground">
                            Priority: {selectedTicket.priority}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-foreground">{selectedTicket.subject}</h3>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                        selectedTicket.status === 'resolved'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : selectedTicket.status === 'in_progress'
                          ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      }`}>
                        {selectedTicket.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Messages Container */}
                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                      {selectedTicket.messages.map((m) => {
                        const isTrader = m.sender === 'user';
                        return (
                          <div
                            key={m.id}
                            className={`p-4 rounded-2xl space-y-1.5 text-xs ${
                              isTrader
                                ? 'bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-foreground ml-4'
                                : 'bg-black text-white dark:bg-zinc-800 dark:text-white mr-4 shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold opacity-80">
                              <span>{m.sender_name}</span>
                              <span className="font-mono text-[10px]">{m.timestamp}</span>
                            </div>
                            <p className="leading-relaxed text-xs">{m.text}</p>
                          </div>
                        );
                      })}
                      <div ref={traderChatBottomRef} />
                    </div>

                    {/* Reply Input Box */}
                    <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ticketReplyText}
                          onChange={(e) => setTicketReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendTicketReply(selectedTicket.id);
                          }}
                          placeholder="Type your follow-up reply..."
                          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendTicketReply(selectedTicket.id)}
                          className="px-4 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Your messages are delivered directly to the EMPIRIAL Support & Admin Moderation desk.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-xs">
                    Select a ticket on the left to view the thread.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ======================= TAB 5: REFER & EARN ======================= */}
        {activeTab === 'referrals' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* 1. Header & Title Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
              <div>
                <h2 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
                  Refer & Earn Program
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">
                  Invite fellow traders with your unique link. Earn <span className="font-bold text-foreground">100 Points</span> for every signup & unlock Cash Payouts, Free Prop Challenges, and Lifetime Commission when your invites purchase accounts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateInvite}
                  disabled={isSimulatingInvite}
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Users className={`w-3.5 h-3.5 ${isSimulatingInvite ? 'animate-spin' : ''}`} />
                  <span>{isSimulatingInvite ? 'Simulating Invite...' : '+ Simulate Test Invite (+100 Pts)'}</span>
                </button>
              </div>
            </div>

            {/* 2. Quick Metrics Bar (Strictly RULE:BW Numbers & Typography) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border shadow-xs space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Total Referrals Invited</span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {effectiveReferralsCount} <span className="text-sm font-medium text-muted-foreground">Traders</span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>1 Invite = 100 Points</span>
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border shadow-xs space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Points Earned via Referrals</span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {totalReferralPoints.toLocaleString()} <span className="text-sm font-medium text-muted-foreground">Pts</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Total Balance: {(currentUser.points || 0).toLocaleString()} Pts</span>
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border shadow-xs space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Referral Commission Earned</span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  ${totalCommissionEarned.toFixed(2)}
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Lifetime 20% Commission</span>
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border shadow-xs space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">100 Referrals Milestone</span>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {effectiveReferralsCount} <span className="text-sm font-medium text-muted-foreground">/ 100</span>
                </div>
                <span className={`text-[11px] font-bold flex items-center gap-1 ${isMilestoneUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {isMilestoneUnlocked ? (
                    <>
                      <Unlock className="w-3 h-3" />
                      <span>Unlocked & Active!</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>{invitesRemaining} more to unlock rewards</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* 3. 100-Referrals Milestone Policy Banner & Progress Bar */}
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                      isMilestoneUnlocked
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700'
                    }`}>
                      {isMilestoneUnlocked ? <Unlock className="w-3 h-3 text-emerald-500" /> : <Lock className="w-3 h-3 text-muted-foreground" />}
                      <span>{isMilestoneUnlocked ? 'Elite Partner Tier (Unlocked)' : 'Locked: Active After 100 Referrals'}</span>
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {milestoneProgressPct}% Completed
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    100 Referrals Elite Unlock Milestone
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                    <strong className="text-foreground">Important Program Policy:</strong> Reward redemptions (Direct Cash Payouts, Free Prop Firm Evaluation Accounts, and Instant Commission Withdrawals) become fully active once your account reaches <strong className="text-foreground">100 verified referrals</strong>. You earn <strong className="text-foreground">100 Points</strong> immediately for every invited user who creates an account.
                  </p>
                </div>

                {/* Interactive Demo Test Toggle */}
                <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setDemoSimulate100(!demoSimulate100)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      demoSimulate100
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground'
                    }`}
                  >
                    {demoSimulate100 ? <Check className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    <span>{demoSimulate100 ? 'Demo Mode: 100+ Referrals (Active)' : 'Test Toggle: Simulate 100+ Referrals'}</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-3 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
                  <div
                    className="h-full rounded-full bg-black dark:bg-white transition-all duration-500"
                    style={{ width: `${milestoneProgressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>0 Referrals</span>
                  <span className="font-semibold text-foreground">
                    {effectiveReferralsCount} / 100 Referrals ({milestoneProgressPct}%)
                  </span>
                  <span>100 Referrals (Reward Unlock)</span>
                </div>
              </div>
            </div>

            {/* 4. Unique Referral Link & Social Sharing Center */}
            <div className="bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="space-y-1 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-foreground" />
                    <span>Your Unique Referral Link</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Referral Code:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs font-bold text-foreground">
                      {referralCode}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link anywhere. When someone clicks and registers, they get linked to your account and you receive 100 Points immediately.
                </p>
              </div>

              {/* Link Bar */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="flex-1 flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 font-mono text-xs text-foreground overflow-x-auto select-all">
                  <span>{referralUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReferralLink}
                  className="px-6 py-3 rounded-2xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {copiedRefLink ? <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedRefLink ? 'Link Copied!' : 'Copy Unique Link'}</span>
                </button>
              </div>

              {/* Quick Share Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span>Quick Share:</span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Join EMPIRIAL 2.0 with my referral link to compare top prop firms and get exclusive discounts: ${referralUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground text-xs font-medium transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Compare top prop firms and claim verified discounts on EMPIRIAL 2.0:`)}&url=${encodeURIComponent(referralUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground text-xs font-medium transition-colors"
                  >
                    Twitter / X
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(`Compare prop firms and grab discounts on EMPIRIAL 2.0:`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground text-xs font-medium transition-colors"
                  >
                    Telegram
                  </a>
                  <a
                    href={`mailto:?subject=Join%20EMPIRIAL%202.0%20Prop%20Firm%20Platform&body=${encodeURIComponent(`Hey, check out EMPIRIAL 2.0 to compare prop firms, claim promo discounts, and enter giveaways: ${referralUrl}`)}`}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-foreground text-xs font-medium transition-colors"
                  >
                    Email
                  </a>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Instant webhook attribution on user registration</span>
                </div>
              </div>
            </div>

            {/* 5. Rewards Redemption Catalog (Cash, Challenges, Commission) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Gift className="w-5 h-5 text-foreground" />
                    <span>Redeem Referral Rewards Catalog</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Convert your earned points and commission balances into direct payouts or evaluation accounts. (Requires 100 Referrals to redeem).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    isMilestoneUnlocked
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground border border-zinc-200 dark:border-zinc-700'
                  }`}>
                    {isMilestoneUnlocked ? '● Redemptions Unlocked' : '● Redemptions Locked (100 Ref. Req.)'}
                  </span>
                </div>
                     {/* Reward Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogRewards && catalogRewards.length > 0 ? (
                  catalogRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="p-6 rounded-3xl bg-white dark:bg-card border border-zinc-200 dark:border-border shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                            {reward.category?.toUpperCase() || 'REWARD'}
                          </span>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-foreground">{reward.reward_value}</span>
                            <p className="text-[10px] text-muted-foreground">Value</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-foreground">{reward.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                            {reward.description}
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-between text-xs font-semibold border-t border-zinc-100 dark:border-zinc-800">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="text-foreground font-mono font-bold">
                            {(reward.points_cost || reward.pointsCost || 0).toLocaleString()} Points
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenRewardRedeem({
                          id: reward.id,
                          title: reward.title,
                          category: reward.category || 'cash',
                          pointsCost: reward.points_cost || reward.pointsCost || 1000,
                          valueDisplay: reward.reward_value || '$100.00 USD',
                          description: reward.description || '',
                          tag: reward.title,
                        })}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          isMilestoneUnlocked
                            ? 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                            : 'border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 hover:text-foreground'
                        }`}
                      >
                        {isMilestoneUnlocked ? <Wallet className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isMilestoneUnlocked ? `Redeem ${reward.title}` : 'Redeem (100 Invites Req.)'}</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <>
                    {/* Fallback Static Cards */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-card border border-zinc-200 dark:border-border shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                            Direct Cash Payout
                          </span>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-foreground">$100.00</span>
                            <p className="text-[10px] text-muted-foreground">USD Transfer</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-foreground">$100 Direct Cash Transfer</h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Direct wire transfer to your Bank Account or USDT (TRC20/ERC20) Crypto wallet.
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-between text-xs font-semibold border-t border-zinc-100 dark:border-zinc-800">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="text-foreground font-mono font-bold">10,000 Points</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenRewardRedeem({
                          id: 'rew-cash-100',
                          title: '$100 Direct Cash Transfer',
                          category: 'cash',
                          pointsCost: 10000,
                          valueDisplay: '$100.00 USD',
                          description: 'Bank Wire Transfer or USDT Crypto Payout',
                          tag: 'Direct Cash',
                        })}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          isMilestoneUnlocked
                            ? 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                            : 'border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 hover:text-foreground'
                        }`}
                      >
                        {isMilestoneUnlocked ? <Wallet className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isMilestoneUnlocked ? 'Redeem $100 Cash' : 'Redeem (100 Invites Req.)'}</span>
                      </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-card border border-zinc-200 dark:border-border shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                            Direct Cash Payout
                          </span>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-foreground">$250.00</span>
                            <p className="text-[10px] text-muted-foreground">USD Transfer</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-foreground">$250 Direct Cash Transfer</h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Fast direct settlement to your verified bank account or crypto wallet.
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-between text-xs font-semibold border-t border-zinc-100 dark:border-zinc-800">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="text-foreground font-mono font-bold">25,000 Points</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenRewardRedeem({
                          id: 'rew-cash-250',
                          title: '$250 Direct Cash Transfer',
                          category: 'cash',
                          pointsCost: 25000,
                          valueDisplay: '$250.00 USD',
                          description: 'Bank Wire Transfer or USDT Crypto Payout',
                          tag: 'Direct Cash',
                        })}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          isMilestoneUnlocked
                            ? 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                            : 'border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 hover:text-foreground'
                        }`}
                      >
                        {isMilestoneUnlocked ? <Wallet className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isMilestoneUnlocked ? 'Redeem $250 Cash' : 'Redeem (100 Invites Req.)'}</span>
                      </button>
                    </div>

                    <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                            Commission Payout
                          </span>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-foreground">${totalCommissionEarned.toFixed(2)}</span>
                            <p className="text-[10px] text-muted-foreground">Available Balance</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-foreground">Withdraw Account Commission</h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Earn 20% on every challenge bought by your referrals. Withdraw your accrued earnings anytime.
                          </p>
                        </div>
                        <div className="pt-2 flex items-center justify-between text-xs font-semibold border-t border-zinc-100 dark:border-zinc-800">
                          <span className="text-muted-foreground">Commission Rate:</span>
                          <span className="text-foreground font-mono font-bold">20% Lifetime</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenRewardRedeem({
                          id: 'rew-comm-payout',
                          title: `Referral Commission Payout ($${totalCommissionEarned.toFixed(2)})`,
                          category: 'commission',
                          pointsCost: 0,
                          valueDisplay: `$${totalCommissionEarned.toFixed(2)} USD`,
                          description: 'Direct withdrawal of referral purchase commissions',
                          tag: 'Commission',
                        })}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          isMilestoneUnlocked
                            ? 'bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200'
                            : 'border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 hover:text-foreground'
                        }`}
                      >
                        {isMilestoneUnlocked ? <DollarSign className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isMilestoneUnlocked ? `Withdraw $${totalCommissionEarned.toFixed(2)}` : 'Withdraw (100 Invites Req.)'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>             </div>
            </div>

            {/* 6. Referred Traders Activity Table */}
            <div className="bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-foreground" />
                    <span>Your Referred Traders ({filteredReferrals.length})</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Live list of traders registered via your unique link with points and commissions awarded.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setReferralFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      referralFilter === 'all'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All ({referralsList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReferralFilter('purchased')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      referralFilter === 'purchased'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Purchased Challenge ({referralsList.filter((r) => r.status === 'challenge_purchased').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReferralFilter('signed_up')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      referralFilter === 'signed_up'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Signed Up Only ({referralsList.filter((r) => r.status === 'account_created').length})
                  </button>
                </div>
              </div>

              {/* Referrals List Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200/80 dark:border-zinc-800 text-muted-foreground font-semibold">
                      <th className="pb-3 pr-4">Trader</th>
                      <th className="pb-3 pr-4">Joined Date</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Challenge Purchased</th>
                      <th className="pb-3 pr-4 text-right">Points Earned</th>
                      <th className="pb-3 text-right">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                    {filteredReferrals.length > 0 ? (
                      filteredReferrals.map((ref) => {
                        const isPurchased = ref.status === 'challenge_purchased';
                        return (
                          <tr key={ref.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-[11px] text-foreground shrink-0 overflow-hidden">
                                  {ref.avatarUrl ? (
                                    <img src={ref.avatarUrl} alt={ref.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{ref.name.slice(0, 2).toUpperCase()}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-foreground">{ref.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{ref.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 pr-4 text-muted-foreground font-mono text-[11px]">
                              {ref.joined_at}
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPurchased
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground border border-zinc-200 dark:border-zinc-700'
                              }`}>
                                {isPurchased ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                <span>{isPurchased ? 'Challenge Purchased' : 'Account Created'}</span>
                              </span>
                            </td>
                            <td className="py-3.5 pr-4">
                              {ref.purchased_account_title ? (
                                <span className="font-semibold text-foreground">{ref.purchased_account_title}</span>
                              ) : (
                                <span className="text-muted-foreground italic">Browsing prop firms</span>
                              )}
                            </td>
                            <td className="py-3.5 pr-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              +{ref.points_earned} Pts
                            </td>
                            <td className="py-3.5 text-right font-mono font-bold text-foreground">
                              {ref.commission_earned > 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400">+${ref.commission_earned.toFixed(2)}</span>
                              ) : (
                                <span className="text-muted-foreground">$0.00</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No referrals matching this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 7. Redeemed Rewards History */}
            {redeemedRewardsList.length > 0 && (
              <div className="bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Your Redeemed Rewards History ({redeemedRewardsList.length})</span>
                </h3>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {redeemedRewardsList.map((red) => (
                    <div key={red.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-foreground">{red.reward_title}</p>
                        <p className="text-[11px] text-muted-foreground">{red.delivery_info} • {red.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                          {red.status}
                        </span>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {red.points_spent > 0 ? `-${red.points_spent.toLocaleString()} Pts` : 'Commission Payout'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. How Refer & Earn Works (3 Simple Steps) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-zinc-200 dark:border-border shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="text-sm font-bold text-foreground">Share Your Unique Link</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Send your personalized link or referral code to fellow traders on Discord, Telegram, or Twitter.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-zinc-200 dark:border-border shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="text-sm font-bold text-foreground">Earn 100 Points per Invite</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every user who creates an account with your link instantly awards you 100 Points in real-time telemetry.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-card border border-zinc-200 dark:border-border shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h4 className="text-sm font-bold text-foreground">Reach 100 Referrals & Redeem</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Unlock Cash Payouts, Free Prop Firm Challenges, and 20% Lifetime Account Commission once you hit 100 referrals!
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: Write New Review Modal */}
      <AnimatePresence>
        {isWriteReviewModalOpen && (
          <div
            onClick={() => setIsWriteReviewModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl cursor-default max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Write a Prop Firm Review</h3>
                  <p className="text-xs text-muted-foreground">Your review will be verified and published to the community.</p>
                </div>
                <button onClick={() => setIsWriteReviewModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Select Prop Firm</label>
                  <select
                    value={newReviewFirmId}
                    onChange={(e) => setNewReviewFirmId(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-semibold text-foreground"
                  >
                    {MOCK_FIRMS.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Overall Rating (1 to 5 Stars)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`} />
                      </button>
                    ))}
                    <span className="font-bold ml-2 text-foreground">{newReviewRating}.0 Stars</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Review Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fast payout turnaround and great cTrader spreads"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Review Experience & Feedback</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your execution, rules experience, scaling, and payout processing..."
                    value={newReviewBody}
                    onChange={(e) => setNewReviewBody(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWriteReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Submit for Moderation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Open Support Ticket Modal */}
      <AnimatePresence>
        {isOpenNewTicketModal && (
          <div
            onClick={() => setIsOpenNewTicketModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl cursor-default"
            >
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Open a Support Ticket</h3>
                  <p className="text-xs text-muted-foreground">Our team monitors priority tickets 24/7.</p>
                </div>
                <button onClick={() => setIsOpenNewTicketModal(false)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Category</label>
                    <select
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-semibold text-foreground"
                    >
                      <option value="payouts">Payout Inquiry</option>
                      <option value="accounts">Account Verification</option>
                      <option value="events">Tournament / Giveaway</option>
                      <option value="discounts">Discount Codes</option>
                      <option value="general">General Support</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Priority</label>
                    <select
                      value={newTicketPriority}
                      onChange={(e) => setNewTicketPriority(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-semibold text-foreground"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent Escalation</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Ticket Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Need assistance with NYS Capital telemetry sync"
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-foreground">Detailed Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide relevant account numbers, transaction hashes, or challenge details..."
                    value={newTicketMessage}
                    onChange={(e) => setNewTicketMessage(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenNewTicketModal(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Open Ticket Now
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Milestone Locked Explainer Modal */}
      <AnimatePresence>
        {isLockedMilestoneModalOpen && (
          <div
            onClick={() => setIsLockedMilestoneModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl cursor-default text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-foreground">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">100 Referrals Milestone Required</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lockedModalReason || 'Direct Cash Transfers, Free Prop Firm Challenges, and Direct Commissions unlock automatically once you reach 100 verified referrals.'}
                </p>
              </div>

              {/* Progress Summary */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-left">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Current Progress:</span>
                  <span className="font-bold text-foreground">{effectiveReferralsCount} / 100 Referrals ({milestoneProgressPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-black dark:bg-white transition-all duration-300"
                    style={{ width: `${milestoneProgressPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-center pt-1">
                  You earn <strong className="text-foreground">100 Points</strong> immediately per signup. Keep sharing to unlock!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyReferralLink}
                  className="flex-1 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Invite Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLockedMilestoneModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Confirm Reward Redemption Modal */}
      <AnimatePresence>
        {isRedeemModalOpen && selectedReward && (
          <div
            onClick={() => setIsRedeemModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl cursor-default"
            >
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                    {selectedReward.tag || 'Reward Redemption'}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-1">{selectedReward.title}</h3>
                  <p className="text-xs text-muted-foreground">{selectedReward.description}</p>
                </div>
                <button onClick={() => setIsRedeemModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reward Cost & Balance Review */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reward Value:</span>
                  <span className="font-bold text-foreground">{selectedReward.valueDisplay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Points Cost:</span>
                  <span className="font-bold text-foreground font-mono">
                    {selectedReward.pointsCost > 0 ? `${selectedReward.pointsCost.toLocaleString()} Points` : 'Free ($0 Pts)'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-muted-foreground">Available Points:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {(currentUser.points || 0).toLocaleString()} Points
                  </span>
                </div>
              </div>

              <form onSubmit={handleConfirmRedeem} className="space-y-4 text-xs">
                {selectedReward.category === 'cash' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="font-bold text-foreground">Select Payout Method</label>
                      <select
                        value={redeemPayoutMethod}
                        onChange={(e) => setRedeemPayoutMethod(e.target.value as any)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 font-semibold text-foreground"
                      >
                        <option value="bank">Direct Bank Wire Transfer (Global IBAN / SWIFT / ACH)</option>
                        <option value="crypto_usdt">USDT Crypto Wallet (TRC-20 / ERC-20)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-foreground">
                        {redeemPayoutMethod === 'bank' ? 'Bank Account / IBAN / SWIFT Details' : 'USDT TRC20 Wallet Address'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={redeemPayoutMethod === 'bank' ? 'Account Number, Bank Name, SWIFT/Routing...' : 'e.g. TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'}
                        value={redeemPayoutAddress}
                        onChange={(e) => setRedeemPayoutAddress(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold"
                      />
                    </div>
                  </div>
                )}

                {selectedReward.category === 'challenge' && (
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Account Delivery Email</label>
                    <input
                      type="email"
                      required
                      placeholder="trader@email.com"
                      value={redeemPayoutAddress || currentUser.email}
                      onChange={(e) => setRedeemPayoutAddress(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      The official voucher coupon code will be sent to this email immediately upon verification.
                    </p>
                  </div>
                )}

                {selectedReward.category === 'commission' && (
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Withdrawal Destination (Bank / USDT Address)</label>
                    <input
                      type="text"
                      required
                      placeholder="Bank wire details or USDT TRC20 address..."
                      value={redeemPayoutAddress}
                      onChange={(e) => setRedeemPayoutAddress(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-foreground font-semibold"
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRedeemModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Redemption</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default ProfileClient;
