import React, { useState, useEffect } from 'react';
import { getSiteSettings } from '@/lib/firebase/services';
import {
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  Target,
  MessageSquare,
  Activity,
  Send,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export function BentoDashboard() {
  const [supportEmail, setSupportEmail] = useState('support@empirial.com');
  // Interactive state for Daily Pip Target
  const [pipGoal, setPipGoal] = useState(350);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'Sofia Davis', role: 'Support Lead', text: 'Hi, how can I help you with your payout verification today?' },
    { sender: 'Trader', role: 'You', text: 'Hey, I just passed Phase 2 on Funding Pips! When is my first 5-day cycle?' },
    { sender: 'Sofia Davis', role: 'Support Lead', text: 'Congratulations! Your contract is approved and your 5-day cycle started today.' },
  ]);

  useEffect(() => {
    async function loadEmail() {
      try {
        const settings = await getSiteSettings();
        if (settings) {
          const email = settings.contactEmail || settings.contactPage?.email || 'support@empirial.com';
          setSupportEmail(email);
        }
      } catch (err) {
        console.error('Failed to load settings in BentoDashboard:', err);
      }
    }
    loadEmail();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages(prev => [...prev, { sender: 'Trader', role: 'You', text: chatMessage }]);
    setChatMessage('');
  };

  return (
    <section className="py-16 bg-[#08090D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>REAL-TIME TRADER TELEMETRY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Live Prop Intelligence Command Center
          </h2>
          <p className="text-sm text-slate-400">
            Monitor real-time payout volumes, challenge pass rates, team accounts, and drawdown boundaries in one unified dashboard.
          </p>
        </div>

        {/* Bento Grid Container (Matching Image 4 Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-elevation-base/90 p-5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl">
          
          {/* Card 1: Total Revenue / Payouts Tracked */}
          <div className="bg-elevation-surface border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all">
            <div>
              <span className="text-xs font-semibold text-slate-400">Total Payouts Audited</span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-white mt-1">
                $15,231.89
              </div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+20.1% from last month</span>
              </div>
            </div>

            {/* Sparkline Line Graph (Matching Image 4) */}
            <div className="h-20 w-full pt-2">
              <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
                <path
                  d="M 5 45 Q 40 35 70 42 T 130 45 T 160 38 T 195 10"
                  fill="transparent"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Node Points */}
                {[
                  { cx: 5, cy: 45 },
                  { cx: 40, cy: 37 },
                  { cx: 70, cy: 42 },
                  { cx: 100, cy: 44 },
                  { cx: 130, cy: 45 },
                  { cx: 160, cy: 38 },
                  { cx: 195, cy: 10 },
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="3.5" fill="#FFFFFF" />
                ))}
              </svg>
            </div>
          </div>

          {/* Card 2: Subscriptions / Active Traders */}
          <div className="bg-elevation-surface border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all">
            <div>
              <span className="text-xs font-semibold text-slate-400">Funded Traders</span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-white mt-1">
                +2,350
              </div>
              <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1 mt-1">
                <Users className="w-3.5 h-3.5" />
                <span>+180.1% from last month</span>
              </div>
            </div>

            {/* Dynamic Bar Chart (Matching Image 4) */}
            <div className="flex items-end justify-between gap-1.5 h-20 pt-2 px-1">
              {[40, 75, 55, 90, 65, 80, 60, 95, 70].map((h, i) => (
                <div
                  key={i}
                  className="w-full bg-slate-300 hover:bg-cyan-400 transition-colors rounded-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 3: June 2026 Calendar / Trading Days */}
          <div className="bg-elevation-surface border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-3 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">June 2026</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <span key={day} className="text-slate-500 font-bold py-1">
                  {day}
                </span>
              ))}
              {/* Previous month days */}
              {['28', '29', '30', '31'].map((d) => (
                <span key={d} className="text-slate-600 py-1">
                  {d}
                </span>
              ))}
              {/* Active days */}
              {['1', '2', '3', '4'].map((d) => (
                <span key={d} className="text-slate-300 py-1">
                  {d}
                </span>
              ))}
              {/* Highlighted passing day */}
              <span className="bg-white text-black font-bold rounded-md py-1 shadow">
                5
              </span>
              {['6', '7', '8', '9', '10', '11', '12', '13', '14', '15'].map((d) => (
                <span key={d} className="text-slate-300 py-1">
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Card 4: Daily Move Goal / Profit Target Setter */}
          <div className="bg-elevation-surface border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-3 hover:border-cyan-500/30 transition-all">
            <div>
              <span className="text-xs font-semibold text-white">Daily Profit Goal</span>
              <p className="text-[11px] text-slate-400">Set your daily target pips / profit.</p>
            </div>

            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setPipGoal(Math.max(50, pipGoal - 50))}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="text-center">
                <div className="text-3xl font-mono font-black text-white">
                  {pipGoal}
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                  PIPS / TARGET
                </span>
              </div>
              <button
                onClick={() => setPipGoal(pipGoal + 50)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Target Activity Bar */}
            <div className="flex items-end justify-between gap-1 h-8 pt-1">
              {[20, 45, 60, 80, 50, 90, 75, 40, 65, 85, 30, 95].map((h, i) => (
                <div
                  key={i}
                  className="w-full bg-slate-300 hover:bg-emerald-400 transition-colors rounded-xs"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <button className="w-full py-1.5 rounded-lg bg-white hover:bg-slate-100 text-black text-xs font-bold transition-all shadow">
              Lock Goal
            </button>
          </div>

          {/* Row 2: Team Members & Challenge Portfolios (Span 2 cols on lg) */}
          <div className="lg:col-span-1 bg-elevation-surface border border-white/10 rounded-2xl p-5 space-y-3 hover:border-cyan-500/30 transition-all">
            <div>
              <span className="text-xs font-bold text-white">Funded Accounts Team</span>
              <p className="text-[11px] text-slate-400">Collaborate with copiers & risk managers.</p>
            </div>

            <div className="space-y-2.5 pt-1">
              {[
                { name: 'Sofia Davis', email: 'sofia@empirial.com', role: 'Owner', initials: 'SD' },
                { name: 'Jackson Lee', email: 'jackson@trader.io', role: 'Member', initials: 'JL' },
                { name: 'Isabella Nguyen', email: 'isabella@prop.org', role: 'Member', initials: 'IN' },
              ].map((user, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-elevation-card border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                      {user.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{user.name}</div>
                      <div className="text-[10px] text-slate-400">{user.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Live Chat / Support Assistant (Span 1 col on lg) */}
          <div className="lg:col-span-2 bg-elevation-surface border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-3 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  SD
                </div>
                <div>
                  <span className="text-xs font-bold text-white">Sofia Davis</span>
                  <p className="text-[10px] text-slate-400">{supportEmail}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Online
              </span>
            </div>

            {/* Chat Messages */}
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 text-xs">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.sender === 'Trader' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                      m.sender === 'Trader'
                        ? 'bg-cyan-500/20 text-white border border-cyan-500/30'
                        : 'bg-elevation-card text-slate-200 border border-white/5'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-white/5">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-elevation-base border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Row 2: Equity & Volume Activity Curve (Span 1 col on lg) */}
          <div className="lg:col-span-1 bg-elevation-surface border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2 hover:border-cyan-500/30 transition-all">
            <div>
              <span className="text-xs font-bold text-white">Equity & Minutes</span>
              <p className="text-[11px] text-slate-400">Trading volume is ahead of schedule.</p>
            </div>

            {/* Bell Curve SVG Graph (Matching Image 4) */}
            <div className="h-32 w-full pt-2">
              <svg viewBox="0 0 200 90" className="w-full h-full overflow-visible">
                <path
                  d="M 5 80 Q 40 85 70 80 Q 100 10 130 80 Q 160 85 195 75"
                  fill="transparent"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Node Points */}
                {[
                  { cx: 5, cy: 80 },
                  { cx: 40, cy: 82 },
                  { cx: 70, cy: 80 },
                  { cx: 100, cy: 15 },
                  { cx: 130, cy: 80 },
                  { cx: 160, cy: 83 },
                  { cx: 195, cy: 75 },
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="3.5" fill="#FFFFFF" />
                ))}
              </svg>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
