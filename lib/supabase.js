import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rlmjuuaayyffyilesfka.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbWp1dWFheXlmZnlpbGVzZmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyOTA4NzEsImV4cCI6MjEwNDg2Njg3MX0.NOofOBGnxekyJgucemZVx3WnZGcpZAjecjelOjpMlLE";

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

export const DEFAULT_SITE_SETTINGS = {
  registrationsOpen: true,
  delegateOpen: true,
  delegationOpen: true,
  ocOpen: true,
  ebOpen: true,
  socialsOpen: true,
  secretariatOpen: true,
  roundName: "Priority Round Applications",
  delegateFee: 2500,
  delegationFee: 2200,
  ocFeeFull: 1500,
  ocFeeNoTransport: 1000,
  ocFeeBasic: 750,
  socialsFee: 999,
  upiId: "6301550628@nyes",
  upiPayee: "Bejugam Aditya",
};

/**
 * Normalize raw settings object (from Supabase snake_case or Firestore camelCase)
 */
export function normalizeSettings(raw = {}) {
  return {
    registrationsOpen:
      raw.registrations_open ?? raw.registrationsOpen ?? DEFAULT_SITE_SETTINGS.registrationsOpen,
    delegateOpen:
      raw.delegate_open ?? raw.delegateOpen ?? DEFAULT_SITE_SETTINGS.delegateOpen,
    delegationOpen:
      raw.delegation_open ?? raw.delegationOpen ?? DEFAULT_SITE_SETTINGS.delegationOpen,
    ocOpen: raw.oc_open ?? raw.ocOpen ?? DEFAULT_SITE_SETTINGS.ocOpen,
    ebOpen: raw.eb_open ?? raw.ebOpen ?? DEFAULT_SITE_SETTINGS.ebOpen,
    socialsOpen:
      raw.socials_open ?? raw.socialsOpen ?? DEFAULT_SITE_SETTINGS.socialsOpen,
    secretariatOpen:
      raw.secretariat_open ?? raw.secretariatOpen ?? DEFAULT_SITE_SETTINGS.secretariatOpen,
    roundName:
      raw.round_name || raw.roundName || DEFAULT_SITE_SETTINGS.roundName,
    delegateFee: Number(
      raw.delegate_fee ?? raw.delegateFee ?? DEFAULT_SITE_SETTINGS.delegateFee
    ),
    delegationFee: Number(
      raw.delegation_fee ?? raw.delegationFee ?? DEFAULT_SITE_SETTINGS.delegationFee
    ),
    ocFeeFull: Number(
      raw.oc_fee_full ?? raw.ocFeeFull ?? DEFAULT_SITE_SETTINGS.ocFeeFull
    ),
    ocFeeNoTransport: Number(
      raw.oc_fee_no_transport ??
        raw.ocFeeNoTransport ??
        DEFAULT_SITE_SETTINGS.ocFeeNoTransport
    ),
    ocFeeBasic: Number(
      raw.oc_fee_basic ?? raw.ocFeeBasic ?? DEFAULT_SITE_SETTINGS.ocFeeBasic
    ),
    socialsFee: Number(
      raw.socials_fee ?? raw.socialsFee ?? DEFAULT_SITE_SETTINGS.socialsFee
    ),
    upiId: raw.upi_id || raw.upiId || DEFAULT_SITE_SETTINGS.upiId,
    upiPayee: raw.upi_payee || raw.upiPayee || DEFAULT_SITE_SETTINGS.upiPayee,
  };
}

/**
 * Upload a file or base64 data URI to Supabase Storage (with automatic data-URI fallback)
 */
export async function uploadFileToSupabase(fileOrDataUrl, folder = "receipts", prefix = "RM26") {
  if (!fileOrDataUrl) return "";
  if (!supabase) return typeof fileOrDataUrl === "string" ? fileOrDataUrl : "";

  try {
    let blob = null;
    let ext = "png";

    if (typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:")) {
      const match = fileOrDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        ext = mime.split("/")[1] || "png";
        const byteCharacters = atob(match[2]);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          byteArrays.push(new Uint8Array(byteNumbers));
        }
        blob = new Blob(byteArrays, { type: mime });
      }
    } else if (typeof File !== "undefined" && fileOrDataUrl instanceof File) {
      blob = fileOrDataUrl;
      ext = fileOrDataUrl.name.split(".").pop() || "png";
    }

    if (!blob) return typeof fileOrDataUrl === "string" ? fileOrDataUrl : "";

    const path = `${folder}/${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { data, error } = await supabase.storage
      .from("resolve-uploads")
      .upload(path, blob, { upsert: true });

    if (!error && data) {
      const { data: pub } = supabase.storage.from("resolve-uploads").getPublicUrl(path);
      if (pub?.publicUrl) return pub.publicUrl;
    }
  } catch (err) {
    console.warn("[Supabase Storage] Using direct payload fallback:", err.message);
  }

  return typeof fileOrDataUrl === "string" ? fileOrDataUrl : "";
}

