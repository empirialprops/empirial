import { getStoredUser } from '@/lib/utils/auth-store';

export type AuditModule =
  | 'firms'
  | 'challenges'
  | 'deals'
  | 'events'
  | 'reviews'
  | 'messages'
  | 'settings'
  | 'roles';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_name: string;
  actor_email: string;
  actor_role: string;
  action: string;
  module: AuditModule;
  target_id?: string;
  entity_name?: string;
  previous_state: any;
  new_state: any;
  is_reverted: boolean;
  reverted_at?: string;
  reverted_by?: string;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-seed-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actor_name: 'Super Admin',
    actor_email: 'admin@empirial.com',
    actor_role: 'admin',
    action: 'Initialized Admin Control Matrix',
    module: 'settings',
    previous_state: null,
    new_state: { status: 'initialized' },
    is_reverted: false,
  },
];

export function getStoredAuditLogs(): AuditLogEntry[] {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  const saved = localStorage.getItem('empirial_audit_logs');
  if (!saved) {
    localStorage.setItem('empirial_audit_logs', JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : INITIAL_AUDIT_LOGS;
  } catch (e) {
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveAuditLogs(logs: AuditLogEntry[]) {
  if (typeof window === 'undefined') return;
  // Cap strictly at 20 most recent logs
  const cappedLogs = logs.slice(0, 20);
  localStorage.setItem('empirial_audit_logs', JSON.stringify(cappedLogs));
  window.dispatchEvent(new CustomEvent('audit-logs-changed', { detail: cappedLogs }));

  // Asynchronously sync audit log to Firestore
  import('@/lib/firebase/config').then(({ db }) => {
    if (db) {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        cappedLogs.forEach((log) => {
          const docRef = doc(db, 'audit_logs', log.id);
          setDoc(docRef, log, { merge: true }).catch((err) => {
            console.warn('Silent Firestore audit log sync failed:', err);
          });
        });
      });
    }
  }).catch((err) => {
    console.warn('Firebase config import failed during audit log sync:', err);
  });
}

export function logAdminAction(params: {
  action: string;
  module: AuditModule;
  target_id?: string;
  entity_name?: string;
  previous_state: any;
  new_state: any;
}): AuditLogEntry {
  const currentLogs = getStoredAuditLogs();
  const currentUser = getStoredUser();

  const newLog: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    actor_name: currentUser?.displayName || currentUser?.email || 'Staff Member',
    actor_email: currentUser?.email || 'staff@empirial.com',
    actor_role: currentUser?.role || 'admin',
    action: params.action,
    module: params.module,
    target_id: params.target_id,
    entity_name: params.entity_name,
    previous_state: params.previous_state ? JSON.parse(JSON.stringify(params.previous_state)) : null,
    new_state: params.new_state ? JSON.parse(JSON.stringify(params.new_state)) : null,
    is_reverted: false,
  };

  const updated = [newLog, ...currentLogs].slice(0, 20);
  saveAuditLogs(updated);
  return newLog;
}

export async function revertAuditLog(logId: string): Promise<{ success: boolean; message: string }> {
  const logs = getStoredAuditLogs();
  const logIndex = logs.findIndex((l) => l.id === logId);

  if (logIndex === -1) {
    return { success: false, message: 'Log entry not found.' };
  }

  const log = logs[logIndex];
  if (log.is_reverted) {
    return { success: false, message: 'This change has already been reverted.' };
  }

  const currentUser = getStoredUser();
  if (!currentUser || !['admin', 'super_admin'].includes(currentUser.role)) {
    return { success: false, message: 'Access denied: Only Super Admins can undo changes.' };
  }

  try {
    const prevState = log.previous_state;

    switch (log.module) {
      case 'firms': {
        const { getFirms, updateFirm, deleteFirm, createFirm } = await import('@/lib/firebase/services');
        if (log.target_id) {
          if (!prevState) {
            // Revert creation -> delete firm
            await deleteFirm(log.target_id);
          } else {
            // Revert update -> restore prevState
            await updateFirm(log.target_id, prevState);
          }
        }
        break;
      }

      case 'challenges': {
        const { updateChallenge, deleteChallenge } = await import('@/lib/firebase/services');
        if (log.target_id) {
          if (!prevState) {
            await deleteChallenge(log.target_id);
          } else {
            await updateChallenge(log.target_id, prevState);
          }
        }
        break;
      }

      case 'deals': {
        const { updateDeal, deleteDeal } = await import('@/lib/firebase/services');
        const { saveStoredDeals, getStoredDeals } = await import('@/lib/utils/deals-store');
        if (log.target_id) {
          if (!prevState) {
            await deleteDeal(log.target_id);
            const current = getStoredDeals().filter((d) => d.id !== log.target_id);
            saveStoredDeals(current);
          } else {
            await updateDeal(log.target_id, prevState);
            const current = getStoredDeals().map((d) => (d.id === log.target_id ? { ...d, ...prevState } : d));
            saveStoredDeals(current);
          }
        }
        break;
      }

      case 'events': {
        const { updateEvent, deleteEvent } = await import('@/lib/firebase/services');
        if (log.target_id) {
          if (!prevState) {
            await deleteEvent(log.target_id);
          } else {
            await updateEvent(log.target_id, prevState);
          }
        }
        break;
      }

      case 'reviews': {
        const { updateReview, deleteReview } = await import('@/lib/firebase/services');
        if (log.target_id) {
          if (!prevState) {
            await deleteReview(log.target_id);
          } else {
            await updateReview(log.target_id, prevState);
          }
        }
        break;
      }

      case 'messages': {
        const { saveSupportTickets, getStoredSupportTickets } = await import('@/lib/utils/auth-store');
        const { updateSupportTicketStatusInFirestore } = await import('@/lib/firebase/services');
        if (log.target_id && prevState) {
          const tickets = getStoredSupportTickets().map((t) => (t.id === log.target_id ? prevState : t));
          saveSupportTickets(tickets);
          if (prevState.status) {
            updateSupportTicketStatusInFirestore(log.target_id, prevState.status);
          }
        }
        break;
      }

      case 'settings': {
        const { updateSiteSettings } = await import('@/lib/firebase/services');
        if (prevState) {
          await updateSiteSettings(prevState);
        }
        break;
      }

      case 'roles': {
        const { saveStaffProfiles, getStoredStaffProfiles } = await import('@/lib/utils/roles-store');
        if (log.target_id) {
          if (!prevState) {
            const current = getStoredStaffProfiles().filter((p) => p.id !== log.target_id);
            saveStaffProfiles(current);
          } else {
            const current = getStoredStaffProfiles().map((p) => (p.id === log.target_id ? prevState : p));
            saveStaffProfiles(current);
          }
        }
        break;
      }

      default:
        break;
    }

    // Mark log entry as reverted
    log.is_reverted = true;
    log.reverted_at = new Date().toISOString();
    log.reverted_by = currentUser.displayName || currentUser.email;

    logs[logIndex] = log;
    saveAuditLogs(logs);

    return {
      success: true,
      message: `Successfully reverted change for ${log.entity_name || log.module}!`,
    };
  } catch (err: any) {
    console.error('Failed to revert change:', err);
    return {
      success: false,
      message: err.message || 'Failed to undo change due to an internal error.',
    };
  }
}
