import { NextRequest, NextResponse } from 'next/server';

export interface SyncUserRequest {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  provider: 'google.com' | 'discord.com' | 'password' | string;
  createdAt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SyncUserRequest = await req.json();

    if (!body.uid || !body.email) {
      return NextResponse.json(
        { error: 'Missing required user fields (uid, email)' },
        { status: 400 }
      );
    }

    const webhookUrl =
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
      '';

    if (!webhookUrl) {
      console.warn('[Sync Sheet API] GOOGLE_SHEETS_WEBHOOK_URL is not set.');
      return NextResponse.json(
        { error: 'Google Sheets Webhook URL not configured on server' },
        { status: 500 }
      );
    }

    const payload = {
      uid: body.uid,
      name: body.name || 'Trader',
      email: body.email,
      phone: body.phone || 'N/A',
      provider: body.provider || 'password',
      createdAt: body.createdAt || new Date().toISOString(),
    };

    // Forward to Google Apps Script Webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseJson = { status: 'success' };
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      // response might be raw text
    }

    return NextResponse.json({
      success: true,
      data: responseJson,
      syncedUser: payload.email,
    });
  } catch (error: any) {
    console.error('[Sync Sheet API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync user with Google Sheet' },
      { status: 500 }
    );
  }
}
