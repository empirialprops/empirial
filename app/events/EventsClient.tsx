'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Gift,
  Calendar,
  Clock,
  Users,
  Search,
  Check,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Gamepad2,
  GraduationCap,
  Radio,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  Award,
  CheckCircle2,
  Mail,
  UserCheck,
  MessageSquare,
  ListTodo,
  Upload,
  Image as ImageIcon,
  Send,
  FileImage,
} from 'lucide-react';
import { MOCK_EVENTS } from '@/lib/data/events-data';
import { Event, EventCategory, GiveawaySubCategory, EventSubCategory } from '@/lib/types';
import { getEvents } from '@/lib/firebase/services';
import { useEffect } from 'react';
import { getStoredUser, openAuthModal } from '@/lib/utils/auth-store';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function EventsClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const getEventTimeStatus = (startDateStr: string | undefined, nowTime: number) => {
    if (!startDateStr) return { isStarted: false, countdownText: 'Active Now' };
    const startTime = new Date(startDateStr).getTime();
    if (isNaN(startTime)) return { isStarted: false, countdownText: 'Active Now' };

    const diff = startTime - nowTime;
    if (diff <= 0) {
      return { isStarted: true, countdownText: 'EVENT IS STARTED' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    if (days > 0) {
      return {
        isStarted: false,
        countdownText: `Starts in ${days}d ${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`,
      };
    }

    return {
      isStarted: false,
      countdownText: `Starts in ${formattedHours}:${formattedMinutes}:${formattedSeconds}`,
    };
  };

  // Main Category Tab: 'all' | 'giveaway' | 'event'
  const [mainCategory, setMainCategory] = useState<'all' | EventCategory>('all');
  
  // Sub-Category Filter: 'all' | 'tournament' | 'gaming' | 'learn-crack' | 'live-session' | 'bootcamp'
  const [subCategory, setSubCategory] = useState<string>('all');

  // Secondary Filters
  const [giveawaySort, setGiveawaySort] = useState<'latest' | 'popular' | 'max-prize'>('latest');
  const [searchQuery, setSearchQuery] = useState('');

  // Registered Events Tracker (stores IDs)
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>(['ev-tour-1']);
  
  // Task completion state per event
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, string[]>>({});

  // Proof submission state & uploaded computer screenshot file names
  const [proofInput, setProofInput] = useState<Record<string, string>>({});
  const [submittedProofs, setSubmittedProofs] = useState<Record<string, string>>({});
  const [uploadedFileNames, setUploadedFileNames] = useState<Record<string, string>>({});

  // Expanded Card Modal State
  const [selectedEventModal, setSelectedEventModal] = useState<Event | null>(null);
  
  // Flying Trophy Animation State
  const [animatingEventId, setAnimatingEventId] = useState<string | null>(null);
  
  // Mail notification toast state
  const [notificationToast, setNotificationToast] = useState<{ title: string; email: string } | null>(null);

  // Switch Main Category
  const handleSelectMainCategory = (cat: 'all' | EventCategory) => {
    setMainCategory(cat);
    setSubCategory('all');
  };

  // Toggle task completion (Requires Account)
  const handleToggleTask = (eventId: string, taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetEv = events.find((ev) => ev.id === eventId);
    if (targetEv) {
      const status = getEventTimeStatus(targetEv.start_date, Date.now());
      if (status.isStarted) return;
    }

    const user = getStoredUser();
    if (!user) {
      openAuthModal();
      return;
    }
    setCompletedTaskIds((prev) => {
      const current = prev[eventId] || [];
      if (current.includes(taskId)) {
        return { ...prev, [eventId]: current.filter((id) => id !== taskId) };
      } else {
        return { ...prev, [eventId]: [...current, taskId] };
      }
    });
  };

  // Submit proof handler (Requires Account)
  const handleSubmitProof = (eventId: string, proofVal: string) => {
    if (!proofVal.trim()) return;
    const user = getStoredUser();
    if (!user) {
      openAuthModal();
      return;
    }
    setSubmittedProofs((prev) => ({
      ...prev,
      [eventId]: proofVal.trim(),
    }));
  };

  // Register for Event Handler
  const handleRegisterEvent = (ev: Event, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const status = getEventTimeStatus(ev.start_date, Date.now());
    if (status.isStarted) return;

    const user = getStoredUser();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!registeredEventIds.includes(ev.id)) {
      setRegisteredEventIds((prev) => [...prev, ev.id]);
    }
    
    // Trigger Flying Trophy animation
    setAnimatingEventId(ev.id);
    setTimeout(() => {
      setAnimatingEventId(null);
    }, 1400);

    // Trigger Email Notification Toast
    setNotificationToast({
      title: ev.title,
      email: user.email || 'trader@empirial.com',
    });
    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  // Filter and Sort Events List
  const filteredEvents = useMemo(() => {
    let list = [...events];

    // 1. Main Category Filter
    if (mainCategory !== 'all') {
      list = list.filter((e) => e.category === mainCategory);
    }

    // 2. Sub-Category Filter
    if (subCategory !== 'all') {
      list = list.filter((e) => e.sub_category === subCategory);
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.host_name.toLowerCase().includes(q) ||
          e.prize_pool.toLowerCase().includes(q) ||
          (e.firm_name && e.firm_name.toLowerCase().includes(q))
      );
    }

    // 4. Sorting (Specific to Giveaways: Latest, Popular, Max Prize)
    if (mainCategory === 'giveaway' || mainCategory === 'all') {
      if (giveawaySort === 'popular') {
        list.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
      } else if (giveawaySort === 'max-prize') {
        list.sort((a, b) => (b.prize_amount_usd || 0) - (a.prize_amount_usd || 0));
      } else if (giveawaySort === 'latest') {
        list.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      }
    }

    return list;
  }, [mainCategory, subCategory, searchQuery, giveawaySort, events]);

  // Counts for tabs
  const totalCount = events.length;
  const giveawaysCount = events.filter((e) => e.category === 'giveaway').length;
  const eventsCount = events.filter((e) => e.category === 'event').length;

  // Helper for light & consistent subcategory tag colors without dark borders (Point 3)
  const getSubcategoryBadge = (subCat: string) => {
    switch (subCat) {
      case 'tournament':
        return {
          label: 'Trading Tournament',
          icon: <Trophy className="w-3 h-3 shrink-0" />,
          classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border-0',
        };
      case 'gaming':
        return {
          label: 'Gaming Contest',
          icon: <Gamepad2 className="w-3 h-3 shrink-0" />,
          classes: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border-0',
        };
      case 'learn-crack':
        return {
          label: 'Learn & Crack',
          icon: <Sparkles className="w-3 h-3 shrink-0" />,
          classes: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold border-0',
        };
      case 'live-session':
        return {
          label: 'Live Session',
          icon: <Radio className="w-3 h-3 shrink-0" />,
          classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border-0',
        };
      case 'bootcamp':
        return {
          label: 'Bootcamp',
          icon: <GraduationCap className="w-3 h-3 shrink-0" />,
          classes: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border-0',
        };
      default:
        return {
          label: subCat.replace('-', ' '),
          icon: <Award className="w-3 h-3 shrink-0" />,
          classes: 'bg-zinc-100 dark:bg-zinc-800 text-foreground font-semibold border-0',
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4 min-h-screen flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Loading dynamic events grid...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 overflow-x-clip">
      {/* Continuous Atmospheric Tilted Blue Light Beam (Exact match to Home hero screenshot) */}
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
      
      {/* Mail Notification Toast */}
      <AnimatePresence>
        {notificationToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black border border-white/20 dark:border-black/20 shadow-2xl max-w-sm flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-bold flex items-center justify-between">
                <span>Confirmation Mail Sent!</span>
                <button
                  type="button"
                  onClick={() => setNotificationToast(null)}
                  className="text-muted-foreground hover:text-white dark:hover:text-black cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="opacity-90 leading-tight">
                Registry confirmation emailed to <strong className="underline">{notificationToast.email}</strong>.
              </p>
              <div className="pt-1.5">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 font-bold underline hover:opacity-80 transition-opacity"
                >
                  <span>View in Profile → Registered Events</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* 1. Centered Header (Strictly following RULE:BW typography) */}
        <div className="text-center py-6 border-b border-zinc-200/80 dark:border-zinc-800 space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-foreground mb-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>My Registered Events: {registeredEventIds.length} Active</span>
            <Link href="/profile" className="ml-1 underline text-muted-foreground hover:text-foreground">
              (View Profile)
            </Link>
          </div>

          <h1 className="text-xl font-semibold sm:text-2xl lg:text-3xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Prop Trading Events & Giveaways
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Compete in verified prop tournaments, join live market masterclasses, and win funded accounts with free and premium community competitions.
          </p>
        </div>

        {/* 2. Main Category Filter Tabs (Black & White Theme) */}
        <div className="bg-white/60 dark:bg-card backdrop-blur-md border border-zinc-200/80 dark:border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          
          {/* Top Row: Primary Category Tabs & Search Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Main Tabs (All / Giveaways / Events) */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 self-start">
              <button
                type="button"
                onClick={() => handleSelectMainCategory('all')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mainCategory === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Opportunities ({totalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMainCategory('giveaway')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mainCategory === 'giveaway'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Giveaways ({giveawaysCount})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMainCategory('event')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mainCategory === 'event'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Events ({eventsCount})</span>
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tournaments, sessions, bootcamps..."
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sub-Category Filter Tags & Secondary Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            
            {/* Sub-Category Pills with smooth pastel accents */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-foreground mr-1">Categories:</span>
              
              {/* All Subcategories Pill */}
              <button
                type="button"
                onClick={() => setSubCategory('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  subCategory === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs border-0'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground border-0'
                }`}
              >
                All Subcategories
              </button>

              {/* Giveaway Specific Subcategories */}
              {(mainCategory === 'giveaway' || mainCategory === 'all') && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubCategory('tournament')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border-0 ${
                      subCategory === 'tournament'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 shrink-0" />
                    <span>Trading Tournaments</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubCategory('gaming')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border-0 ${
                      subCategory === 'gaming'
                        ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Gaming Contests</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubCategory('learn-crack')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border-0 ${
                      subCategory === 'learn-crack'
                        ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Learn & Crack</span>
                  </button>
                </>
              )}

              {/* Event Specific Subcategories */}
              {(mainCategory === 'event' || mainCategory === 'all') && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubCategory('live-session')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border-0 ${
                      subCategory === 'live-session'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 shrink-0" />
                    <span>Live Sessions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubCategory('bootcamp')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border-0 ${
                      subCategory === 'bootcamp'
                        ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span>Bootcamps</span>
                  </button>
                </>
              )}
            </div>

            {/* Giveaway Sort Controls */}
            {(mainCategory === 'giveaway' || mainCategory === 'all') && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <select
                  value={giveawaySort}
                  onChange={(e) => setGiveawaySort(e.target.value as any)}
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-black dark:focus:border-white"
                >
                  <option value="latest">Sort: Latest</option>
                  <option value="popular">Sort: Popular</option>
                  <option value="max-prize">Sort: Max Prize</option>
                </select>
              </div>
            )}

          </div>

        </div>

        {/* 3. Square Box Cards (3 in a Row with Landscape Poster on Top, Strictly RULE:BW) */}
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((ev) => {
                  const isRegistered = registeredEventIds.includes(ev.id);
                  const isAnimating = animatingEventId === ev.id;
                  const participantPct = ev.max_participants
                    ? Math.min(100, Math.round((ev.participants_count / ev.max_participants) * 100))
                    : 70;

                  const badgeInfo = getSubcategoryBadge(ev.sub_category);

                  return (
                    <motion.div
                      layout
                      key={ev.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      onClick={() => setSelectedEventModal(ev)}
                      className="group relative rounded-3xl border border-zinc-200/80 dark:border-border hover:border-black dark:hover:border-white bg-white/60 dark:bg-card backdrop-blur-md hover:shadow-[0_0_20px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.16)] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-xs"
                    >
                      {/* Flying Trophy Animation burst overlay */}
                      {isAnimating && (
                        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center overflow-hidden">
                          <motion.div
                            initial={{ y: 80, scale: 0.3, opacity: 0 }}
                            animate={{ y: -100, scale: [0.5, 1.8, 1.2], opacity: [0, 1, 0] }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className="flex flex-col items-center justify-center gap-1"
                          >
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-3 shadow-2xl flex items-center justify-center">
                              <Trophy className="w-10 h-10 text-black fill-black/10" />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-extrabold shadow-lg">
                              Registered! 🏆
                            </span>
                          </motion.div>
                        </div>
                      )}

                      {/* Top Part of Card: Landscape Poster Banner */}
                      <div className="relative w-full aspect-[2.2/1] sm:aspect-[2.1/1] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        {ev.poster_url ? (
                          <img
                            src={ev.poster_url}
                            alt={ev.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950 flex items-center justify-center">
                            <Trophy className="w-10 h-10 text-zinc-600" />
                          </div>
                        )}

                        {/* Top Subtle Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Interactive Logo on Top Left - Hovering makes the logo BIG and reveals firm name */}
                        <div className="absolute top-3.5 left-3.5 z-20">
                          <div className="group/logo relative flex items-center gap-2">
                            
                            {/* PNG Logo without heavy background box (with very slightly rounded edges rounded-md like Home Page Choose Plan) */}
                            <div className="h-10 sm:h-11 w-auto max-w-[130px] flex items-center shrink-0 group-hover/logo:scale-130 transition-transform duration-300 ease-out">
                              {ev.is_firm_sponsored && ev.firm_logo ? (
                                <img
                                  src={ev.firm_logo}
                                  alt={ev.host_name}
                                  className="h-10 sm:h-11 w-auto max-w-[130px] object-contain rounded-md drop-shadow-md"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-md bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-md">
                                  <ShieldCheck className="w-6 h-6 shrink-0" />
                                </div>
                              )}
                            </div>
                            
                            {/* Firm Name Slide-Out on Hover */}
                            <div className="opacity-0 max-w-0 overflow-hidden group-hover/logo:opacity-100 group-hover/logo:max-w-[240px] transition-all duration-300 ease-out whitespace-nowrap">
                              <div className="px-3.5 py-1.5 rounded-md bg-black/95 dark:bg-white/95 text-white dark:text-black text-xs font-bold flex items-center gap-1.5 shadow-2xl">
                                <span>{ev.host_name}</span>
                                {ev.is_firm_sponsored && <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />}
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>

                      {/* Middle Content Section */}
                      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                        
                        {/* Top Tags Row in downside content (Subcategory Tag with light consistent colors, NO dark borders) */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            {/* Subcategory Tag */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${badgeInfo.classes}`}
                            >
                              {badgeInfo.icon}
                              <span>{badgeInfo.label}</span>
                            </span>
                          </div>

                          {/* Title & Description */}
                          <div className="space-y-1.5">
                            <h3 className="text-base font-bold text-foreground leading-snug group-hover:underline underline-offset-2">
                              {ev.title}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {ev.description}
                            </p>
                          </div>
                        </div>

                        {/* Specs Card Box: Prize & Countdown */}
                        <div className="space-y-3 pt-1">
                          <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/80 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-foreground shrink-0" />
                                <span>Prize / Value:</span>
                              </span>
                              <span className="font-extrabold text-foreground tracking-tight text-right text-xs truncate max-w-[150px]">
                                {ev.prize_pool}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-zinc-200/50 dark:border-zinc-800/60">
                              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-foreground shrink-0" />
                                <span>Timeline:</span>
                              </span>
                              <span className={`font-mono text-[11px] font-bold ${getEventTimeStatus(ev.start_date, now).isStarted ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-foreground'}`}>
                                {getEventTimeStatus(ev.start_date, now).countdownText}
                              </span>
                            </div>
                          </div>

                          {/* Participant Capacity Progress with Git Repo Typography */}
                          <div className="space-y-1.5">
                            <div className="flex items-baseline justify-between text-xs">
                              <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px]">
                                <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span>Traders Registered</span>
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="font-extrabold tracking-tight text-foreground text-xs">
                                  {ev.participants_count.toLocaleString('en-US')}
                                </span>
                                {ev.max_participants && (
                                  <span className="text-[10px] text-muted-foreground font-medium">
                                    / {ev.max_participants.toLocaleString('en-US')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-black dark:bg-white rounded-full transition-all duration-500"
                                style={{ width: `${participantPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Action CTA Button (Strictly RULE:BW) */}
                          <div className="pt-1">
                            {getEventTimeStatus(ev.start_date, now).isStarted ? (
                              <div className="w-full py-2.5 px-4 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-extrabold text-xs text-center flex items-center justify-center gap-1.5 border border-zinc-300 dark:border-zinc-700 cursor-not-allowed">
                                <Clock className="w-3.5 h-3.5" />
                                <span>EVENT IS STARTED</span>
                              </div>
                            ) : isRegistered ? (
                              <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 dark:border-emerald-600/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                                <Check className="w-3.5 h-3.5" />
                                <span>Registered & Confirmed</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleRegisterEvent(ev, e)}
                                className="w-full py-2.5 px-4 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                              >
                                <span>
                                  {ev.category === 'giveaway' ? 'Enter Giveaway' : 'Register for Event'}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                        </div>

                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full p-12 text-center rounded-3xl bg-white/60 dark:bg-card border border-zinc-200 dark:border-border space-y-3">
                  <p className="text-base font-semibold text-foreground">No events or giveaways match your criteria.</p>
                  <p className="text-xs text-muted-foreground">Try clearing your subcategory or search filters to see all available opportunities.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMainCategory('all');
                      setSubCategory('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </TooltipProvider>

        {/* 5. Expanded Event Detail Modal (Re-ordered: Details, Prizes, Rules, Schedule -> THEN Discord, Tasks & Screenshot Upload at the Downside!) */}
        <AnimatePresence>
          {selectedEventModal && (
            <div
              onClick={() => setSelectedEventModal(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl cursor-default"
              >
                {/* Modal Landscape Poster */}
                {selectedEventModal.poster_url && (
                  <div className="relative w-full aspect-[2.4/1] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <img
                      src={selectedEventModal.poster_url}
                      alt={selectedEventModal.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}

                {/* Big Host Logo & Title Header in Modal */}
                <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-5">
                  <div className="flex items-center gap-4">
                    {/* Clean PNG Logo without heavy background box */}
                    {selectedEventModal.is_firm_sponsored && selectedEventModal.firm_logo ? (
                      <img
                        src={selectedEventModal.firm_logo}
                        alt={selectedEventModal.host_name}
                        className="h-12 sm:h-14 w-auto max-w-[160px] object-contain rounded-md drop-shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-md shrink-0">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-foreground border-0">
                          {selectedEventModal.category.toUpperCase()} • {selectedEventModal.sub_category.toUpperCase()}
                        </span>
                        {getEventTimeStatus(selectedEventModal.start_date, now).isStarted && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border-0">
                            EVENT IS STARTED
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                          Hosted by <strong className="text-foreground">{selectedEventModal.host_name}</strong>
                          {selectedEventModal.is_firm_sponsored && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">
                        {selectedEventModal.title}
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedEventModal(null)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body: Ordered (1. Details, 2. Prizes, 3. Rules, 4. Schedule -> THEN 5. Downside Discord, Tasks & Screenshot Upload) */}
                <div className="space-y-5 text-xs">
                  
                  {/* 1. About This Opportunity (Event Details & Overview) */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-sm">About This Opportunity</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedEventModal.description}
                    </p>
                  </div>

                  {/* 2. Total Prize Pool & Rewards Breakdown */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">Total Prize Pool & Rewards</span>
                      <span className="font-extrabold text-foreground text-sm tracking-tight">{selectedEventModal.prize_pool}</span>
                    </div>

                    {selectedEventModal.prizes_breakdown && (
                      <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                        {selectedEventModal.prizes_breakdown.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-muted-foreground">{p.place}</span>
                            <span className="font-extrabold tracking-tight text-foreground">{p.reward}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Rules & Eligibility */}
                  {selectedEventModal.rules && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground text-sm">Rules & Eligibility</h4>
                      <ul className="space-y-1.5 list-disc pl-4 text-muted-foreground">
                        {selectedEventModal.rules.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 4. Schedule & Timing */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-muted-foreground">
                    <strong className="text-foreground block mb-0.5 text-xs font-bold">Schedule & Timing:</strong>
                    <span>{getEventTimeStatus(selectedEventModal.start_date, now).isStarted ? 'EVENT IS STARTED' : getEventTimeStatus(selectedEventModal.start_date, now).countdownText}</span>
                  </div>

                  {/* ================= DOWNSIDE SECTIONS ================= */}
                  {selectedEventModal.registration_tasks && selectedEventModal.registration_tasks.length > 0 && (
                    <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800 space-y-4">
                      {/* Registration Tasks & Computer Screenshot Upload Section */}
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-foreground" />
                            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Required Participation Tasks</h4>
                          </div>
                          <span className="text-[11px] text-muted-foreground font-mono font-bold">
                            {(completedTaskIds[selectedEventModal.id] || []).length} / {selectedEventModal.registration_tasks.length} Completed
                          </span>
                        </div>

                        {getEventTimeStatus(selectedEventModal.start_date, now).isStarted && (
                          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>Registration is automatically closed because this tournament has already started.</span>
                          </div>
                        )}

                        {/* Task List with UNIFORM Button Sizes (w-24 h-8 for all buttons) */}
                        <div className="space-y-2">
                          {selectedEventModal.registration_tasks.map((task) => {
                            const isDone = (completedTaskIds[selectedEventModal.id] || []).includes(task.id);
                            return (
                              <div
                                key={task.id}
                                onClick={(e) => handleToggleTask(selectedEventModal.id, task.id, e)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                                  isDone
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-foreground'
                                    : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                  <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${
                                    isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-400'
                                  }`}>
                                    {isDone && <Check className="w-3 h-3" />}
                                  </div>
                                  <span className={`font-semibold truncate ${isDone ? 'line-through opacity-75' : ''}`}>
                                    {task.title}
                                  </span>
                                </div>

                                {/* UNIFORM SIZED Task Action Buttons (Exactly w-24 h-8 for all) */}
                                {task.action_url ? (
                                  <a
                                    href={task.action_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-24 h-8 flex items-center justify-center rounded-xl bg-[#0084ff] hover:bg-[#0073e6] text-white text-[11px] font-bold transition-all border-0 shadow-xs shrink-0"
                                  >
                                    <span>Action</span>
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={getEventTimeStatus(selectedEventModal.start_date, now).isStarted}
                                    onClick={(e) => handleToggleTask(selectedEventModal.id, task.id, e)}
                                    className="w-24 h-8 flex items-center justify-center rounded-xl bg-[#0084ff] hover:bg-[#0073e6] disabled:opacity-50 text-white text-[11px] font-bold transition-all border-0 shadow-xs shrink-0 cursor-pointer"
                                  >
                                    {isDone ? 'Completed' : 'Mark Done'}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Computer File Screenshot Upload & Proof Submission */}
                        <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5 text-[#0084ff]" />
                              <span>Upload Screenshot Proof (from Computer for Admin Verification)</span>
                            </span>
                            {submittedProofs[selectedEventModal.id] && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] uppercase border-0">
                                Proof Verified ✓
                              </span>
                            )}
                          </div>

                          {/* File Upload Button & Text Input Grid */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {/* Native Computer File Selector */}
                              <label className={`flex-1 ${getEventTimeStatus(selectedEventModal.start_date, now).isStarted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <input
                                  type="file"
                                  disabled={getEventTimeStatus(selectedEventModal.start_date, now).isStarted}
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setUploadedFileNames((prev) => ({ ...prev, [selectedEventModal.id]: file.name }));
                                      handleSubmitProof(selectedEventModal.id, `Uploaded Screenshot: ${file.name}`);
                                    }
                                  }}
                                  className="hidden"
                                />
                                <div className="w-full bg-white dark:bg-zinc-950 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#0084ff] rounded-xl px-3 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-colors">
                                  <FileImage className="w-4 h-4 text-[#0084ff]" />
                                  <span className="truncate font-semibold">
                                    {uploadedFileNames[selectedEventModal.id]
                                      ? `Selected: ${uploadedFileNames[selectedEventModal.id]}`
                                      : 'Select Screenshot File from Computer...'}
                                  </span>
                                </div>
                              </label>

                              {/* Manual Link Input */}
                              <input
                                type="text"
                                disabled={getEventTimeStatus(selectedEventModal.start_date, now).isStarted}
                                value={proofInput[selectedEventModal.id] || ''}
                                onChange={(e) => setProofInput({ ...proofInput, [selectedEventModal.id]: e.target.value })}
                                placeholder="Or paste image URL / Discord ticket #..."
                                className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                              />

                              {/* Uniform Sky Blue Submit Button (w-24 h-9) */}
                              <button
                                type="button"
                                disabled={getEventTimeStatus(selectedEventModal.start_date, now).isStarted}
                                onClick={() => {
                                  if (proofInput[selectedEventModal.id]) {
                                    handleSubmitProof(selectedEventModal.id, proofInput[selectedEventModal.id]);
                                  }
                                }}
                                className="w-24 h-9 flex items-center justify-center rounded-xl bg-[#0084ff] hover:bg-[#0073e6] disabled:opacity-50 text-white text-xs font-bold transition-all border-0 shadow-xs shrink-0 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5 mr-1" />
                                <span>Submit</span>
                              </button>
                            </div>

                            {/* Verification Status */}
                            {submittedProofs[selectedEventModal.id] && (
                              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                Submitted for Admin Review: <strong className="font-mono">{submittedProofs[selectedEventModal.id]}</strong>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs text-muted-foreground">
                    {registeredEventIds.includes(selectedEventModal.id)
                      ? 'Confirmed & emailed to trader@empirial.com'
                      : `${selectedEventModal.participants_count.toLocaleString('en-US')} traders already registered.`}
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedEventModal(null)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold cursor-pointer"
                    >
                      Close
                    </button>

                    {getEventTimeStatus(selectedEventModal.start_date, now).isStarted ? (
                      <div className="px-5 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-extrabold flex items-center gap-1.5 border border-zinc-300 dark:border-zinc-700 cursor-not-allowed">
                        <Clock className="w-3.5 h-3.5" />
                        <span>EVENT IS STARTED</span>
                      </div>
                    ) : registeredEventIds.includes(selectedEventModal.id) ? (
                      <div className="px-5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Registered & Emailed</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleRegisterEvent(selectedEventModal, e)}
                        className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default EventsClient;
