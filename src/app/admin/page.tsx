
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Trophy,
  Tag,
  Star,
  Sliders,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  FolderUp,
  Activity,
  Layers,
  Calendar,
  Compass,
  RefreshCw,
} from 'lucide-react';
import { getStoredFirms } from '@/lib/utils/firms-store';
import { getStoredChallenges } from '@/lib/utils/challenges-store';
import { MOCK_DEALS } from '@/lib/data/deals-data';
import { MOCK_REVIEWS } from '@/lib/data/reviews-data';
import {
  getFirms,
  getChallenges,
  getDeals,
  getReviews,
  getLivePlatformStats,
} from '@/lib/firebase/services';
import {
  AnalyticsSummary,
  getStoredAnalytics,
  BASELINE_ANALYTICS,
  fetchRealDatabaseAnalytics,
} from '@/lib/utils/analytics-store';

// Advanced Analytics Chart Components
import { KPICards } from '@/components/admin/analytics/KPICards';
import { UserGrowthChart } from '@/components/admin/analytics/UserGrowthChart';
import { PageDwellChart } from '@/components/admin/analytics/PageDwellChart';
import { ClickHotspotsChart } from '@/components/admin/analytics/ClickHotspotsChart';
import { DeviceAcquisitionDonut } from '@/components/admin/analytics/DeviceAcquisitionDonut';
import { ActivityHeatmap } from '@/components/admin/analytics/ActivityHeatmap';
import { RecentActivityFeed } from '@/components/admin/analytics/RecentActivityFeed';

export default function AdminOverviewPage() {
  const [firms, setFirms] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(BASELINE_ANALYTICS);
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [firmsData, challData, dealData, revData, lStats] = await Promise.all([
          getFirms(),
          getChallenges(),
          getDeals(),
          getReviews(),
          getLivePlatformStats(),
        ]);
        setFirms(firmsData);
        setChallenges(challData);
        setDeals(dealData);
        setReviews(revData);

        // Load real database users & telemetry analytics
        const realAnalytics = await fetchRealDatabaseAnalytics();
        setAnalytics(realAnalytics);
      } catch (err) {
        console.error('Failed to load admin overview metrics:', err);
        setFirms(getStoredFirms());
        setChallenges(getStoredChallenges());
        const realAnalytics = await fetchRealDatabaseAnalytics();
        setAnalytics(realAnalytics);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Listen to real-time analytics updates
    const handleAnalyticsUpdate = (e: any) => {
      if (e.detail) setAnalytics(e.detail);
    };
    window.addEventListener('empirial_analytics_updated', handleAnalyticsUpdate);
    return () => window.removeEventListener('empirial_analytics_updated', handleAnalyticsUpdate);
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-foreground rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground font-mono">Loading metrics & telemetry console...</p>
      </div>
    );
  }

  // Filter growth timeline based on active date range
  const filteredTimeline =
    dateRange === '24h'
      ? analytics.growthTimeline.slice(-2)
      : dateRange === '7d'
      ? analytics.growthTimeline.slice(-4)
      : analytics.growthTimeline;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
              Admin Analytics & Telemetry Control Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Real-time platform metrics, user registration trends, page dwell telemetry, and click heatmap analytics.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          {[
            { id: '24h', label: '24 Hours' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'all', label: 'All Time' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setDateRange(r.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                dateRange === r.id
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Top KPI Summary Cards */}
      <KPICards data={analytics} />

      {/* 2. Chart Section 1: User Registrations & Active Traders Timeline */}
      <UserGrowthChart data={filteredTimeline} />

      {/* 3. Chart Section 2: Time in Pages (Dwell Telemetry) & Where Users Clicked (Click Hotspots) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PageDwellChart metrics={analytics.pageDwellMetrics} />
        <ClickHotspotsChart
          hotspots={analytics.clickHotspots}
          totalClicks={analytics.totalClicks}
        />
      </div>

      {/* 4. Chart Section 3: Device Distribution & Acquisition Channels */}
      <DeviceAcquisitionDonut
        devices={analytics.deviceBreakdown}
        channels={analytics.acquisitionChannels}
      />

      {/* 5. Chart Section 4: Peak Hours Heatmap & Live Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityHeatmap />
        </div>
        <div>
          <RecentActivityFeed events={analytics.recentEvents} />
        </div>
      </div>

      {/* Quick Navigation Cards & File System Highlight */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Content Management & Tools</h2>
          <span className="text-xs font-mono text-muted-foreground">Direct Admin Shortcuts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Module 1: Firms File System & Import (Highlighted New Feature) */}
          <div className="bg-[#f4f4f5] dark:bg-card border-2 border-black dark:border-white rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                  <FolderUp className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black text-white dark:bg-white dark:text-black uppercase">
                  Featured
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">Firms Data File System</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload firm rules and account tiers via JSON or CSV. Set customizable "NO INFO" placeholders, inspect rich interactive preview, and edit inline before saving.
              </p>
            </div>
            <Link
              href="/admin/file-system"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-colors shadow-xs"
            >
              <span>Open Firms File System</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Module 2: Prop Firms Directory */}
          <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-foreground flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Prop Firms Directory</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage {firms.length} partner prop firms, logo badges, allocation rules, coupon codes, and restricted jurisdictions.
              </p>
            </div>
            <Link
              href="/admin/firms"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold transition-colors shadow-2xs"
            >
              <span>Manage Firms ({firms.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Module 3: Evaluation Challenges & Batch Generator */}
          <div className="bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-foreground flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Challenges & Reviews</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Audit {challenges.length} challenge models, steps, profit splits, drawdown limits, prices, and moderate {reviews.length} community reviews.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/challenges"
                className="flex-1 py-2 px-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-card dark:text-foreground text-xs font-semibold text-center transition-colors"
              >
                Challenges ({challenges.length})
              </Link>
              <Link
                href="/admin/reviews"
                className="flex-1 py-2 px-3 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold text-center transition-colors shadow-xs"
              >
                Reviews ({reviews.length})
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
