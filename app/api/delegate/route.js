import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDelegateReferralCode, getStallCouponCode, calculateResStats, isReferralVerified } from '@/lib/referrals';
import { enforceRateLimit } from '@/lib/rateLimit';

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbyoC8dZ2L6h1Es_n3Rx3LRSwuiy_8iLklKerZK2jWseNBDzD4i3Gr7JHDNdS7jJzhuWEA/exec";

export async function GET(request) {
  const rl = enforceRateLimit(request, { keyPrefix: 'delegate_get', limit: 60, windowMs: 60_000 });
  if (rl) return rl;
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim()?.toLowerCase();
    const userId = searchParams.get('userId')?.trim();

    if (!email && !userId) {
      return NextResponse.json({ found: false, message: 'Email or userId required' }, { status: 400 });
    }

    // 1. Check Supabase across all 6 application tracks with dual table name fallbacks
    if (supabase && email) {
      try {
        // 1A. Delegate (check 'delegates' then 'delegate_applications')
        let delRow = null;
        try {
          const res = await supabase.from('delegates').select('*').ilike('email', email).limit(1).maybeSingle();
          delRow = res.data;
        } catch (_) {}

        if (!delRow) {
          try {
            const res = await supabase.from('delegate_applications').select('*').ilike('email', email).limit(1).maybeSingle();
            delRow = res.data;
          } catch (_) {}
        }

        if (delRow) {
          const rawId = delRow.reg_id || delRow.delegate_id || delRow.regId || delRow.id;
          const resolvedRegId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(rawId || ''))
            ? `RM-${String(rawId).replace(/-/g, '').slice(0, 4).toUpperCase()}`
            : String(rawId || '').replace(/^RM26-DEL-/i, 'RM-');
          const personalRefCode = getDelegateReferralCode(resolvedRegId, delRow.email || email);
          const personalCouponCode = getStallCouponCode(resolvedRegId, delRow.email || email);

          // Query referrals attributed to this delegate's personal RES-XXXX code
          let referredRows = [];
          try {
            const [ref1, ref2] = await Promise.allSettled([
              supabase.from('delegates').select('full_name, email, payment_status, status, created_at').ilike('referral', personalRefCode),
              supabase.from('delegate_applications').select('name, email, payment_status, status, created_at').ilike('referral', personalRefCode),
            ]);
            const seen = new Set();
            const combined = [
              ...(ref1.status === 'fulfilled' ? ref1.value.data || [] : []),
              ...(ref2.status === 'fulfilled' ? ref2.value.data || [] : []),
            ];
            for (const row of combined) {
              const em = String(row.email || '').trim().toLowerCase();
              // Exclude self-referrals and duplicates
              if (em && em !== (delRow.email || email).toLowerCase() && !seen.has(em)) {
                seen.add(em);
                referredRows.push(row);
              }
            }
          } catch (_) {}

          const usedReferralCode = String(delRow.referral || delRow.referral_code || '').trim().toUpperCase();
          const hasMutualResBonus =
            usedReferralCode.startsWith('RES-') &&
            usedReferralCode.length >= 7 &&
            usedReferralCode !== personalRefCode.toUpperCase();
          const signupBonus = hasMutualResBonus
            ? { usedCode: usedReferralCode, verified: isReferralVerified(delRow) }
            : null;

          const referralStats = {
            code: personalRefCode,
            couponCode: personalCouponCode,
            ...calculateResStats(referredRows, signupBonus),
          };

          const delegate = {
            ...delRow,
            id: delRow.id,
            _id: delRow.id,
            regId: resolvedRegId,
            delegateId: resolvedRegId,
            referralCode: personalRefCode,
            couponCode: personalCouponCode,
            referralStats,
            fullName: delRow.full_name || delRow.name || '',
            name: delRow.full_name || delRow.name || '',
            email: delRow.email || '',
            phone: delRow.phone || '',
            grade: delRow.grade || '',
            dob: delRow.dob || '',
            institution: delRow.school || delRow.institute || delRow.institution || 'Individual Delegate',
            institute: delRow.school || delRow.institute || '',
            address: delRow.address || delRow.residential_address || '',
            transport: delRow.transport || delRow.transport_needed || 'No',
            experience: delRow.experience || delRow.mun_experience || '',
            emergencyName: delRow.emergency_name || delRow.parent_name || '',
            emergencyPhone: delRow.emergency_phone || delRow.parent_phone || '',
            pref1_committee: delRow.pref1_committee || '',
            pref1_country: delRow.pref1_country || delRow.pref1_portfolio1 || '',
            pref2_committee: delRow.pref2_committee || '',
            pref2_country: delRow.pref2_country || delRow.pref2_portfolio1 || '',
            pref3_committee: delRow.pref3_committee || '',
            pref3_country: delRow.pref3_country || delRow.pref3_portfolio1 || '',
            preferencesUpdatedCount: Number(delRow.preferences_updated_count || 0),
            preferencesLocked: Number(delRow.preferences_updated_count || 0) >= 1,
            pref1: delRow.pref1_committee
              ? `${delRow.pref1_committee} · ${[delRow.pref1_portfolio1 || delRow.pref1_country, delRow.pref1_portfolio2].filter(Boolean).join(' / ') || 'General'}`
              : null,
            pref2: delRow.pref2_committee
              ? `${delRow.pref2_committee} · ${[delRow.pref2_portfolio1 || delRow.pref2_country, delRow.pref2_portfolio2].filter(Boolean).join(' / ') || 'General'}`
              : null,
            pref3: delRow.pref3_committee
              ? `${delRow.pref3_committee} · ${[delRow.pref3_portfolio1 || delRow.pref3_country, delRow.pref3_portfolio2].filter(Boolean).join(' / ') || 'General'}`
              : null,
            status: delRow.status || 'Confirmed',
            paymentStatus: (() => {
              const rawPay = String(delRow.payment_status || '').toUpperCase().trim();
              const rawSt = String(delRow.status || '').toUpperCase().trim();
              if (rawPay.includes('FAIL') || rawPay.includes('REJECT') || rawSt.includes('FAIL')) return 'FAILED';
              if (rawPay.includes('PENDING') || rawPay.includes('REVIEW')) return 'PENDING_VERIFICATION';
              if (rawPay === 'VERIFIED' || rawPay === 'PAID' || rawPay === 'APPROVED' || rawPay === 'CONFIRMED') return 'VERIFIED';
              return 'PENDING_VERIFICATION';
            })(),
            paymentUTR: delRow.payment_utr || '',
            allocatedCommittee: delRow.allocated_committee || '',
            allocatedCountry: delRow.allocated_country || '',
            delegationCode: delRow.delegation_code || 'Independent',
            checkInDay1: delRow.check_in_day1 || 'Absent',
            checkInDay2: delRow.check_in_day2 || 'Absent',
            checkInDay3: delRow.check_in_day3 || 'Absent',
            roleType: 'DELEGATE',
            created_at: delRow.created_at || '',
          };
          return NextResponse.json({ found: true, delegate, referralStats });
        }

        // 1B. OC Applications
        const { data: ocRow } = await supabase
          .from('oc_applications')
          .select('*')
          .ilike('email', email)
          .limit(1)
          .maybeSingle();

        if (ocRow) {
          return NextResponse.json({
            found: true,
            delegate: {
              ...ocRow,
              id: ocRow.id,
              regId: ocRow.app_id || `RM26-OC-${String(ocRow.id).slice(0, 4).toUpperCase()}`,
              delegateId: ocRow.app_id || `RM26-OC-${String(ocRow.id).slice(0, 4).toUpperCase()}`,
              fullName: ocRow.full_name || 'OC Applicant',
              email: ocRow.email || email,
              institution: ocRow.school || 'Organizing Committee',
              status: ocRow.status || 'Pending Approval',
              paymentStatus:
                String(ocRow.payment_status || '').toUpperCase() === 'VERIFIED' ||
                ocRow.status === 'Approved' ||
                ocRow.status === 'Accepted'
                  ? 'VERIFIED'
                  : 'PENDING_VERIFICATION',
              paymentUTR: ocRow.payment_utr || 'OC-TRACK',
              allocatedCommittee: ocRow.allocated_department || 'Organizing Committee',
              allocatedCountry: `OC Member (${ocRow.payment_tier || 'Salaried Track'})`,
              roleType: 'OC',
            },
          });
        }

        // 1C. Secretariat Applications
        const { data: secRow } = await supabase
          .from('secretariat_applications')
          .select('*')
          .ilike('email', email)
          .limit(1)
          .maybeSingle();

        if (secRow) {
          return NextResponse.json({
            found: true,
            delegate: {
              ...secRow,
              id: secRow.id,
              regId: secRow.app_id || `RM26-SEC-${String(secRow.id).slice(0, 4).toUpperCase()}`,
              delegateId: secRow.app_id || `RM26-SEC-${String(secRow.id).slice(0, 4).toUpperCase()}`,
              fullName: secRow.full_name || 'Secretariat Applicant',
              email: secRow.email || email,
              institution: secRow.school_college || 'Secretariat',
              status: secRow.status || 'Pending',
              paymentStatus: secRow.status === 'Accepted' || secRow.status === 'Approved' ? 'VERIFIED' : 'PENDING_VERIFICATION',
              paymentUTR: 'SECRETARIAT-EXEMPT',
              allocatedCommittee: 'Resolve Secretariat',
              allocatedCountry: secRow.position || 'Secretariat Role',
              roleType: 'SECRETARIAT',
            },
          });
        }

        // 1D. Executive Board Applications
        const { data: ebRow } = await supabase
          .from('eb_applications')
          .select('*')
          .ilike('email', email)
          .limit(1)
          .maybeSingle();

        if (ebRow) {
          return NextResponse.json({
            found: true,
            delegate: {
              ...ebRow,
              id: ebRow.id,
              regId: ebRow.app_id || `RM26-EB-${String(ebRow.id).slice(0, 4).toUpperCase()}`,
              delegateId: ebRow.app_id || `RM26-EB-${String(ebRow.id).slice(0, 4).toUpperCase()}`,
              fullName: ebRow.full_name || 'EB Applicant',
              email: ebRow.email || email,
              institution: ebRow.institute || 'Executive Board',
              status: ebRow.status || 'Pending',
              paymentStatus: 'VERIFIED',
              paymentUTR: 'EB-HONORARY',
              allocatedCommittee: ebRow.allocated_committee || ebRow.committees || 'Executive Board',
              allocatedCountry: ebRow.allocated_role || ebRow.role_preference || 'Executive Board Member',
              roleType: 'EB',
            },
          });
        }

        // 1E. Delegation Applications (by advisor/head email)
        let teamRow = null;
        try {
          const res = await supabase.from('delegations').select('*').ilike('adviser_email', email).limit(1).maybeSingle();
          teamRow = res.data;
        } catch (_) {}

        if (!teamRow) {
          try {
            const res = await supabase.from('delegation_applications').select('*').ilike('advisor_email', email).limit(1).maybeSingle();
            teamRow = res.data;
          } catch (_) {}
        }

        if (teamRow) {
          return NextResponse.json({
            found: true,
            delegate: {
              ...teamRow,
              id: teamRow.id,
              regId: teamRow.delegation_id || `RM26-DEL-${String(teamRow.id).slice(0, 4).toUpperCase()}`,
              delegateId: teamRow.delegation_id || `RM26-DEL-${String(teamRow.id).slice(0, 4).toUpperCase()}`,
              fullName: teamRow.head_delegate_name || teamRow.advisor_name || 'Delegation Head',
              email: teamRow.adviser_email || teamRow.advisor_email || email,
              institution: teamRow.inst_name || teamRow.institution_name || 'Delegation',
              status: teamRow.status || 'Pending',
              paymentStatus:
                String(teamRow.payment_status || '').toUpperCase() === 'VERIFIED'
                  ? 'VERIFIED'
                  : 'PENDING_VERIFICATION',
              paymentUTR: teamRow.payment_utr || '',
              allocatedCommittee: 'School Delegation',
              allocatedCountry: `${teamRow.size || teamRow.delegate_count || 6} Delegates`,
              roleType: 'DELEGATION',
            },
          });
        }

        // 1F. Socials Applications
        const { data: socRow } = await supabase
          .from('socials_applications')
          .select('*')
          .ilike('email', email)
          .limit(1)
          .maybeSingle();

        if (socRow) {
          return NextResponse.json({
            found: true,
            delegate: {
              ...socRow,
              id: socRow.id,
              regId: socRow.app_id || socRow.id,
              delegateId: socRow.app_id || socRow.id,
              fullName: socRow.full_name || 'Socials Attendee',
              email: socRow.email || email,
              institution: socRow.school || 'Socials Pass',
              status: socRow.status || 'Confirmed',
              paymentStatus: socRow.payment_utr ? 'VERIFIED' : 'PENDING_VERIFICATION',
              paymentUTR: socRow.payment_utr || 'SOCIALS-UPI',
              allocatedCommittee: 'Socials Night',
              allocatedCountry: 'Attendee Pass',
              roleType: 'SOCIALS',
            },
          });
        }
      } catch (supaErr) {
        console.warn('[API /api/delegate] Supabase query notice:', supaErr.message);
      }
    }

    // 2. Fallback to Google Apps Script
    if (email) {
      const targetUrl = `${APPS_SCRIPT_URL}?action=GET_DELEGATE&email=${encodeURIComponent(email)}`;
      const res = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    }

    return NextResponse.json({ found: false, message: 'Delegate record not found' });
  } catch (err) {
    return NextResponse.json({ found: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const rl = enforceRateLimit(request, { keyPrefix: 'delegate_post', limit: 25, windowMs: 60_000 });
  if (rl) return rl;
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const regId = (body.regId || body.delegateId || body.id || '').trim();

    // SELF-SERVE ACCOUNT & DATA DELETION (Requires explicit confirmation phrase)
    if (body.action === 'DELETE_MY_ACCOUNT') {
      const phrase = String(body.confirmPhrase || '').trim().toUpperCase();
      if (phrase !== 'DELETE MY ACCOUNT') {
        return NextResponse.json(
          { success: false, message: 'Confirmation phrase mismatch.' },
          { status: 400 }
        );
      }
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Account email is required.' },
          { status: 400 }
        );
      }

      if (supabase) {
        const purges = [
          supabase.from('delegates').delete().ilike('email', email),
          supabase.from('delegate_applications').delete().ilike('email', email),
          supabase.from('oc_applications').delete().ilike('email', email),
          supabase.from('secretariat_applications').delete().ilike('email', email),
          supabase.from('eb_applications').delete().ilike('email', email),
          supabase.from('socials_passes').delete().ilike('email', email),
          supabase.from('delegations').delete().ilike('adviser_email', email),
          supabase.from('delegations').delete().ilike('email', email),
          supabase.from('registered_users').delete().ilike('email', email),
          supabase.from('profiles').delete().ilike('email', email),
          supabase.from('secretariat_roster').delete().ilike('email', email),
          supabase.from('draft_leads').delete().ilike('email', email),
          supabase.from('referral_coupons').delete().ilike('delegate_email', email),
        ];
        await Promise.allSettled(purges);
      }

      return NextResponse.json({
        success: true,
        deleted: true,
        message: 'Account and all associated conference records permanently deleted.',
      });
    }

    if (!email && !regId) {
      return NextResponse.json({ success: false, message: 'Email or registration ID required' }, { status: 400 });
    }

    // Build schema-exact payload matching live Supabase `delegate_applications` columns
    const updatePayload = { updated_at: new Date().toISOString() };

    if (body.fullName || body.name) {
      updatePayload.name = (body.fullName || body.name).trim();
    }
    if (body.phone !== undefined) {
      updatePayload.phone = String(body.phone || '').trim();
    }
    if (body.institution || body.school || body.institute) {
      updatePayload.institute = (body.institution || body.school || body.institute).trim();
    }
    if (body.grade !== undefined) {
      updatePayload.grade = body.grade;
    }
    if (body.dob !== undefined) {
      updatePayload.dob = String(body.dob || '').trim();
    }
    if (body.address !== undefined) {
      updatePayload.address = String(body.address || '').trim();
    }
    if (body.transport !== undefined) {
      updatePayload.transport = body.transport;
    }
    if (body.experience !== undefined || body.munExperience !== undefined) {
      updatePayload.experience = String(body.experience ?? body.munExperience ?? '').trim();
    }
    if (body.emergencyName !== undefined || body.emergency_name !== undefined) {
      updatePayload.emergency_name = String(body.emergencyName ?? body.emergency_name ?? '').trim();
    }
    if (body.emergencyPhone !== undefined || body.emergency_phone !== undefined) {
      const emgPh = String(body.emergencyPhone ?? body.emergency_phone ?? '').trim();
      const delPh = String(body.phone ?? '').trim();
      const cleanEmg = emgPh.replace(/\D/g, '').slice(-10);
      const cleanDel = delPh.replace(/\D/g, '').slice(-10);
      if (cleanEmg && cleanDel && cleanEmg === cleanDel) {
        return NextResponse.json(
          { success: false, message: "Parent / Emergency number cannot be the same as the delegate's phone number." },
          { status: 400 }
        );
      }
      updatePayload.emergency_phone = emgPh;
    }

    // Committee preferences (Enforce strict one-time preference change limit for delegates)
    let currentRow = null;
    if (supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(regId);
        let findQ = supabase.from('delegate_applications').select('*');
        if (email) findQ = findQ.ilike('email', email);
        else if (isUuid) findQ = findQ.eq('id', regId);
        else if (regId) findQ = findQ.eq('reg_id', regId);
        const { data: existing } = await findQ.limit(1).maybeSingle();
        currentRow = existing || null;
      } catch (_) {}
    }

    const currentPrefCount = Number(currentRow?.preferences_updated_count || 0);
    const isChangingPrefs =
      currentRow &&
      ((body.pref1_committee !== undefined && String(body.pref1_committee || '') !== String(currentRow.pref1_committee || '')) ||
        (body.pref1_country !== undefined && String(body.pref1_country || '').trim() !== String(currentRow.pref1_country || '').trim()) ||
        (body.pref2_committee !== undefined && String(body.pref2_committee || '') !== String(currentRow.pref2_committee || '')) ||
        (body.pref2_country !== undefined && String(body.pref2_country || '').trim() !== String(currentRow.pref2_country || '').trim()) ||
        (body.pref3_committee !== undefined && String(body.pref3_committee || '') !== String(currentRow.pref3_committee || '')) ||
        (body.pref3_country !== undefined && String(body.pref3_country || '').trim() !== String(currentRow.pref3_country || '').trim()));

    if (isChangingPrefs && currentPrefCount >= 1) {
      return NextResponse.json(
        {
          success: false,
          preferencesLocked: true,
          message: 'Committee and country preferences can only be changed once. Your one-time preference update has already been used.',
        },
        { status: 403 }
      );
    }

    if (currentPrefCount < 1) {
      if (body.pref1_committee !== undefined) updatePayload.pref1_committee = body.pref1_committee;
      if (body.pref1_country !== undefined) updatePayload.pref1_country = String(body.pref1_country || '').trim();
      if (body.pref2_committee !== undefined) updatePayload.pref2_committee = body.pref2_committee;
      if (body.pref2_country !== undefined) updatePayload.pref2_country = String(body.pref2_country || '').trim();
      if (body.pref3_committee !== undefined) updatePayload.pref3_committee = body.pref3_committee;
      if (body.pref3_country !== undefined) updatePayload.pref3_country = String(body.pref3_country || '').trim();
      if (isChangingPrefs) {
        updatePayload.preferences_updated_count = 1;
      }
    }

    // 1. Update underlying `delegate_applications` table directly (which backs the `delegates` view)
    if (supabase && Object.keys(updatePayload).length > 1) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(regId);
        let q = supabase.from('delegate_applications').update(updatePayload);
        if (currentRow?.id) {
          q = q.eq('id', currentRow.id);
        } else if (email) {
          q = q.ilike('email', email);
        } else if (isUuid) {
          q = q.eq('id', regId);
        } else if (regId) {
          q = q.eq('reg_id', regId);
        }
        const { error: sbErr } = await q;
        if (sbErr) console.warn('[API /api/delegate POST] Supabase update error:', sbErr.message);
      } catch (sbErr) {
        console.warn('[API /api/delegate POST] Supabase update notice:', sbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      preferencesUpdatedCount: isChangingPrefs ? 1 : currentPrefCount,
      preferencesLocked: isChangingPrefs || currentPrefCount >= 1,
      message: isChangingPrefs
        ? 'Preferences updated and locked (1/1 one-time change used).'
        : 'Delegate details updated successfully.',
      updated: updatePayload,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
