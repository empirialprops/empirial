// @ts-nocheck -- ported legacy code; typed loosely in the original project
/**
 * Google Sheets Integration Module
 * Automatically appends new & existing Firebase user details into target Google Sheet via Apps Script Webhook.
 * Target Sheet ID: 1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA
 */

export interface SheetUserPayload {
  uid: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  phone?: string;
  provider: string; // 'google.com' | 'discord.com' | 'password'
  role?: string;
  points?: number;
  disabled?: boolean;
  createdAt: string;
  lastSignInAt?: string;
  photoURL?: string;
}

// Configurable Webhook URL (Falls back to deployed Google Apps Script Web App URL)
export const DEFAULT_SHEETS_WEBHOOK_URL = (import.meta.env.VITE_UNUSED as string | undefined) || '';

/**
 * Resolves active Webhook URL from provided param, localStorage, env, or siteSettings
 */
export async function resolveWebhookUrl(providedUrl?: string): Promise<string> {
  if (providedUrl && providedUrl.trim()) {
    if (typeof window !== 'undefined') localStorage.setItem('empirial_sheets_webhook_url', providedUrl.trim());
    return providedUrl.trim();
  }
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('empirial_sheets_webhook_url');
    if (localUrl && localUrl.trim()) return localUrl.trim();
  }
  if ((import.meta.env.VITE_UNUSED as string | undefined) && (import.meta.env.VITE_UNUSED as string | undefined).trim()) {
    return (import.meta.env.VITE_UNUSED as string | undefined).trim();
  }
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./config');
    if (db) {
      const snap = await getDoc(doc(db, 'siteSettings', 'main'));
      if (snap.exists() && snap.data().sheetsWebhookUrl) {
        const url = snap.data().sheetsWebhookUrl;
        if (typeof window !== 'undefined') localStorage.setItem('empirial_sheets_webhook_url', url);
        return url;
      }
    }
  } catch (err) {
    console.warn('Failed to load webhook URL from siteSettings:', err);
  }
  return '';
}

/**
 * Dispatch single user signup data to Google Apps Script Webhook.
 */
export async function syncUserToGoogleSheet(payload: SheetUserPayload, webhookUrl?: string): Promise<{ success: boolean; error?: string }> {
  const targetUrl = await resolveWebhookUrl(webhookUrl);
  if (!targetUrl || targetUrl.trim() === '') {
    console.warn('[Google Sheets Sync] Webhook URL not configured. Skipping sheet append.');
    return { success: false, error: 'Webhook URL not set' };
  }

  try {
    const dataToSend = {
      uid: payload.uid || '',
      name: payload.name || 'Anonymous Trader',
      email: payload.email || '',
      emailVerified: payload.emailVerified ?? false,
      phone: payload.phone || 'N/A',
      provider: payload.provider || 'password',
      role: payload.role || (payload.email?.includes('admin') ? 'admin' : 'trader'),
      points: payload.points || 500,
      disabled: payload.disabled ?? false,
      createdAt: payload.createdAt || new Date().toISOString(),
      lastSignInAt: payload.lastSignInAt || new Date().toISOString(),
      photoURL: payload.photoURL || 'N/A',
    };

    await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(dataToSend),
      mode: 'no-cors',
    });

    console.log('[Google Sheets Sync] Successfully dispatched user to Google Sheet:', payload.email);
    return { success: true };
  } catch (err: any) {
    console.error('[Google Sheets Sync] Failed to dispatch user to Google Sheet:', err);
    return { success: false, error: err?.message || 'Network request failed' };
  }
}

/**
 * Fetch all existing users from Firestore, Initial Mocks, and LocalStorage and sync them to Google Sheets in bulk.
 */
