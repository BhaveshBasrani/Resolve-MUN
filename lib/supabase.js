import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rlmjuuaayyffyilesfka.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbWp1dWFheXlmZnlpbGVzZmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyOTA4NzEsImV4cCI6MjEwNDg2Njg3MX0.NOofOBGnxekyJgucemZVx3WnZGcpZAjecjelOjpMlLE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const GOOGLE_APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxd_EyDHhJY1yokbma62PFcLu1SyBC-QXe32zb8JRIOUaJBowaivqNcgVwqk4HEsxTLpw/exec";

/* -------------------------------------------------------------------------- */
/*                               AUTH HELPERS                                 */
/* -------------------------------------------------------------------------- */

export async function signInWithGoogle() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: origin ? `${origin}/` : undefined,
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password, fullName) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: origin ? `${origin}/` : undefined,
    },
  });
  if (error) throw error;
  return data;
}

export async function sendPasswordReset(email) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin ? `${origin}/auth/reset-password` : undefined,
  });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("resolve_delegate_cache");
    sessionStorage.removeItem("resolve_settings_cache");
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/*                     HELLA-OPTIMIZED EGRESS DATA HELPERS                    */
/* -------------------------------------------------------------------------- */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetch delegate record with strict column projection and sessionStorage caching.
 * Egress footprint is <200 bytes compared to full row dumps.
 */
export async function fetchDelegateApplicationCached(userId, email, forceRefresh = false) {
  if (!userId && !email) return null;

  const cacheKey = `resolve_delegate_cache_${userId || email}`;

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

  // Ultra-lean column selection
  let query = supabase
    .from("delegate_applications")
    .select(
      "id, name, email, grade, institute, status, payment_status, allocated_committee, allocated_country, registration_fee, created_at"
    );

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.ilike("email", email);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (error) {
    console.warn("[Supabase] fetchDelegateApplication error:", error.message);
    return null;
  }

  if (typeof window !== "undefined" && data) {
    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: Date.now(), data })
      );
    } catch (_) {}
  }

  return data;
}

/**
 * Fetch conference system settings with caching.
 */
export async function fetchSystemSettingsCached(forceRefresh = false) {
  const cacheKey = "resolve_settings_cache";

  if (!forceRefresh && typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS * 2) {
          return parsed.data;
        }
      }
    } catch (_) {}
  }

  const { data, error } = await supabase
    .from("system_settings")
    .select("registrations_open, round_name, delegate_base_fee")
    .eq("id", "global")
    .maybeSingle();

  const settings = data || {
    registrations_open: true,
    round_name: "Round 1 Priority Applications",
    delegate_base_fee: 1999.0,
  };

  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: Date.now(), data: settings })
      );
    } catch (_) {}
  }

  return settings;
}

/**
 * Save new delegate application into Supabase and dispatch email via Google Apps Script.
 * Uses 0 Supabase egress for email dispatch.
 */
export async function submitDelegateApplication(formData, user = null) {
  let activeUserId = user?.id || null;
  if (!activeUserId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) activeUserId = session.user.id;
    } catch (_) {}
  }

  const applicationPayload = {
    user_id: activeUserId,
    name: formData.name,
    grade: formData.grade || "",
    phone: formData.phone,
    email: formData.email,
    institute: formData.institute,
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
    registration_fee: parseFloat(formData.registration_fee) || 1999.0,
    payment_utr: formData.payment_utr || "",
    payment_screenshot_url: formData.payment_screenshot_link || formData.payment_screenshot_url || "",
    payment_status: "PENDING_VERIFICATION",
    status: "PENDING",
  };

  const { data, error } = await supabase
    .from("delegate_applications")
    .insert([applicationPayload])
    .select("id, name, email, status")
    .single();

  if (error) throw error;

  // Clear cache for fresh read next time
  if (typeof window !== "undefined") {
    if (user?.id) sessionStorage.removeItem(`resolve_delegate_cache_${user.id}`);
    sessionStorage.removeItem(`resolve_delegate_cache_${formData.email}`);
  }

  // Trigger Google Apps Script for automated confirmation email & Google Sheet audit sync
  // Runs asynchronous out-of-band: 0 Supabase egress!
  dispatchMailingWebhook({
    type: "DELEGATE_REGISTRATION",
    application_id: data.id,
    ...formData,
  }).catch((err) => console.warn("[AppsScript Mailer] Notice:", err));

  return data;
}

/**
 * Send 6-digit email verification code via Google Apps Script (0 Supabase egress).
 */
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

/**
 * Dispatches email notification and spreadsheet backup directly to Google Apps Script.
 * Zero Supabase egress.
 */
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
