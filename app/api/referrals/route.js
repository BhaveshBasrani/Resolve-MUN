import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDelegateReferralCode, RES_POINTS_PER_REFERRAL } from '@/lib/referrals';
import { enforceRateLimit } from '@/lib/rateLimit';
import { sendTransactionalEmail, RESOLVE_CC_EMAIL } from '@/lib/mailer';

const BASE_DELEGATE_FEE = 2500;
const SECRETARIAT_CASH_POOL = 400;

const ADMIN_EMAILS = [
  'bhaveshkumarbasrani@gmail.com',
  'resolve.mun@gmail.com',
];

// In-memory fallback mirror for custom Secretariat codes in case Supabase write is throttled
const memorySecretariatCodes = new Map();

// Legacy partner & ambassador codes (fallback alongside dynamic Supabase system_settings.referral_codes)
const LEGACY_PARTNER_CODES = {
  SBXS2026: 2500, AETHERXR2026: 2500, DIYA: 2500, ICFAI: 2000, NYA200: 2500,
  SOLARIS: 2500, PROMOTION: 2500, UNT100: 2500, HET100: 2500, YCE200: 2500,
  AN69: 2500, ATHENAXR2026: 2500, STYLE100: 2500, TTG300: 2300, PARNIKA200: 2500,
  RAYON67: 2500, IRISXRESOLVE: 2500, ABHINAYA200: 2500, SKA200: 1999,
  AVETE99: 2500, BHAFN01: 2500, POOCF02: 2500, RAYFM03: 2500, JAYFM04: 2500,
  NIKSH05: 2500, AARCL06: 2500, SNVPU99: 2500, SWASG07: 2500, KANDG08: 2500,
  ROHDD09: 2500, DHACS10: 2500, JOTDC11: 2500, RAACA12: 2500, RISCO13: 2500,
  ABHCA14: 2500, ADYSA15: 2500, GAYFH16: 2500, AARDM17: 2500, ABHCC18: 2500,
  HIMCI19: 2500, DEVOC20: 2500, DHASP21: 2500, HAVST22: 2500, NIPLG23: 2500,
  MEGDA24: 2500, RYAMK25: 2500, SHRPL26: 2500, TANHP27: 2500, HEMOR28: 2500,
  AKAUF29: 2500, ANAUO30: 2500, CHAUO31: 2500, LIKUM32: 2500, VAIUM33: 2500,
  ISHUD34: 2500, MOKUD35: 2500, PARUD36: 2500, NIYUH37: 2500, SAAUH38: 2500,
  DEEUC39: 2500, PRAUC40: 2500, VIGUP41: 2500, YUVUT42: 2500,
};

function normalizeCode(c) {
  return String(c || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');
}

function parseCodesArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) { }
  }
  return [];
}

async function loadSiteSettingsRow() {
  if (!supabase) return { baseFee: BASE_DELEGATE_FEE, referralCodes: [] };
  try {
    const [sysRes, siteRes] = await Promise.allSettled([
      supabase.from('system_settings').select('*').eq('id', 'global').maybeSingle(),
      supabase.from('site_settings').select('*').eq('id', 'global').maybeSingle(),
    ]);
    const sysData = sysRes.status === 'fulfilled' ? sysRes.value.data : null;
    const siteData = siteRes.status === 'fulfilled' ? siteRes.value.data : null;
    const baseFee =
      Number(
        siteData?.delegate_fee ||
        sysData?.delegate_base_fee ||
        siteData?.delegateFee ||
        BASE_DELEGATE_FEE
      ) || BASE_DELEGATE_FEE;

    // Merge codes from system_settings (primary) and site_settings (fallback)
    const map = new Map();
    for (const c of [...parseCodesArray(siteData?.referral_codes), ...parseCodesArray(sysData?.referral_codes)]) {
      const k = normalizeCode(c?.code);
      if (k) map.set(k, { ...c, code: k });
    }
    return { row: sysData || siteData || { id: 'global' }, baseFee, referralCodes: Array.from(map.values()) };
  } catch (_) {
    return { baseFee: BASE_DELEGATE_FEE, referralCodes: [] };
  }
}

async function saveReferralCodesToSettings(_existingRow, updatedCodes) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert(
        {
          id: 'global',
          referral_codes: updatedCodes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    if (!error) return true;
    console.warn('[API /api/referrals] system_settings upsert error:', error.message);
  } catch (err) {
    console.warn('[API /api/referrals] saveReferralCodesToSettings notice:', err.message);
  }
  return false;
}

