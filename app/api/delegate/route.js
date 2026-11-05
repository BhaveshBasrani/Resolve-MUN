import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxd_EyDHhJY1yokbma62PFcLu1SyBC-QXe32zb8JRIOUaJBowaivqNcgVwqk4HEsxTLpw/exec";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim()?.toLowerCase();
    const userId = searchParams.get('userId')?.trim();

    if (!email && !userId) {
      return NextResponse.json({ found: false, message: 'Email or userId required' }, { status: 400 });
    }

    // 1. Check Supabase first (delegates, oc_applications, secretariat_applications)
    if (supabase && email) {
      try {
        const { data: delRow } = await supabase
          .from('delegates')
          .select('*')
          .ilike('email', email)
          .limit(1)
          .maybeSingle();

        if (delRow) {
          const delegate = {
            ...delRow,
            id: delRow.id,
            _id: delRow.id,
            regId: delRow.delegate_id || delRow.id,
            delegateId: delRow.delegate_id || delRow.id,
            fullName: delRow.full_name || '',
            name: delRow.full_name || '',
            email: delRow.email || '',
            phone: delRow.phone || '',
            grade: delRow.grade || '',
            institution: delRow.school || 'Individual Delegate',
            institute: delRow.school || '',
            status: delRow.status || 'Confirmed',
            paymentStatus: delRow.payment_status || 'PENDING_VERIFICATION',
            paymentUTR: delRow.payment_utr || '',
            allocatedCommittee: delRow.allocated_committee || '',
            allocatedCountry: delRow.allocated_country || '',
            delegationCode: delRow.delegation_code || 'Independent',
            checkInDay1: delRow.check_in_day1 || 'Absent',
            checkInDay2: delRow.check_in_day2 || 'Absent',
            checkInDay3: delRow.check_in_day3 || 'Absent',
            pref1: delRow.pref1_committee
              ? `${delRow.pref1_committee} · ${[delRow.pref1_portfolio1, delRow.pref1_portfolio2].filter(Boolean).join(' / ') || 'General'}`
              : null,
            pref2: delRow.pref2_committee
              ? `${delRow.pref2_committee} · ${[delRow.pref2_portfolio1, delRow.pref2_portfolio2].filter(Boolean).join(' / ') || 'General'}`
              : null,
            pref3: delRow.pref3_committee
              ? `${delRow.pref3_committee} · ${[delRow.pref3_portfolio1, delRow.pref3_portfolio2].filter(Boolean).join(' / ') || 'General'}`
              : null,
            roleType: 'DELEGATE',
            created_at: delRow.created_at || '',
          };
          return NextResponse.json({ found: true, delegate });
        }
      } catch (supaErr) {
        console.warn('[API /api/delegate] Supabase query notice:', supaErr.message);
      }
    }

    // 2. Check Cloud Firestore delegates, oc_applications, secretariat_applications
    try {
      let q = null;
      if (email) {
        q = query(collection(db, 'delegates'), where('email', '==', email), limit(1));
      } else if (userId) {
        q = query(collection(db, 'delegates'), where('user_id', '==', userId), limit(1));
      }

      if (q) {
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const data = docSnap.data();
          const delegate = {
            ...data,
            id: docSnap.id,
            _id: docSnap.id,
            regId: data.delegateId || data.regId || docSnap.id,
            delegateId: data.delegateId || data.regId || docSnap.id,
            fullName: data.fullName || data.name || data['Full Name'] || '',
            name: data.name || data.fullName || data['Full Name'] || '',
            email: data.email || data['Email Address'] || '',
            phone: data.phone || data['Phone Number'] || '',
            grade: data.grade || data['Grade'] || '',
            institution: data.institution || data.institute || data.school || data['School / Institution'] || 'Individual Delegate',
            institute: data.institute || data.institution || data.school || data['School / Institution'] || '',
            status: data.status || 'Confirmed',
            paymentStatus: data.payment_status || data.paymentStatus || 'PENDING_VERIFICATION',
            paymentUTR: data.payment_utr || data.paymentUTR || '',
            allocatedCommittee: data.allocated_committee || data.allocatedCommittee || data['Allocated Committee'] || '',
            allocatedCountry: data.allocated_country || data.allocatedCountry || data['Allocated Country'] || '',
            checkInDay1: data.checkInDay1 || data.check_in_day1 || 'Absent',
            checkInDay2: data.checkInDay2 || data.check_in_day2 || 'Absent',
            checkInDay3: data.checkInDay3 || data.check_in_day3 || 'Absent',
            pref1: (data.pref1_committee
              ? `${data.pref1_committee} · ${data.pref1_country || data.pref1_portfolio1 || 'General'}`
              : data.pref1 || data['Pref 1'] || null),
            pref2: (data.pref2_committee
              ? `${data.pref2_committee} · ${data.pref2_country || data.pref2_portfolio1 || 'General'}`
              : data.pref2 || data['Pref 2'] || null),
            pref3: (data.pref3_committee
              ? `${data.pref3_committee} · ${data.pref3_country || data.pref3_portfolio1 || 'General'}`
              : data.pref3 || data['Pref 3'] || null),
            roleType: 'DELEGATE',
            created_at: data.created_at || data.createdAt || '',
          };

          return NextResponse.json({ found: true, delegate });
        }
      }

      // Check Firestore OC Applications
      if (email) {
        const ocSnap = await getDocs(query(collection(db, 'oc_applications'), where('email', '==', email), limit(1)));
        if (!ocSnap.empty) {
          const docSnap = ocSnap.docs[0];
          const data = docSnap.data();
          return NextResponse.json({
            found: true,
            delegate: {
              ...data,
              id: docSnap.id,
              regId: data.appId || `RM26-OC-${docSnap.id.slice(0, 4).toUpperCase()}`,
              delegateId: data.appId || `RM26-OC-${docSnap.id.slice(0, 4).toUpperCase()}`,
              fullName: data.fullName || data.name || 'OC Applicant',
              email: data.email || email,
              institution: data.school || data.institute || 'Organizing Committee',
              status: data.status || 'Confirmed',
              paymentStatus: data.payment_utr ? 'VERIFIED' : 'PENDING_VERIFICATION',
              paymentUTR: data.payment_utr || 'OC-TRACK',
              allocatedCommittee: data.allocated_department || 'Organizing Committee',
              allocatedCountry: `OC Member (${data.payment_tier || 'Salaried Track'})`,
              roleType: 'OC',
            },
          });
        }

        // Check Firestore Secretariat Applications
        const secSnap = await getDocs(query(collection(db, 'secretariat_applications'), where('email', '==', email), limit(1)));
        if (!secSnap.empty) {
          const docSnap = secSnap.docs[0];
          const data = docSnap.data();
          return NextResponse.json({
            found: true,
            delegate: {
              ...data,
              id: docSnap.id,
              regId: data.appId || `RM26-SEC-${docSnap.id.slice(0, 4).toUpperCase()}`,
              delegateId: data.appId || `RM26-SEC-${docSnap.id.slice(0, 4).toUpperCase()}`,
              fullName: data.fullName || 'Secretariat Applicant',
              email: data.email || email,
              institution: data.schoolCollege || 'Secretariat',
              status: data.status || 'Pending',
              paymentStatus: data.status === 'Accepted' || data.status === 'Approved' ? 'VERIFIED' : 'PENDING_VERIFICATION',
              paymentUTR: 'SECRETARIAT-EXEMPT',
              allocatedCommittee: 'Resolve Secretariat',
              allocatedCountry: data.position || 'Secretariat Role',
              roleType: 'SECRETARIAT',
            },
          });
        }
      }
    } catch (fsErr) {
      console.warn('[API /api/delegate] Firestore direct query error:', fsErr.message);
    }

    // 3. Fallback to Google Apps Script
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
