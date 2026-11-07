import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  supabase,
  DEFAULT_SITE_SETTINGS,
  normalizeSettings,
  uploadFileToSupabase,
} from "@/lib/supabase";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCIgWD087Ni6xZqNrnnI76GQgkzZmQ4Hdw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mun-resolve.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mun-resolve",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mun-resolve.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "849575601668",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:849575601668:web:2e130b554f2901153a3751",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-1H3N17GSRE",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = null;
export const storage = null;
export const googleProvider = new GoogleAuthProvider();

export const GOOGLE_APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxd_EyDHhJY1yokbma62PFcLu1SyBC-QXe32zb8JRIOUaJBowaivqNcgVwqk4HEsxTLpw/exec";

/* -------------------------------------------------------------------------- */
/*                               AUTH HELPERS                                 */
/* -------------------------------------------------------------------------- */

export async function syncUserToBackend(user) {
  if (!user || !user.email) return;
  try {
    fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SYNC_USER",
        adminKey: "abhilashisgoat",
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split("@")[0],
        photoURL: user.photoURL || "",
      }),
    }).catch(() => {});
  } catch (_) {}
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  if (result.user) syncUserToBackend(result.user);
  return result.user;
}

export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  if (result.user) syncUserToBackend(result.user);
  return result.user;
}

export async function signUpWithEmail(email, password, fullName) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (fullName && result.user) {
    try {
      await updateProfile(result.user, { displayName: fullName });
    } catch (_) {}
  }
  if (result.user) syncUserToBackend(result.user);
  return result.user;
}

export async function sendPasswordReset(email) {
  return await sendPasswordResetEmail(auth, email);
}

export async function signOutUser() {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("resolve_delegate_cache");
      sessionStorage.removeItem("resolve_settings_cache");
      localStorage.removeItem("resolve_user_verified");
      localStorage.removeItem("resolve_user_name");
      localStorage.removeItem("resolve_user_email");
      localStorage.removeItem("resolve_user_photo");
    } catch (_) {}
  }
  return await signOut(auth);
}

/* -------------------------------------------------------------------------- */
/*                     TRANSACTIONAL MAILING & OTP ENGINE                     */
/* -------------------------------------------------------------------------- */

export async function dispatchMailingWebhook(payload) {
  try {
    const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return await res.json().catch(() => ({ status: "success" }));
  } catch (err) {
    console.warn("Mailing webhook non-blocking error:", err);
    return { status: "dispatched_locally" };
  }
}

async function saveToFirestoreSafe(collectionName, docId, data) {
  try {
    const { getFirestore, doc, setDoc } = await import("firebase/firestore");
    const db = getFirestore(app);
    await setDoc(doc(db, collectionName, docId), data, { merge: true });
  } catch (err) {
    console.warn(`[Firestore] Mirror notice (${collectionName}):`, err.message || err);
  }
}

export async function sendVerificationCodeEmail(email, code, fullName) {
  return await dispatchMailingWebhook({
    action: "SEND_VERIFICATION_CODE",
    type: "EMAIL_VERIFICATION_CODE",
    email: email,
    code: code,
    fullName: fullName || "Delegate",
    subject: `Your Resolve MUN 2.0 Verification Code: ${code}`,
  });
}

/* -------------------------------------------------------------------------- */
/*                      DELEGATE REGISTRATION & CACHE                         */
/* -------------------------------------------------------------------------- */

const CACHE_TTL_MS = 3 * 60 * 1000;

