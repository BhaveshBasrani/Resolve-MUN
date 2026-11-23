import { supabase } from '@/lib/supabase';
import { buildResolveEmailHtml } from '@/lib/emailTemplates';
import { getDelegateReferralCode, RES_POINTS_PER_REFERRAL } from '@/lib/referrals';

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbyoC8dZ2L6h1Es_n3Rx3LRSwuiy_8iLklKerZK2jWseNBDzD4i3Gr7JHDNdS7jJzhuWEA/exec';
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'ResolveMUNAdmin2026@Secure';
export const RESOLVE_CC_EMAIL = process.env.RESOLVE_CC_EMAIL || 'resolve.mun@gmail.com';

// Hard daily safety cap per provider (Resend free tier = 100/day, Apps Script free tier = 100/day)
const RESEND_DAILY_CAP = 95;
const APPS_SCRIPT_DAILY_CAP = 95;

const dailyTracker = {
  date: '',
  resendCount: 0,
  appsScriptCount: 0,
  resendExhausted: false,
};

function syncDailyCounter() {
  const today = new Date().toISOString().slice(0, 10);
  if (dailyTracker.date !== today) {
    dailyTracker.date = today;
    dailyTracker.resendCount = 0;
    dailyTracker.appsScriptCount = 0;
    dailyTracker.resendExhausted = false;
  }
}

/**
 * Bulletproof Dual-Provider Transactional Mailer:
 * 1. Primary: Resend API (up to 95/day safety cap)
 * 2. Automatic Failover: Google Apps Script (when Resend hits daily cap, 429, or any error)
 * Never exceeds 100 emails/day per provider.
 */
export async function sendTransactionalEmail({
  to,
  cc = '',
  subject,
  text = '',
  html = '',
  name = 'Delegate',
  eyebrow = 'Resolve MUN 2.0',
  title = '',
  ctaLabel = 'Open Delegate Dashboard',
  ctaUrl = 'https://resolvemun.in/dashboard',
  highlightBox = null,
  action = 'ADMIN_SEND_CUSTOM_EMAIL',
}) {
  syncDailyCounter();

  const cleanTo = String(to || '').trim();
  const cleanCc = String(cc || '').trim();
  if (!cleanTo || !cleanTo.includes('@')) {
    return { sent: false, error: 'Valid recipient email required' };
  }

  const finalSubject = String(subject || 'Resolve MUN 2.0 Notification').trim();
  const finalText = String(text || '').trim();
  const finalHtml =
    html ||
    buildResolveEmailHtml({
      eyebrow,
      title: title || finalSubject,
      recipientName: name,
      bodyText: finalText,
      ctaLabel,
      ctaUrl,
      highlightBox,
    });

  // 1. Primary: Resend API (if key present, not exhausted, and under 95/day cap)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && !dailyTracker.resendExhausted && dailyTracker.resendCount < RESEND_DAILY_CAP) {
    try {
      const fromAddr = process.env.RESEND_FROM_EMAIL || 'Resolve MUN 2.0 <noreply@resolvemun.in>';
      const payload = {
        from: fromAddr,
        to: [cleanTo],
        reply_to: RESOLVE_CC_EMAIL,
        subject: finalSubject,
        text: finalText,
        html: finalHtml,
      };
      if (cleanCc && cleanCc.includes('@') && cleanCc.toLowerCase() !== cleanTo.toLowerCase()) {
        payload.cc = [cleanCc];
      }

      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const rData = await r.json().catch(() => ({}));
      if (r.ok) {
        dailyTracker.resendCount += 1;
        return {
          sent: true,
          provider: 'resend',
          id: rData.id,
          dailyCount: dailyTracker.resendCount,
        };
      }
      // If Resend daily quota / rate limit hit, mark exhausted for today and fail over to Apps Script
      if (r.status === 429 || String(rData?.message || '').toLowerCase().includes('quota') || String(rData?.message || '').toLowerCase().includes('limit')) {
        dailyTracker.resendExhausted = true;
      }
      console.warn('[mailer] Resend failed, failing over to Apps Script:', r.status, rData?.message);
    } catch (err) {
      console.warn('[mailer] Resend network error, failing over to Apps Script:', err.message);
    }
  }

  // 2. Fallback: Google Apps Script (also capped at 95/day so it never exceeds 100/day)
  if (dailyTracker.appsScriptCount >= APPS_SCRIPT_DAILY_CAP) {
    return {
      sent: false,
      provider: 'quota_guard',
      error: 'Daily email safety cap reached (95/day) across both Resend and Apps Script.',
    };
  }

  try {
    const asRes = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action,
        adminKey: ADMIN_KEY,
        email: cleanTo,
        cc: cleanCc && cleanCc.toLowerCase() !== cleanTo.toLowerCase() ? cleanCc : '',
        subject: finalSubject,
        messageBody: finalText,
        htmlBody: finalHtml,
        recipients: [{ email: cleanTo, name }],
      }),
    });

    if (asRes.status === 403) {
      return {
        sent: false,
        provider: 'apps_script',
        code: 'APPS_SCRIPT_403',
        error: 'Google Apps Script returned 403 Forbidden (check Web App "Anyone" access).',
      };
    }

    const asText = await asRes.text();
    if (asRes.ok) {
      dailyTracker.appsScriptCount += 1;
    }
    return {
      sent: asRes.ok,
      provider: 'apps_script',
      dailyCount: dailyTracker.appsScriptCount,
      raw: asText.slice(0, 200),
    };
  } catch (err) {
    return { sent: false, provider: 'apps_script', error: err.message };
  }
}