export async function syncAllExistingUsersToGoogleSheet(webhookUrl?: string): Promise<{ success: boolean; count: number; error?: string }> {
  const targetUrl = await resolveWebhookUrl(webhookUrl);
  if (!targetUrl || targetUrl.trim() === '') {
    console.warn('[Google Sheets Sync] Webhook URL not configured for batch sync.');
    return { success: false, count: 0, error: 'Webhook URL not set' };
  }

  try {
    const userMap = new Map<string, SheetUserPayload>();

    // 1. Initial Pre-seeded / Demo Accounts with Complete Auth Data
    const MOCK_INITIAL_USERS: SheetUserPayload[] = [
      {
        uid: 'user_alex_miller_001',
        name: 'Alex Miller',
        email: 'alex.miller@empirialtraders.com',
        emailVerified: true,
        phone: '+1 (555) 234-5678',
        provider: 'google.com',
        role: 'trader',
        points: 1250,
        disabled: false,
        createdAt: '2026-01-15T10:00:00.000Z',
        lastSignInAt: '2026-03-20T18:30:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      {
        uid: 'user_marcus_chen_002',
        name: 'Marcus Chen',
        email: 'marcus.chen@empirialtraders.com',
        emailVerified: true,
        phone: '+1 (555) 876-5432',
        provider: 'discord.com',
        role: 'trader',
        points: 890,
        disabled: false,
        createdAt: '2026-02-01T14:30:00.000Z',
        lastSignInAt: '2026-03-21T09:12:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      {
        uid: 'user_sarah_jenkins_003',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@empirialtraders.com',
        emailVerified: true,
        phone: '+44 20 7946 0912',
        provider: 'password',
        role: 'trader',
        points: 2100,
        disabled: false,
        createdAt: '2026-02-18T09:15:00.000Z',
        lastSignInAt: '2026-03-21T14:05:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      },
      {
        uid: 'user_anuraj_admin_000',
        name: 'Anuraj (Empirial Admin)',
        email: 'anuraj@empirialprops.com',
        emailVerified: true,
        phone: '+91 98765 43210',
        provider: 'google.com',
        role: 'admin',
        points: 99999,
        disabled: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        lastSignInAt: '2026-03-21T16:00:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      },
      {
        uid: 'trader-001',
        name: 'Demo Trader',
        email: 'trader@empirial.com',
        emailVerified: true,
        phone: '+1 (555) 000-1111',
        provider: 'password',
        role: 'trader',
        points: 500,
        disabled: false,
        createdAt: '2026-01-10T12:00:00.000Z',
        lastSignInAt: '2026-03-19T11:45:00.000Z',
        photoURL: 'N/A',
      },
      {
        uid: 'admin-001',
        name: 'System Admin',
        email: 'admin@empirial.com',
        emailVerified: true,
        phone: '+1 (555) 000-9999',
        provider: 'password',
        role: 'admin',
        points: 50000,
        disabled: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        lastSignInAt: '2026-03-21T15:20:00.000Z',
        photoURL: 'N/A',
      },
      {
        uid: 'user_elena_rostova_004',
        name: 'Elena Rostova',
        email: 'elena.rostova@empirialtraders.com',
        emailVerified: false,
        phone: '+49 30 123456',
        provider: 'google.com',
        role: 'trader',
        points: 620,
        disabled: false,
        createdAt: '2026-02-25T11:20:00.000Z',
        lastSignInAt: '2026-03-18T10:00:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      },
      {
        uid: 'user_david_kim_005',
        name: 'David Kim',
        email: 'david.kim@empirialtraders.com',
        emailVerified: true,
        phone: '+82 2 3456 7890',
        provider: 'password',
        role: 'trader',
        points: 1450,
        disabled: false,
        createdAt: '2026-03-01T08:45:00.000Z',
        lastSignInAt: '2026-03-21T07:30:00.000Z',
        photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      }
    ];

    MOCK_INITIAL_USERS.forEach(u => userMap.set(u.email || u.uid, u));

    // 2. Query all Firestore User Documents
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('./config');
      if (db) {
        const snap = await getDocs(collection(db, 'users'));
        snap.docs.forEach(doc => {
          const u = doc.data();
          const item: SheetUserPayload = {
            uid: u.uid || doc.id,
            name: u.displayName || u.name || 'Trader',
            email: u.email || '',
            emailVerified: u.emailVerified ?? false,
            phone: u.phoneNumber || u.phone || 'N/A',
            provider: u.provider || (u.email?.includes('gmail') ? 'google.com' : 'password'),
            role: u.role || (u.email?.includes('admin') ? 'admin' : 'trader'),
            points: u.points || 500,
            disabled: u.disabled ?? false,
            createdAt: u.created_at || u.createdAt || new Date().toISOString(),
            lastSignInAt: u.lastLogin || u.lastSignInAt || new Date().toISOString(),
            photoURL: u.photoURL || u.avatar || 'N/A',
          };
          if (item.email) userMap.set(item.email, item);
          else userMap.set(item.uid, item);
        });
      }
    } catch (e) {
      console.warn('Error fetching Firestore users during sheet sync:', e);
    }

    const allUsersList = Array.from(userMap.values());
    if (allUsersList.length === 0) return { success: true, count: 0 };

    await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ users: allUsersList }),
      mode: 'no-cors',
    });

    console.log(`[Google Sheets Sync] Successfully dispatched ${allUsersList.length} users with full auth data to Google Sheet`);
    return { success: true, count: allUsersList.length };
  } catch (err: any) {
    console.error('[Google Sheets Sync] Failed to sync users:', err);
    return { success: false, count: 0, error: err?.message || 'Sync failed' };
  }
}
