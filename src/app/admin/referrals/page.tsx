
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  ArrowUpRight, 
  Search, 
  ArrowUpDown, 
  Calendar, 
  User, 
  Link as LinkIcon, 
  X,
  FileText,
  Percent,
  CheckCircle,
  AlertCircle,
  Gift,
  Plus,
  Edit,
  Trash2,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  Shield,
  DollarSign,
  Trophy,
  Sliders,
  Settings
} from 'lucide-react';
import { 
  getAdminReferralStats, 
  getSiteSettings, 
  updateSiteSettings, 
  getLoyaltyRewards, 
  createLoyaltyReward, 
  updateLoyaltyReward, 
  deleteLoyaltyReward 
} from '@/lib/firebase/services';
import { LoyaltyReward } from '@/lib/types';

const INITIAL_LOYALTY_REWARDS: LoyaltyReward[] = [
  {
    id: 'rew-cash-100',
    title: '$100 Direct Cash Transfer',
    description: 'Direct wire transfer to Bank Account or USDT (TRC20/ERC20) Crypto wallet.',
    category: 'cash',
    points_cost: 10000,
    reward_value: '$100.00 USD',
    is_active: true,
  },
  {
    id: 'rew-cash-250',
    title: '$250 Direct Cash Transfer',
    description: 'Fast direct settlement to your verified bank account or crypto wallet.',
    category: 'cash',
    points_cost: 25000,
    reward_value: '$250.00 USD',
    is_active: true,
  },
  {
    id: 'rew-free-50k',
    title: '100% Free 50K Evaluation Account',
    description: '100% discount voucher code for any 50K prop firm challenge of your choice.',
    category: 'challenge',
    points_cost: 15000,
    reward_value: '$249 Value',
    is_active: true,
  },
  {
    id: 'rew-free-100k',
    title: '100% Free 100K Evaluation Account',
    description: 'Full free entry ticket for a 100K funded account evaluation challenge.',
    category: 'challenge',
    points_cost: 30000,
    reward_value: '$499 Value',
    is_active: true,
  },
  {
    id: 'rew-comm-payout',
    title: 'Instant Commission Payout',
    description: 'Withdraw accumulated 20% referral commissions directly to Bank/USDT.',
    category: 'commission',
    points_cost: 1000,
    reward_value: '20% Lifetime',
    is_active: true,
  },
];

