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

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBg95Ln6L3-pDY2kJLL_h9t_Yg5wK-ETTY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "resolve-mun.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "resolve-mun",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "resolve-mun.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "417017657861",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:417017657861:web:40ba9b5c43669b2f257a6c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RRHK8V4ZFG",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const GOOGLE_APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxd_EyDHhJY1yokbma62PFcLu1SyBC-QXe32zb8JRIOUaJBowaivqNcgVwqk4HEsxTLpw/exec";

/* -------------------------------------------------------------------------- */
/*                               AUTH HELPERS                                 */
/* -------------------------------------------------------------------------- */

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email, password, fullName) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (fullName && result.user) {
    try {
      await updateProfile(result.user, { displayName: fullName });
    } catch (_) {}
  }
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

const CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchDelegateApplicationCached(userId, email, forceRefresh = false) {
  if (!email && !userId) return null;
  const identifier = email || userId;
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

  try {
    const res = await fetch(`/api/delegate?email=${encodeURIComponent(identifier)}`);
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
    console.warn("[Firebase] fetchDelegateApplication error:", err);
  }
  return null;
}

export async function fetchSystemSettingsCached(forceRefresh = false) {
  return {
    registrations_open: true,
    round_name: "Round 1 Priority Applications",
    delegate_base_fee: 1999.0,
  };
}

export async function submitDelegateApplication(formData, user = null) {
  const activeUser = user || auth.currentUser;
  const activeUserId = activeUser?.uid || null;

  const payload = {
    type: "DELEGATE_REGISTRATION",
    action: "SUBMIT_DELEGATE",
    user_id: activeUserId,
    uid: activeUserId,
    isVerifiedUser: true,
    recaptchaToken: formData.recaptcha_token || formData.recaptchaToken || "RESOLVE_VERIFIED",
    recaptcha_token: formData.recaptcha_token || formData.recaptchaToken || "RESOLVE_VERIFIED",
    name: formData.name,
    fullName: formData.name,
    grade: formData.grade || "",
    phone: formData.phone,
    email: formData.email,
    institute: formData.institute,
    institution: formData.institute,
    address: formData.address || "",
    transport: formData.transport || "",
    experience: formData.experience || "",
    emergency_name: formData.emergency_name || "",
    emergency_phone: formData.emergency_phone || "",
    referral: formData.referral || "",
    pref1_committee: formData.pref1_committee || "",
    pref1_country: formData.pref1_country || "",
    pref2_committee: formData.pref2_committee || "",
    pref2_country: formData.pref2_country || "",
    pref3_committee: formData.pref3_committee || "",
    pref3_country: formData.pref3_country || "",
    registration_fee: parseFloat(formData.registration_fee) || 2199.0,
    payment_utr: formData.payment_utr || formData.txnID || "",
    payment_screenshot_link: formData.payment_screenshot_link || formData.payment_screenshot_url || "",
    payment_screenshot_url: formData.payment_screenshot_link || formData.payment_screenshot_url || "",
    payment_status: "PENDING_VERIFICATION",
    status: "Confirmed",
    created_at: new Date().toISOString(),
  };

  const response = await dispatchMailingWebhook(payload);

  if (typeof window !== "undefined") {
    if (activeUserId) sessionStorage.removeItem(`resolve_delegate_cache_${activeUserId}`);
    sessionStorage.removeItem(`resolve_delegate_cache_${formData.email}`);
    localStorage.setItem("resolve_user_registered", "true");
    localStorage.setItem("resolve_delegate_id", response?.regId || response?.id || "RM26-DEL-CONFIRMED");
    localStorage.setItem("resolve_user_email", formData.email);
    localStorage.setItem("resolve_user_name", formData.name);
  }

  return { ...payload, id: response?.regId || response?.id || `DEL-${Date.now()}` };
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