export async function fetchDelegateApplicationCached(userId, email, forceRefresh = false) {
  if (!email && !userId) return null;
  const cleanEmail = email ? email.trim().toLowerCase() : "";
  const identifier = cleanEmail || userId;
  const cacheKey = `resolve_delegate_cache_${identifier}`;

  if (!forceRefresh && typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          return parsed.data;
        }
      }
    } catch (_) {}
  }

  // 1. Check Supabase first (delegates, oc_applications, secretariat_applications)
  if (supabase && cleanEmail) {
    try {
      const { data: delRow } = await supabase
        .from("delegates")
        .select("*")
        .ilike("email", cleanEmail)
        .limit(1)
        .maybeSingle();

      if (delRow) {
        const normalized = {
          ...delRow,
          id: delRow.id,
          _id: delRow.id,
          regId: delRow.delegate_id || delRow.id,
          delegateId: delRow.delegate_id || delRow.id,
          fullName: delRow.full_name,
          name: delRow.full_name,
          institution: delRow.school,
          institute: delRow.school,
          paymentUTR: delRow.payment_utr,
          paymentStatus: delRow.payment_status,
          allocatedCommittee: delRow.allocated_committee,
          allocatedCountry: delRow.allocated_country,
          delegationCode: delRow.delegation_code,
          checkInDay1: delRow.check_in_day1,
          checkInDay2: delRow.check_in_day2,
          checkInDay3: delRow.check_in_day3,
          pref1: delRow.pref1_committee
            ? `${delRow.pref1_committee} · ${[delRow.pref1_portfolio1, delRow.pref1_portfolio2].filter(Boolean).join(" / ") || "General"}`
            : null,
          pref2: delRow.pref2_committee
            ? `${delRow.pref2_committee} · ${[delRow.pref2_portfolio1, delRow.pref2_portfolio2].filter(Boolean).join(" / ") || "General"}`
            : null,
          pref3: delRow.pref3_committee
            ? `${delRow.pref3_committee} · ${[delRow.pref3_portfolio1, delRow.pref3_portfolio2].filter(Boolean).join(" / ") || "General"}`
            : null,
          roleType: "DELEGATE",
        };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: normalized }));
        }
        return normalized;
      }

      // Check OC Applications in Supabase
      const { data: ocRow } = await supabase
        .from("oc_applications")
        .select("*")
        .ilike("email", cleanEmail)
        .limit(1)
        .maybeSingle();

      if (ocRow) {
        const normalized = {
          ...ocRow,
          id: ocRow.id,
          _id: ocRow.id,
          regId: ocRow.app_id || ocRow.id,
          delegateId: ocRow.app_id || ocRow.id,
          fullName: ocRow.full_name,
          name: ocRow.full_name,
          institution: ocRow.school,
          paymentUTR: ocRow.payment_utr || "OC-TRACK",
          paymentStatus: ocRow.payment_status || "VERIFIED",
          allocatedCommittee: ocRow.allocated_department || "Organizing Committee",
          allocatedCountry: `OC Member (${ocRow.payment_tier || "Standard"})`,
          roleType: "OC",
        };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: normalized }));
        }
        return normalized;
      }

      // Check Secretariat Applications in Supabase
      const { data: secRow } = await supabase
        .from("secretariat_applications")
        .select("*")
        .ilike("email", cleanEmail)
        .limit(1)
        .maybeSingle();

      if (secRow) {
        const normalized = {
          ...secRow,
          id: secRow.id,
          _id: secRow.id,
          regId: secRow.app_id || secRow.id,
          delegateId: secRow.app_id || secRow.id,
          fullName: secRow.full_name,
          name: secRow.full_name,
          institution: secRow.school_college,
          paymentUTR: "SECRETARIAT-EXEMPT",
          paymentStatus: secRow.status === "Accepted" || secRow.status === "Approved" ? "VERIFIED" : "PENDING_VERIFICATION",
          allocatedCommittee: "Resolve Secretariat",
          allocatedCountry: secRow.allocated_role || secRow.position || "Secretariat Applicant",
          roleType: "SECRETARIAT",
        };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: normalized }));
        }
        return normalized;
      }

      // Check EB Applications in Supabase
      const { data: ebRow } = await supabase
        .from("eb_applications")
        .select("*")
        .ilike("email", cleanEmail)
        .limit(1)
        .maybeSingle();

      if (ebRow) {
        const normalized = {
          ...ebRow,
          id: ebRow.id,
          _id: ebRow.id,
          regId: ebRow.app_id || ebRow.id,
          delegateId: ebRow.app_id || ebRow.id,
          fullName: ebRow.full_name,
          name: ebRow.full_name,
          institution: ebRow.institute,
          paymentUTR: "EB-EXEMPT",
          paymentStatus: ebRow.status === "Accepted" || ebRow.status === "Approved" ? "VERIFIED" : "PENDING_VERIFICATION",
          allocatedCommittee: ebRow.committees || "Executive Board",
          allocatedCountry: ebRow.role_preference || "EB Applicant",
          roleType: "EB",
        };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: normalized }));
        }
        return normalized;
      }

      // Check Delegations in Supabase (Contingent Head)
      const { data: delTeamRow } = await supabase
        .from("delegations")
        .select("*")
        .ilike("head_email", cleanEmail)
        .limit(1)
        .maybeSingle();

      if (delTeamRow) {
        const normalized = {
          ...delTeamRow,
          id: delTeamRow.id,
          _id: delTeamRow.id,
          regId: delTeamRow.delegation_code || delTeamRow.id,
          delegateId: delTeamRow.delegation_code || delTeamRow.id,
          fullName: delTeamRow.head_name || "Delegation Head",
          name: delTeamRow.head_name || "Delegation Head",
          institution: delTeamRow.institution,
          paymentUTR: delTeamRow.payment_utr || "DELEGATION-BANK",
          paymentStatus: delTeamRow.payment_status || "VERIFIED",
          allocatedCommittee: `Delegation (${delTeamRow.delegates_count || 6} Delegates)`,
          allocatedCountry: delTeamRow.delegation_code || "Contingent",
          roleType: "DELEGATION",
          delId: delTeamRow.delegation_code,
        };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: normalized }));
        }
        return normalized;
      }

      // Check Socials Pass in Supabase
      const { data: socRow } = await supabase
        .from("socials_applications")
        .select("*")
        .ilike("email", cleanEmail)
        .limit(1)
        .maybeSingle();

      if (socRow) {
        const normalized = {
          ...socRow,
          id: socRow.id,
          _id: socRow.id,
          regId: socRow.app_id || socRow.id,
          delegateId: socRow.app_id || socRow.id,
          fullName: socRow.full_name,
          name: socRow.full_name,
          institution: socRow.institution,
          paymentUTR: socRow.payment_utr || "SOCIALS-UPI",
          paymentStatus: socRow.payment_status || "VERIFIED",
          allocatedCommittee: "Socials Night",
          allocatedCountry: "Attendee Pass",
          roleType: "SOCIALS",
        };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: normalized }));
        }
        return normalized;
      }
    } catch (supaErr) {
      console.warn("[Supabase] Direct profile lookup fallback:", supaErr.message);
    }
  }

  // 2. Fallback to API route
  try {
    const res = await fetch(`/api/delegate/?email=${encodeURIComponent(identifier)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.found) {
        const record = data.delegate || data;
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: record }));
        }
        return record;
      }
    }
  } catch (err) {
    console.warn("[Firebase] fetchDelegateApplication fallback error:", err);
  }

  return null;
}

/**
 * Fetch Live Site Settings (Open/Closed Passes, Dynamic Pricing, UPI Details)
 */
export async function fetchSystemSettingsCached(forceRefresh = false) {
  const cacheKey = "resolve_settings_cache_v2";
  if (!forceRefresh && typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 60 * 1000) {
          return parsed.data;
        }
      }
    } catch (_) {}
  }

  // 1. Try Supabase site_settings
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (!error && data) {
        const normalized = normalizeSettings(data);
        const result = {
          ...normalized,
          registrations_open: normalized.registrationsOpen,
          round_name: normalized.roundName,
          delegate_base_fee: normalized.delegateFee,
        };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: result }));
        }
        return result;
      }
    } catch (_) {}
  }

  // 2. Fallback to defaults
  return {
    ...DEFAULT_SITE_SETTINGS,
    registrations_open: DEFAULT_SITE_SETTINGS.registrationsOpen,
    round_name: DEFAULT_SITE_SETTINGS.roundName,
    delegate_base_fee: DEFAULT_SITE_SETTINGS.delegateFee,
  };
}

/* -------------------------------------------------------------------------- */
/*              SUPABASE + FIREBASE REGISTRATION SUBMISSION HELPERS           */
/* -------------------------------------------------------------------------- */

/**
 * Submit Individual Delegate Registration (Priority Round PDF Schema)
 */
export async function submitDelegateApplication(formData, user = null) {
  const activeUser = user || auth.currentUser;
  const activeUserId = activeUser?.uid || null;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const generatedId = `RM26-DEL-${randomSuffix}`;

  const rawScreenshot = formData.payment_screenshot_link || formData.payment_screenshot_url || "";
  const uploadedScreenshotUrl = await uploadFileToSupabase(rawScreenshot, "delegate-payments", generatedId);

  const pref1CountryCombined = [formData.pref1_portfolio1 || formData.pref1_country, formData.pref1_portfolio2]
    .filter(Boolean)
    .join(" / ");
  const pref2CountryCombined = [formData.pref2_portfolio1 || formData.pref2_country, formData.pref2_portfolio2]
    .filter(Boolean)
    .join(" / ");
  const pref3CountryCombined = [formData.pref3_portfolio1 || formData.pref3_country, formData.pref3_portfolio2]
    .filter(Boolean)
    .join(" / ");

  const cleanEmail = (formData.email || "").trim().toLowerCase();
  const qrToken = `RESOLVE26:DELEGATE:${generatedId}:${cleanEmail}`;

  const docData = {
    delegateId: generatedId,
    "Delegate ID": generatedId,
    user_id: activeUserId,
    uid: activeUserId,
    fullName: formData.name || formData.fullName || "",
    "Full Name": formData.name || formData.fullName || "",
    name: formData.name || formData.fullName || "",
    email: cleanEmail,
    "Email Address": cleanEmail,
    phone: formData.phone || "",
    "Phone Number": formData.phone || "",
    school: formData.institute || formData.institution || formData.school || "",
    institute: formData.institute || formData.institution || formData.school || "",
    "School / Institution": formData.institute || formData.institution || formData.school || "",
    dob: formData.dob || "",
    grade: formData.grade || "",
    address: formData.address || "",
    transport: formData.transport || "No",
    experience: formData.experience || "",
    emergency_name: formData.emergency_name || "",
    emergency_phone: formData.emergency_phone || "",
    referral: formData.referral || formData.referral_code || "",
    additional_info: formData.additional_info || "",
    pref1_committee: formData.pref1_committee || "",
    pref1_country: pref1CountryCombined,
    pref1_portfolio1: formData.pref1_portfolio1 || formData.pref1_country || "",
    pref1_portfolio2: formData.pref1_portfolio2 || "",
    pref2_committee: formData.pref2_committee || "",
    pref2_country: pref2CountryCombined,
    pref2_portfolio1: formData.pref2_portfolio1 || formData.pref2_country || "",
    pref2_portfolio2: formData.pref2_portfolio2 || "",
    pref3_committee: formData.pref3_committee || "",
    pref3_country: pref3CountryCombined,
    pref3_portfolio1: formData.pref3_portfolio1 || formData.pref3_country || "",
    pref3_portfolio2: formData.pref3_portfolio2 || "",
    registration_fee: parseFloat(formData.registration_fee) || 2500.0,
    payment_utr: formData.payment_utr || formData.txnID || "",
    txnID: formData.payment_utr || formData.txnID || "",
    payment_screenshot_link: uploadedScreenshotUrl,
    payment_screenshot_url: uploadedScreenshotUrl,
    paymentVerified: "Pending",
    "Payment Verified": "Pending",
    payment_status: "PENDING_VERIFICATION",
    applicationStatus: "Pending",
    "Application Status": "Pending",
    status: "Confirmed",
    qr_token: qrToken,
    checkInDay1: "Absent",
    checkInDay2: "Absent",
    checkInDay3: "Absent",
    created_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  // 1. Dispatch to Google Apps Script (Saves screenshot to Google Drive folder 'Resolve_MUN_2026/Delegates')
  let driveScreenshotUrl = "";
  try {
    const appsScriptRes = await dispatchMailingWebhook({
      type: "DELEGATE_REGISTRATION",
      action: "SUBMIT_DELEGATE",
      regId: generatedId,
      id: generatedId,
      screenshotBase64: rawScreenshot,
      paymentScreenshotBase64: rawScreenshot,
      screenshotName: `Payment_${generatedId}.png`,
      ...docData,
      payment_screenshot_link: rawScreenshot,
    });
    if (appsScriptRes?.driveUrl) {
      driveScreenshotUrl = appsScriptRes.driveUrl;
      docData.payment_screenshot_url = driveScreenshotUrl;
      docData.payment_screenshot_link = driveScreenshotUrl;
      docData.payment_screenshot_drive_url = driveScreenshotUrl;
    }
  } catch (err) {
    console.warn("Apps Script dispatch note:", err);
  }

  const finalScreenshotUrl = driveScreenshotUrl || uploadedScreenshotUrl || "";

  // 2. Write to Supabase 'delegates'
  if (supabase) {
    try {
      await supabase.from("delegates").insert({
        delegate_id: generatedId,
        user_id: activeUserId,
        full_name: docData.fullName,
        email: cleanEmail,
        phone: docData.phone,
        school: docData.school,
        dob: docData.dob,
        grade: docData.grade,
        address: docData.address,
        transport: docData.transport,
        experience: docData.experience,
        pref1_committee: docData.pref1_committee,
        pref1_portfolio1: docData.pref1_portfolio1,
        pref1_portfolio2: docData.pref1_portfolio2,
        pref2_committee: docData.pref2_committee,
        pref2_portfolio1: docData.pref2_portfolio1,
        pref2_portfolio2: docData.pref2_portfolio2,
        pref3_committee: docData.pref3_committee,
        pref3_portfolio1: docData.pref3_portfolio1,
        pref3_portfolio2: docData.pref3_portfolio2,
        registration_fee: docData.registration_fee,
        payment_utr: docData.payment_utr,
        payment_screenshot_url: finalScreenshotUrl,
        payment_status: "PENDING_VERIFICATION",
        status: "Confirmed",
        referral_code: docData.referral,
        additional_info: docData.additional_info,
        qr_token: qrToken,
      });
    } catch (supaErr) {
      console.warn("[Supabase] Delegate insert notice:", supaErr.message);
    }
  }

  // 3. Mirror to Firebase Firestore
  saveToFirestoreSafe("delegates", generatedId, {
    ...docData,
    payment_screenshot_url: finalScreenshotUrl,
  });

  if (typeof window !== "undefined") {
    if (activeUserId) sessionStorage.removeItem(`resolve_delegate_cache_${activeUserId}`);
    if (cleanEmail) sessionStorage.removeItem(`resolve_delegate_cache_${cleanEmail}`);
    localStorage.setItem("resolve_user_registered", "true");
    localStorage.setItem("resolve_delegate_id", generatedId);
    if (cleanEmail) localStorage.setItem("resolve_user_email", cleanEmail);
    if (docData.fullName) localStorage.setItem("resolve_user_name", docData.fullName);
  }

  return { ...docData, regId: generatedId, id: generatedId };
}

/**
 * Submit Delegation Registration (Delegation PDF Schema — ₹2,200/delegate, min 6)
 */
export async function submitDelegationApplication(data) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const delegationId = `RM26-INST-${randomSuffix}`;

  const rawScreenshot = data.payment_screenshot_link || data.screenshotBase64 || "";
  const uploadedScreenshotUrl = await uploadFileToSupabase(rawScreenshot, "delegation-payments", delegationId);

  const docData = {
    delegationId: delegationId,
    delegationName: data.delegationName || data.instName || "",
    headDelegateName: data.headDelegateName || data.adviserName || "",
    instName: data.instName || data.school || "",
    adviserName: data.adviserName || data.headDelegateName || "",
    adviserPhone: data.adviserPhone || data.phone || "",
    adviserEmail: (data.adviserEmail || data.email || "").trim().toLowerCase(),
    dob: data.dob || "",
    grade: data.grade || "",
    address: data.address || "",
    transport: data.transport || "No",
    experience: data.experience || "",
    pref1_committee: data.pref1_committee || "",
    pref1_portfolio1: data.pref1_portfolio1 || "",
    pref1_portfolio2: data.pref1_portfolio2 || "",
    pref2_committee: data.pref2_committee || "",
    pref2_portfolio1: data.pref2_portfolio1 || "",
    pref2_portfolio2: data.pref2_portfolio2 || "",
    pref3_committee: data.pref3_committee || "",
    pref3_portfolio1: data.pref3_portfolio1 || "",
    pref3_portfolio2: data.pref3_portfolio2 || "",
    size: data.size || 6,
    delegates: data.delegates || [],
    txnID: data.txnID || data.utr || "",
    utr: data.utr || data.txnID || "",
    payment_screenshot_link: uploadedScreenshotUrl,
    totalAmount: data.totalAmount || (Number(data.size || 6) * 2200),
    referral: data.referral || "",
    additional_info: data.additional_info || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  // 1. Dispatch to Google Apps Script (Saves screenshot to Google Drive folder 'Resolve_MUN_2026/Delegations')
  let driveScreenshotUrl = "";
  try {
    const appsScriptRes = await dispatchMailingWebhook({
      action: "SUBMIT_DELEGATION",
      type: "DELEGATION_APPLICATION",
      delegationId: delegationId,
      screenshotBase64: rawScreenshot,
      paymentScreenshotBase64: rawScreenshot,
      screenshotName: `Delegation_Payment_${delegationId}.png`,
      ...docData,
      payment_screenshot_link: rawScreenshot,
    });
    if (appsScriptRes?.driveUrl) {
      driveScreenshotUrl = appsScriptRes.driveUrl;
      docData.payment_screenshot_url = driveScreenshotUrl;
      docData.payment_screenshot_link = driveScreenshotUrl;
    }
  } catch (err) {
    console.warn("Apps Script dispatch note:", err);
  }

  const finalScreenshotUrl = driveScreenshotUrl || uploadedScreenshotUrl || "";

  // 2. Write to Supabase 'delegations'
  if (supabase) {
    try {
      await supabase.from("delegations").insert({
        delegation_id: delegationId,
        delegation_name: docData.delegationName,
        head_delegate_name: docData.headDelegateName,
        inst_name: docData.instName,
        adviser_name: docData.adviserName,
        adviser_email: docData.adviserEmail,
        adviser_phone: docData.adviserPhone,
        size: docData.size,
        delegates: docData.delegates,
        total_amount: docData.totalAmount,
        payment_utr: docData.utr,
        payment_screenshot_url: finalScreenshotUrl,
        referral_code: docData.referral,
        additional_info: docData.additional_info,
        status: "Pending",
      });
    } catch (supaErr) {
      console.warn("[Supabase] Delegation insert notice:", supaErr.message);
    }
  }

  // 3. Mirror to Firebase Firestore
  saveToFirestoreSafe("delegations", delegationId, {
    ...docData,
    payment_screenshot_url: finalScreenshotUrl,
  });

  return { ...docData, delegationId };
}

/**
 * Submit OC Application (Salaried Role PDF Schema — ₹1500 / ₹1000 / ₹750 / Pay Later)
 */
export async function submitOcApplication(data) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const appId = `RM26-OC-${randomSuffix}`;

  const rawScreenshot = data.payment_screenshot_link || data.cvBase64 || "";
  const uploadedScreenshotUrl = await uploadFileToSupabase(rawScreenshot, "oc-payments", appId);

  const docData = {
    appId,
    name: data.name || "",
    fullName: data.name || "",
    grade: data.grade || "",
    phone: data.phone || "",
    email: (data.email || "").trim().toLowerCase(),
    dob: data.dob || "",
    institute: data.institute || data.school || "",
    school: data.institute || data.school || "",
    address: data.address || "",
    transport: data.transport || "Yes",
    payment_tier: data.payment_tier || "1500_FULL",
    fee_amount: Number(data.fee_amount || 1500),
    instagram: data.instagram || "",
    munCount: data.munCount || "",
    why: data.why || data.additional_info || "",
    attributes: data.attributes || "",
    referral: data.referral || "",
    additional_info: data.additional_info || "",
    payment_utr: data.payment_utr || data.txnID || "",
    payment_screenshot_link: uploadedScreenshotUrl,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  // 1. Dispatch to Google Apps Script (Saves screenshot to Google Drive folder 'Resolve_MUN_2026/Organizing_Committee')
  let driveScreenshotUrl = "";
  try {
    const appsScriptRes = await dispatchMailingWebhook({
      action: "SUBMIT_OC",
      type: "OC_APPLICATION",
      appId,
      screenshotBase64: rawScreenshot,
      paymentScreenshotBase64: rawScreenshot,
      screenshotName: `OC_Payment_${appId}.png`,
      ...docData,
      payment_screenshot_link: rawScreenshot,
    });
    if (appsScriptRes?.driveUrl) {
      driveScreenshotUrl = appsScriptRes.driveUrl;
      docData.payment_screenshot_url = driveScreenshotUrl;
      docData.payment_screenshot_link = driveScreenshotUrl;
    }
  } catch (err) {
    console.warn("Apps Script dispatch note:", err);
  }

  const finalScreenshotUrl = driveScreenshotUrl || uploadedScreenshotUrl || "";

  if (supabase) {
    try {
      await supabase.from("oc_applications").insert({
        app_id: appId,
        full_name: docData.fullName,
        phone: docData.phone,
        email: docData.email,
        school: docData.school,
        dob: docData.dob,
        grade: docData.grade,
        address: docData.address,
        transport: docData.transport,
        payment_tier: docData.payment_tier,
        fee_amount: docData.fee_amount,
        payment_utr: docData.payment_utr,
        payment_screenshot_url: finalScreenshotUrl,
        payment_status: docData.payment_utr ? "PENDING_VERIFICATION" : "PAY_LATER",
        referral_code: docData.referral,
        additional_info: docData.additional_info,
        status: "Pending",
      });
    } catch (supaErr) {
      console.warn("[Supabase] OC insert notice:", supaErr.message);
    }
  }

  saveToFirestoreSafe("oc_applications", appId, {
    ...docData,
    payment_screenshot_url: finalScreenshotUrl,
  });

  return docData;
}

/**
 * Submit EB Application to Supabase & trigger email
 */
export async function submitEbApplication(data) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const appId = `RM26-EB-${randomSuffix}`;
  const uploadedCvUrl = await uploadFileToSupabase(data.cv_file, "eb-cvs", appId);

  const docData = {
    appId,
    name: data.name || "",
    phone: data.phone || "",
    email: (data.email || "").trim().toLowerCase(),
    institute: data.institute || "",
    position: data.position || "",
    experience: data.experience || "",
    why: data.why || "",
    committees: data.committees || "",
    cv_file: uploadedCvUrl,
    dob: data.dob || "",
    referral: data.referral || "",
    munCount: data.munCount || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  let driveCvUrl = "";
  try {
    const appsScriptRes = await dispatchMailingWebhook({
      action: "SUBMIT_EB",
      type: "EB_APPLICATION",
      appId,
      cvBase64: data.cv_file || data.cvBase64 || "",
      cvName: `EB_CV_${appId}.pdf`,
      ...docData,
      cv_file: data.cv_file || "",
    });
    if (appsScriptRes?.cvUrl || appsScriptRes?.driveUrl) {
      driveCvUrl = appsScriptRes.cvUrl || appsScriptRes.driveUrl;
      docData.cv_file = driveCvUrl;
    }
  } catch (err) {
    console.warn("Apps Script dispatch note:", err);
  }

  const finalCvUrl = driveCvUrl || uploadedCvUrl || "";

  if (supabase) {
    try {
      await supabase.from("eb_applications").insert({
        app_id: appId,
        full_name: docData.name,
        email: docData.email,
        phone: docData.phone,
        institute: docData.institute,
        dob: docData.dob,
        role_preference: docData.position,
        committees: docData.committees,
        mun_count: docData.munCount,
        experience: docData.experience,
        why_join: docData.why,
        cv_url: finalCvUrl,
        referral_code: docData.referral,
        status: "Pending",
      });
    } catch (supaErr) {
      console.warn("[Supabase] EB insert notice:", supaErr.message);
    }
  }

  saveToFirestoreSafe("eb_applications", appId, {
    ...docData,
    cv_url: finalCvUrl,
  });

  return { ...docData, cv_url: finalCvUrl };
}

/**
 * Submit Secretariat Application (Secretariat PDF Schema — 11 Positions)
 */
export async function submitSecretariatApplication(data) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const appId = `RM26-SEC-${randomSuffix}`;

  const [portfolioUrl, resumeUrl] = await Promise.all([
    uploadFileToSupabase(data.portfolioBase64, "secretariat-portfolios", appId),
    uploadFileToSupabase(data.resumeBase64, "secretariat-resumes", appId),
  ]);

  const docData = {
    appId,
    fullName: data.fullName || "",
    email: (data.email || "").trim().toLowerCase(),
    phone: data.phone || "",
    instagram: data.instagram || "",
    schoolCollege: data.schoolCollege || "",
    residentialAddress: data.residentialAddress || "",
    dob: data.dob || "",
    grade: data.grade || "",
    previousExperiences: data.previousExperiences || "",
    position: data.position || "",
    whyJoin: data.whyJoin || "",
    contribution: data.contribution || "",
    dailyCommitment: data.dailyCommitment || "",
    portfolioName: data.portfolioName || "",
    resumeName: data.resumeName || "",
    portfolioUrl: portfolioUrl || "",
    resumeUrl: resumeUrl || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  let driveResumeUrl = "";
  let drivePortfolioUrl = "";
  try {
    const appsScriptRes = await dispatchMailingWebhook({
      action: "SUBMIT_SECRETARIAT",
      type: "SECRETARIAT_APPLICATION",
      appId,
      resumeBase64: data.resumeBase64 || "",
      portfolioBase64: data.portfolioBase64 || "",
      resumeName: data.resumeName || `SEC_RESUME_${appId}.pdf`,
      portfolioName: data.portfolioName || `SEC_PORTFOLIO_${appId}.pdf`,
      ...docData,
    });
    if (appsScriptRes?.resumeUrl) driveResumeUrl = appsScriptRes.resumeUrl;
    if (appsScriptRes?.portfolioUrl) drivePortfolioUrl = appsScriptRes.portfolioUrl;
  } catch (err) {
    console.warn("Apps Script dispatch note:", err);
  }

  const finalResumeUrl = driveResumeUrl || resumeUrl || "";
  const finalPortfolioUrl = drivePortfolioUrl || portfolioUrl || "";

  if (supabase) {
    try {
      await supabase.from("secretariat_applications").insert({
        app_id: appId,
        full_name: docData.fullName,
        email: docData.email,
        phone: docData.phone,
        instagram: docData.instagram,
        school_college: docData.schoolCollege,
        residential_address: docData.residentialAddress,
        dob: docData.dob,
        grade: docData.grade,
        previous_experiences: docData.previousExperiences,
        position: docData.position,
        why_join: docData.whyJoin,
        contribution: docData.contribution,
        daily_commitment: docData.dailyCommitment,
        portfolio_url: finalPortfolioUrl,
        resume_url: finalResumeUrl,
        status: "Pending",
      });
    } catch (supaErr) {
      console.warn("[Supabase] Secretariat insert notice:", supaErr.message);
    }
  }

  saveToFirestoreSafe("secretariat_applications", appId, {
    ...docData,
    portfolio_url: finalPortfolioUrl,
    resume_url: finalResumeUrl,
  });

  return { ...docData, portfolioUrl: finalPortfolioUrl, resumeUrl: finalResumeUrl };
}

/**
 * Submit Socials Night Pass Registration (₹999 default / dynamic socialsFee)
 */
export async function submitSocialsApplication(data, user = null) {
  const activeUser = user || auth.currentUser;
  const activeUserId = activeUser?.uid || null;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const generatedId = `RM26-SOC-${randomSuffix}`;

  const rawScreenshot = data.payment_screenshot_link || data.payment_screenshot_url || "";
  const uploadedScreenshotUrl = await uploadFileToSupabase(rawScreenshot, "socials-payments", generatedId);

  const cleanEmail = (data.email || "").trim().toLowerCase();
  const qrToken = `RESOLVE26:SOCIALS:${generatedId}:${cleanEmail}`;

  const docData = {
    delegateId: generatedId,
    appId: generatedId,
    user_id: activeUserId,
    fullName: data.name || data.fullName || "",
    name: data.name || data.fullName || "",
    email: cleanEmail,
    phone: data.phone || "",
    school: data.institute || data.school || "",
    institute: data.institute || data.school || "",
    dob: data.dob || "",
    grade: data.grade || "",
    referral: data.referral || "",
    registration_fee: parseFloat(data.registration_fee) || 999.0,
    payment_utr: data.payment_utr || data.txnID || "",
    payment_screenshot_link: uploadedScreenshotUrl,
    payment_screenshot_url: uploadedScreenshotUrl,
    payment_status: "PENDING_VERIFICATION",
    allocated_committee: "Socials Night Pass",
    allocated_country: "Socials Admit One",
    status: "Confirmed",
    qr_token: qrToken,
    createdAt: new Date().toISOString(),
  };

  let driveScreenshotUrl = "";
  try {
    const appsScriptRes = await dispatchMailingWebhook({
      action: "SUBMIT_SOCIALS",
      type: "SOCIALS_REGISTRATION",
      regId: generatedId,
      id: generatedId,
      screenshotBase64: rawScreenshot,
      paymentScreenshotBase64: rawScreenshot,
      screenshotName: `Socials_Payment_${generatedId}.png`,
      ...docData,
      payment_screenshot_link: rawScreenshot,
    });
    if (appsScriptRes?.driveUrl) {
      driveScreenshotUrl = appsScriptRes.driveUrl;
      docData.payment_screenshot_url = driveScreenshotUrl;
      docData.payment_screenshot_link = driveScreenshotUrl;
    }
  } catch (err) {
    console.warn("Apps Script dispatch note:", err);
  }

  const finalScreenshotUrl = driveScreenshotUrl || uploadedScreenshotUrl || "";

  if (supabase) {
    try {
      await supabase.from("delegates").insert({
        delegate_id: generatedId,
        user_id: activeUserId,
        full_name: docData.fullName,
        email: cleanEmail,
        phone: docData.phone,
        school: docData.school,
        dob: docData.dob,
        grade: docData.grade,
        registration_fee: docData.registration_fee,
        payment_utr: docData.payment_utr,
        payment_screenshot_url: finalScreenshotUrl,
        payment_status: "PENDING_VERIFICATION",
        allocated_committee: "Socials Night Pass",
        allocated_country: "Socials Admit One",
        status: "Confirmed",
        referral_code: docData.referral,
        qr_token: qrToken,
      });
    } catch (supaErr) {
      console.warn("[Supabase] Socials pass insert notice:", supaErr.message);
    }
  }

  saveToFirestoreSafe("delegates", generatedId, {
    ...docData,
    payment_screenshot_url: finalScreenshotUrl,
  });

  if (typeof window !== "undefined") {
    if (activeUserId) sessionStorage.removeItem(`resolve_delegate_cache_${activeUserId}`);
    if (cleanEmail) sessionStorage.removeItem(`resolve_delegate_cache_${cleanEmail}`);
    localStorage.setItem("resolve_user_registered", "true");
    localStorage.setItem("resolve_delegate_id", generatedId);
    if (cleanEmail) localStorage.setItem("resolve_user_email", cleanEmail);
    if (docData.fullName) localStorage.setItem("resolve_user_name", docData.fullName);
  }

  return { ...docData, regId: generatedId, id: generatedId };
}

/**
 * Submit Waitlist Entry
 */
export async function submitWaitlistEntry(data) {
  const email = typeof data === "string" ? data : data.email;
  const docData = {
    email: email,
    status: "Active",
    createdAt: new Date().toISOString(),
  };

  dispatchMailingWebhook({
    action: "SUBMIT_WAITLIST",
    type: "WAITLIST_ENTRY",
    email: email,
    recaptcha_token: data.recaptcha_token || "",
  }).catch((err) => console.warn("Email dispatch error:", err));

  return docData;
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
};
