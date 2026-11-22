import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDelegateReferralCode, RES_POINTS_PER_REFERRAL } from '@/lib/referrals';

const BASE_DELEGATE_FEE = 2500;
const SECRETARIAT_CASH_POOL = 400;

const ADMIN_EMAILS = [
  'bhaveshkumarbasrani@gmail.com',
  'adityabejugam@gmail.com',
  'support@resolvemun.in',
  'admin@resolvemun.in',
  'resolve.mun@gmail.com',
  'munresolve@gmail.com',
];

// In-memory fallback mirror for custom Secretariat codes in case Supabase write is throttled
const memorySecretariatCodes = new Map();

function normalizeCode(c) {
  return String(c || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');
}

async function loadSiteSettingsRow() {
  if (!supabase) return { baseFee: BASE_DELEGATE_FEE, referralCodes: [] };
  try {
    const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
    if (!data) return { baseFee: BASE_DELEGATE_FEE, referralCodes: [] };
    const baseFee = Number(data.delegate_fee || data.delegateFee || BASE_DELEGATE_FEE) || BASE_DELEGATE_FEE;
    let codes = [];
    const raw = data.referral_codes || data.referralCodes;
    if (Array.isArray(raw)) {
      codes = raw;
    } else if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) codes = parsed;
      } catch (_) {}
    }
    return { row: data, baseFee, referralCodes: codes };
  } catch (_) {
    return { baseFee: BASE_DELEGATE_FEE, referralCodes: [] };
  }
}

async function saveReferralCodesToSettings(existingRow, updatedCodes) {
  if (!supabase) return false;
  try {
    if (existingRow?.id) {
      const { error } = await supabase
        .from('site_settings')
        .update({ referral_codes: updatedCodes })
        .eq('id', existingRow.id);
      if (!error) return true;
    } else {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ id: 1, referral_codes: updatedCodes }, { onConflict: 'id' });
      if (!error) return true;
    }
  } catch (err) {
    console.warn('[API /api/referrals] saveReferralCodesToSettings notice:', err.message);
  }
  return false;
}

function mergeCodesWithMemory(dbCodes = []) {
  const map = new Map();
  for (const c of dbCodes) {
    const k = normalizeCode(c.code);
    if (k) map.set(k, { ...c, code: k });
  }
  for (const [k, v] of memorySecretariatCodes.entries()) {
    map.set(k, { ...v, code: k });
  }
  return Array.from(map.values());
}

async function fetchAllDelegateRows() {
  if (!supabase) return [];
  const [r1, r2] = await Promise.allSettled([
    supabase.from('delegates').select('id, delegate_id, full_name, email, referral, payment_status, status, created_at'),
    supabase.from('delegate_applications').select('id, reg_id, name, full_name, email, referral_code, payment_status, status, created_at'),
  ]);
  const seen = new Set();
  const list = [];
  const combined = [
    ...(r1.status === 'fulfilled' ? r1.value.data || [] : []),
    ...(r2.status === 'fulfilled' ? r2.value.data || [] : []),
  ];
  for (const row of combined) {
    const em = String(row.email || '').trim().toLowerCase();
    const key = em || row.delegate_id || row.reg_id || row.id;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    list.push({
      id: row.delegate_id || row.reg_id || row.id,
      name: row.full_name || row.name || 'Delegate',
      email: em,
      referralCode: normalizeCode(row.referral || row.referral_code),
      paymentStatus: String(row.payment_status || '').toUpperCase(),
      status: String(row.status || '').toUpperCase(),
      createdAt: row.created_at || null,
    });
  }
  return list;
}

