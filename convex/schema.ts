import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

import { STATUSES } from "./lib/statuses";

export { STATUSES };
export const statusValidator = v.union(...STATUSES.map((s) => v.literal(s)));

export default defineSchema({
  // Users, sessions and sign-in rate limits for the admin login (Convex Auth).
  ...authTables,

  /** One per phone number, so repeat clients show their full history. */
  customers: defineTable({
    phone: v.string(), // normalized, e.g. 09171234567
    name: v.string(), // latest name given
    email: v.string(), // latest email given, may be ""
    firstSeenAt: v.number(),
    lastInquiryAt: v.number(),
    inquiryCount: v.number(),
  })
    .index("by_phone", ["phone"])
    .index("by_lastInquiry", ["lastInquiryAt"]),

  /**
   * A request from the website. The fields the customer submitted are stored
   * exactly as sent and never edited afterwards; staff changes (status,
   * schedule, quote) live in their own fields and every change is logged in
   * `activity`.
   */
  inquiries: defineTable({
    ref: v.string(), // e.g. QC-20261006-7KQ2M, shown to the customer
    customerId: v.id("customers"),
    submissionId: v.optional(v.string()), // dedupes retries of the same form
    // As submitted by the customer (read-only):
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    service: v.string(),
    propertyType: v.string(),
    propertySize: v.string(),
    address: v.string(),
    preferredDate: v.string(),
    preferredTime: v.string(),
    message: v.string(),
    // Managed by the admin:
    status: statusValidator,
    scheduledDate: v.optional(v.string()), // YYYY-MM-DD
    scheduledTime: v.optional(v.string()), // HH:MM, 24-hour
    quoteCentavos: v.optional(v.number()), // the quoted price at the time it was given
    quoteNote: v.optional(v.string()),
    updatedAt: v.number(),
    // name + phone + ref + email + address, for the search box.
    searchText: v.string(),
  })
    .index("by_ref", ["ref"])
    .index("by_submission", ["submissionId"])
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"])
    .index("by_scheduledDate", ["scheduledDate"])
    .searchIndex("search", { searchField: "searchText", filterFields: ["status"] }),

  /** Append-only history of every inquiry. Nothing in it is ever edited or deleted. */
  activity: defineTable({
    inquiryId: v.id("inquiries"),
    at: v.number(),
    actor: v.string(), // admin email, or "website"
    kind: v.union(
      v.literal("created"),
      v.literal("status"),
      v.literal("note"),
      v.literal("schedule"),
      v.literal("quote"),
    ),
    text: v.string(), // human-readable summary, e.g. "Status: New → Contacted"
  }).index("by_inquiry", ["inquiryId", "at"]),

  /** Per-IP counters for public form submissions. */
  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  }).index("by_key", ["key"]),
});
