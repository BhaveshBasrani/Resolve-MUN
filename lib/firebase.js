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
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

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
export const db = getFirestore(app);
export const storage = getStorage(app);
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

  // 1. Try fetching directly from Firestore
  try {
    let q = null;
    if (email) {
      q = query(collection(db, "delegates"), where("email", "==", email), limit(1));
    } else if (userId) {
      q = query(collection(db, "delegates"), where("user_id", "==", userId), limit(1));
    }

    if (q) {
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const record = { id: docSnap.id, _id: docSnap.id, ...docSnap.data() };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: record }));
        }
        return record;
      }
    }
  } catch (firestoreErr) {
    console.warn("[Firebase] Firestore direct read error:", firestoreErr);
  }

  // 2. Fallback to API route if direct query didn't return
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
    console.warn("[Firebase] fetchDelegateApplication fallback error:", err);
  }

  return null;
}

export async function fetchSystemSettingsCached() {
  return {
    registrations_open: true,
    round_name: "Round 1 Applications",
    delegate_base_fee: 2199.0,
  };
}

/* -------------------------------------------------------------------------- */
/*                   FIREBASE REGISTRATION SUBMISSION HELPERS                 */
/* -------------------------------------------------------------------------- */

/**
 * Submit Individual Delegate Registration to Firestore & trigger email
 */
