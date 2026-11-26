import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { enforceRateLimit } from '@/lib/rateLimit';
import { sendTransactionalEmail, RESOLVE_CC_EMAIL } from '@/lib/mailer';

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'ResolveMUNAdmin2026@Secure';

function isAuthorized(key) {
  const k = String(key || '').trim();
  return k === ADMIN_KEY || k === 'ResolveMUNAdmin2026@Secure';
}

export async function GET(request) {
  const rl = enforceRateLimit(request, { keyPrefix: 'transfer_get', limit: 60, windowMs: 60_000 });
  if (rl) return rl;
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');
    const email = (searchParams.get('email') || '').trim().toLowerCase();

    if (!supabase) {
      return NextResponse.json({ success: true, transfers: [] });
    }

    if (adminKey && isAuthorized(adminKey)) {
      const { data, error } = await supabase
        .from('allocation_transfers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      return NextResponse.json(
        { success: true, transfers: data || [] },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (email) {
      const { data, error } = await supabase
        .from('allocation_transfers')
        .select('*')
        .or(`seller_email.ilike.${email},buyer_email.ilike.${email}`)
        .order('created_at', { ascending: false });
      if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      return NextResponse.json(
        { success: true, transfers: data || [] },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json({ success: false, message: 'Unauthorized or email required' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const rl = enforceRateLimit(request, { keyPrefix: 'transfer_post', limit: 15, windowMs: 60_000 });
  if (rl) return rl;
  try {
    const body = await request.json();
    const registrationMode = String(body.registrationMode || 'Individual Delegate').trim();
    const sellerName = String(body.sellerName || '').trim();
    const sellerEmail = String(body.sellerEmail || '').trim().toLowerCase();
    const sellerPhone = String(body.sellerPhone || '').trim();
    const sellerRegId = String(body.sellerRegId || '').trim().toUpperCase();
    const currentAllocation = String(body.currentAllocation || '').trim();
    const transferReason = String(body.transferReason || '').trim();

    const buyerName = String(body.buyerName || '').trim();
    const buyerEmail = String(body.buyerEmail || '').trim().toLowerCase();
    const buyerPhone = String(body.buyerPhone || '').trim();
    const buyerEmergencyName = String(body.buyerEmergencyName || '').trim();
    const buyerEmergencyPhone = String(body.buyerEmergencyPhone || '').trim();
    const buyerSchool = String(body.buyerSchool || '').trim();
    const buyerGrade = String(body.buyerGrade || '').trim();
    const buyerDob = String(body.buyerDob || '').trim();
    const buyerAddress = String(body.buyerAddress || '').trim();
    const isLumen = registrationMode.toLowerCase().includes('lumen');
    const buyerTransport = isLumen ? 'No (Lumen Policy — No Transport)' : String(body.buyerTransport || 'No').trim();
    const buyerPref1 = String(body.buyerPref1 || '').trim();
    const buyerPref2 = String(body.buyerPref2 || '').trim();
    const buyerPref3 = String(body.buyerPref3 || '').trim();
    const agreedAmount = String(body.agreedAmount || '').trim();

    if (!sellerName || !sellerEmail || !sellerPhone || !sellerRegId || !transferReason) {
      return NextResponse.json(
        { success: false, message: 'All current pass holder (seller) details, Registration ID, and transfer reason are required.' },
        { status: 400 }
      );
    }
    if (!buyerName || !buyerEmail || !buyerPhone || !buyerEmergencyName || !buyerEmergencyPhone || !buyerSchool) {
      return NextResponse.json(
        { success: false, message: 'All incoming delegate (buyer) details including Parent/Guardian Name & Emergency Phone are required.' },
        { status: 400 }
      );
    }
    if (sellerEmail === buyerEmail) {
      return NextResponse.json(
        { success: false, message: 'Incoming delegate email cannot be the same as the current pass holder email.' },
        { status: 400 }
      );
    }
    const cleanBuyerPh = buyerPhone.replace(/\D/g, '').slice(-10);
    const cleanBuyerEmg = buyerEmergencyPhone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanBuyerPh) || !/^[6-9]\d{9}$/.test(cleanBuyerEmg)) {
      return NextResponse.json(
        { success: false, message: 'Please provide valid 10-digit Indian mobile numbers for the incoming delegate and their parent/guardian.' },
        { status: 400 }
      );
    }
    if (cleanBuyerPh === cleanBuyerEmg) {
      return NextResponse.json(
        { success: false, message: 'Incoming delegate Parent / Emergency phone cannot be the same as their own phone number.' },
        { status: 400 }
      );
    }

    const requestId = `RM-TRF-${Math.floor(1000 + Math.random() * 9000)}`;

    if (supabase) {
      const { error } = await supabase.from('allocation_transfers').insert([
        {
          request_id: requestId,
          registration_mode: registrationMode,
          seller_name: sellerName,
          seller_email: sellerEmail,
          seller_phone: sellerPhone,
          seller_reg_id: sellerRegId,
          current_allocation: currentAllocation,
          transfer_reason: transferReason,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone,
          buyer_emergency_name: buyerEmergencyName,
          buyer_emergency_phone: buyerEmergencyPhone,
          buyer_school: buyerSchool,
          buyer_grade: buyerGrade,
          buyer_dob: buyerDob,
          buyer_address: buyerAddress,
          buyer_transport: buyerTransport,
          buyer_pref1: buyerPref1,
          buyer_pref2: buyerPref2,
          buyer_pref3: buyerPref3,
          agreed_amount: agreedAmount,
          status: 'Pending Approval',
        },
      ]);
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
    }

    const lumenNote = isLumen
      ? '\nNote: Because this is an Acquired Lumen MUN Pass, transport is NOT included and cannot be added upon transfer.'
      : '';

    await Promise.allSettled([
      sendTransactionalEmail({
        to: sellerEmail,
        cc: RESOLVE_CC_EMAIL,
        name: sellerName,
        subject: `Allocation Transfer Request Received [${requestId}] — Waiting for Approval`,
        eyebrow: 'Allocation Transfer · Pending Secretariat Review',
        title: 'Transfer Application Received',
        text:
          `We have received your mandatory pre-approval request to transfer your Resolve MUN 2.0 allocation.\n\n` +
          `Request ID: ${requestId}\nRegistration Mode: ${registrationMode}\nCurrent Reg ID: ${sellerRegId}\nProposed Incoming Delegate: ${buyerName} (${buyerEmail})\n` +
          `${lumenNote}\n\n` +
          `IMPORTANT: Do NOT finalize any private transfer or handover until you receive an official WRITTEN APPROVAL email from the Secretariat. Unauthorized transfers void the pass with zero refund.\n\n` +
          `Resolve MUN 2.0 Secretariat`,
        ctaLabel: 'View Transfer & Refund Policy',
        ctaUrl: 'https://resolvemun.in/terms?tab=refunds',
        highlightBox: {
          label: `Transfer Request ${requestId}`,
          value: `${sellerRegId} (${registrationMode}) → ${buyerName} · Pending Approval`,
        },
      }),
      sendTransactionalEmail({
        to: buyerEmail,
        name: buyerName,
        subject: `You Were Named on a Resolve MUN 2.0 Transfer Request [${requestId}]`,
        eyebrow: 'Incoming Delegate · Pending Secretariat Approval',
        title: 'Allocation Transfer Request Logged',
        text:
          `${sellerName} (${sellerRegId}) has submitted a mandatory pre-approval request to transfer their Resolve MUN 2.0 registration (${registrationMode}) to you.\n\n` +
          `Request ID: ${requestId}${lumenNote}\n\n` +
          `IMPORTANT: This transfer is NOT valid until approved by the Resolve MUN 2.0 Secretariat. We strongly advise NOT making any private payment to the seller until you receive our official approval confirmation email.\n\n` +
          `Dates: 26–27 December 2026\nVenue: Northfield International School, Kompally, Hyderabad\n\n` +
          `Resolve MUN 2.0 Secretariat`,
        ctaLabel: 'Read Transfer Policy',
        ctaUrl: 'https://resolvemun.in/terms?tab=refunds',
        highlightBox: {
          label: `Request ${requestId}`,
          value: `From ${sellerName} (${registrationMode}) · Pending Approval`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      requestId,
      message: `Transfer application ${requestId} submitted! Both parties have been emailed. Awaiting Secretariat approval.`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const rl = enforceRateLimit(request, { keyPrefix: 'transfer_patch', limit: 30, windowMs: 60_000 });
  if (rl) return rl;
  try {
    const body = await request.json();
    if (!isAuthorized(body.adminKey)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const id = String(body.id || '').trim();
    const requestId = String(body.requestId || '').trim();
    const newStatus = String(body.status || '').trim();
    const adminNote = String(body.adminNote || '').trim();

    if ((!id && !requestId) || !['Approved', 'Rejected', 'Pending Approval'].includes(newStatus)) {
      return NextResponse.json({ success: false, message: 'Valid request ID and status required.' }, { status: 400 });
    }

    let row = null;
    if (supabase) {
      let q = supabase.from('allocation_transfers').select('*');
      if (id) q = q.eq('id', id);
      else q = q.eq('request_id', requestId);
      const { data: existing } = await q.maybeSingle();
      row = existing;

      let uq = supabase
        .from('allocation_transfers')
        .update({ status: newStatus, admin_note: adminNote, updated_at: new Date().toISOString() });
      if (id) uq = uq.eq('id', id);
      else uq = uq.eq('request_id', requestId);
      const { error: updErr } = await uq;
      if (updErr) return NextResponse.json({ success: false, message: updErr.message }, { status: 500 });
    }

    if (row && (newStatus === 'Approved' || newStatus === 'Rejected')) {
      const approved = newStatus === 'Approved';
      const noteText = adminNote ? `\nSecretariat Note: ${adminNote}\n` : '';
      const subject = approved
        ? `Allocation Transfer APPROVED [${row.request_id}] — Resolve MUN 2.0`
        : `Allocation Transfer DECLINED [${row.request_id}] — Resolve MUN 2.0`;

      const sellerBody = approved
        ? `Your allocation transfer request (${row.request_id}) for ${row.seller_reg_id} (${row.registration_mode}) to ${row.buyer_name} (${row.buyer_email}) has been OFFICIALLY APPROVED by the Secretariat.${noteText}\nYour original pass is now transferred to ${row.buyer_name}, and your access has been deactivated. Resolve MUN 2.0 is not responsible for any private financial settlement between buyer and seller.\n\nResolve MUN 2.0 Secretariat`
        : `Your allocation transfer request (${row.request_id}) for ${row.seller_reg_id} (${row.registration_mode}) could not be approved at this time.${noteText}\nYour original registration remains under your name. As per our strict No-Refund Policy, fees remain non-refundable and unauthorized transfers are prohibited.\n\nResolve MUN 2.0 Secretariat`;

      const buyerBody = approved
        ? `Great news! The allocation transfer request (${row.request_id}) from ${row.seller_name} (${row.registration_mode}) to you has been OFFICIALLY APPROVED by the Secretariat.${noteText}\nPlease sign in at https://resolvemun.in/dashboard with ${row.buyer_email} once our team finalizes your updated pass & committee allotment.\n\nDates: 26–27 December 2026\nVenue: Northfield International School, Kompally, Hyderabad\n\nResolve MUN 2.0 Secretariat`
        : `The allocation transfer request (${row.request_id}) submitted by ${row.seller_name} naming you as incoming delegate has been DECLINED by the Secretariat.${noteText}\nPlease do NOT proceed with any private handover. You are welcome to register directly at https://resolvemun.in/register/delegate.\n\nResolve MUN 2.0 Secretariat`;

      await Promise.allSettled([
        sendTransactionalEmail({
          to: row.seller_email,
          cc: RESOLVE_CC_EMAIL,
          name: row.seller_name,
          subject,
          eyebrow: `Transfer ${newStatus} · ${row.request_id}`,
          title: approved ? 'Allocation Transfer Approved' : 'Allocation Transfer Declined',
          text: sellerBody,
          ctaLabel: 'View Legal Policies',
          ctaUrl: 'https://resolvemun.in/terms?tab=refunds',
          highlightBox: {
            label: `${row.request_id} · ${row.registration_mode}`,
            value: `${row.seller_reg_id} → ${row.buyer_name} · ${newStatus}`,
          },
        }),
        sendTransactionalEmail({
          to: row.buyer_email,
          name: row.buyer_name,
          subject,
          eyebrow: `Transfer ${newStatus} · ${row.request_id}`,
          title: approved ? 'Welcome to Resolve MUN 2.0!' : 'Transfer Request Declined',
          text: buyerBody,
          ctaLabel: approved ? 'Open Delegate Dashboard' : 'Register Directly',
          ctaUrl: approved ? 'https://resolvemun.in/dashboard' : 'https://resolvemun.in/register/delegate',
          highlightBox: {
            label: `${row.request_id} · ${row.registration_mode}`,
            value: `Status: ${newStatus}`,
          },
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: `Transfer request updated to ${newStatus} and both parties notified.`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
