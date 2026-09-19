'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Trash2, CheckCircle2, Send, MessageSquare, Ticket, AlertCircle, Clock, ShieldCheck, User, Radio } from 'lucide-react';
import {
  UserSupportTicket,
  getStoredSupportTickets,
  saveSupportTickets,
  replyToSupportTicket,
} from '@/lib/utils/auth-store';
import {
  subscribeToAllSupportTickets,
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

    // Real-time Firestore subscription across all browsers/devices
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
    replyToSupportTicket(ticketId, replyText.trim(), 'admin', 'EMPIRIAL Admin Desk');
    setTickets(getStoredSupportTickets());
    setReplyText('');
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0];

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.messages?.length, activeTicket?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Support & Trader Tickets Inbox</h1>
          <p className="text-xs text-slate-400">
            Real-time incoming support tickets from traders on the Profile Desk. Responses sync directly back to user profiles.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-elevation-card border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              filterStatus === 'all' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('open')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              filterStatus === 'open' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Open ({tickets.filter((t) => t.status === 'open').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('in_progress')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              filterStatus === 'in_progress' ? 'bg-sky-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            In Progress ({tickets.filter((t) => t.status === 'in_progress').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('resolved')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              filterStatus === 'resolved' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved ({tickets.filter((t) => t.status === 'resolved').length})
          </button>
        </div>
      </div>

      {/* Main Support Workspace: Left List + Right Conversation Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  activeTicket?.id === t.id
                    ? 'bg-elevation-raised border-cyan-500/50 shadow-lg'
                    : 'bg-elevation-surface border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-cyan-400">{t.id}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                      {t.category}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      t.status === 'resolved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : t.status === 'in_progress'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-xs leading-snug line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {t.messages[t.messages.length - 1]?.text}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5 font-mono">
                  <span>From: {t.user_name} ({t.user_email})</span>
                  <span>{t.created_at.substring(0, 10)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center rounded-2xl bg-elevation-surface border border-white/10 text-slate-400 text-xs">
              No tickets matching current status filter.
            </div>
          )}
        </div>

        {/* Right Column: Ticket Detail & Admin Reply Thread */}
        <div className="lg:col-span-7 bg-elevation-surface border border-white/10 rounded-2xl p-6 space-y-5">
          {activeTicket ? (
            <>
              {/* Top Details & Status Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{activeTicket.id}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/10 text-white">
                      Priority: {activeTicket.priority}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Category: {activeTicket.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{activeTicket.subject}</h3>
                  <div className="text-xs text-slate-400">
                    Trader: <strong className="text-white">{activeTicket.user_name}</strong> •{' '}
                    <span className="font-mono text-cyan-300">{activeTicket.user_email}</span>
                    {activeTicket.user_phone && ` • ${activeTicket.user_phone}`}
                  </div>
                </div>

                {/* Status Switcher & Delete */}
                <div className="flex items-center gap-2">
                  <select
                    value={activeTicket.status}
                    onChange={(e) => handleStatusChange(activeTicket.id, e.target.value as any)}
                    className="bg-elevation-card border border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDelete(activeTicket.id)}
                    className="p-1.5 rounded-xl bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors"
                    title="Delete Ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {activeTicket.messages.map((m) => {
                  const isAdmin = m.sender === 'admin' || m.sender === 'support';
                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl text-xs space-y-1 ${
                        isAdmin
                          ? 'bg-cyan-950/40 border border-cyan-500/30 text-slate-200 ml-4'
                          : 'bg-elevation-card border border-white/5 text-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={isAdmin ? 'text-cyan-400 flex items-center gap-1' : 'text-white'}>
                          {isAdmin && <ShieldCheck className="w-3.5 h-3.5" />}
                          <span>{m.sender_name}</span>
                        </span>
                        <span className="font-mono text-slate-400 text-[10px]">{m.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Admin Reply Composer */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendReply(activeTicket.id);
                    }}
                    placeholder="Type official admin response to trader..."
                    className="flex-1 bg-elevation-card border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendReply(activeTicket.id)}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Sending a response will automatically set the ticket status to <strong>In Progress</strong> and notify the trader on their profile ticket desk.
                </p>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              Select a ticket from the left panel to inspect details and respond.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