async function uploadBase64ProofToStorage(base64Str, folder, prefix) {
  if (!supabase || !base64Str || !String(base64Str).startsWith('data:')) return '';
  try {
    const match = String(base64Str).match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!match) return '';
    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
    const fileName = `${folder}/${prefix}_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('resolve-uploads')
      .upload(fileName, buffer, { contentType: mimeType, upsert: true });
    if (!error && data) {
      const { data: pub } = supabase.storage.from('resolve-uploads').getPublicUrl(fileName);
      return pub?.publicUrl || '';
    }
  } catch (_) { }
  return '';
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
    supabase.from('delegates').select('*'),
    supabase.from('delegate_applications').select('*'),
  ]);
  const seen = new Set();
  const list = [];
  const combined = [
    ...(r2.status === 'fulfilled' ? r2.value.data || [] : []),
    ...(r1.status === 'fulfilled' ? r1.value.data || [] : []),
  ];
  for (const row of combined) {
    const em = String(row.email || '').trim().toLowerCase();
    const rawId = row.reg_id || row.delegate_id || row.id;
    const resolvedId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(rawId || ''))
      ? `RM-${String(rawId).replace(/-/g, '').slice(0, 4).toUpperCase()}`
      : String(rawId || '').replace(/^RM26-DEL-/i, 'RM-');
    const key = em || resolvedId;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    list.push({
      id: resolvedId,
      name: row.name || row.full_name || 'Delegate',
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
  const rl = enforceRateLimit(request, { keyPrefix: 'referrals_get', limit: 60, windowMs: 60_000 });
  if (rl) return rl;
  try {
    const { searchParams } = new URL(request.url);
    const rawCode = searchParams.get('code');
    const rawEmail = searchParams.get('email');
    const rawOcEmail = searchParams.get('ocEmail');
    const rawLumenEmail = searchParams.get('lumenEmail');

    // MODE 0A: Acquired Lumen MUN Delegate Lookup (?lumenEmail=...)
    if (rawLumenEmail) {
      const email = rawLumenEmail.trim().toLowerCase();
      let lumenDelegate = null;
      if (supabase && email) {
        try {
          const { data: row } = await supabase
            .from('delegate_applications')
            .select('*')
            .ilike('email', email)
            .limit(1)
            .maybeSingle();
          if (row) {
            const rawId = row.reg_id || row.id || '';
            const shortId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(rawId))
              ? `RM-LMN-${String(rawId).replace(/-/g, '').slice(0, 4).toUpperCase()}`
              : String(rawId).replace(/^RM26-DEL-/i, 'RM-');
            lumenDelegate = {
              id: row.id,
              regId: shortId,
              fullName: row.name || row.full_name || '',
              email: row.email || email,
              phone: row.phone || '',
              school: row.institute || row.school || '',
              grade: row.grade || '',
              dob: row.dob || '',
              address: row.address || '',
              emergencyName: row.emergency_name || '',
              emergencyPhone: row.emergency_phone || '',
              experience: row.experience || '',
              transport: 'No — Self Commute (Lumen Transfer)',
              pref1Committee: row.pref1_committee || '',
              pref1Country: row.pref1_country || '',
              pref2Committee: row.pref2_committee || '',
              pref2Country: row.pref2_country || '',
              pref3Committee: row.pref3_committee || '',
              pref3Country: row.pref3_country || '',
              preferencesUpdatedCount: Number(row.preferences_updated_count || 0),
              preferencesLocked: Number(row.preferences_updated_count || 0) >= 1,
              allocatedCommittee: row.allocated_committee || '',
              allocatedCountry: row.allocated_country || '',
              paymentUtr: row.payment_utr || '',
              paymentScreenshotUrl: row.payment_screenshot_url || '',
              status: row.status || 'PENDING',
              paymentStatus: String(row.payment_status || '').toUpperCase() === 'VERIFIED' ? 'VERIFIED' : 'PENDING_VERIFICATION',
              createdAt: row.created_at,
            };
          }
        } catch (_) { }
      }
      return NextResponse.json({
        success: true,
        found: Boolean(lumenDelegate),
        lumenDelegate,
      });
    }

    // MODE 0: Existing OC Member Profile Lookup (?ocEmail=...)
    if (rawOcEmail) {
      const email = rawOcEmail.trim().toLowerCase();
      let ocMember = null;
      if (supabase && email) {
        try {
          const { data: row } = await supabase
            .from('oc_applications')
            .select('*')
            .ilike('email', email)
            .limit(1)
            .maybeSingle();
          if (row) {
            ocMember = {
              id: row.id,
              appId: row.app_id || `RM-OC-${String(row.id).replace(/-/g, '').slice(0, 4).toUpperCase()}`,
              fullName: row.full_name || '',
              email: row.email || email,
              phone: row.phone || '',
              school: row.school || row.institute || '',
              grade: row.grade || '',
              dob: row.dob || '',
              department: row.allocated_department || row.department1 || 'Organizing Committee',
              feeTier: row.fee_tier || row.payment_tier || '',
              transport: row.transport_needed || row.transport || 'No',
              address: row.residential_address || row.address || '',
              instagram: row.instagram || '',
              emergencyName: row.emergency_name || '',
              emergencyPhone: row.emergency_phone || '',
              paymentUtr: row.payment_utr || '',
              paymentScreenshotUrl: row.payment_screenshot_url || '',
              status: row.status || 'Pending Approval',
              paymentStatus: row.payment_status || 'PENDING_VERIFICATION',
              createdAt: row.created_at,
            };
          }
        } catch (_) { }
      }

      const { baseFee: ocBaseFee, referralCodes: ocDbCodes } = await loadSiteSettingsRow();
      const ocAllCodes = mergeCodesWithMemory(ocDbCodes);
      const myCodes = ocAllCodes.filter(
        (c) => String(c.ownerEmail || '').trim().toLowerCase() === email && c.active !== false
      );
      const ocStatusLower = String(ocMember?.status || '').toLowerCase();
      const isApproved =
        ADMIN_EMAILS.includes(email) ||
        ocStatusLower === 'approved' ||
        ocStatusLower === 'accepted' ||
        myCodes.length > 0;

      const allDelegates = await fetchAllDelegateRows();
      const myCodeSet = new Set(myCodes.map((c) => normalizeCode(c.code)));
      const codeMap = new Map(myCodes.map((c) => [normalizeCode(c.code), c]));
      const myReferrals = allDelegates
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
      const verifiedRefs = myReferrals.filter((r) => r.verified);
      const pendingRefs = myReferrals.filter((r) => !r.verified);

      return NextResponse.json(
        {
          success: true,
          found: Boolean(ocMember),
          isApproved,
          ocMember,
          baseFee: ocBaseFee,
          cashPoolPerReferral: SECRETARIAT_CASH_POOL,
          myCodes,
          stats: {
            totalReferrals: myReferrals.length,
            verifiedCount: verifiedRefs.length,
            pendingCount: pendingRefs.length,
            totalVerifiedCash: verifiedRefs.reduce((s, r) => s + r.cashEarned, 0),
            totalPendingCash: pendingRefs.reduce((s, r) => s + r.cashEarned, 0),
          },
          referrals: myReferrals,
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

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
        }, { headers: { 'Cache-Control': 'no-store' } });
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
          resPointsForDelegate: RES_POINTS_PER_REFERRAL,
          finalFee: baseFee,
          message: `✓ Valid Delegate Referral (${matchedDelegate.name}) — +${RES_POINTS_PER_REFERRAL} RES Points to BOTH you & ${matchedDelegate.name}! · Pay ₹${baseFee.toLocaleString('en-IN')}`,
        }, { headers: { 'Cache-Control': 'no-store' } });
      }

      // 1C. Check legacy partner / ambassador codes
      if (LEGACY_PARTNER_CODES[code]) {
        const finalFee = Number(LEGACY_PARTNER_CODES[code]);
        const discount = Math.max(0, baseFee - finalFee);
        return NextResponse.json({
          valid: true,
          code,
          type: 'PARTNER_CODE',
          ownerName: 'Resolve MUN Ambassador',
          baseFee,
          discountAmount: discount,
          finalFee,
          message:
            discount > 0
              ? `✓ Valid referral code applied — ₹${discount.toLocaleString('en-IN')} OFF · Pay ₹${finalFee.toLocaleString('en-IN')}`
              : `✓ Valid referral code applied — Pay ₹${finalFee.toLocaleString('en-IN')}`,
        }, { headers: { 'Cache-Control': 'no-store' } });
      }

      return NextResponse.json({
        valid: false,
        code,
        baseFee,
        finalFee: baseFee,
        message: 'Referral code not recognized',
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // MODE 2: Secretariat Cash Dashboard Stats (?email=...)
    if (rawEmail) {
      const email = rawEmail.trim().toLowerCase();
      let isSecretariat = ADMIN_EMAILS.includes(email);
      let memberName = '';
      let memberRole = isSecretariat ? 'Secretariat / Admin' : '';
      let rosterMember = null;
      let needsOnboarding = false;
      let pendingApproval = false;

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
          const hasSubmittedProfile = Boolean(rRow.phone || rRow.school || rRow.upi_id);
          if (rRow.onboarded || ADMIN_EMAILS.includes(email)) {
            needsOnboarding = false;
            pendingApproval = false;
          } else if (hasSubmittedProfile) {
            needsOnboarding = false;
            pendingApproval = true;
          } else {
            needsOnboarding = true;
            pendingApproval = false;
          }
        } else if (secRow) {
          isSecretariat = true;
          memberName = secRow.full_name || memberName;
          memberRole = secRow.position || 'Secretariat';
          const approved = String(secRow.status || '').toLowerCase() === 'accepted' || String(secRow.status || '').toLowerCase() === 'approved';
          needsOnboarding = false;
          pendingApproval = !approved && !ADMIN_EMAILS.includes(email);
        } else {
          // Anyone with the /secretariat group link can submit their profile for admin approval
          isSecretariat = true;
          needsOnboarding = !ADMIN_EMAILS.includes(email);
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
        pendingApproval,
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
  const rl = enforceRateLimit(request, { keyPrefix: 'referrals_post', limit: 25, windowMs: 60_000 });
  if (rl) return rl;
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
      // Enforce Secretariat or OC approval gate server-side
      if (supabase && !ADMIN_EMAILS.includes(email)) {
        const [rosterRes, ocRes] = await Promise.allSettled([
          supabase.from('secretariat_roster').select('onboarded').ilike('email', email).limit(1).maybeSingle(),
          supabase.from('oc_applications').select('status').ilike('email', email).limit(1).maybeSingle(),
        ]);
        const rosterApproved = Boolean(rosterRes.status === 'fulfilled' && rosterRes.value.data?.onboarded);
        const ocStatus = String(ocRes.status === 'fulfilled' ? ocRes.value.data?.status || '' : '').toLowerCase();
        const ocApproved = ocStatus === 'approved' || ocStatus === 'accepted';
        if (!rosterApproved && !ocApproved) {
          return NextResponse.json(
            { success: false, message: 'Your Secretariat / OC profile is pending Admin approval before you can create referral codes.' },
            { status: 403 }
          );
        }
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

      const roleTag = String(body.memberType || '').toUpperCase() === 'OC' ? 'OC' : 'Secretariat';
      const entry = {
        code,
        type: 'SECRETARIAT_CASH',
        ownerEmail: email,
        ownerName,
        label: `${ownerName} (${roleTag})`,
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

      // Ensure Secretariat/Admin code owners always appear in the Admin Secretariat Roster table
      if (supabase && roleTag === 'Secretariat') {
        try {
          const { data: exRoster } = await supabase
            .from('secretariat_roster')
            .select('id')
            .ilike('email', email)
            .limit(1)
            .maybeSingle();
          if (!exRoster?.id) {
            const nowIso = new Date().toISOString();
            await supabase.from('secretariat_roster').upsert(
              {
                email,
                full_name: ownerName,
                allotted_role: ADMIN_EMAILS.includes(email) ? 'Secretariat / Admin' : 'Secretariat Member',
                onboarded: true,
                onboarded_at: nowIso,
                updated_at: nowIso,
              },
              { onConflict: 'email' }
            );
          }
        } catch (_) {}
      }

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
      const allottedRole = String(body.allottedRole || 'Secretariat Member').trim();
      const phone = String(body.phone || '').trim();
      const school = String(body.school || '').trim();
      const grade = String(body.grade || '').trim();
      const upiId = String(body.upiId || '').trim();
      const instagram = String(body.instagram || '').trim();

      if (!fullName || !phone || !school || !allottedRole) {
        return NextResponse.json(
          { success: false, message: 'Full Name, Allotted Role, Phone, and School/Institution are required.' },
          { status: 400 }
        );
      }

      const isAdminEmail = ADMIN_EMAILS.includes(email);
      let isAlreadyApproved = isAdminEmail;
      if (supabase) {
        const nowIso = new Date().toISOString();
        try {
          const { data: exRoster } = await supabase
            .from('secretariat_roster')
            .select('onboarded')
            .ilike('email', email)
            .limit(1)
            .maybeSingle();
          if (exRoster?.onboarded) isAlreadyApproved = true;
        } catch (_) { }

        const { error } = await supabase
          .from('secretariat_roster')
          .upsert(
            {
              email,
              full_name: fullName,
              allotted_role: allottedRole,
              phone,
              school,
              grade,
              upi_id: upiId,
              instagram,
              onboarded: isAlreadyApproved,
              onboarded_at: isAlreadyApproved ? nowIso : null,
              updated_at: nowIso,
            },
            { onConflict: 'email' }
          );
        if (error) {
          return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        // Also mirror into `secretariat_applications` as Pending Approval until admin approves
        try {
          const { data: exSec } = await supabase
            .from('secretariat_applications')
            .select('id, status')
            .ilike('email', email)
            .limit(1)
            .maybeSingle();
          const secPayload = {
            full_name: fullName,
            email,
            phone,
            school_college: school,
            institute: school,
            grade,
            instagram,
            position: allottedRole,
            allocated_role: allottedRole,
            status: isAlreadyApproved ? 'Accepted' : 'Pending Approval',
          };
          if (exSec?.id) {
            await supabase.from('secretariat_applications').update(secPayload).eq('id', exSec.id);
          } else {
            await supabase.from('secretariat_applications').insert([
              {
                ...secPayload,
                app_id: `RM-SEC-${Math.floor(1000 + Math.random() * 9000)}`,
              },
            ]);
          }
        } catch (_) { }
      }

      // Mirror to Google Apps Script Sheet
      const appsUrl = process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL;
      if (appsUrl) {
        fetch(appsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'SUBMIT_SECRETARIAT',
            fullName,
            email,
            phone,
            schoolCollege: school,
            grade,
            instagram,
            position: allottedRole,
            upiId,
            status: isAlreadyApproved ? 'Accepted' : 'Pending Approval',
          }),
        }).catch(() => { });
      }

      // Send "Waiting for Approval" email to Secretariat member + CC Resolve
      if (!isAlreadyApproved) {
        await sendTransactionalEmail({
          to: email,
          cc: RESOLVE_CC_EMAIL,
          name: fullName,
          subject: `Secretariat Profile Submitted — Waiting for Approval | Resolve MUN 2.0`,
          eyebrow: 'Secretariat Onboarding · Pending Approval',
          title: 'Profile Received — Waiting for Admin Approval',
          text:
            `We have received your Resolve MUN 2.0 Secretariat onboarding details (${allottedRole}).\n\n` +
            `Your profile is currently waiting for Admin approval. Once approved, you will receive a confirmation email and your ₹400 Referral Cash Dashboard will unlock at https://resolvemun.in/secretariat.\n\n` +
            `Dates: 26–27 December 2026\nVenue: Northfield International School, Kompally, Hyderabad\n\n` +
            `Resolve MUN 2.0 Secretariat`,
          ctaLabel: 'Open Secretariat Portal',
          ctaUrl: 'https://resolvemun.in/secretariat',
          highlightBox: {
            label: 'Submitted Role · Status',
            value: `${allottedRole} · Waiting for Admin Approval`,
          },
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        pendingApproval: !isAlreadyApproved,
        message: isAlreadyApproved
          ? 'Secretariat profile saved! Your referral code dashboard is active.'
          : 'Secretariat profile submitted! Awaiting Admin approval to unlock your referral dashboard.',
      });
    }

    if (action === 'COMPLETE_OC_ONBOARDING') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, message: 'Valid signed-in email is required.' }, { status: 400 });
      }
      const fullName = String(body.fullName || '').trim();
      const phone = String(body.phone || '').trim();
      const school = String(body.school || '').trim();
      const grade = String(body.grade || '').trim();
      const dob = String(body.dob || '').trim();
      const department = String(body.department || 'Organizing Committee').trim();
      const feeTier = String(body.feeTier || body.payment_tier || '₹1,500 — Full Plan (Transport + T-Shirt + Meals)').trim();
      const transport = String(body.transport || 'No').trim();
      const address = String(body.address || '').trim();
      const instagram = String(body.instagram || '').trim();
      const emergencyName = String(body.emergencyName || '').trim();
      const emergencyPhone = String(body.emergencyPhone || '').trim();
      const paymentUtr = String(body.paymentUtr || '').trim();
      const paymentScreenshotUrl = String(body.paymentScreenshotUrl || '').trim();
      const paymentScreenshotBase64 = String(body.paymentScreenshotBase64 || '').trim();

      if (!fullName || !phone || !school || !department) {
        return NextResponse.json(
          { success: false, message: 'Full Name, Phone, School/Institution, and Department are required.' },
          { status: 400 }
        );
      }

      const cleanOcPh = phone.replace(/\D/g, '').slice(-10);
      const cleanOcEmg = emergencyPhone.replace(/\D/g, '').slice(-10);
      if (cleanOcPh && cleanOcEmg && cleanOcPh === cleanOcEmg) {
        return NextResponse.json(
          { success: false, message: "Parent / Emergency phone cannot be the same as your own phone number." },
          { status: 400 }
        );
      }

      let savedAppId = `RM-OC-${Math.floor(1000 + Math.random() * 9000)}`;
      if (supabase) {
        try {
          const { data: existing } = await supabase
            .from('oc_applications')
            .select('id, app_id, status, payment_status, payment_screenshot_url')
            .ilike('email', email)
            .limit(1)
            .maybeSingle();

          if (existing?.app_id) {
            savedAppId = String(existing.app_id).replace(/^RM26-OC-/i, 'RM-OC-');
          }

          const alreadyApproved =
            String(existing?.status || '').toLowerCase() === 'approved' ||
            String(existing?.status || '').toLowerCase() === 'accepted';

          let finalOcProofUrl = paymentScreenshotUrl || existing?.payment_screenshot_url || '';
          if (!finalOcProofUrl && paymentScreenshotBase64) {
            finalOcProofUrl = await uploadBase64ProofToStorage(paymentScreenshotBase64, 'oc-payments', savedAppId);
          }

          const ocPayload = {
            app_id: savedAppId,
            full_name: fullName,
            email,
            phone,
            school,
            institute: school,
            grade,
            dob,
            department1: department,
            allocated_department: department,
            transport_needed: transport,
            transport,
            residential_address: address,
            address,
            instagram,
            payment_tier: feeTier,
            fee_tier: feeTier,
            payment_utr: paymentUtr || (feeTier.toLowerCase().includes('later') ? 'PAY_LATER' : 'PENDING'),
            payment_screenshot_url: finalOcProofUrl,
            payment_status: alreadyApproved ? 'VERIFIED' : 'PENDING_VERIFICATION',
            status: alreadyApproved ? 'Approved' : 'Pending Approval',
            additional_info: emergencyName || emergencyPhone ? `Parent: ${emergencyName} (${emergencyPhone})` : '',
          };

          if (existing?.id) {
            const { error: updErr } = await supabase
              .from('oc_applications')
              .update(ocPayload)
              .eq('id', existing.id);
            if (updErr) return NextResponse.json({ success: false, message: updErr.message }, { status: 500 });
          } else {
            const { error: insErr } = await supabase
              .from('oc_applications')
              .insert([ocPayload]);
            if (insErr) return NextResponse.json({ success: false, message: insErr.message }, { status: 500 });
          }
        } catch (err) {
          return NextResponse.json({ success: false, message: err.message }, { status: 500 });
        }
      }

      // Mirror to Google Apps Script (archives screenshot in Drive & logs to Sheet)
      const appsUrl = process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL;
      if (appsUrl) {
        fetch(appsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'SUBMIT_OC',
            appId: savedAppId,
            fullName,
            email,
            phone,
            emergencyName,
            emergencyPhone,
            school,
            grade,
            dob,
            department,
            address,
            instagram,
            transport,
            feeTier,
            payment_tier: feeTier,
            payment_utr: paymentUtr || 'PENDING',
            payment_screenshot_link: paymentScreenshotUrl || paymentScreenshotBase64,
            paymentScreenshotBase64,
            screenshotName: body.screenshotName || `OC_Payment_${savedAppId}.png`,
          }),
        }).catch(() => { });
      }

      // Send "Waiting for Approval" email to OC member + CC Resolve
      await sendTransactionalEmail({
        to: email,
        cc: RESOLVE_CC_EMAIL,
        name: fullName,
        subject: `OC Onboarding Received — Waiting for Admin Approval [${savedAppId}]`,
        eyebrow: 'Organizing Committee · Pending Approval',
        title: 'OC Profile Received — Waiting for Approval',
        text:
          `We have received your Resolve MUN 2.0 Organizing Committee (OC) profile.\n\n` +
          `Application ID: ${savedAppId}\nDepartment: ${department}\nSelected Plan: ${feeTier}\nUTR: ${paymentUtr || 'Pending / Pay Later'}\n\n` +
          `Your profile and payment proof are waiting for Admin approval. Once approved, you will receive an approval email and your OC Pass & ₹400 Referral Cash Dashboard will unlock at https://resolvemun.in/oc.\n\n` +
          `Dates: 26–27 December 2026\nVenue: Northfield International School, Kompally, Hyderabad\n\n` +
          `Resolve MUN 2.0 Secretariat`,
        ctaLabel: 'Open OC Portal',
        ctaUrl: 'https://resolvemun.in/oc',
        highlightBox: {
          label: `OC Profile · ${savedAppId}`,
          value: `${department} · ${feeTier} · Waiting for Approval`,
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        appId: savedAppId,
        message: 'OC Profile & payment proof submitted! Awaiting Secretariat approval.',
      });
    }

    if (action === 'COMPLETE_LUMEN_ONBOARDING') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return NextResponse.json({ success: false, message: 'Valid signed-in email is required.' }, { status: 400 });
      }
      const fullName = String(body.fullName || '').trim();
      const phone = String(body.phone || '').trim();
      const school = String(body.school || '').trim();
      const grade = String(body.grade || '').trim();
      const dob = String(body.dob || '').trim();
      const address = String(body.address || '').trim();
      const emergencyName = String(body.emergencyName || '').trim();
      const emergencyPhone = String(body.emergencyPhone || '').trim();
      const experience = String(body.experience || 'First Timer / N/A').trim();
      const pref1Committee = String(body.pref1Committee || '').trim();
      const pref1Country = String(body.pref1Country || '').trim();
      const pref2Committee = String(body.pref2Committee || '').trim();
      const pref2Country = String(body.pref2Country || '').trim();
      const pref3Committee = String(body.pref3Committee || '').trim();
      const pref3Country = String(body.pref3Country || '').trim();

      if (!fullName || !phone || !school || !grade || !dob || !pref1Committee || !pref2Committee || !pref3Committee) {
        return NextResponse.json(
          {
            success: false,
            message: 'Please complete your Personal Details, DOB, and all 3 Committee Preferences.',
          },
          { status: 400 }
        );
      }

      const cleanDelPhone = phone.replace(/\D/g, '').slice(-10);
      const cleanEmgPhone = emergencyPhone.replace(/\D/g, '').slice(-10);
      if (cleanDelPhone && cleanEmgPhone && cleanDelPhone === cleanEmgPhone) {
        return NextResponse.json(
          {
            success: false,
            message: "Parent / Emergency contact number cannot be the same as the delegate's phone number.",
          },
          { status: 400 }
        );
      }

      let savedRegId = `RM-LMN-${Math.floor(1000 + Math.random() * 9000)}`;
      if (supabase) {
        try {
          const { data: existing } = await supabase
            .from('delegate_applications')
            .select('*')
            .ilike('email', email)
            .limit(1)
            .maybeSingle();

          if (existing?.reg_id) {
            savedRegId = String(existing.reg_id).startsWith('RM-LMN-')
              ? existing.reg_id
              : `RM-LMN-${String(existing.reg_id).replace(/[^0-9A-Z]/gi, '').slice(-4) || Math.floor(1000 + Math.random() * 9000)}`;
          }

          const currentPrefCount = Number(existing?.preferences_updated_count || 0);
          const isChangingPrefs =
            existing &&
            existing.pref1_committee &&
            (pref1Committee !== (existing.pref1_committee || '') ||
              pref1Country !== (existing.pref1_country || '') ||
              pref2Committee !== (existing.pref2_committee || '') ||
              pref2Country !== (existing.pref2_country || '') ||
              pref3Committee !== (existing.pref3_committee || '') ||
              pref3Country !== (existing.pref3_country || ''));

          if (isChangingPrefs && currentPrefCount >= 1) {
            return NextResponse.json(
              {
                success: false,
                preferencesLocked: true,
                message: 'Committee and portfolio preferences can only be changed once. Your one-time preference edit has already been used.',
              },
              { status: 403 }
            );
          }

          const paymentUtr = String(body.paymentUtr || '').trim() || 'LUMEN-ACQUIRED';
          let paymentScreenshotUrl = String(body.paymentScreenshotUrl || '').trim() || existing?.payment_screenshot_url || '';
          const paymentScreenshotBase64 = String(body.paymentScreenshotBase64 || '').trim();
          if (!paymentScreenshotUrl && paymentScreenshotBase64) {
            paymentScreenshotUrl = await uploadBase64ProofToStorage(paymentScreenshotBase64, 'payment-proofs', savedRegId);
          }
          const alreadyVerified = String(existing?.payment_status || '').toUpperCase() === 'VERIFIED';

          const lumenPayload = {
            reg_id: savedRegId,
            name: fullName,
            email,
            phone,
            institute: school,
            grade,
            dob,
            address,
            emergency_name: emergencyName,
            emergency_phone: emergencyPhone,
            experience,
            transport: 'No (Lumen Transfer)',
            pref1_committee: isChangingPrefs && currentPrefCount >= 1 ? existing.pref1_committee : pref1Committee,
            pref1_country: isChangingPrefs && currentPrefCount >= 1 ? existing.pref1_country : pref1Country,
            pref2_committee: isChangingPrefs && currentPrefCount >= 1 ? existing.pref2_committee : pref2Committee,
            pref2_country: isChangingPrefs && currentPrefCount >= 1 ? existing.pref2_country : pref2Country,
            pref3_committee: isChangingPrefs && currentPrefCount >= 1 ? existing.pref3_committee : pref3Committee,
            pref3_country: isChangingPrefs && currentPrefCount >= 1 ? existing.pref3_country : pref3Country,
            preferences_updated_count: isChangingPrefs ? 1 : currentPrefCount,
            registration_fee: 0,
            payment_utr: paymentUtr,
            payment_screenshot_url: paymentScreenshotUrl,
            referral: 'LUMEN-MUN',
            payment_status: alreadyVerified ? 'VERIFIED' : 'PENDING_VERIFICATION',
            status: alreadyVerified ? (existing?.allocated_committee ? 'ALLOTTED' : 'Confirmed') : 'PENDING',
            additional_info: body.liabilityAccepted ? 'LUMEN_ACQUIRED | LIABILITY_ACCEPTED' : 'LUMEN_ACQUIRED',
            updated_at: new Date().toISOString(),
          };

          if (existing?.id) {
            const { error: updErr } = await supabase
              .from('delegate_applications')
              .update(lumenPayload)
              .eq('id', existing.id);
            if (updErr) return NextResponse.json({ success: false, message: updErr.message }, { status: 500 });
          } else {
            const { error: insErr } = await supabase
              .from('delegate_applications')
              .insert([lumenPayload]);
            if (insErr) return NextResponse.json({ success: false, message: insErr.message }, { status: 500 });
          }

          await supabase.from('draft_leads').delete().ilike('email', email);

          // Mirror to Google Apps Script (archives Lumen transaction screenshot to Drive & logs to Sheet)
          const appsUrl = process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL;
          if (appsUrl) {
            fetch(appsUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                action: 'SUBMIT_LUMEN',
                regId: savedRegId,
                fullName,
                email,
                phone,
                emergencyName,
                emergencyPhone,
                school,
                grade,
                dob,
                address,
                experience,
                pref1_committee: pref1Committee,
                pref1_country: pref1Country,
                pref2_committee: pref2Committee,
                pref2_country: pref2Country,
                pref3_committee: pref3Committee,
                pref3_country: pref3Country,
                payment_utr: paymentUtr,
                payment_screenshot_link: paymentScreenshotUrl || paymentScreenshotBase64,
                paymentScreenshotBase64,
                screenshotName: body.screenshotName || `Lumen_Payment_${savedRegId}.png`,
              }),
            }).catch(() => { });
          }
        } catch (err) {
          return NextResponse.json({ success: false, message: err.message }, { status: 500 });
        }
      }

      // Send "Waiting for Verification" email to Lumen MUN Delegate + CC Resolve
      await sendTransactionalEmail({
        to: email,
        cc: RESOLVE_CC_EMAIL,
        name: fullName,
        subject: `Lumen Transfer Received — Payment Proof Under Verification [${savedRegId}]`,
        eyebrow: 'Lumen MUN Transfer · Waiting for Approval',
        title: 'Your Transfer & Payment Proof Are Under Review',
        text:
          `Welcome to Resolve MUN 2.0! We have received your Lumen MUN transfer details, transaction proof (UTR: ${paymentUtr || 'Attached'}), and committee preferences.\n\n` +
          `Registration ID: ${savedRegId}\nPreferences: ${[pref1Committee, pref2Committee, pref3Committee].filter(Boolean).join(' · ')}\n\n` +
          `Our Secretariat is currently verifying your Lumen transaction screenshot. Once approved, your official Digital Gate Pass & Committee Allotment will be unlocked.\n\n` +
          `Dates: 26–27 December 2026\nVenue: Northfield International School, Kompally, Hyderabad\n\n` +
          `Resolve MUN 2.0 Secretariat`,
        ctaLabel: 'Track Status on Dashboard',
        ctaUrl: 'https://resolvemun.in/dashboard',
        highlightBox: {
          label: 'Lumen Transfer Reference',
          value: `${savedRegId} · UTR: ${paymentUtr || 'Attached'} · Waiting for Approval`,
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        regId: savedRegId,
        message: 'Lumen Delegate transfer & payment proof submitted! Awaiting Secretariat approval.',
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
