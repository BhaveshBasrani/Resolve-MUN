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
            id: docSnap.id,
            _id: docSnap.id,
            regId: data.delegateId || data.regId || docSnap.id,
            delegateId: data.delegateId || data.regId || docSnap.id,
            fullName: data.name || data.fullName,
            name: data.name || data.fullName,
            email: data.email,
            phone: data.phone,
            institution: data.institution || data.institute || "Individual Delegate",
            status: data.status || "Confirmed",
            paymentStatus: data.payment_status || data.paymentStatus || "VERIFIED",
            paymentUTR: data.payment_utr || data.paymentUTR || "VERIFIED",
            allocatedCommittee: data.allocated_committee || data.allocatedCommittee || "",
            allocatedCountry: data.allocated_country || data.allocatedCountry || "",
            pref1: data.pref1 || (data.pref1_committee ? `${data.pref1_committee} · ${data.pref1_country || 'General'}` : null),
            pref2: data.pref2 || (data.pref2_committee ? `${data.pref2_committee} · ${data.pref2_country || 'General'}` : null),
            pref3: data.pref3 || (data.pref3_committee ? `${data.pref3_committee} · ${data.pref3_country || 'General'}` : null),
            created_at: data.created_at,
            ...data,
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