export default function AdminReferralPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // Tab state: 'referrers' | 'leads' | 'settings_rewards'
  const [activeTab, setActiveTab] = useState<'referrers' | 'leads' | 'settings_rewards'>('referrers');
  
  // Referrers Filters & Sorting
  const [referrerSearch, setReferrerSearch] = useState('');
  const [referrerSortField, setReferrerSortField] = useState<'visitors' | 'registrations' | 'conversionRate'>('registrations');
  const [referrerSortOrder, setReferrerSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Leads Filters
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<'ALL' | 'REGISTERED' | 'NOT REGISTERED'>('ALL');
  
  // Detail View State
  const [selectedReferrer, setSelectedReferrer] = useState<any>(null);

  // Settings & Reward Cards Management State
  const [programSettings, setProgramSettings] = useState<{
    pointsPerInvite: number;
    milestoneThreshold: number;
    commissionRate: number;
    policyDescription: string;
  }>({
    pointsPerInvite: 100,
    milestoneThreshold: 100,
    commissionRate: 20,
    policyDescription: 'Important Program Policy: Reward redemptions (Direct Cash Payouts, Free Prop Firm Evaluation Accounts, and Instant Commission Withdrawals) become fully active once your account reaches 100 verified referrals.',
  });

  const [rewardsList, setRewardsList] = useState<LoyaltyReward[]>(INITIAL_LOYALTY_REWARDS);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  const [rewardForm, setRewardForm] = useState<{
    title: string;
    description: string;
    category: 'cash' | 'challenge' | 'commission';
    points_cost: number;
    reward_value: string;
    is_active: boolean;
  }>({
    title: '',
    description: '',
    category: 'cash',
    points_cost: 5000,
    reward_value: '$50.00 USD',
    is_active: true,
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [stats, settingsDoc, firestoreRewards] = await Promise.all([
        getAdminReferralStats(),
        getSiteSettings(),
        getLoyaltyRewards(),
      ]);

      setData(stats);

      if (settingsDoc?.referralSettings) {
        setProgramSettings(settingsDoc.referralSettings);
      }

      if (firestoreRewards && firestoreRewards.length > 0) {
        setRewardsList(firestoreRewards);
      } else {
        setRewardsList(INITIAL_LOYALTY_REWARDS);
      }
    } catch (err) {
      console.error('Failed to load admin referral stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered and sorted Referrers List
  const processedReferrers = useMemo(() => {
    if (!data?.referrers) return [];
    
    let list = data.referrers.filter((r: any) => 
      r.name.toLowerCase().includes(referrerSearch.toLowerCase()) || 
      r.code.toLowerCase().includes(referrerSearch.toLowerCase()) ||
      r.uid.toLowerCase().includes(referrerSearch.toLowerCase())
    );
    
    list.sort((a: any, b: any) => {
      let aVal = a[referrerSortField];
      let bVal = b[referrerSortField];
      
      if (aVal < bVal) return referrerSortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return referrerSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return list;
  }, [data, referrerSearch, referrerSortField, referrerSortOrder]);

  // Filtered Leads List
  const processedLeads = useMemo(() => {
    if (!data?.leads) return [];
    
    return data.leads.filter((l: any) => {
      if (leadStatusFilter !== 'ALL' && l.status !== leadStatusFilter) return false;
      
      const searchLower = leadSearch.toLowerCase();
      return (
        l.visitorId.toLowerCase().includes(searchLower) ||
        l.referredByCode.toLowerCase().includes(searchLower) ||
        l.referredByName.toLowerCase().includes(searchLower) ||
        l.name.toLowerCase().includes(searchLower)
      );
    });
  }, [data, leadSearch, leadStatusFilter]);

  const handleSort = (field: 'visitors' | 'registrations' | 'conversionRate') => {
    if (referrerSortField === field) {
      setReferrerSortOrder(referrerSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setReferrerSortField(field);
      setReferrerSortOrder('desc');
    }
  };

  const handleSelectReferrer = (referrer: any) => {
    if (!data?.leads) return;
    const referrerLeads = data.leads.filter((l: any) => l.referredByUid === referrer.uid);
    setSelectedReferrer({
      ...referrer,
      leads: referrerLeads
    });
  };

  // Save Program Settings
  const handleSaveProgramSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSiteSettings({ referralSettings: programSettings });
      setIsSettingsSaved(true);
      setTimeout(() => setIsSettingsSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save referral program settings:', err);
    }
  };

  // Reward Card Modal Handlers
  const handleOpenAddReward = () => {
    setEditingReward(null);
    setRewardForm({
      title: '',
      description: '',
      category: 'cash',
      points_cost: 5000,
      reward_value: '$50.00 USD',
      is_active: true,
    });
    setIsRewardModalOpen(true);
  };

  const handleOpenEditReward = (reward: LoyaltyReward) => {
    setEditingReward(reward);
    setRewardForm({
      title: reward.title,
      description: reward.description || '',
      category: (reward.category as any) || 'cash',
      points_cost: reward.points_cost,
      reward_value: reward.reward_value || '',
      is_active: reward.is_active !== false,
    });
    setIsRewardModalOpen(true);
  };

  const handleSaveRewardCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardForm.title.trim() || !rewardForm.reward_value.trim()) return;

    try {
      if (editingReward) {
        await updateLoyaltyReward(editingReward.id, rewardForm);
        setRewardsList((prev) =>
          prev.map((r) => (r.id === editingReward.id ? { ...r, ...rewardForm } : r))
        );
      } else {
        const newId = await createLoyaltyReward(rewardForm);
        setRewardsList((prev) => [{ id: newId, ...rewardForm }, ...prev]);
      }
      setIsRewardModalOpen(false);
    } catch (err) {
      console.error('Failed to save reward card:', err);
    }
  };

  const handleDeleteRewardCard = async (id: string) => {
    try {
      await deleteLoyaltyReward(id);
      setRewardsList((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete reward card:', err);
    }
  };

  const handleToggleRewardActive = async (reward: LoyaltyReward) => {
    const updatedStatus = !reward.is_active;
    try {
      await updateLoyaltyReward(reward.id, { is_active: updatedStatus });
      setRewardsList((prev) =>
        prev.map((r) => (r.id === reward.id ? { ...r, is_active: updatedStatus } : r))
      );
    } catch (err) {
      console.error('Failed to toggle reward active status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        <span className="text-xs text-zinc-500 font-mono">Loading referral intelligence...</span>
      </div>
    );
  }

  const overallVisitors = data?.totalVisitors || 0;
  const overallRegistrations = data?.totalRegistrations || 0;
  const activeReferrersCount = data?.activeReferrers || 0;
  const overallConversionRate = data?.conversionRate || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header (RULE:BW Typography) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Referral Program & Lead Intelligence
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Audit inbound referral attributions, track user signups, and edit program rules and redeemable reward cards.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          Refresh Data
        </button>
      </div>

      {/* 2. Metrics Grid (Strict B&W styling) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-[24px] bg-zinc-950 border border-zinc-800 space-y-1.5">
          <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Referral Visitors</span>
          <div className="text-3xl font-bold tracking-tight text-white">
            {overallVisitors.toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">Unique inbound landing hits</p>
        </div>

        <div className="p-6 rounded-[24px] bg-zinc-950 border border-zinc-800 space-y-1.5">
          <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Referred Signups</span>
          <div className="text-3xl font-bold tracking-tight text-white">
            {overallRegistrations.toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">Connected Firebase user accounts</p>
        </div>

        <div className="p-6 rounded-[24px] bg-zinc-950 border border-zinc-800 space-y-1.5">
          <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Active Referrers</span>
          <div className="text-3xl font-bold tracking-tight text-white">
            {activeReferrersCount.toLocaleString()}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">Users driving inbound visitors</p>
        </div>

        <div className="p-6 rounded-[24px] bg-zinc-950 border border-zinc-800 space-y-1.5">
          <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Conversion Rate</span>
          <div className="text-3xl font-bold tracking-tight text-white font-mono">
            {overallConversionRate.toFixed(2)}%
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">Attributed Signups / Total Visits</p>
        </div>
      </div>

      {/* 3. Section Tabs (RULE:BW Buttons) */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => { setActiveTab('referrers'); setSelectedReferrer(null); }}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'referrers' 
              ? 'border-white text-white font-extrabold' 
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Referrers List ({processedReferrers.length})
        </button>
        <button
          onClick={() => { setActiveTab('leads'); setSelectedReferrer(null); }}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'leads' 
              ? 'border-white text-white font-extrabold' 
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          All Referral Leads ({processedLeads.length})
        </button>
        <button
          onClick={() => { setActiveTab('settings_rewards'); setSelectedReferrer(null); }}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings_rewards' 
              ? 'border-white text-white font-extrabold' 
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Edit Program & Reward Cards ({rewardsList.length})</span>
        </button>
      </div>

      {/* 4. Tab Content */}
      <div className="space-y-4">
        
        {/* TAB 1: Referrers List */}
        {activeTab === 'referrers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search referrers by name, ID or code..."
                  value={referrerSearch}
                  onChange={(e) => setReferrerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-900/30">
                      <th className="p-4">Referrer Profile</th>
                      <th className="p-4">Referral Code</th>
                      <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('visitors')}>
                        <div className="flex items-center gap-1.5">
                          <span>Total Visitors</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('registrations')}>
                        <div className="flex items-center gap-1.5">
                          <span>Registrations</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('conversionRate')}>
                        <div className="flex items-center gap-1.5">
                          <span>Conversion Rate</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-xs">
                    {processedReferrers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono">
                          No active referrers found matching query.
                        </td>
                      </tr>
                    ) : (
                      processedReferrers.map((r: any) => (
                        <tr 
                          key={r.uid} 
                          onClick={() => handleSelectReferrer(r)}
                          className="hover:bg-zinc-900/40 cursor-pointer transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-bold text-white">{r.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono max-w-[150px] truncate">{r.uid}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-white">
                              {r.code}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-white font-mono">{r.visitors.toLocaleString()}</td>
                          <td className="p-4 font-semibold text-white font-mono">{r.registrations.toLocaleString()}</td>
                          <td className="p-4 font-semibold text-white font-mono">{r.conversionRate.toFixed(1)}%</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSelectReferrer(r); }}
                              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-white rounded-lg transition-colors cursor-pointer"
                            >
                              Inspect Leads
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: All Referral Leads */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search leads by visitor ID, name or referrer code..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs w-full sm:w-auto">
                <button
                  onClick={() => setLeadStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    leadStatusFilter === 'ALL' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setLeadStatusFilter('REGISTERED')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    leadStatusFilter === 'REGISTERED' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Registered
                </button>
                <button
                  onClick={() => setLeadStatusFilter('NOT REGISTERED')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    leadStatusFilter === 'NOT REGISTERED' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Visitors Only
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-900/30">
                      <th className="p-4">Visitor / Account Name</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Referred By Code</th>
                      <th className="p-4">Referrer Name</th>
                      <th className="p-4">First Visited</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {processedLeads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">
                          No inbound referral leads match query.
                        </td>
                      </tr>
                    ) : (
                      processedLeads.map((l: any, i: number) => (
                        <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white">{l.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">{l.visitorId}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              l.status === 'REGISTERED'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                            }`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-[11px] text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg">
                              {l.referredByCode}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-white">{l.referredByName}</td>
                          <td className="p-4 text-zinc-400 font-mono text-[11px]">
                            {new Date(l.visitedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROGRAM SETTINGS & REWARD CARDS MANAGER (REQUIREMENT 3) */}
        {activeTab === 'settings_rewards' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* 1. Referral Program Rules & Policy Form */}
            <div className="p-6 rounded-[24px] bg-zinc-950 border border-zinc-800 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-white" />
                    <span>Referral Program Rules & Policy Configuration</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Set global points per referral, unlock milestone criteria, lifetime commission percentages, and public policy rules.
                  </p>
                </div>
                {isSettingsSaved && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Settings Saved to Firestore!</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveProgramSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Points Awarded Per Signup Invite
                    </label>
                    <input
                      type="number"
                      value={programSettings.pointsPerInvite}
                      onChange={(e) => setProgramSettings({ ...programSettings, pointsPerInvite: Number(e.target.value) })}
                      required
                      min={1}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Milestone Reward Unlock Threshold (Invites)
                    </label>
                    <input
                      type="number"
                      value={programSettings.milestoneThreshold}
                      onChange={(e) => setProgramSettings({ ...programSettings, milestoneThreshold: Number(e.target.value) })}
                      required
                      min={1}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Lifetime Commission Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={programSettings.commissionRate}
                      onChange={(e) => setProgramSettings({ ...programSettings, commissionRate: Number(e.target.value) })}
                      required
                      min={0}
                      max={100}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Public Program Policy & Disclaimer Notice
                  </label>
                  <textarea
                    value={programSettings.policyDescription}
                    onChange={(e) => setProgramSettings({ ...programSettings, policyDescription: e.target.value })}
                    rows={3}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold cursor-pointer transition-all shadow-sm flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Program Settings</span>
                </button>
              </form>
            </div>

            {/* 2. Redeemable Rewards Catalog Cards Manager (RULE:BW Cards & Buttons) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-white" />
                    <span>Redeemable Rewards Cards Catalog</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Manage the cards and rewards displayed to traders in their dashboard Refer & Earn redemption center.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddReward}
                  className="px-4 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Reward Card</span>
                </button>
              </div>

              {/* Reward Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewardsList.map((reward) => (
                  <div
                    key={reward.id}
                    className={`p-6 rounded-[24px] bg-zinc-950 border transition-all flex flex-col justify-between space-y-4 ${
                      reward.is_active !== false
                        ? 'border-zinc-800 hover:border-white'
                        : 'border-zinc-900 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-white text-[10px] font-extrabold uppercase tracking-wider">
                          {(reward.category || 'cash').toUpperCase()}
                        </span>

                        <div className="text-right">
                          <span className="text-lg font-extrabold text-white">{reward.reward_value}</span>
                          <p className="text-[10px] text-zinc-500 font-mono">Value Tag</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white">{reward.title}</h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                          {reward.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs font-semibold border-t border-zinc-900">
                        <span className="text-zinc-500">Points Cost:</span>
                        <span className="text-white font-mono font-bold">{reward.points_cost.toLocaleString()} Pts</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-900">
                      <button
                        type="button"
                        onClick={() => handleToggleRewardActive(reward)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                          reward.is_active !== false
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                        }`}
                      >
                        {reward.is_active !== false ? '● Active' : '○ Inactive'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditReward(reward)}
                          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Edit Card"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRewardCard(reward.id)}
                          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Delete Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal: Add/Edit Reward Card */}
            {isRewardModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
                <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[28px] p-6 space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="text-lg font-bold text-white">
                      {editingReward ? 'Edit Reward Card' : 'Create New Reward Card'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsRewardModalOpen(false)}
                      className="p-1 rounded-full text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveRewardCard} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Reward Title</label>
                      <input
                        type="text"
                        value={rewardForm.title}
                        onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                        placeholder="e.g. $100 Direct Cash Transfer"
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
                        <select
                          value={rewardForm.category}
                          onChange={(e) => setRewardForm({ ...rewardForm, category: e.target.value as any })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors cursor-pointer"
                        >
                          <option value="cash">Direct Cash</option>
                          <option value="challenge">Free Prop Challenge</option>
                          <option value="commission">Commission Withdrawal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">Reward Value Tag</label>
                        <input
                          type="text"
                          value={rewardForm.reward_value}
                          onChange={(e) => setRewardForm({ ...rewardForm, reward_value: e.target.value })}
                          placeholder="e.g. $100.00 USD"
                          required
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Points Cost</label>
                      <input
                        type="number"
                        value={rewardForm.points_cost}
                        onChange={(e) => setRewardForm({ ...rewardForm, points_cost: Number(e.target.value) })}
                        required
                        min={100}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                      <textarea
                        value={rewardForm.description}
                        onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                        rows={3}
                        placeholder="Detailed description of payout settlement or voucher redemption..."
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="is_active_toggle"
                        checked={rewardForm.is_active}
                        onChange={(e) => setRewardForm({ ...rewardForm, is_active: e.target.checked })}
                        className="rounded bg-zinc-900 border-zinc-800 text-white cursor-pointer"
                      />
                      <label htmlFor="is_active_toggle" className="text-xs text-zinc-300 font-medium cursor-pointer">
                        Enable & Publish Card in Referral Catalog
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setIsRewardModalOpen(false)}
                        className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold cursor-pointer shadow-sm flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingReward ? 'Update Card' : 'Create Card'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* 5. Referrer Detail Modal */}
      {selectedReferrer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[28px] overflow-hidden shadow-2xl space-y-0">
            <div className="p-5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-500 font-mono">REFERRER INTELLIGENCE</div>
                <h3 className="text-base font-bold text-white">{selectedReferrer.name}</h3>
              </div>
              <button
                onClick={() => setSelectedReferrer(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Total Visits</span>
                  <span className="text-lg font-bold text-white">{selectedReferrer.visitors}</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Registrations</span>
                  <span className="text-lg font-bold text-white">{selectedReferrer.registrations}</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Conversion Rate</span>
                  <span className="text-lg font-bold text-white">{selectedReferrer.conversionRate.toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Attributed Leads ({selectedReferrer.leads?.length || 0})
                </h4>
                <div className="border border-zinc-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-900 text-[10px] font-bold text-zinc-500 uppercase">
                        <th className="p-3">Visitor Name</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Visited Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {selectedReferrer.leads?.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-zinc-500 font-mono text-[11px]">
                            No leads recorded for this referrer code.
                          </td>
                        </tr>
                      ) : (
                        selectedReferrer.leads?.map((lead: any, i: number) => (
                          <tr key={i}>
                            <td className="p-3">
                              <div className="font-bold text-white">{lead.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono">{lead.visitorId}</div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                lead.status === 'REGISTERED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-zinc-400">
                              {new Date(lead.visitedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