function isRowVerified(row) {
  const pay = String(row.paymentStatus || '').toUpperCase().trim();
  const st = String(row.status || '').toUpperCase().trim();
  if (pay.includes('FAIL') || pay.includes('REJECT') || st.includes('FAIL')) return false;
  if (pay.includes('PENDING') || pay.includes('REVIEW')) return false;
  return pay === 'VERIFIED' || pay === 'PAID' || pay === 'APPROVED' || st === 'ALLOTTED' || st === 'PAYMENT_VERIFIED';
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCode = searchParams.get('code');
    const rawEmail = searchParams.get('email');

    const { baseFee, referralCodes: dbCodes } = await loadSiteSettingsRow();
    const allCodes = mergeCodesWithMemory(dbCodes);

    // MODE 1: Live Referral Code Validation (?code=RES-0813 or ?code=SEC-BHAVESH)
    if (rawCode) {
      const code = normalizeCode(rawCode);
      if (!code || code.length < 3) {
        return NextResponse.json({ valid: false, message: 'Referral code not recognized', baseFee, finalFee: baseFee });
      }

      // 1A. Check Admin & Secretariat custom codes in site_settings.referral_codes
      const customMatch = allCodes.find((c) => normalizeCode(c.code) === code && c.active !== false);
      if (customMatch) {
        const discount = Math.max(
          0,
          Math.min(
            baseFee,
            Number(
              customMatch.discountAmount !== undefined
                ? customMatch.discountAmount
                : customMatch.finalFee !== undefined && customMatch.finalFee !== ''
                ? baseFee - Number(customMatch.finalFee)
                : 0
            ) || 0
          )
        );
        const finalFee = Math.max(0, baseFee - discount);
        const isSecretariat = customMatch.type === 'SECRETARIAT_CASH' || Boolean(customMatch.ownerEmail);
        const cashCommission = isSecretariat
          ? Math.max(0, Number(customMatch.cashCommission ?? SECRETARIAT_CASH_POOL - discount))
          : 0;

        return NextResponse.json({
          valid: true,
          code,
          type: isSecretariat ? 'SECRETARIAT_CASH' : 'PROMO',
          ownerName: customMatch.ownerName || customMatch.label || 'Resolve MUN Secretariat',
          baseFee,
          discountAmount: discount,
          cashCommission,
          finalFee,
          message:
            discount > 0
              ? `✓ Valid referral code (${customMatch.ownerName || 'Secretariat'}) — ₹${discount.toLocaleString('en-IN')} OFF · Pay ₹${finalFee.toLocaleString('en-IN')}`
              : `✓ Valid referral code (${customMatch.ownerName || 'Secretariat'}) applied — Pay ₹${finalFee.toLocaleString('en-IN')}`,
        });
      }

      // 1B. Check all registered delegates' personal RES-XXXX codes
      const delegates = await fetchAllDelegateRows();
      const matchedDelegate = delegates.find(
        (d) => normalizeCode(getDelegateReferralCode(d.id, d.email)) === code
      );
      if (matchedDelegate) {
        return NextResponse.json({
          valid: true,
          code,
          type: 'DELEGATE_RES',
          ownerName: matchedDelegate.name,
          baseFee,
          discountAmount: 0,
          resPointsForReferrer: RES_POINTS_PER_REFERRAL,
          finalFee: baseFee,
          message: `✓ Valid Delegate Referral (${matchedDelegate.name}) — +${RES_POINTS_PER_REFERRAL} RES Points to referrer · Pay ₹${baseFee.toLocaleString('en-IN')}`,
        });
      }

      return NextResponse.json({
        valid: false,
        code,
        baseFee,
        finalFee: baseFee,
        message: 'Referral code not recognized',
      });
    }

    // MODE 2: Secretariat Cash Dashboard Stats (?email=...)
    if (rawEmail) {
      const email = rawEmail.trim().toLowerCase();
      let isSecretariat = ADMIN_EMAILS.includes(email);
      let memberName = '';
      let memberRole = isSecretariat ? 'Secretariat / Admin' : '';
      let rosterMember = null;
      let needsOnboarding = false;

      if (supabase) {
        const [rosterRes, secRes, ocRes] = await Promise.allSettled([
          supabase.from('secretariat_roster').select('*').ilike('email', email).limit(1).maybeSingle(),
          supabase.from('secretariat_applications').select('full_name, email, position, status').ilike('email', email).limit(1).maybeSingle(),
          supabase.from('oc_applications').select('full_name, email, allocated_department, status').ilike('email', email).limit(1).maybeSingle(),
        ]);
        const rRow = rosterRes.status === 'fulfilled' ? rosterRes.value.data : null;
        const secRow = secRes.status === 'fulfilled' ? secRes.value.data : null;
        const ocRow = ocRes.status === 'fulfilled' ? ocRes.value.data : null;

        if (rRow) {
          isSecretariat = true;
          rosterMember = {
            id: rRow.id,
            email: rRow.email,
            fullName: rRow.full_name || '',
            allottedRole: rRow.allotted_role || 'Secretariat Member',
            department: rRow.department || '',
            phone: rRow.phone || '',
            school: rRow.school || '',
            grade: rRow.grade || '',
            upiId: rRow.upi_id || '',
            instagram: rRow.instagram || '',
            onboarded: Boolean(rRow.onboarded),
            onboardedAt: rRow.onboarded_at || null,
          };
          memberName = rRow.full_name || memberName;
          memberRole = rRow.allotted_role || 'Secretariat Member';
          needsOnboarding = !rRow.onboarded;
        } else if (secRow) {
          isSecretariat = true;
          memberName = secRow.full_name || memberName;
          memberRole = secRow.position || 'Secretariat';
        } else if (ocRow) {
          isSecretariat = true;
          memberName = ocRow.full_name || memberName;
          memberRole = ocRow.allocated_department || 'Organizing Committee';
        }
      }

      const myCodes = allCodes.filter(
        (c) => String(c.ownerEmail || '').trim().toLowerCase() === email && c.active !== false
      );

      // Also check if user already has a code registered -> grants Secretariat dashboard access
      if (myCodes.length > 0) isSecretariat = true;

      const delegates = await fetchAllDelegateRows();
      const myCodeSet = new Set(myCodes.map((c) => normalizeCode(c.code)));
      const codeMap = new Map(myCodes.map((c) => [normalizeCode(c.code), c]));

      const myReferrals = delegates
        .filter((d) => d.referralCode && myCodeSet.has(d.referralCode) && d.email !== email)
        .map((d) => {
          const cfg = codeMap.get(d.referralCode) || {};
          const discount = Math.max(0, Math.min(SECRETARIAT_CASH_POOL, Number(cfg.discountAmount || 0)));
          const commission = Math.max(0, SECRETARIAT_CASH_POOL - discount);
          const verified = isRowVerified(d);
          return {
            ...d,
            discountGiven: discount,
            cashEarned: commission,
            verified,
          };
        });

      const verifiedReferrals = myReferrals.filter((r) => r.verified);
      const pendingReferrals = myReferrals.filter((r) => !r.verified);
      const totalVerifiedCash = verifiedReferrals.reduce((sum, r) => sum + r.cashEarned, 0);
      const totalPendingCash = pendingReferrals.reduce((sum, r) => sum + r.cashEarned, 0);

      return NextResponse.json({
        success: true,
        authorized: isSecretariat,
        needsOnboarding,
        rosterMember,
        memberName,
        memberRole: memberRole || 'Secretariat',
        baseFee,
        cashPoolPerReferral: SECRETARIAT_CASH_POOL,
        myCodes,
        stats: {
          totalReferrals: myReferrals.length,
          verifiedCount: verifiedReferrals.length,
          pendingCount: pendingReferrals.length,
          totalVerifiedCash,
          totalPendingCash,
        },
        referrals: myReferrals,
      });
    }

    return NextResponse.json({ success: true, baseFee, cashPoolPerReferral: SECRETARIAT_CASH_POOL, codes: allCodes });
  } catch (err) {
    return NextResponse.json({ valid: false, success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const action = String(body.action || 'UPSERT_SECRETARIAT_CODE').toUpperCase();

    if (action === 'UPSERT_SECRETARIAT_CODE') {
      const email = String(body.email || '').trim().toLowerCase();
      const ownerName = String(body.ownerName || body.name || 'Secretariat Member').trim();
      const code = normalizeCode(body.code);
      const rawDiscount = Number(body.discountAmount ?? 0);

      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, message: 'Valid signed-in email is required.' }, { status: 400 });
      }
      if (!code || code.length < 3 || code.length > 20) {
        return NextResponse.json(
          { success: false, message: 'Referral code must be 3–20 letters/numbers (e.g. SEC-BHAVESH or BHAVESH100).' },
          { status: 400 }
        );
      }
      if (Number.isNaN(rawDiscount) || rawDiscount < 0 || rawDiscount > SECRETARIAT_CASH_POOL) {
        return NextResponse.json(
          { success: false, message: `Discount must be between ₹0 and ₹${SECRETARIAT_CASH_POOL}.` },
          { status: 400 }
        );
      }

      const discountAmount = Math.round(rawDiscount);
      const cashCommission = SECRETARIAT_CASH_POOL - discountAmount;
      const { row, baseFee, referralCodes: dbCodes } = await loadSiteSettingsRow();
      const finalFee = Math.max(0, baseFee - discountAmount);

      const allCodes = mergeCodesWithMemory(dbCodes);
      const conflict = allCodes.find(
        (c) =>
          normalizeCode(c.code) === code &&
          c.ownerEmail &&
          String(c.ownerEmail).trim().toLowerCase() !== email
      );
      if (conflict) {
        return NextResponse.json(
          { success: false, message: `Code "${code}" is already taken by another Secretariat member.` },
          { status: 409 }
        );
      }

      const entry = {
        code,
        type: 'SECRETARIAT_CASH',
        ownerEmail: email,
        ownerName,
        label: `${ownerName} (Secretariat)`,
        discountAmount,
        cashCommission,
        finalFee,
        active: true,
        updatedAt: new Date().toISOString(),
      };

      const filtered = allCodes.filter((c) => normalizeCode(c.code) !== code);
      const updated = [entry, ...filtered];
      memorySecretariatCodes.set(code, entry);

      await saveReferralCodesToSettings(row, updated);

      return NextResponse.json({
        success: true,
        code: entry,
        message: `Code ${code} saved! Delegates pay ₹${finalFee.toLocaleString('en-IN')} (₹${discountAmount} off) · You earn ₹${cashCommission} cash per verified signup.`,
      });
    }

    if (action === 'COMPLETE_SECRETARIAT_ONBOARDING') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, message: 'Valid signed-in email is required.' }, { status: 400 });
      }
      const fullName = String(body.fullName || '').trim();
      const phone = String(body.phone || '').trim();
      const school = String(body.school || '').trim();
      const grade = String(body.grade || '').trim();
      const upiId = String(body.upiId || '').trim();
      const instagram = String(body.instagram || '').trim();

      if (!fullName || !phone || !school) {
        return NextResponse.json(
          { success: false, message: 'Full Name, Phone, and School/Institution are required.' },
          { status: 400 }
        );
      }

      if (supabase) {
        const { data: existing } = await supabase
          .from('secretariat_roster')
          .select('id, allotted_role')
          .ilike('email', email)
          .limit(1)
          .maybeSingle();

        if (!existing && !ADMIN_EMAILS.includes(email)) {
          return NextResponse.json(
            { success: false, message: 'Your email is not on the Secretariat Roster yet. Ask the Admin to add you first.' },
            { status: 403 }
          );
        }

        const nowIso = new Date().toISOString();
        if (existing?.id) {
          const { error } = await supabase
            .from('secretariat_roster')
            .update({
              full_name: fullName,
              phone,
              school,
              grade,
              upi_id: upiId,
              instagram,
              onboarded: true,
              onboarded_at: nowIso,
              updated_at: nowIso,
            })
            .eq('id', existing.id);
          if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Onboarding complete! You can now create your referral code and track earnings.',
      });
    }

    if (action === 'DELETE_SECRETARIAT_CODE') {
      const email = String(body.email || '').trim().toLowerCase();
      const code = normalizeCode(body.code);
      if (!email || !code) {
        return NextResponse.json({ success: false, message: 'Email and code required.' }, { status: 400 });
      }
      const { row, referralCodes: dbCodes } = await loadSiteSettingsRow();
      const allCodes = mergeCodesWithMemory(dbCodes);
      const updated = allCodes.filter(
        (c) => !(normalizeCode(c.code) === code && String(c.ownerEmail || '').trim().toLowerCase() === email)
      );
      memorySecretariatCodes.delete(code);
      await saveReferralCodesToSettings(row, updated);
      return NextResponse.json({ success: true, deleted: code });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
