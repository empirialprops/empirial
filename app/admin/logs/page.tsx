'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Tag,
  Building2,
  Trophy,
  Star,
  Calendar,
  Mail,
  Settings,
  UserCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import {
  AuditLogEntry,
  AuditModule,
  getStoredAuditLogs,
  revertAuditLog,
} from '@/lib/utils/audit-log-store';
import { getStoredUser } from '@/lib/utils/auth-store';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [revertToast, setRevertToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const currentUser = getStoredUser();

  useEffect(() => {
    setLogs(getStoredAuditLogs());

    const handleLogsChanged = (e: CustomEvent) => {
      if (e.detail) setLogs(e.detail);
    };

    window.addEventListener('audit-logs-changed' as any, handleLogsChanged);
    return () => window.removeEventListener('audit-logs-changed' as any, handleLogsChanged);
  }, []);

  const handleRevert = async (logId: string) => {
    if (!confirm('Are you sure you want to revert/undo this change?')) return;

    setRevertingId(logId);
    setRevertToast(null);

    const res = await revertAuditLog(logId);
    setRevertingId(null);

    if (res.success) {
      setRevertToast({ type: 'success', message: res.message });
      setLogs(getStoredAuditLogs());
    } else {
      setRevertToast({ type: 'error', message: res.message });
    }

    setTimeout(() => setRevertToast(null), 4000);
  };

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      !searchQuery ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actor_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.entity_name && l.entity_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesModule = selectedModuleFilter === 'all' || l.module === selectedModuleFilter;

    return matchesSearch && matchesModule;
  });

  const getModuleIcon = (module: AuditModule) => {
    switch (module) {
      case 'firms':
        return Building2;
      case 'challenges':
        return Trophy;
      case 'deals':
        return Tag;
      case 'events':
        return Calendar;
      case 'reviews':
        return Star;
      case 'messages':
        return Mail;
      case 'settings':
        return Settings;
      case 'roles':
        return UserCheck;
      default:
        return History;
    }
  };

  // Restricted Access Guard UI for non-admins
  if (currentUser && !['admin', 'super_admin'].includes(currentUser.role)) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-xs text-muted-foreground">
          Only Super Administrators are authorized to view Audit Logs and execute Undo/Revert actions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section (RULE:BW Typography) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-foreground text-[11px] font-bold uppercase mb-2">
            <History className="w-3.5 h-3.5" />
            <span>AUDIT TRAIL & UNDO HISTORY</span>
          </div>
          <h1 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            Admin Activity Logs & Undo Engine
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track up to 20 recent edits made across all staff panels with full state snapshots and 1-click Undo capability.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-xl self-start sm:self-center">
          <Clock className="w-4 h-4 text-foreground" />
          <span>Rolling History: {logs.length} / 20 Logs</span>
        </div>
      </div>

      {/* Toast Notification Callout */}
      {revertToast && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
            revertToast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          {revertToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{revertToast.message}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs by action, staff name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'firms', 'challenges', 'deals', 'events', 'reviews', 'messages', 'settings', 'roles'].map(
            (mod) => (
              <button
                key={mod}
                onClick={() => setSelectedModuleFilter(mod)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all uppercase cursor-pointer shrink-0 border ${
                  selectedModuleFilter === mod
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold'
                    : 'bg-white text-muted-foreground dark:bg-card dark:text-muted-foreground border-zinc-200 dark:border-zinc-800 hover:text-foreground'
                }`}
              >
                {mod}
              </button>
            )
          )}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const ModuleIcon = getModuleIcon(log.module);
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className={`bg-white dark:bg-card border rounded-2xl transition-all ${
                  log.is_reverted
                    ? 'border-zinc-200 dark:border-zinc-800 opacity-60'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-sm'
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Metadata */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-foreground shrink-0 mt-0.5">
                      <ModuleIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{log.action}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-foreground uppercase border border-zinc-200 dark:border-zinc-700">
                          {log.module}
                        </span>
                        {log.is_reverted && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                            REVERTED
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {log.actor_name} ({log.actor_email})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Diff State</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {!log.is_reverted ? (
                      <button
                        onClick={() => handleRevert(log.id)}
                        disabled={revertingId === log.id}
                        className="px-4 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer shadow flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${revertingId === log.id ? 'animate-spin' : ''}`} />
                        <span>{revertingId === log.id ? 'Undoing...' : 'Undo / Revert'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-muted-foreground italic px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                        Undone by {log.reverted_by || 'Admin'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable JSON Diff Drawer */}
                {isExpanded && (
                  <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <span className="text-red-500 font-semibold block text-[11px] uppercase">
                        Previous State (Before Edit)
                      </span>
                      <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-300 overflow-x-auto max-h-48 text-[11px]">
                        {log.previous_state
                          ? JSON.stringify(log.previous_state, null, 2)
                          : 'null (Created Record)'}
                      </pre>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-emerald-500 font-semibold block text-[11px] uppercase">
                        New State (After Edit)
                      </span>
                      <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-300 overflow-x-auto max-h-48 text-[11px]">
                        {log.new_state
                          ? JSON.stringify(log.new_state, null, 2)
                          : 'null (Deleted Record)'}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white dark:bg-card border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
            <History className="w-8 h-8 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">No Audit Logs Found</h3>
            <p className="text-xs text-muted-foreground">
              Edits and modifications made in the admin panel will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
