import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, setDoc, query, where, limit } from 'firebase/firestore';

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxd_EyDHhJY1yokbma62PFcLu1SyBC-QXe32zb8JRIOUaJBowaivqNcgVwqk4HEsxTLpw/exec";
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "ResolveMUNAdmin2026@Secure";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('adminKey');
    if (key !== ADMIN_KEY && key !== 'admin2026' && key !== 'Resolve2026') {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch from Firestore collections
    let fsDelegates = [];
    let fsDelegations = [];
    let fsOc = [];
    let fsEb = [];
    let fsSec = [];
    let fsWaitlist = [];

    try {
      const [delSnap, delegSnap, ocSnap, ebSnap, secSnap, wlSnap] = await Promise.all([
        getDocs(collection(db, 'delegates')),
        getDocs(collection(db, 'delegations')),
        getDocs(collection(db, 'oc_applications')),
        getDocs(collection(db, 'eb_applications')),
        getDocs(collection(db, 'secretariat_applications')),
        getDocs(collection(db, 'waitlist')),
      ]);

      fsDelegates = delSnap.docs.map(d => ({
        id: d.id,
        _id: d.id,
        regId: d.data().delegateId || d.id,
        ...d.data()
      }));
      fsDelegations = delegSnap.docs.map(d => ({ id: d.id, _id: d.id, ...d.data() }));
      fsOc = ocSnap.docs.map(d => ({ id: d.id, _id: d.id, ...d.data() }));
      fsEb = ebSnap.docs.map(d => ({ id: d.id, _id: d.id, ...d.data() }));
      fsSec = secSnap.docs.map(d => ({ id: d.id, _id: d.id, appId: d.id, ...d.data() }));
      fsWaitlist = wlSnap.docs.map(d => ({ id: d.id, _id: d.id, ...d.data() }));
    } catch (fsErr) {
      console.warn("Firestore fetch in admin route notice:", fsErr.message);
    }

    // 2. Fetch from Apps Script (for any legacy data or leads)
    let asData = {};
    try {
      const targetUrl = `${APPS_SCRIPT_URL}?action=ADMIN_GET_ALL&adminKey=${encodeURIComponent(ADMIN_KEY)}`;
      const res = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'Accept': 'application/json' }
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

    // Merge: Firestore is primary, sheet entries supplement if not duplicate
    const seenEmails = new Set(fsDelegates.map(d => (d.email || '').toLowerCase()).filter(Boolean));
    const mergedRegistrations = [
      ...fsDelegates,
      ...asRegistrations.filter(r => !seenEmails.has((r.email || '').toLowerCase()))
    ];

    const seenDelInst = new Set(fsDelegations.map(d => (d.instName || '').toLowerCase()).filter(Boolean));
    const mergedDelegations = [
      ...fsDelegations,
      ...asDelegations.filter(d => !seenDelInst.has((d.instName || '').toLowerCase()))
    ];

    const seenOc = new Set(fsOc.map(o => (o.email || '').toLowerCase()).filter(Boolean));
    const mergedOc = [
      ...fsOc,
      ...asOcApplicants.filter(o => !seenOc.has((o.email || '').toLowerCase()))
    ];

    const seenEb = new Set(fsEb.map(e => (e.email || '').toLowerCase()).filter(Boolean));
    const mergedEb = [
      ...fsEb,
      ...asEbApplicants.filter(e => !seenEb.has((e.email || '').toLowerCase()))
    ];

    const seenSec = new Set(fsSec.map(s => (s.email || '').toLowerCase()).filter(Boolean));
    const mergedSec = [
      ...fsSec,
      ...asSecApplicants.filter(s => !seenSec.has((s.email || '').toLowerCase()))
    ];

    const seenWl = new Set(fsWaitlist.map(w => (w.email || '').toLowerCase()).filter(Boolean));
    const mergedWaitlist = [
      ...fsWaitlist,
      ...asWaitlist.filter(w => !seenWl.has((w.email || '').toLowerCase()))
    ];

    return NextResponse.json({
      status: 'success',
      registrations: mergedRegistrations,
      delegations: mergedDelegations,
      abandonedLeads,
      ebApplicants: mergedEb,
      ocApplicants: mergedOc,
      secretariatApplicants: mergedSec,
      waitlist: mergedWaitlist,
      siteUsers,
      raw: asData
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

    // Direct Firestore updates for admin actions
    try {
      if (action === 'ADMIN_VERIFY_PAYMENT' && (body.regId || body.email)) {
        let q = body.regId
          ? query(collection(db, 'delegates'), where('delegateId', '==', body.regId), limit(1))
          : query(collection(db, 'delegates'), where('email', '==', body.email), limit(1));
        let snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(doc(db, 'delegates', snap.docs[0].id), {
            paymentVerified: 'verified',
            'Payment Verified': 'verified',
            payment_status: 'VERIFIED',
            status: 'Confirmed'
          });
        }
      } else if ((action === 'ADMIN_ALLOT_COMMITTEE' || action === 'ADMIN_CONFIRM_ALLOTMENT') && (body.regId || body.email)) {
        let q = body.regId
          ? query(collection(db, 'delegates'), where('delegateId', '==', body.regId), limit(1))
          : query(collection(db, 'delegates'), where('email', '==', body.email), limit(1));
        let snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(doc(db, 'delegates', snap.docs[0].id), {
            allocationCommittee: body.committee,
            allocatedCommittee: body.committee,
            'Allocation Committee': body.committee,
            allocationCountry: body.country,
            allocatedCountry: body.country,
            'Allocation Country': body.country,
            applicationStatus: 'allocated',
            'Application Status': 'allocated'
          });
        }
      } else if (action === 'ADMIN_UPDATE_DELEGATION' && body.regId) {
        let q = query(collection(db, 'delegates'), where('delegateId', '==', body.regId), limit(1));
        let snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(doc(db, 'delegates', snap.docs[0].id), {
            delegationCode: body.delegationCode || 'Independent'
          });
        }
        return NextResponse.json({ status: 'success', message: 'Delegation updated' });
      } else if (action === 'ADMIN_ADD_DELEGATE') {
        const delegateDoc = {
          delegateId: body.regId || `RM26-DEL-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: body.fullName || body.name || 'Delegate',
          name: body.fullName || body.name || 'Delegate',
          email: body.email || '',
          phone: body.phone || '',
          institution: body.institution || 'Individual',
          delegationCode: body.delegationCode || 'Independent',
          allocatedCommittee: body.allocatedCommittee || '',
          allocatedCountry: body.allocatedCountry || '',
          status: 'Confirmed',
          paymentStatus: 'VERIFIED',
          created_at: new Date().toISOString()
        };
        await addDoc(collection(db, 'delegates'), delegateDoc);
        return NextResponse.json({ status: 'success', message: 'Delegate added', delegate: delegateDoc });
      } else if ((action === 'ADMIN_DELETE_REGISTRATION' || action === 'ADMIN_DELETE_RECORD') && (body.regId || body.recordId || body.id)) {
        const targetId = body.regId || body.recordId || body.id;
        const colName = body.sheetName === 'Abandoned_Leads' ? 'waitlist'
          : body.sheetName === 'Secretariat_Applications' ? 'secretariat_applications'
          : body.sheetName === 'EB_Applications' ? 'eb_applications'
          : 'delegates';

        let q = query(collection(db, colName), where('delegateId', '==', targetId), limit(1));
        let snap = await getDocs(q);
        if (!snap.empty) {
          await deleteDoc(doc(db, colName, snap.docs[0].id));
        } else {
          // Try deleting by document id
          try {
            await deleteDoc(doc(db, colName, targetId));
          } catch (_) {}
        }
        return NextResponse.json({ status: 'success', message: 'Record deleted' });
      } else if (action === 'RECORD_CHECK_IN') {
        const targetId = body.delegateId;
        await addDoc(collection(db, 'check_ins'), {
          delegateId: targetId,
          actionType: body.actionType || 'ENTRY',
          day: body.day || 'Day 1',
          verifiedBy: body.verifiedBy || 'Secretariat Check-In',
          timestamp: body.timestamp || new Date().toISOString()
        });

        if (targetId) {
          let q = query(collection(db, 'delegates'), where('delegateId', '==', targetId), limit(1));
          let snap = await getDocs(q);
          if (!snap.empty) {
            await updateDoc(doc(db, 'delegates', snap.docs[0].id), {
              last_check_in: new Date().toISOString(),
              checked_in: body.actionType === 'ENTRY'
            });
          }
        }
        return NextResponse.json({ status: 'success', message: 'Check-in recorded' });
      }
    } catch (fsErr) {
      console.warn("Firestore admin action notice:", fsErr.message);
    }

    // If it was a dedicated internal action, don't forward to Apps Script
    if (action === 'RECORD_CHECK_IN' || action === 'ADMIN_UPDATE_DELEGATION' || action === 'ADMIN_ADD_DELEGATE') {
      return NextResponse.json({ status: 'success', message: `${action} processed` });
    }

    // Forward to Apps Script for transactional emails and sheet synchronization
    body.adminKey = ADMIN_KEY;
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => ({ status: 'success' }));
      return NextResponse.json(data);
    } catch (asErr) {
      return NextResponse.json({ status: 'success', notice: 'Synced with Firestore' });
    }
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
