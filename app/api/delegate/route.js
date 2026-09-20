import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
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

    // 1. Check Cloud Firestore delegates collection first (Fast & Real-time)
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
            ...data,                                                           // raw Firestore fields first
            id: docSnap.id,
            _id: docSnap.id,
            regId: data.delegateId || data.regId || docSnap.id,
            delegateId: data.delegateId || data.regId || docSnap.id,
            fullName: data.fullName || data.name || data['Full Name'] || '',
            name: data.name || data.fullName || data['Full Name'] || '',
            email: data.email || data['Email Address'] || '',
            phone: data.phone || data['Phone Number'] || '',
            grade: data.grade || data['Grade'] || '',
            institution: data.institution || data.institute || data['School / Institution'] || 'Individual Delegate',
            institute: data.institute || data.institution || data['School / Institution'] || '',
            status: data.status || 'Confirmed',
            paymentStatus: data.payment_status || data.paymentStatus || 'VERIFIED',
            paymentUTR: data.payment_utr || data.paymentUTR || 'VERIFIED',
            allocatedCommittee: data.allocated_committee || data.allocatedCommittee || data['Allocated Committee'] || '',
            allocatedCountry: data.allocated_country || data.allocatedCountry || data['Allocated Country'] || '',
            // Committee preferences — always compute from raw fields so dashes never show
            pref1: (data.pref1_committee
              ? `${data.pref1_committee} · ${data.pref1_country || 'General'}`
              : data.pref1 || data['Pref 1'] || null),
            pref2: (data.pref2_committee
              ? `${data.pref2_committee} · ${data.pref2_country || 'General'}`
              : data.pref2 || data['Pref 2'] || null),
            pref3: (data.pref3_committee
              ? `${data.pref3_committee} · ${data.pref3_country || 'General'}`
              : data.pref3 || data['Pref 3'] || null),
            created_at: data.created_at || data.createdAt || '',
          };

          return NextResponse.json({ found: true, delegate });
        }
      }
    } catch (fsErr) {
      console.warn('[API /api/delegate] Firestore direct query error:', fsErr.message);
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
