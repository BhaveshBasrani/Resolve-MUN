// Sliding-Window Rate Limiter & API Security Guard for Resolve MUN 2.0
import { NextResponse } from "next/server";

const buckets = new Map();
const MAX_BUCKETS = 5000;

export function getClientIp(request) {
  try {
    const xff = request.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0].trim();
    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp.trim();
  } catch (_) {}
  return "127.0.0.1";
}

/**
 * Checks sliding-window rate limit for (ip + keyPrefix).
 * Returns null if allowed, or a 429 NextResponse if rate-limited.
 */
export function enforceRateLimit(
  request,
  { keyPrefix = "api", limit = 60, windowMs = 60_000 } = {}
) {
  const now = Date.now();
  const ip = getClientIp(request);
  const key = `${keyPrefix}:${ip}`;

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets.entries()) {
      if (now - v.start > windowMs * 2) buckets.delete(k);
    }
  }

  let entry = buckets.get(key);
  if (!entry || now - entry.start >= windowMs) {
    entry = { count: 1, start: now };
    buckets.set(key, entry);
    return null;
  }

  entry.count += 1;
  if (entry.count > limit) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.start + windowMs - now) / 1000));
    return NextResponse.json(
      {
        status: "error",
        success: false,
        message: `Too many requests. Please wait ${retryAfterSec}s and try again.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}
