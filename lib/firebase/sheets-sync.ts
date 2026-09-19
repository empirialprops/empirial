/**
 * Google Sheets Integration Module
 * Automatically appends new & existing Firebase user details into target Google Sheet via Apps Script Webhook.
 * Target Sheet ID: 1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA
 */

export interface SheetUserPayload {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  provider: string; // 'google.com' | 'discord.com' | 'password'
  createdAt: string;
}

// Configurable Webhook URL (Falls back to deployed Google Apps Script Web App URL)
export const DEFAULT_SHEETS_WEBHOOK_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL || '';

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
  if (process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL && process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL.trim()) {
    return process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL.trim();
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
      phone: payload.phone || 'N/A',
      provider: payload.provider || 'password',
      createdAt: payload.createdAt || new Date().toISOString(),
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

    // 1. Initial Pre-seeded / Demo Accounts
    const MOCK_INITIAL_USERS: SheetUserPayload[] = [
      {
        uid: 'user_alex_miller_001',
        name: 'Alex Miller',
        email: 'alex.miller@empirialtraders.com',
        phone: '+1 (555) 234-5678',
        provider: 'google.com',
        createdAt: '2026-01-15T10:00:00.000Z',
      },
      {
        uid: 'user_marcus_chen_002',
        name: 'Marcus Chen',
        email: 'marcus.chen@empirialtraders.com',
        phone: '+1 (555) 876-5432',
        provider: 'discord.com',
        createdAt: '2026-02-01T14:30:00.000Z',
      },
      {
        uid: 'user_sarah_jenkins_003',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@empirialtraders.com',
        phone: '+44 20 7946 0912',
        provider: 'password',
        createdAt: '2026-02-18T09:15:00.000Z',
      },
      {
        uid: 'user_anuraj_admin_000',
        name: 'Anuraj (Empirial Admin)',
        email: 'anuraj@empirialprops.com',
        phone: '+91 98765 43210',
        provider: 'google.com',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        uid: 'trader-001',
        name: 'Demo Trader',
        email: 'trader@empirial.com',
        phone: '+1 (555) 000-1111',
        provider: 'password',
        createdAt: '2026-01-10T12:00:00.000Z',
      },
      {
        uid: 'admin-001',
        name: 'System Admin',
        email: 'admin@empirial.com',
        phone: '+1 (555) 000-9999',
        provider: 'password',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
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
            phone: u.phoneNumber || u.phone || 'N/A',
            provider: u.provider || (u.email?.includes('gmail') ? 'google.com' : 'password'),
            createdAt: u.created_at || u.createdAt || new Date().toISOString(),
          };
          if (item.email) userMap.set(item.email, item);
          else userMap.set(item.uid, item);
        });
      }
    } catch (e) {
      console.warn('Error fetching Firestore users during sheet sync:', e);
    }

    // 3. LocalStorage user (client-side)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('empirial_user');
        if (saved) {
          const u = JSON.parse(saved);
          const item: SheetUserPayload = {
            uid: u.uid || 'local-user',
            name: u.displayName || 'Local Trader',
            email: u.email || '',
            phone: u.phoneNumber || 'N/A',
            provider: u.email?.includes('gmail') ? 'google.com' : 'password',
            createdAt: new Date().toISOString(),
          };
          if (item.email) userMap.set(item.email, item);
        }
      } catch (e) {
        console.warn('Error reading local user for sheet sync:', e);
      }
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

    console.log(`[Google Sheets Sync] Successfully dispatched ${allUsersList.length} users to Google Sheet at ${targetUrl}`);
    return { success: true, count: allUsersList.length };
  } catch (err: any) {
    console.error('[Google Sheets Sync] Failed to sync users:', err);
    return { success: false, count: 0, error: err?.message || 'Sync failed' };
  }
}
