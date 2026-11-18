'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Trash2, CheckCircle2, Send, MessageSquare, Ticket, AlertCircle, Clock, ShieldCheck, User, Radio, Sparkles, RefreshCw } from 'lucide-react';
import {
  UserSupportTicket,
  getStoredSupportTickets,
  saveSupportTickets,
  replyToSupportTicket,
} from '@/lib/utils/auth-store';
import {
  subscribeToAllSupportTickets,
  subscribeToSingleSupportTicket,
  updateSupportTicketStatusInFirestore,
  deleteSupportTicketFromFirestore,
} from '@/lib/firebase/services';

export default function AdminMessagesPage() {
  const [tickets, setTickets] = useState<UserSupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTickets(getStoredSupportTickets());

    // Real-time Firestore subscription across all support tickets
    const unsubscribe = subscribeToAllSupportTickets((remoteTickets) => {
      if (remoteTickets && remoteTickets.length > 0) {
        setTickets(remoteTickets);
        saveSupportTickets(remoteTickets);
      }
    });

    const handleTicketsChange = (e: CustomEvent) => {
      if (e.detail) setTickets(e.detail);
    };

    window.addEventListener('support-tickets-changed' as any, handleTicketsChange);
    return () => {
      unsubscribe();
      window.removeEventListener('support-tickets-changed' as any, handleTicketsChange);
    };
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0];

  // Subscribe to live single ticket thread when active ticket changes
  useEffect(() => {
    if (!activeTicket?.id) return;
    const unsubSingle = subscribeToSingleSupportTicket(activeTicket.id, (updatedTicketDoc) => {
      if (!updatedTicketDoc) return;
      setTickets((prev) =>
        prev.map((t) => (t.id === updatedTicketDoc.id ? { ...t, ...updatedTicketDoc } : t))
      );
    });
    return () => unsubSingle();
  }, [activeTicket?.id]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.messages?.length, activeTicket?.id]);

  const handleDelete = (id: string) => {
    const updated = tickets.filter((t) => t.id !== id);
    setTickets(updated);
    saveSupportTickets(updated);
    deleteSupportTicketFromFirestore(id);
    if (selectedTicketId === id) setSelectedTicketId(null);
  };

  const handleStatusChange = (id: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    const updated = tickets.map((t) => {
      if (t.id === id) return { ...t, status: newStatus, updated_at: new Date().toISOString() };
      return t;
    });
    setTickets(updated);
    saveSupportTickets(updated);
    updateSupportTicketStatusInFirestore(id, newStatus);
  };

  const handleSendReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    const msgText = replyText.trim();
    setReplyText('');

    replyToSupportTicket(ticketId, msgText, 'admin', 'EMPIRIAL Admin Desk');
    setTickets(getStoredSupportTickets());
  };

  return (
    <div className="space-y-6">
      {/* 1. Header (RULE:BW Typography) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground text-[11px] font-bold uppercase mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>LIVE CHAT & SUPPORT DESK</span>
          </div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Trader Support Tickets Inbox
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Real-time live messaging service synced directly with trader profile dashboards. Responses deliver instantly without refreshing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => alert('All support ticket status changes and replies have been saved!')}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer shadow flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>

          {/* Filter Pills (RULE:BW) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('open')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              filterStatus === 'open'
                ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Open ({tickets.filter((t) => t.status === 'open').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              filterStatus === 'in_progress'
                ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            In Progress ({tickets.filter((t) => t.status === 'in_progress').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              filterStatus === 'resolved'
                ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Resolved ({tickets.filter((t) => t.status === 'resolved').length})
          </button>
        </div>
      </div>
    </div>

      {/* 2. Main Support Workspace: Left List + Right Live Chat Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Incoming Support Tickets ({filteredTickets.length})
          </span>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((t) => {
                const isActive = activeTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isActive
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                        : 'bg-white dark:bg-card border-zinc-200 dark:border-border hover:border-black dark:hover:border-white text-foreground shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold">{t.id}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black border-current'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-muted-foreground border-zinc-200 dark:border-zinc-800'
                        }`}>
                          {t.category}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          t.status === 'resolved'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : t.status === 'in_progress'
                            ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs leading-snug line-clamp-1">{t.subject}</h4>
                      <p className={`text-[11px] line-clamp-1 mt-0.5 ${isActive ? 'opacity-80' : 'text-muted-foreground'}`}>
                        {t.messages[t.messages.length - 1]?.text}
                      </p>
                    </div>

                    <div className={`flex items-center justify-between text-[10px] pt-1.5 border-t font-mono ${
                      isActive ? 'border-white/20 dark:border-black/20 opacity-80' : 'border-zinc-100 dark:border-zinc-800 text-muted-foreground'
                    }`}>
                      <span>{t.user_name} ({t.user_email})</span>
                      <span>{t.created_at.substring(0, 10)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-card border border-zinc-200 dark:border-border text-muted-foreground text-xs">
                No tickets matching current status filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Live Ticket Chat (WhatsApp / Discord Style) */}
        <div className="lg:col-span-7 bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-6 space-y-5 shadow-xs">
          {activeTicket ? (
            <>
              {/* Top Details & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">{activeTicket.id}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground">
                      Priority: {activeTicket.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Category: {activeTicket.category}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-foreground">{activeTicket.subject}</h3>
                  <div className="text-xs text-muted-foreground">
                    Trader: <strong className="text-foreground">{activeTicket.user_name}</strong> •{' '}
                    <span className="font-mono text-foreground underline">{activeTicket.user_email}</span>
                    {activeTicket.user_phone && ` • ${activeTicket.user_phone}`}
                  </div>
                </div>

                {/* Status Switcher & Delete */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <select
                    value={activeTicket.status}
                    onChange={(e) => handleStatusChange(activeTicket.id, e.target.value as any)}
                    className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDelete(activeTicket.id)}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-muted-foreground hover:text-red-500 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                    title="Delete Ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-time Live Message Thread (Discord / WhatsApp Ticket Style) */}
              <div className="space-y-3.5 max-h-[380px] min-h-[260px] overflow-y-auto p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800/80">
                {activeTicket.messages.map((m) => {
                  const isAdmin = m.sender === 'admin' || m.sender === 'support';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 shadow-2xs ${
                          isAdmin
                            ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none'
                            : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground rounded-tl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] font-bold opacity-90 pb-1 border-b border-current/10">
                          <span className="flex items-center gap-1">
                            {isAdmin && <ShieldCheck className="w-3 h-3" />}
                            <span>{m.sender_name}</span>
                          </span>
                          <span className="font-mono text-[9px] opacity-75">{m.timestamp}</span>
                        </div>
                        <p className="leading-relaxed pt-1 text-xs">{m.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Admin Real-Time Reply Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendReply(activeTicket.id);
                }}
                className="pt-2 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type live response to trader..."
                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Live real-time socket connected</span>
                  </span>
                  <span>Press Enter to dispatch instantly</span>
                </div>
              </form>
            </>
          ) : (
            <div className="py-20 text-center text-muted-foreground text-xs">
              Select a ticket from the left panel to open live support thread.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
