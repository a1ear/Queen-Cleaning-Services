import "server-only";
import { randomInt } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { InquiryValues } from "./validate";

export const TIME_ZONE = "Asia/Manila";

// No 0/O or 1/I, so IDs can be read out over the phone without confusion.
const ID_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** e.g. LAU-20261006-7KQ2M. Random, so IDs reveal nothing about inquiry volume. */
export function makeInquiryId(prefix: string, now = new Date()) {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(now)
    .replaceAll("-", "");
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  return `${prefix}-${date}-${suffix}`;
}

/** "2026-10-06 14:05" in Philippine time: readable and sorts correctly in Sheets. */
export function formatTimestamp(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

/** One row of the Inquiries sheet, in column order. Keys match the Make.com mapping. */
export type InquiryRow = InquiryValues & { timestamp: string; inquiryId: string; status: "New" };

export class DeliveryError extends Error {}

/**
 * Send an inquiry to the Make.com scenario, which appends it to Google Sheets.
 * Resolves only when Make confirms the row was written.
 */
export async function deliverInquiry(row: InquiryRow) {
  const url = process.env.MAKE_WEBHOOK_URL;
  const secret = process.env.MAKE_WEBHOOK_SECRET;

  if (!url || !secret) {
    if (process.env.NODE_ENV === "production")
      throw new DeliveryError("MAKE_WEBHOOK_URL or MAKE_WEBHOOK_SECRET is not set");
    return deliverToDevFile(row);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, secret }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
  } catch (error) {
    throw new DeliveryError(`Make.com request failed: ${(error as Error).message}`);
  }

  // Make answers "Accepted" when a scenario is off or the filter rejected the
  // call, so only the JSON reply from the scenario's Webhook response counts.
  const text = await response.text();
  let ok = false;
  try {
    ok = response.ok && JSON.parse(text)?.ok === true;
  } catch {}
  if (!ok) throw new DeliveryError(`Make.com did not confirm the row (HTTP ${response.status}): ${text.slice(0, 200)}`);
}

/**
 * Local development without Make.com: rows go to .data/dev-inquiries.jsonl.
 * MOCK_MAKE=fail simulates Make being down; MOCK_MAKE=slow adds a 3 s delay.
 */
async function deliverToDevFile(row: InquiryRow) {
  const mode = process.env.MOCK_MAKE;
  if (mode === "slow") await new Promise((r) => setTimeout(r, 3000));
  if (mode === "fail") throw new DeliveryError("MOCK_MAKE=fail");
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "dev-inquiries.jsonl"), JSON.stringify(row) + "\n");
  console.info(`[dev] inquiry ${row.inquiryId} saved to .data/dev-inquiries.jsonl (set MAKE_WEBHOOK_URL to send to Make.com)`);
}
