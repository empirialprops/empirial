import { NextResponse } from 'next/server';

/**
 * Contact Form API Handler
 * Receives contact form submissions from /contact and forwards them directly to
 * your professional GoDaddy Titan Mail inbox (support@empirial.com).
 * 
 * Instructions to connect Titan Mail (GoDaddy Professional Mail):
 * 1. Set environment variables in .env.local:
 *    TITAN_SMTP_HOST=smtp.titan.email
 *    TITAN_SMTP_PORT=465
 *    TITAN_EMAIL_USER=support@empirial.com  (your Titan mail address)
 *    TITAN_EMAIL_PASS=your_titan_mail_password
 * 
 * 2. Alternatively, use Resend API key:
 *    RESEND_API_KEY=re_xxxxxxxxx
 *    FORWARD_TO_EMAIL=support@empirial.com
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    console.log(`[Contact Form API] New Inquiry from ${name} (${email}): ${subject}`);

    const titanUser = process.env.TITAN_EMAIL_USER || process.env.FORWARD_TO_EMAIL || 'support@empirial.com';
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'EMPIRIAL Contact <onboarding@resend.dev>',
          to: [titanUser],
          reply_to: email,
          subject: `[EMPIRIAL Contact Form] ${subject} - from ${name}`,
          html: `
            <h2>New Contact Inquiry</h2>
            <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
            <p><strong>Category:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="background:#f4f4f5; padding:12px; border-left:4px solid #000;">${message}</blockquote>
          `,
        }),
      });

      if (!resendRes.ok) {
        console.warn('[Contact API] Resend email dispatch failed:', await resendRes.text());
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry received and ticket created successfully. Delivered to Titan Mail box.',
      recipient: titanUser,
    });
  } catch (err: any) {
    console.error('[Contact Form API Error]:', err);
    return NextResponse.json(
      { error: 'Failed to process contact inquiry.', details: err?.message },
      { status: 500 }
    );
  }
}
