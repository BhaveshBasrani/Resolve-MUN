import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbyfh1S7g1oJ9ej06z-OUZnn9BJhVSbSFuCmBESJ53bPTQsPPDL-s5P3HOaZ4RzfWna1/exec";

export async function GET(request) {
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
          const delegate = {
            ...delRow,
            id: delRow.id,
            _id: delRow.id,
            regId: delRow.delegate_id || delRow.reg_id || delRow.regId || delRow.id,
            delegateId: delRow.delegate_id || delRow.reg_id || delRow.regId || delRow.id,
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
            pref1_committee: delRow.pref1_committee || '',
            pref1_country: delRow.pref1_country || delRow.pref1_portfolio1 || '',
            pref2_committee: delRow.pref2_committee || '',
            pref2_country: delRow.pref2_country || delRow.pref2_portfolio1 || '',
            pref3_committee: delRow.pref3_committee || '',
            pref3_country: delRow.pref3_country || delRow.pref3_portfolio1 || '',
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
            paymentStatus: String(delRow.payment_status || '').toUpperCase() === 'VERIFIED' ? 'VERIFIED' : (delRow.payment_utr ? 'VERIFIED' : 'PENDING_VERIFICATION'),
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
          return NextResponse.json({ found: true, delegate });
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
              status: ocRow.status || 'Confirmed',
              paymentStatus: ocRow.payment_utr ? 'VERIFIED' : 'PENDING_VERIFICATION',
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
              paymentStatus: teamRow.payment_utr ? 'VERIFIED' : 'PENDING_VERIFICATION',
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
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const regId = (body.regId || body.delegateId || body.id || '').trim();

    if (!email && !regId) {
      return NextResponse.json({ success: false, message: 'Email or registration ID required' }, { status: 400 });
    }

    const updatePayload = {
      updated_at: new Date().toISOString(),
    };

    if (body.fullName || body.name) {
      const nm = (body.fullName || body.name).trim();
      updatePayload.name = nm;
      updatePayload.full_name = nm;
    }
    if (body.phone) updatePayload.phone = String(body.phone).trim();
    if (body.institution || body.school || body.institute) {
      const inst = (body.institution || body.school || body.institute).trim();
      updatePayload.school = inst;
      updatePayload.institute = inst;
      updatePayload.institution = inst;
    }
    if (body.grade) updatePayload.grade = body.grade;
    if (body.dob) updatePayload.dob = body.dob;
    if (body.address) {
      const addr = body.address.trim();
      updatePayload.address = addr;
      updatePayload.residential_address = addr;
    }
    if (body.transport) {
      updatePayload.transport = body.transport;
      updatePayload.transport_needed = body.transport;
    }
    if (body.experience || body.munExperience) {
      const exp = (body.experience || body.munExperience).trim();
      updatePayload.experience = exp;
      updatePayload.mun_experience = exp;
    }

    // Committee preferences
    if (body.pref1_committee) updatePayload.pref1_committee = body.pref1_committee;
    if (body.pref1_country) {
      updatePayload.pref1_country = body.pref1_country;
      updatePayload.pref1_portfolio1 = body.pref1_country;
    }
    if (body.pref2_committee) updatePayload.pref2_committee = body.pref2_committee;
    if (body.pref2_country) {
      updatePayload.pref2_country = body.pref2_country;
      updatePayload.pref2_portfolio1 = body.pref2_country;
    }
    if (body.pref3_committee) updatePayload.pref3_committee = body.pref3_committee;
    if (body.pref3_country) {
      updatePayload.pref3_country = body.pref3_country;
      updatePayload.pref3_portfolio1 = body.pref3_country;
    }

    // 1. Update in Supabase
    if (supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(regId);
        let filterStr = '';
        if (isUuid) filterStr = `id.eq.${regId}`;
        else if (regId && email) filterStr = `delegate_id.eq.${regId},reg_id.eq.${regId},email.ilike.${email}`;
        else if (regId) filterStr = `delegate_id.eq.${regId},reg_id.eq.${regId},id.eq.${regId}`;
        else if (email) filterStr = `email.ilike.${email}`;

        if (filterStr) {
          await Promise.allSettled([
            supabase.from('delegate_applications').update(updatePayload).or(filterStr),
            supabase.from('delegates').update(updatePayload).or(filterStr),
          ]);
        }
      } catch (sbErr) {
        console.warn('[API /api/delegate POST] Supabase update notice:', sbErr.message);
      }
    }

    // 2. Dispatch to Google Apps Script via UPDATE_DELEGATE
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'UPDATE_DELEGATE',
        adminKey: 'ResolveMUNAdmin2026@Secure',
        regId,
        email,
        ...body,
      }),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Delegate details updated successfully',
      updated: updatePayload,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
