import type { NextRequest } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@convex/_generated/api";

const MAX_BODY_BYTES = 8_000;
const SUBMISSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

const reply = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });

// Customers only ever see these sentences; technical detail goes to the logs.
const GENERIC_ERROR = { ok: false, error: "We couldn't submit your request right now." };

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host = new URL(origin).host;
    return host === request.headers.get("x-forwarded-host") || host === request.headers.get("host");
  } catch {
    return false;
  }
}

/**
 * Public endpoint for the quote form. Cheap checks happen here; validation,
 * rate limiting and storage happen in Convex (`inquiries.submit`), which only
 * accepts calls carrying INQUIRY_SUBMIT_SECRET, so it can't be called around
 * this route.
 */
export async function POST(request: NextRequest) {
  // Only this site's own pages may post here.
  if (!isSameOrigin(request)) return reply(403, GENERIC_ERROR);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply(415, GENERIC_ERROR);

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return reply(413, GENERIC_ERROR);

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error();
    body = parsed;
  } catch {
    return reply(400, GENERIC_ERROR);
  }

  // Honeypot: people never see this field, bots fill it in. Pretend it worked
  // so the bot has no signal to adapt to, and store nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    console.info("[inquiry] honeypot triggered, dropped");
    return reply(200, { ok: true });
  }

  const secret = process.env.INQUIRY_SUBMIT_SECRET;
  if (!secret || !process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error("[inquiry] INQUIRY_SUBMIT_SECRET or NEXT_PUBLIC_CONVEX_URL is not set");
    return reply(500, GENERIC_ERROR);
  }

  // Only string fields go to the database; anything else is dropped.
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string" && key !== "website" && key !== "submissionId") fields[key] = value;
  }
  const submissionId =
    typeof body.submissionId === "string" && SUBMISSION_ID_RE.test(body.submissionId) ? body.submissionId : undefined;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";

  try {
    const result = await fetchMutation(api.inquiries.submit, { secret, ip, submissionId, fields });
    if (result.ok) {
      console.info("[inquiry] saved", { ref: result.ref });
      return reply(200, { ok: true, inquiryId: result.ref });
    }
    if (result.reason === "rate_limited") {
      return reply(429, { ok: false, error: "Too many requests. Please wait a few minutes, or contact us directly." });
    }
    return reply(422, { ok: false, errors: result.errors });
  } catch (error) {
    // Logged without the customer's personal details.
    console.error("[inquiry] save failed", { reason: error instanceof Error ? error.message : String(error) });
    return reply(502, GENERIC_ERROR);
  }
}
