import { NextResponse } from 'next/server';
import { buildResolveEmailHtml } from '@/lib/emailTemplates';

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbyoC8dZ2L6h1Es_n3Rx3LRSwuiy_8iLklKerZK2jWseNBDzD4i3Gr7JHDNdS7jJzhuWEA/exec';
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'ResolveMUNAdmin2026@Secure';

// Unified Transactional Email Endpoint
// Supports Resend API (if RESEND_API_KEY is set in .env.local) with Google Apps Script fallback.
export async function POST(request) {
  try {
    const body = await request.json();
    const to = String(body.to || body.email || '').trim();
    const subject = String(body.subject || 'Resolve MUN 2.0 Notification').trim();
    const text = String(body.text || body.messageBody || body.message || '').trim();
    const html =
      body.html ||
      buildResolveEmailHtml({
        eyebrow: body.eyebrow || 'Resolve MUN 2.0',
        title: body.title || subject,
        recipientName: body.name || 'Delegate',
        bodyText: text,
        ctaLabel: body.ctaLabel || 'Open Delegate Dashboard',
        ctaUrl: body.ctaUrl || 'https://resolvemun.in/dashboard',
        highlightBox: body.highlightBox || null,
      });

    if (!to || !to.includes('@')) {
      return NextResponse.json({ sent: false, error: 'Valid recipient email required' }, { status: 400 });
    }

    // 1. Primary: Resend API (if RESEND_API_KEY is configured in .env.local)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const fromAddr = process.env.RESEND_FROM_EMAIL || 'Resolve MUN 2.0 <onboarding@resend.dev>';
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: fromAddr, to: [to], subject, text, html }),
      });
      const rData = await r.json().catch(() => ({}));
      if (r.ok) {
        return NextResponse.json({ sent: true, provider: 'resend', id: rData.id });
      }
      return NextResponse.json(
        { sent: false, provider: 'resend', error: rData.message || `HTTP ${r.status}` },
        { status: 502 }
      );
    }

    // 2. Fallback: Google Apps Script Web App
    const asRes = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: body.action || 'ADMIN_SEND_CUSTOM_EMAIL',
        adminKey: ADMIN_KEY,
        email: to,
        subject,
        messageBody: text,
        recipients: [{ email: to, name: body.name || 'Delegate' }],
      }),
    });

    if (asRes.status === 403) {
      return NextResponse.json(
        {
          sent: false,
          provider: 'apps_script',
          code: 'APPS_SCRIPT_403',
          error:
            'Google Apps Script returned 403 Forbidden. In Apps Script click Deploy -> Manage deployments -> Edit -> set "Who has access" to "Anyone", OR add RESEND_API_KEY to .env.local.',
        },
        { status: 502 }
      );
    }

    const asText = await asRes.text();
    return NextResponse.json({ sent: asRes.ok, provider: 'apps_script', raw: asText.slice(0, 200) });
  } catch (err) {
    return NextResponse.json({ sent: false, error: err.message }, { status: 500 });
  }
}
