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

export const DEFAULT_COMMITTEE_CAPACITIES = {
  "UNCSW": 60,
  "UNHRC": 70,
  "DISEC": 80,
  "IP": 30,
  "Lok Sabha": 85,
  "LOK SABHA": 85,
  "Marvel": 50,
};

export const DEFAULT_REFERRAL_CODES = [
  { code: "BHAFN01", ambassador: "Bhavik (Secretariat)", finalFee: 2500, active: true },
  { code: "TANHP27", ambassador: "Tanvi", finalFee: 2500, active: true },
  { code: "NIPLG23", ambassador: "Nipun", finalFee: 2500, active: true },
  { code: "SHRPL26", ambassador: "Shresth", finalFee: 2500, active: true },
  { code: "CHAUO31", ambassador: "Chaithanya", finalFee: 2500, active: true },
  { code: "MEGDA24", ambassador: "Meghana", finalFee: 2500, active: true },
  { code: "RESOLVE500", ambassador: "Resolve Priority Delegate", finalFee: 2000, active: true },
  { code: "EARLYBIRD", ambassador: "Early Bird Offer", finalFee: 1999, active: true },
  { code: "ICFAI", ambassador: "ICFAI Institutional Partner", finalFee: 2000, active: true },
];

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
  committeeCapacities: DEFAULT_COMMITTEE_CAPACITIES,
  committeeDocuments: {},
  referralCodes: DEFAULT_REFERRAL_CODES,
  conferenceDates: "25, 26, 27 December 2026",
  conferenceVenue: "TBA (To Be Announced)",
  venueShort: "TBA",
  venueAddress: "TBA (To Be Announced), Hyderabad",
  venueMapUrl: "",
  prizePool: "₹25,000+",
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
    committeeCapacities: raw.committee_capacities ?? raw.committeeCapacities ?? DEFAULT_COMMITTEE_CAPACITIES,
    committeeDocuments: raw.committee_documents ?? raw.committeeDocuments ?? {},
    referralCodes: Array.isArray(raw.referral_codes)
      ? raw.referral_codes
      : Array.isArray(raw.referralCodes)
      ? raw.referralCodes
      : DEFAULT_REFERRAL_CODES,
    conferenceDates:
      raw.conference_dates || raw.conferenceDates || DEFAULT_SITE_SETTINGS.conferenceDates,
    conferenceVenue:
      raw.conference_venue || raw.conferenceVenue || DEFAULT_SITE_SETTINGS.conferenceVenue,
    venueShort:
      raw.venue_short || raw.venueShort || (raw.conference_venue || raw.conferenceVenue || DEFAULT_SITE_SETTINGS.conferenceVenue).split(",")[0].trim(),
    venueAddress:
      raw.venue_address || raw.venueAddress || DEFAULT_SITE_SETTINGS.venueAddress,
    venueMapUrl:
      raw.venue_map_url || raw.venueMapUrl || DEFAULT_SITE_SETTINGS.venueMapUrl,
    prizePool:
      raw.prize_pool || raw.prizePool || DEFAULT_SITE_SETTINGS.prizePool,
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
      try {
        const res = await fetch(fileOrDataUrl);
        blob = await res.blob();
        const mime = blob.type || "";
        ext = mime.split("/")[1]?.split("+")[0] || (fileOrDataUrl.includes("application/pdf") ? "pdf" : "png");
      } catch (_) {
        const parts = fileOrDataUrl.split(",");
        const mimeMatch = parts[0]?.match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/png";
        ext = mime.split("/")[1] || "png";
        const byteString = atob(parts[1] || "");
        const ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        blob = new Blob([ia], { type: mime });
      }
    } else if (typeof File !== "undefined" && fileOrDataUrl instanceof File) {
      blob = fileOrDataUrl;
      ext = fileOrDataUrl.name.split(".").pop() || "png";
    }

    if (!blob) return typeof fileOrDataUrl === "string" ? fileOrDataUrl : "";

    const path = `${folder}/${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const contentType = blob.type || (ext.toLowerCase() === "pdf" ? "application/pdf" : ext.toLowerCase() === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "image/png");
    const { data, error } = await supabase.storage
      .from("resolve-uploads")
      .upload(path, blob, { upsert: true, contentType });

    if (!error && data) {
      const { data: pub } = supabase.storage.from("resolve-uploads").getPublicUrl(path);
      if (pub?.publicUrl) return pub.publicUrl;
    }
  } catch (err) {
    console.warn("[Supabase Storage] Upload notice:", err?.message || err);
  }

  return typeof fileOrDataUrl === "string" ? fileOrDataUrl : "";
}

