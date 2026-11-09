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
  // Allow admins or staff; if user session is not explicitly a non-admin trader, permit staff rollback
  if (currentUser && currentUser.role === 'trader') {
    return { success: false, message: 'Access denied: Only Super Admins can undo changes.' };
  }
  const actorName = currentUser?.displayName || currentUser?.email || 'Admin';

  try {
    const prevState = log.previous_state;

    switch (log.module) {
      case 'firms': {
        const { getStoredFirms, updateStoredFirm, deleteStoredFirm, addStoredFirm } = await import('@/lib/utils/firms-store');
        if (log.target_id) {
          if (!prevState) {
            // Revert creation -> delete firm
            deleteStoredFirm(log.target_id);
            try {
              const { deleteFirm } = await import('@/lib/firebase/services');
              await deleteFirm(log.target_id);
            } catch (err) {
              console.warn('Silent Firestore deleteFirm error during undo:', err);
            }
          } else {
            // Revert update or deletion -> restore prevState
            const currentFirms = getStoredFirms();
            const exists = currentFirms.some((f) => f.id === log.target_id || f.slug === log.target_id);
            if (exists) {
              updateStoredFirm(log.target_id, prevState);
            } else {
              addStoredFirm({ ...prevState, id: log.target_id });
            }
            try {
              const { updateFirm } = await import('@/lib/firebase/services');
              await updateFirm(log.target_id, prevState);
            } catch (err) {
              console.warn('Silent Firestore updateFirm error during undo:', err);
            }
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('firms-changed'));
          }
        }
        break;
      }

      case 'challenges': {
        const { getStoredChallenges, updateStoredChallenge, deleteStoredChallenge, addStoredChallenge } = await import('@/lib/utils/challenges-store');
        if (log.target_id) {
          if (!prevState) {
            deleteStoredChallenge(log.target_id);
            try {
              const { deleteChallenge } = await import('@/lib/firebase/services');
              await deleteChallenge(log.target_id);
            } catch (err) {
              console.warn('Silent Firestore deleteChallenge error during undo:', err);
            }
          } else {
            const currentCh = getStoredChallenges();
            const exists = currentCh.some((c) => c.id === log.target_id);
            if (exists) {
              updateStoredChallenge(log.target_id, prevState);
            } else {
              addStoredChallenge({ ...prevState, id: log.target_id });
            }
            try {
              const { updateChallenge } = await import('@/lib/firebase/services');
              await updateChallenge(log.target_id, prevState);
            } catch (err) {
              console.warn('Silent Firestore updateChallenge error during undo:', err);
            }
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('challenges-changed'));
          }
        }
        break;
      }

      case 'deals': {
        const { saveStoredDeals, getStoredDeals } = await import('@/lib/utils/deals-store');
        if (log.target_id) {
          const current = getStoredDeals();
          if (!prevState) {
            saveStoredDeals(current.filter((d) => d.id !== log.target_id));
            try {
              const { deleteDeal } = await import('@/lib/firebase/services');
              await deleteDeal(log.target_id);
            } catch {}
          } else {
            const exists = current.some((d) => d.id === log.target_id);
            const updated = exists
              ? current.map((d) => (d.id === log.target_id ? { ...d, ...prevState } : d))
              : [...current, prevState];
            saveStoredDeals(updated);
            try {
              const { updateDeal } = await import('@/lib/firebase/services');
              await updateDeal(log.target_id, prevState);
            } catch {}
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('deals-changed'));
          }
        }
        break;
      }

      case 'events': {
        const { updateEvent, deleteEvent } = await import('@/lib/firebase/services');
        if (log.target_id) {
          try {
            if (!prevState) {
              await deleteEvent(log.target_id);
            } else {
              await updateEvent(log.target_id, prevState);
            }
          } catch (e) {
            console.warn('Firestore event revert error:', e);
          }
        }
        break;
      }

      case 'reviews': {
        const { updateReview, deleteReview } = await import('@/lib/firebase/services');
        if (log.target_id) {
          try {
            if (!prevState) {
              await deleteReview(log.target_id);
            } else {
              await updateReview(log.target_id, prevState);
            }
          } catch (e) {
            console.warn('Firestore review revert error:', e);
          }
        }
        break;
      }

      case 'messages': {
        const { saveSupportTickets, getStoredSupportTickets } = await import('@/lib/utils/auth-store');
        if (log.target_id && prevState) {
          const tickets = getStoredSupportTickets().map((t) => (t.id === log.target_id ? prevState : t));
          saveSupportTickets(tickets);
          try {
            const { updateSupportTicketStatusInFirestore } = await import('@/lib/firebase/services');
            if (prevState.status) {
              updateSupportTicketStatusInFirestore(log.target_id, prevState.status);
            }
          } catch (e) {}
        }
        break;
      }

      case 'settings': {
        if (prevState) {
          try {
            const { updateSiteSettings } = await import('@/lib/firebase/services');
            await updateSiteSettings(prevState);
          } catch (e) {}
        }
        break;
      }

      case 'roles': {
        const { saveStaffProfiles, getStoredStaffProfiles } = await import('@/lib/utils/roles-store');
        if (log.target_id) {
          const current = getStoredStaffProfiles();
          if (!prevState) {
            saveStaffProfiles(current.filter((p) => p.id !== log.target_id));
          } else {
            const exists = current.some((p) => p.id === log.target_id);
            saveStaffProfiles(exists ? current.map((p) => (p.id === log.target_id ? prevState : p)) : [...current, prevState]);
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
    log.reverted_by = actorName;

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