/**
 * Automatically notify the owner of a referral code (Secretariat, OC, or Delegate RES-XXXX)
 * whenever a new delegate registers with their code — CC'ing Resolve MUN Secretariat.
 */
export async function notifyReferralCodeUsed({
  referralCode,
  delegateName,
  delegateEmail,
  regId,
  feePaid,
}) {
  const code = String(referralCode || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!code || code.length < 3 || !supabase) return { sent: false, skipped: true };

  try {
    let ownerEmail = '';
    let ownerName = '';
    let rewardSummary = '';
    let portalUrl = 'https://resolvemun.in/dashboard';

    // 1. Check Secretariat & OC custom codes in system_settings.referral_codes
    const { data: sysRow } = await supabase
      .from('system_settings')
      .select('referral_codes')
      .eq('id', 'global')
      .maybeSingle();

    const codes = Array.isArray(sysRow?.referral_codes) ? sysRow.referral_codes : [];
    const customMatch = codes.find(
      (c) => String(c?.code || '').trim().toUpperCase() === code && c.active !== false
    );

    if (customMatch?.ownerEmail) {
      ownerEmail = String(customMatch.ownerEmail).trim().toLowerCase();
      ownerName = customMatch.ownerName || customMatch.label || 'Team Member';
      const discount = Number(customMatch.discountAmount || 0);
      const commission = Math.max(0, Number(customMatch.cashCommission ?? 400 - discount));
      const isOc = String(customMatch.label || '').includes('(OC)');
      portalUrl = isOc ? 'https://resolvemun.in/oc' : 'https://resolvemun.in/secretariat';
      rewardSummary = `₹${commission} cash commission (pending payment verification) · Delegate discount: ₹${discount}`;
    } else if (code.startsWith('RES-')) {
      // 2. Check Delegate personal RES-XXXX codes
      const [r1, r2] = await Promise.allSettled([
        supabase.from('delegates').select('id, reg_id, full_name, email'),
        supabase.from('delegate_applications').select('id, reg_id, name, email'),
      ]);
      const combined = [
        ...(r2.status === 'fulfilled' ? r2.value.data || [] : []),
        ...(r1.status === 'fulfilled' ? r1.value.data || [] : []),
      ];
      for (const row of combined) {
        const rawId = row.reg_id || row.id;
        const resolvedId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(rawId || ''))
          ? `RM-${String(rawId).replace(/-/g, '').slice(0, 4).toUpperCase()}`
          : String(rawId || '').replace(/^RM26-DEL-/i, 'RM-');
        const personalCode = getDelegateReferralCode(resolvedId, row.email);
        if (personalCode.toUpperCase() === code) {
          ownerEmail = String(row.email || '').trim().toLowerCase();
          ownerName = row.full_name || row.name || 'Delegate';
          portalUrl = 'https://resolvemun.in/dashboard';
          rewardSummary = `+${RES_POINTS_PER_REFERRAL} RES Points (₹100 stall credit) for BOTH you and ${delegateName} once verified!`;
          break;
        }
      }
    }

    // Avoid self-referral spam
    if (!ownerEmail || ownerEmail === String(delegateEmail || '').trim().toLowerCase()) {
      return { sent: false, skipped: true };
    }

    const subject = `Referral Code ${code} Used! — Resolve MUN 2.0 [${regId}]`;
    const bodyText =
      `Great news! ${delegateName} just registered for Resolve MUN 2.0 using your referral code ${code}.\n\n` +
      `Delegate: ${delegateName} (${regId})\n` +
      `Fee Submitted: ₹${Number(feePaid || 2500).toLocaleString('en-IN')}\n` +
      `Your Reward: ${rewardSummary}\n\n` +
      `Once our Secretariat verifies their payment UTR, your reward will automatically move from Pending to Verified on your portal.\n\n` +
      `Keep sharing your link!\nResolve MUN 2.0 Secretariat`;

    return await sendTransactionalEmail({
      to: ownerEmail,
      cc: RESOLVE_CC_EMAIL,
      name: ownerName,
      subject,
      text: bodyText,
      eyebrow: `Referral Alert · ${code}`,
      title: 'Your Referral Code Was Just Used!',
      ctaLabel: 'Track Your Earnings',
      ctaUrl: portalUrl,
      highlightBox: {
        label: `Code ${code} · New Signup`,
        value: `${delegateName} (${regId}) · ${rewardSummary}`,
      },
    });
  } catch (err) {
    console.warn('[mailer] notifyReferralCodeUsed notice:', err.message);
    return { sent: false, error: err.message };
  }
}
