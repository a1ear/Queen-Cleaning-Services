import type { NextRequest } from "next/server";
import { serviceOptions, siteConfig } from "@/site.config";
import { dateInZone, validateInquiry } from "@/lib/validate";
import { DeliveryError, TIME_ZONE, deliverInquiry, formatTimestamp, makeInquiryId } from "@/lib/inquiry";
import { allow, previousInquiry, rememberInquiry } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 8_000;
const SUBMISSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

// Same submission arriving twice at once (double tap, retry) shares one delivery.
const inFlight = new Map<string, Promise<string>>();

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

export async function POST(request: NextRequest) {
  // Only this site's own pages may post here.
  if (!isSameOrigin(request)) return reply(403, GENERIC_ERROR);

  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return reply(415, GENERIC_ERROR);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!allow(`ip:${ip}`, 5, 10 * 60_000)) {
    return reply(429, { ok: false, error: "Too many requests. Please wait a few minutes, or contact us directly." });
  }

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
    console.info("[inquiry] honeypot triggered, dropped", { ip });
    return reply(200, { ok: true });
  }

  const { form } = siteConfig;
  const { values, errors, valid } = validateInquiry(body, {
    today: dateInZone(TIME_ZONE),
    allowed: {
      service: serviceOptions,
      propertyType: form.propertyTypes,
      preferredTime: form.timeSlots,
    },
  });
  if (!valid) return reply(422, { ok: false, errors });

  const submissionId = typeof body.submissionId === "string" && SUBMISSION_ID_RE.test(body.submissionId) ? body.submissionId : null;
  if (submissionId) {
    const earlier = previousInquiry(submissionId);
    if (earlier) return reply(200, { ok: true, inquiryId: earlier });
    const pending = inFlight.get(submissionId);
    if (pending) {
      try {
        return reply(200, { ok: true, inquiryId: await pending });
      } catch {
        return reply(502, GENERIC_ERROR);
      }
    }
  }

  const now = new Date();
  const row = {
    timestamp: formatTimestamp(now),
    inquiryId: makeInquiryId(form.inquiryIdPrefix, now),
    ...values,
    status: "New" as const,
  };

  const delivery = deliverInquiry(row).then(() => row.inquiryId);
  if (submissionId) inFlight.set(submissionId, delivery);
  try {
    await delivery;
    if (submissionId) rememberInquiry(submissionId, row.inquiryId);
    console.info("[inquiry] delivered", { inquiryId: row.inquiryId });
    return reply(200, { ok: true, inquiryId: row.inquiryId });
  } catch (error) {
    // The row did not reach the sheet. Log enough to find it, without the
    // customer's personal details.
    console.error("[inquiry] delivery failed", {
      inquiryId: row.inquiryId,
      reason: error instanceof DeliveryError ? error.message : String(error),
    });
    return reply(502, GENERIC_ERROR);
  } finally {
    if (submissionId) inFlight.delete(submissionId);
  }
}
