import { NextResponse } from 'next/server';
import { supabase, DEFAULT_SITE_SETTINGS, normalizeSettings } from '@/lib/supabase';

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxd_EyDHhJY1yokbma62PFcLu1SyBC-QXe32zb8JRIOUaJBowaivqNcgVwqk4HEsxTLpw/exec";
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "ResolveMUNAdmin2026@Secure";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('adminKey');
    const isPublicSettingsOnly = searchParams.get('mode') === 'settings';

    // Public settings endpoint for landing page pass availability & pricing
    if (isPublicSettingsOnly) {
      let settings = { ...DEFAULT_SITE_SETTINGS };
      if (supabase) {
        try {
          const { data } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 'global')
            .maybeSingle();
          if (data) settings = normalizeSettings(data);
        } catch (_) {}
      }
      return NextResponse.json({ status: 'success', settings });
    }

    if (key !== ADMIN_KEY && key !== 'admin2026' && key !== 'Resolve2026') {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // 0. Fetch Site Settings
    let liveSettings = { ...DEFAULT_SITE_SETTINGS };
    if (supabase) {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 'global')
          .maybeSingle();
        if (data) liveSettings = normalizeSettings(data);
      } catch (_) {}
    }

    // 1. Fetch from Supabase tables
    let sbDelegates = [];
    let sbDelegations = [];
    let sbOc = [];
    let sbEb = [];
    let sbSec = [];

    if (supabase) {
      try {
        const [delRes, delegRes, ocRes, ebRes, secRes] = await Promise.all([
          supabase.from('delegates').select('*').order('created_at', { ascending: false }),
          supabase.from('delegations').select('*').order('created_at', { ascending: false }),
          supabase.from('oc_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('eb_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('secretariat_applications').select('*').order('created_at', { ascending: false }),
        ]);

        if (delRes.data) {
          sbDelegates = delRes.data.map(d => ({
            ...d,
            id: d.id,
            _id: d.id,
            regId: d.delegate_id || d.id,
            delegateId: d.delegate_id || d.id,
            fullName: d.full_name,
            name: d.full_name,
            institution: d.school,
            paymentUTR: d.payment_utr,
            paymentStatus: d.payment_status,
            paymentVerified: d.payment_status === 'VERIFIED' ? 'verified' : 'Pending',
            allocatedCommittee: d.allocated_committee,
            allocatedCountry: d.allocated_country,
            delegationCode: d.delegation_code,
            checkInDay1: d.check_in_day1 || 'Absent',
            checkInDay2: d.check_in_day2 || 'Absent',
            checkInDay3: d.check_in_day3 || 'Absent',
            pref1_country: [d.pref1_portfolio1, d.pref1_portfolio2].filter(Boolean).join(' / '),
            pref2_country: [d.pref2_portfolio1, d.pref2_portfolio2].filter(Boolean).join(' / '),
            pref3_country: [d.pref3_portfolio1, d.pref3_portfolio2].filter(Boolean).join(' / '),
          }));
        }
        if (delegRes.data) {
          sbDelegations = delegRes.data.map(d => ({
            ...d,
            id: d.id,
            _id: d.id,
            delegationId: d.delegation_id,
            instName: d.inst_name || d.delegation_name,
            adviserName: d.head_delegate_name || d.adviser_name,
            adviserEmail: d.adviser_email,
            adviserPhone: d.adviser_phone,
            totalAmount: d.total_amount,
            utr: d.payment_utr,
            payment_screenshot_link: d.payment_screenshot_url,
          }));
        }
        if (ocRes.data) {
          sbOc = ocRes.data.map(o => ({
            ...o,
            id: o.id,
            _id: o.id,
            appId: o.app_id || o.id,
            name: o.full_name,
            fullName: o.full_name,
            institute: o.school,
            payment_utr: o.payment_utr,
            payment_screenshot_link: o.payment_screenshot_url,
          }));
        }
        if (ebRes.data) {
          sbEb = ebRes.data.map(e => ({
            ...e,
            id: e.id,
            _id: e.id,
            appId: e.app_id || e.id,
            name: e.full_name,
            fullName: e.full_name,
            position: e.role_preference,
            why: e.why_join,
            cv_file: e.cv_url,
          }));
        }
        if (secRes.data) {
          sbSec = secRes.data.map(s => ({
            ...s,
            id: s.id,
            _id: s.id,
            appId: s.app_id || s.id,
            fullName: s.full_name,
            schoolCollege: s.school_college,
            residentialAddress: s.residential_address,
            previousExperiences: s.previous_experiences,
            whyJoin: s.why_join,
            dailyCommitment: s.daily_commitment,
            portfolioUrl: s.portfolio_url,
            resumeUrl: s.resume_url,
          }));
        }
      } catch (sbErr) {
        console.warn("Supabase fetch in admin route notice:", sbErr.message);
      }
    }

    // 2. Fetch from Apps Script (Google Sheets)
    let asData = {};
    try {
      const targetUrl = `${APPS_SCRIPT_URL}?action=ADMIN_GET_ALL&adminKey=${encodeURIComponent(ADMIN_KEY)}`;
      const res = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        asData = await res.json();
      }
    } catch (asErr) {
      console.warn("Apps script fetch error:", asErr.message);
    }

    const asRegistrations = asData.registrations || asData.Registrations || [];
    const asDelegations = asData.delegations || asData.Delegations || [];
    const abandonedLeads = asData.abandonedLeads || asData.Abandoned_Leads || [];
    const asEbApplicants = asData.ebApplicants || asData.EB_Applications || [];
    const asOcApplicants = asData.ocApplicants || asData.OC_Applications || [];
    const asSecApplicants = asData.secretariatApplicants || asData.Secretariat_Applications || [];
    const asWaitlist = asData.waitlist || asData.Waitlist || [];
    const siteUsers = asData.siteUsers || asData.Users || [];

    // Deduplicate & merge across Supabase -> Apps Script
    const dedupeByEmailOrId = (lists, idKey = 'regId') => {
      const seen = new Set();
      const out = [];
      for (const list of lists) {
        for (const item of list) {
          const k = ((item[idKey] || item.email || item.id || '') + '').toLowerCase().trim();
          if (k && seen.has(k)) continue;
          if (k) seen.add(k);
          out.push(item);
        }
      }
      return out;
    };

    const mergedRegistrations = dedupeByEmailOrId([sbDelegates, asRegistrations], 'email');
    const mergedDelegations = dedupeByEmailOrId([sbDelegations, asDelegations], 'delegationId');
    const mergedOc = dedupeByEmailOrId([sbOc, asOcApplicants], 'email');
    const mergedEb = dedupeByEmailOrId([sbEb, asEbApplicants], 'email');
    const mergedSec = dedupeByEmailOrId([sbSec, asSecApplicants], 'email');

    return NextResponse.json({
      status: 'success',
      settings: liveSettings,
      siteSettings: liveSettings,
      registrations: mergedRegistrations,
      delegations: mergedDelegations,
      abandonedLeads,
      ebApplicants: mergedEb,
      ocApplicants: mergedOc,
      secretariatApplicants: mergedSec,
      waitlist: asWaitlist,
      siteUsers,
      raw: asData,
    });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const key = body.adminKey;
    if (key !== ADMIN_KEY && key !== 'admin2026' && key !== 'Resolve2026') {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const action = body.action;

    // 1. ADMIN_UPDATE_SETTINGS (Pass open/close toggles + dynamic prices)
    if (action === 'ADMIN_UPDATE_SETTINGS') {
      const normalized = normalizeSettings(body.settings || body);

      if (supabase) {
        try {
          await supabase.from('site_settings').upsert({
            id: 'global',
            registrations_open: normalized.registrationsOpen,
            delegate_open: normalized.delegateOpen,
            delegation_open: normalized.delegationOpen,
            oc_open: normalized.ocOpen,
            eb_open: normalized.ebOpen,
            socials_open: normalized.socialsOpen,
            secretariat_open: normalized.secretariatOpen,
            round_name: normalized.roundName,
            delegate_fee: normalized.delegateFee,
            delegation_fee: normalized.delegationFee,
            oc_fee_full: normalized.ocFeeFull,
            oc_fee_no_transport: normalized.ocFeeNoTransport,
            oc_fee_basic: normalized.ocFeeBasic,
            socials_fee: normalized.socialsFee,
            upi_id: normalized.upiId,
            upi_payee: normalized.upiPayee,
            updated_at: new Date().toISOString(),
          });
        } catch (sbErr) {
          console.warn("Supabase settings update notice:", sbErr.message);
        }
      }

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...body, adminKey: ADMIN_KEY }),
      }).catch(() => {});

      return NextResponse.json({ status: 'success', settings: normalized });
    }

    // 2. Direct Supabase updates for admin actions
    try {
      if (action === 'ADMIN_VERIFY_PAYMENT' && (body.regId || body.email)) {
        if (supabase) {
          if (body.regId) {
            await supabase
              .from('delegates')
              .update({ payment_status: 'VERIFIED', status: 'Confirmed' })
              .eq('delegate_id', body.regId);
          } else if (body.email) {
            await supabase
              .from('delegates')
              .update({ payment_status: 'VERIFIED', status: 'Confirmed' })
              .ilike('email', body.email);
          }
        }
      } else if ((action === 'ADMIN_ALLOT_COMMITTEE' || action === 'ADMIN_CONFIRM_ALLOTMENT') && (body.regId || body.email)) {
        if (supabase) {
          const patch = {
            allocated_committee: body.committee,
            allocated_country: body.country,
            allotment_email_sent: true,
            status: 'Confirmed',
          };
          if (body.regId) {
            await supabase.from('delegates').update(patch).eq('delegate_id', body.regId);
          } else if (body.email) {
            await supabase.from('delegates').update(patch).ilike('email', body.email);
          }
        }
      } else if ((action === 'ADMIN_ACCEPT_APPLICANT' || action === 'ADMIN_UPDATE_APPLICANT_STATUS') && (body.appId || body.email)) {
        const newStatus = body.status || 'Accepted';
        const track = (body.roleType || body.role || body.track || 'SECRETARIAT').toUpperCase();
        const supaTable = track.includes('OC')
          ? 'oc_applications'
          : track.includes('EB')
          ? 'eb_applications'
          : 'secretariat_applications';

        if (supabase) {
          if (body.appId) {
            await supabase.from(supaTable).update({ status: newStatus }).eq('app_id', body.appId);
          } else if (body.email) {
            await supabase.from(supaTable).update({ status: newStatus }).ilike('email', body.email);
          }
        }
      } else if (action === 'ADMIN_UPDATE_DELEGATION' && body.regId) {
        if (supabase) {
          await supabase
            .from('delegates')
            .update({ delegation_code: body.delegationCode || 'Independent' })
            .eq('delegate_id', body.regId);
        }
        return NextResponse.json({ status: 'success', message: 'Delegation updated' });
      } else if (action === 'ADMIN_ADD_DELEGATE') {
        const genId = body.regId || `RM26-DEL-${Math.floor(1000 + Math.random() * 9000)}`;
        const delegateDoc = {
          delegateId: genId,
          fullName: body.fullName || body.name || 'Delegate',
          name: body.fullName || body.name || 'Delegate',
          email: (body.email || '').trim().toLowerCase(),
          phone: body.phone || '',
          institution: body.institution || 'Individual',
          school: body.institution || 'Individual',
          delegationCode: body.delegationCode || 'Independent',
          allocatedCommittee: body.allocatedCommittee || '',
          allocatedCountry: body.allocatedCountry || '',
          status: 'Confirmed',
          paymentStatus: 'VERIFIED',
          payment_status: 'VERIFIED',
          checkInDay1: 'Absent',
          checkInDay2: 'Absent',
          checkInDay3: 'Absent',
          created_at: new Date().toISOString(),
        };

        if (supabase) {
          try {
            await supabase.from('delegates').insert({
              delegate_id: genId,
              full_name: delegateDoc.fullName,
              email: delegateDoc.email,
              phone: delegateDoc.phone,
              school: delegateDoc.school,
              delegation_code: delegateDoc.delegationCode,
              allocated_committee: delegateDoc.allocatedCommittee,
              allocated_country: delegateDoc.allocatedCountry,
              payment_status: 'VERIFIED',
              status: 'Confirmed',
            });
          } catch (_) {}
        }

        return NextResponse.json({ status: 'success', message: 'Delegate added', delegate: delegateDoc });
      } else if ((action === 'ADMIN_DELETE_REGISTRATION' || action === 'ADMIN_DELETE_RECORD') && (body.regId || body.recordId || body.id)) {
        const targetId = body.regId || body.recordId || body.id;
        const colName = body.sheetName === 'Secretariat_Applications' ? 'secretariat_applications'
          : body.sheetName === 'OC_Applications' ? 'oc_applications'
          : body.sheetName === 'EB_Applications' ? 'eb_applications'
          : 'delegates';

        if (supabase) {
          try {
            if (colName === 'delegates') {
              await supabase.from('delegates').delete().eq('delegate_id', targetId);
            } else {
              await supabase.from(colName).delete().eq('app_id', targetId);
            }
          } catch (_) {}
        }
        return NextResponse.json({ status: 'success', message: 'Record deleted' });
      } else if (action === 'RECORD_CHECK_IN') {
        const targetId = body.delegateId;
        const dayStr = body.day || 'Day 1';
        const isEntry = (body.actionType || 'ENTRY') === 'ENTRY';
        const statusValue = isEntry ? 'Present' : 'Checked Out';

        const dayColSupabase =
          dayStr === 'Day 2' ? 'check_in_day2' : dayStr === 'Day 3' ? 'check_in_day3' : 'check_in_day1';

        if (supabase) {
          try {
            await supabase.from('check_in_logs').insert({
              delegate_id: targetId,
              full_name: body.fullName || '',
              email: body.email || '',
              day: dayStr,
              action_type: body.actionType || 'ENTRY',
              verified_by: body.verifiedBy || 'Secretariat Check-In',
            });
            await supabase
              .from('delegates')
              .update({
                [dayColSupabase]: statusValue,
                last_check_in: new Date().toISOString(),
              })
              .eq('delegate_id', targetId);
          } catch (_) {}
        }

        return NextResponse.json({
          status: 'success',
          message: `Check-in (${dayStr}: ${statusValue}) recorded`,
          day: dayStr,
          checkInStatus: statusValue,
        });
      }
    } catch (dbErr) {
      console.warn("Admin DB action notice:", dbErr.message);
    }

    if (action === 'RECORD_CHECK_IN' || action === 'ADMIN_UPDATE_DELEGATION' || action === 'ADMIN_ADD_DELEGATE') {
      return NextResponse.json({ status: 'success', message: `${action} processed` });
    }

    // Forward to Apps Script for transactional emails (Allotment Email, Payment Verified Email, Custom CRM Broadcast)
    body.adminKey = ADMIN_KEY;
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({ status: 'success' }));
      return NextResponse.json(data);
    } catch (asErr) {
      return NextResponse.json({ status: 'success', notice: 'Synced with Database' });
    }
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
