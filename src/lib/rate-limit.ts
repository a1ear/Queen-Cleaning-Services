import "server-only";

/**
 * Best-effort, in-memory limits. Each server instance keeps its own counters,
 * so on serverless hosting a determined attacker spread across instances can
 * get past them. That is acceptable for a quote form; if real abuse shows up,
 * swap these Maps for a shared store (e.g. Upstash Redis) without changing callers.
 */

const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000;

/** True if `key` has made fewer than `limit` calls in the last `windowMs`. */
export function allow(key: string, limit: number, windowMs: number, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.delete(key); // re-insert so the Map stays ordered oldest-first
  hits.set(key, recent);
  if (hits.size > MAX_KEYS) hits.delete(hits.keys().next().value!);
  return true;
}

/**
 * Remembers recent submissions by the form's one-time submission ID, so a
 * retry after a timeout returns the original inquiry instead of a duplicate row.
 */
const recent = new Map<string, { inquiryId: string; at: number }>();
const REMEMBER_MS = 30 * 60_000;

export function previousInquiry(submissionId: string, now = Date.now()) {
  const entry = recent.get(submissionId);
  return entry && now - entry.at < REMEMBER_MS ? entry.inquiryId : undefined;
}

export function rememberInquiry(submissionId: string, inquiryId: string, now = Date.now()) {
  recent.set(submissionId, { inquiryId, at: now });
  if (recent.size > MAX_KEYS) recent.delete(recent.keys().next().value!);
}
