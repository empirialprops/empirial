/**
 * Google Sheets Integration Module
 * Automatically appends new Firebase signup user details into a target Google Sheet via Apps Script Webhook.
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
 * Dispatch new user signup data to Google Apps Script Webhook.
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

    // Use mode: 'no-cors' or text POST for Apps Script compatibility
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(dataToSend),
      mode: 'no-cors',
    });

    console.log('[Google Sheets Sync] Successfully dispatched new user to Google Sheet:', payload.email);
    return { success: true };
  } catch (err: any) {
    console.error('[Google Sheets Sync] Failed to dispatch user to Google Sheet:', err);
    return { success: false, error: err?.message || 'Network request failed' };
  }
}
