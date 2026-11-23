import { NextResponse } from 'next/server';
import { enforceRateLimit } from '@/lib/rateLimit';
import { sendTransactionalEmail } from '@/lib/mailer';

// Unified Transactional Email Endpoint
// Primary: Resend API (<= 95/day cap) -> Automatic Failover: Google Apps Script (<= 95/day cap)
export async function POST(request) {
  const rl = enforceRateLimit(request, { keyPrefix: 'email_post', limit: 20, windowMs: 60_000 });
  if (rl) return rl;
  try {
    const body = await request.json();
    const to = String(body.to || body.email || '').trim();
    if (!to || !to.includes('@')) {
      return NextResponse.json({ sent: false, error: 'Valid recipient email required' }, { status: 400 });
    }

    const result = await sendTransactionalEmail({
      to,
      cc: body.cc || '',
      subject: body.subject || 'Resolve MUN 2.0 Notification',
      text: body.text || body.messageBody || body.message || '',
      html: body.html || '',
      name: body.name || 'Delegate',
      eyebrow: body.eyebrow || 'Resolve MUN 2.0',
      title: body.title || '',
      ctaLabel: body.ctaLabel || 'Open Delegate Dashboard',
      ctaUrl: body.ctaUrl || 'https://resolvemun.in/dashboard',
      highlightBox: body.highlightBox || null,
      action: body.action || 'ADMIN_SEND_CUSTOM_EMAIL',
    });

    return NextResponse.json(result, { status: result.sent ? 200 : 502 });
  } catch (err) {
    return NextResponse.json({ sent: false, error: err.message }, { status: 500 });
  }
}
