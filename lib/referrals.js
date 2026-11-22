// Resolve MUN 2.0 — Referral & RES Points Rewards Engine
// 400 RES Points per verified referral · 1 RES Point = ₹0.25 (₹100 Stall Coupon per referral)

export const RES_POINTS_PER_REFERRAL = 400;
export const RES_POINT_RUPEE_VALUE = 0.25;
export const RUPEES_PER_REFERRAL = RES_POINTS_PER_REFERRAL * RES_POINT_RUPEE_VALUE; // ₹100

export const RES_TIERS = [
  { min: 0, name: "Delegate", badge: "TIER 0" },
  { min: 1, name: "Diplomat Envoy", badge: "TIER I" },
  { min: 3, name: "Senior Ambassador", badge: "TIER II" },
  { min: 5, name: "High Commissioner", badge: "TIER III" },
  { min: 10, name: "Grand Plenipotentiary", badge: "TIER IV" },
];

/**
 * Deterministic personal referral code derived from Delegate ID (e.g. RM26-DEL-4821 -> RES-4821)
 */
export function getDelegateReferralCode(delegateId = "", email = "") {
  const idStr = String(delegateId || "").trim().toUpperCase();
  const tailMatch = idStr.match(/([A-Z0-9]{4,6})$/);
  if (tailMatch && !["CONFIRMED", "PENDING"].includes(tailMatch[1])) {
    return `RES-${tailMatch[1].slice(-4)}`;
  }
  const cleanEmail = String(email || "delegate").trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < cleanEmail.length; i++) {
    hash = (hash * 31 + cleanEmail.charCodeAt(i)) >>> 0;
  }
  const suffix = String(1000 + (hash % 9000));
  return `RES-${suffix}`;
}

/**
 * Deterministic campus stall coupon code (e.g. RES-4821 -> CPN-4821)
 */
export function getStallCouponCode(delegateId = "", email = "") {
  const refCode = getDelegateReferralCode(delegateId, email);
  return refCode.replace(/^RES-/, "CPN-");
}

/**
 * Check if a referred delegate record counts as verified
 */
export function isReferralVerified(row = {}) {
  const pay = String(row.payment_status || row.paymentStatus || "").toUpperCase().trim();
  const st = String(row.status || "").toUpperCase().trim();
  if (pay.includes("FAIL") || pay.includes("REJECT") || st.includes("FAIL")) return false;
  if (pay.includes("PENDING") || pay.includes("REVIEW")) return false;
  if (pay === "VERIFIED" || pay === "PAID" || pay === "APPROVED") return true;
  if (["CONFIRMED", "ALLOTTED", "APPROVED", "PAYMENT_VERIFIED", "MANUAL_APPROVED"].includes(st)) return true;
  return false;
}

/**
 * Compute full RES points, INR coupon value, and tier progression
 */
export function calculateResStats(referredRows = []) {
  const rows = Array.isArray(referredRows) ? referredRows : [];
  let verifiedCount = 0;
  let pendingCount = 0;

  const referrals = rows.map((r) => {
    const verified = isReferralVerified(r);
    if (verified) verifiedCount++;
    else pendingCount++;
    const rawName = String(r.full_name || r.fullName || r.name || "Delegate").trim();
    const parts = rawName.split(/\s+/);
    const displayName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
    return {
      name: displayName,
      verified,
      status: verified ? "Verified" : "Pending",
      points: RES_POINTS_PER_REFERRAL,
      createdAt: r.created_at || r.timestamp || "",
    };
  });

  const activePoints = verifiedCount * RES_POINTS_PER_REFERRAL;
  const pendingPoints = pendingCount * RES_POINTS_PER_REFERRAL;
  const rupeeValue = Number((activePoints * RES_POINT_RUPEE_VALUE).toFixed(2));
  const pendingRupeeValue = Number((pendingPoints * RES_POINT_RUPEE_VALUE).toFixed(2));

  let currentTier = RES_TIERS[0];
  let nextTier = RES_TIERS[1];
  for (let i = RES_TIERS.length - 1; i >= 0; i--) {
    if (verifiedCount >= RES_TIERS[i].min) {
      currentTier = RES_TIERS[i];
      nextTier = RES_TIERS[i + 1] || null;
      break;
    }
  }

  let progressPct = 100;
  if (nextTier) {
    const span = Math.max(1, nextTier.min - currentTier.min);
    progressPct = Math.min(100, Math.round(((verifiedCount - currentTier.min) / span) * 100));
  }

  return {
    totalReferrals: rows.length,
    verifiedCount,
    pendingCount,
    activePoints,
    pendingPoints,
    rupeeValue,
    pendingRupeeValue,
    currentTier,
    nextTier,
    progressPct,
    referrals,
  };
}
