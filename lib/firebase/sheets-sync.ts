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
 * Dispatch single user signup data to Google Apps Script Webhook.
 */
export async function syncUserToGoogleSheet(payload: SheetUserPayload, webhookUrl: string = DEFAULT_SHEETS_WEBHOOK_URL): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || webhookUrl.trim() === '') {
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

    await fetch(webhookUrl, {
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
 * Fetch all existing users from Firestore and sync them to Google Sheets in bulk.
 */
export async function syncAllExistingUsersToGoogleSheet(webhookUrl: string = DEFAULT_SHEETS_WEBHOOK_URL): Promise<{ success: boolean; count: number; error?: string }> {
  if (!webhookUrl || webhookUrl.trim() === '') {
    console.warn('[Google Sheets Sync] Webhook URL not configured for batch sync.');
    return { success: false, count: 0, error: 'Webhook URL not set' };
  }

  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('./config');
    if (!db) return { success: false, count: 0, error: 'Database not initialized' };

    const snap = await getDocs(collection(db, 'users'));
    if (snap.empty) return { success: true, count: 0 };

    const usersList: SheetUserPayload[] = snap.docs.map(doc => {
      const u = doc.data();
      return {
        uid: u.uid || doc.id,
        name: u.displayName || u.name || 'Trader',
        email: u.email || '',
        phone: u.phoneNumber || u.phone || 'N/A',
        provider: u.provider || (u.email?.includes('gmail') ? 'google.com' : 'password'),
        createdAt: u.created_at || u.createdAt || new Date().toISOString(),
      };
    });

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ users: usersList }),
      mode: 'no-cors',
    });

    console.log(`[Google Sheets Sync] Successfully dispatched ${usersList.length} existing users to Google Sheet.`);
    return { success: true, count: usersList.length };
  } catch (err: any) {
    console.error('[Google Sheets Sync] Failed to sync existing users:', err);
    return { success: false, count: 0, error: err?.message || 'Sync failed' };
  }
}