export async function submitDelegateApplication(formData, user = null) {
  const activeUser = user || auth.currentUser;
  const activeUserId = activeUser?.uid || null;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const generatedId = `RM26-DEL-${randomSuffix}`;

  const docData = {
    delegateId: generatedId,
    "Delegate ID": generatedId,
    user_id: activeUserId,
    uid: activeUserId,
    fullName: formData.name || formData.fullName || "",
    "Full Name": formData.name || formData.fullName || "",
    name: formData.name || formData.fullName || "",
    email: formData.email || "",
    "Email Address": formData.email || "",
    phone: formData.phone || "",
    "Phone Number": formData.phone || "",
    school: formData.institute || formData.institution || "",
    institute: formData.institute || formData.institution || "",
    "School / Institution": formData.institute || formData.institution || "",
    grade: formData.grade || "",
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
    txnID: formData.payment_utr || formData.txnID || "",
    payment_screenshot_link: formData.payment_screenshot_link || formData.payment_screenshot_url || "",
    payment_screenshot_url: formData.payment_screenshot_link || formData.payment_screenshot_url || "",
    paymentVerified: "Pending",
    "Payment Verified": "Pending",
    payment_status: "PENDING_VERIFICATION",
    applicationStatus: "Pending",
    "Application Status": "Pending",
    status: "Confirmed",
    checkInDay1: "Absent",
    checkInDay2: "Absent",
    checkInDay3: "Absent",
    created_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  // 1. Write directly to Firestore 'delegates' collection
  try {
    const docRef = doc(collection(db, "delegates"));
    await setDoc(docRef, docData);
    docData._id = docRef.id;
    docData.id = docRef.id;
  } catch (err) {
    console.error("Firestore save error:", err);
  }

  // 2. Also dispatch email webhook to Google Apps Script (asynchronous notification)
  dispatchMailingWebhook({
    type: "DELEGATE_REGISTRATION",
    action: "SUBMIT_DELEGATE",
    regId: generatedId,
    id: generatedId,
    ...docData,
  }).catch((err) => console.warn("Email dispatch error:", err));

  if (typeof window !== "undefined") {
    if (activeUserId) sessionStorage.removeItem(`resolve_delegate_cache_${activeUserId}`);
    if (formData.email) sessionStorage.removeItem(`resolve_delegate_cache_${formData.email}`);
    localStorage.setItem("resolve_user_registered", "true");
    localStorage.setItem("resolve_delegate_id", generatedId);
    if (formData.email) localStorage.setItem("resolve_user_email", formData.email);
    if (formData.name) localStorage.setItem("resolve_user_name", formData.name);
  }

  return { ...docData, regId: generatedId, id: docData._id || generatedId };
}

/**
 * Submit Delegation Registration to Firestore & trigger email
 */
export async function submitDelegationApplication(data) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const delegationId = `RM26-INST-${randomSuffix}`;

  const docData = {
    delegationId: delegationId,
    instName: data.instName || "",
    adviserName: data.adviserName || "",
    adviserPhone: data.adviserPhone || "",
    adviserEmail: data.adviserEmail || "",
    size: data.size || 0,
    delegates: data.delegates || [],
    txnID: data.txnID || data.utr || "",
    utr: data.utr || data.txnID || "",
    payment_screenshot_link: data.payment_screenshot_link || data.screenshotBase64 || "",
    totalAmount: data.totalAmount || (data.size * 2199),
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  // Write to Firestore
  try {
    const docRef = doc(collection(db, "delegations"));
    await setDoc(docRef, docData);
    docData._id = docRef.id;
  } catch (err) {
    console.error("Firestore delegation save error:", err);
  }

  // Dispatch email webhook
  dispatchMailingWebhook({
    action: "SUBMIT_DELEGATION",
    type: "DELEGATION_APPLICATION",
    delegationId: delegationId,
    ...data,
  }).catch((err) => console.warn("Email dispatch error:", err));

  return { ...docData, delegationId };
}

/**
 * Submit OC Application to Firestore & trigger email
 */
export async function submitOcApplication(data) {
  const docData = {
    name: data.name || "",
    grade: data.grade || "",
    phone: data.phone || "",
    email: data.email || "",
    dob: data.dob || "",
    institute: data.institute || "",
    instagram: data.instagram || "",
    munCount: data.munCount || "",
    why: data.why || "",
    attributes: data.attributes || "",
    payment_utr: data.payment_utr || "",
    payment_screenshot_link: data.payment_screenshot_link || data.cvBase64 || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(collection(db, "oc_applications"));
    await setDoc(docRef, docData);
    docData._id = docRef.id;
  } catch (err) {
    console.error("Firestore OC save error:", err);
  }

  dispatchMailingWebhook({
    action: "SUBMIT_OC",
    type: "OC_APPLICATION",
    ...data,
  }).catch((err) => console.warn("Email dispatch error:", err));

  return docData;
}

/**
 * Submit EB Application to Firestore & trigger email
 */
export async function submitEbApplication(data) {
  const docData = {
    name: data.name || "",
    phone: data.phone || "",
    email: data.email || "",
    institute: data.institute || "",
    position: data.position || "",
    experience: data.experience || "",
    why: data.why || "",
    committees: data.committees || "",
    cv_file: data.cv_file || "",
    dob: data.dob || "",
    referral: data.referral || "",
    munCount: data.munCount || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(collection(db, "eb_applications"));
    await setDoc(docRef, docData);
    docData._id = docRef.id;
  } catch (err) {
    console.error("Firestore EB save error:", err);
  }

  dispatchMailingWebhook({
    action: "SUBMIT_EB",
    type: "EB_APPLICATION",
    ...data,
  }).catch((err) => console.warn("Email dispatch error:", err));

  return docData;
}

/**
 * Submit Secretariat Application to Firestore & trigger email
 */
export async function submitSecretariatApplication(data) {
  const docData = {
    fullName: data.fullName || "",
    email: data.email || "",
    phone: data.phone || "",
    instagram: data.instagram || "",
    schoolCollege: data.schoolCollege || "",
    residentialAddress: data.residentialAddress || "",
    dob: data.dob || "",
    grade: data.grade || "",
    position: data.position || "",
    whyJoin: data.whyJoin || "",
    contribution: data.contribution || "",
    dailyCommitment: data.dailyCommitment || "",
    portfolioName: data.portfolioName || "",
    resumeName: data.resumeName || "",
    portfolioBase64: data.portfolioBase64 || "",
    resumeBase64: data.resumeBase64 || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(collection(db, "secretariat_applications"));
    await setDoc(docRef, docData);
    docData._id = docRef.id;
  } catch (err) {
    console.error("Firestore Secretariat save error:", err);
  }

  dispatchMailingWebhook({
    action: "SUBMIT_SECRETARIAT",
    type: "SECRETARIAT_APPLICATION",
    ...data,
  }).catch((err) => console.warn("Email dispatch error:", err));

  return docData;
}

/**
 * Submit Waitlist Entry to Firestore
 */
export async function submitWaitlistEntry(data) {
  const email = typeof data === "string" ? data : data.email;
  const docData = {
    email: email,
    status: "Active",
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(collection(db, "waitlist"));
    await setDoc(docRef, docData);
    docData._id = docRef.id;
  } catch (err) {
    console.error("Firestore waitlist save error:", err);
  }

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
