import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireAdmin } from "./auth";
import { STATUSES, statusValidator } from "./schema";
import { makeRef, manilaDate, peso, TIME_ZONE } from "./lib/format";
import { validateInquiry, dateInZone } from "../src/lib/validate";
import { serviceOptions, siteConfig } from "../src/site.config";

const LIST_LIMIT = 200;
const RATE = { perIp: 5, ipWindowMs: 10 * 60_000, global: 120, globalWindowMs: 60 * 60_000 };

/** Fixed-window counter in the database, so the limit holds across every server instance. */
async function underLimit(ctx: MutationCtx, key: string, limit: number, windowMs: number, now: number) {
  const row = await ctx.db.query("rateLimits").withIndex("by_key", (q) => q.eq("key", key)).unique();
  if (!row || now - row.windowStart >= windowMs) {
    if (row) await ctx.db.patch(row._id, { windowStart: now, count: 1 });
    else await ctx.db.insert("rateLimits", { key, windowStart: now, count: 1 });
    return true;
  }
  if (row.count >= limit) return false;
  await ctx.db.patch(row._id, { count: row.count + 1 });
  return true;
}

async function log(ctx: MutationCtx, inquiryId: Id<"inquiries">, actor: string, kind: Doc<"activity">["kind"], text: string) {
  await ctx.db.insert("activity", { inquiryId, at: Date.now(), actor, kind, text });
}

// ─── Public: called only by the website's own server (/api/inquiry) ─────────

export const submit = mutation({
  args: {
    secret: v.string(),
    ip: v.string(),
    submissionId: v.optional(v.string()),
    fields: v.record(v.string(), v.string()),
  },
  handler: async (ctx, { secret, ip, submissionId, fields }) => {
    // Only the website's server knows this secret. Without it, nobody can
    // skip the site's checks by calling this function directly.
    const expected = process.env.INQUIRY_SUBMIT_SECRET;
    if (!expected || secret !== expected) throw new ConvexError("Not allowed.");

    if (submissionId) {
      const earlier = await ctx.db.query("inquiries").withIndex("by_submission", (q) => q.eq("submissionId", submissionId)).first();
      if (earlier) return { ok: true as const, ref: earlier.ref };
    }

    const now = Date.now();
    if (!(await underLimit(ctx, `ip:${ip}`, RATE.perIp, RATE.ipWindowMs, now))) return { ok: false as const, reason: "rate_limited" as const };
    if (!(await underLimit(ctx, "global", RATE.global, RATE.globalWindowMs, now))) return { ok: false as const, reason: "rate_limited" as const };

    const { values, errors, valid } = validateInquiry(fields, {
      today: dateInZone(TIME_ZONE, new Date(now)),
      allowed: { service: serviceOptions, propertyType: siteConfig.form.propertyTypes, preferredTime: siteConfig.form.timeSlots },
    });
    if (!valid) return { ok: false as const, reason: "invalid" as const, errors };

    // One customer record per phone number; keep their latest name and email.
    const customer = await ctx.db.query("customers").withIndex("by_phone", (q) => q.eq("phone", values.phone)).unique();
    let customerId: Id<"customers">;
    if (customer) {
      customerId = customer._id;
      await ctx.db.patch(customerId, {
        name: values.name,
        email: values.email || customer.email,
        lastInquiryAt: now,
        inquiryCount: customer.inquiryCount + 1,
      });
    } else {
      customerId = await ctx.db.insert("customers", {
        phone: values.phone, name: values.name, email: values.email,
        firstSeenAt: now, lastInquiryAt: now, inquiryCount: 1,
      });
    }

    let ref = makeRef(siteConfig.form.inquiryIdPrefix, now);
    while (await ctx.db.query("inquiries").withIndex("by_ref", (q) => q.eq("ref", ref)).first()) {
      ref = makeRef(siteConfig.form.inquiryIdPrefix, now);
    }

    const inquiryId = await ctx.db.insert("inquiries", {
      ref, customerId, submissionId, ...values,
      status: "New", updatedAt: now,
      searchText: [values.name, values.phone, ref, values.email, values.address].join(" "),
    });
    await log(ctx, inquiryId, "website", "created", `Request received from the website (${values.service}).`);
    return { ok: true as const, ref };
  },
});

// ─── Admin only ─────────────────────────────────────────────────────────────

const statusFilter = v.union(v.literal("All"), statusValidator);

export const counts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const result: Record<string, number> = { All: 0 };
    for (const status of STATUSES) {
      const n = (await ctx.db.query("inquiries").withIndex("by_status", (q) => q.eq("status", status)).collect()).length;
      result[status] = n;
      result.All += n;
    }
    return result;
  },
});

export const list = query({
  args: { status: statusFilter, search: v.optional(v.string()) },
  handler: async (ctx, { status, search }) => {
    await requireAdmin(ctx);
    const term = search?.trim();
    let rows: Doc<"inquiries">[];
    if (term) {
      rows = await ctx.db
        .query("inquiries")
        .withSearchIndex("search", (q) => {
          const s = q.search("searchText", term);
          return status === "All" ? s : s.eq("status", status);
        })
        .take(LIST_LIMIT);
    } else if (status === "All") {
      rows = await ctx.db.query("inquiries").order("desc").take(LIST_LIMIT);
    } else {
      rows = await ctx.db.query("inquiries").withIndex("by_status", (q) => q.eq("status", status)).order("desc").take(LIST_LIMIT);
    }
    return rows.map((r) => ({
      _id: r._id, ref: r.ref, createdAt: r._creationTime, name: r.name, phone: r.phone,
      service: r.service, propertyType: r.propertyType, address: r.address, status: r.status,
      scheduledDate: r.scheduledDate, scheduledTime: r.scheduledTime, quoteCentavos: r.quoteCentavos,
    }));
  },
});

export const get = query({
  args: { id: v.string() }, // comes from the URL, so it may be malformed
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const id = ctx.db.normalizeId("inquiries", args.id);
    if (!id) return null;
    const inquiry = await ctx.db.get(id);
    if (!inquiry) return null;
    const [customer, activity] = await Promise.all([
      ctx.db.get(inquiry.customerId),
      ctx.db.query("activity").withIndex("by_inquiry", (q) => q.eq("inquiryId", id)).order("desc").collect(),
    ]);
    // searchText and submissionId are internal; everything else is shown.
    const view = { ...inquiry, createdAt: inquiry._creationTime } as Partial<typeof inquiry> & { createdAt: number };
    delete view.searchText;
    delete view.submissionId;
    return { inquiry: view as Omit<typeof inquiry, "searchText" | "submissionId"> & { createdAt: number }, customer, activity };
  },
});

export const upcoming = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const today = manilaDate(Date.now());
    const rows = await ctx.db.query("inquiries").withIndex("by_scheduledDate", (q) => q.gte("scheduledDate", today)).collect();
    return rows
      .filter((r) => r.status !== "Cancelled" && r.status !== "Completed")
      .sort((a, b) => `${a.scheduledDate} ${a.scheduledTime ?? ""}`.localeCompare(`${b.scheduledDate} ${b.scheduledTime ?? ""}`))
      .map((r) => ({
        _id: r._id, ref: r.ref, name: r.name, phone: r.phone, service: r.service, address: r.address,
        status: r.status, scheduledDate: r.scheduledDate!, scheduledTime: r.scheduledTime, quoteCentavos: r.quoteCentavos,
      }));
  },
});

export const setStatus = mutation({
  args: { id: v.id("inquiries"), status: statusValidator },
  handler: async (ctx, { id, status }) => {
    const admin = await requireAdmin(ctx);
    const inquiry = await ctx.db.get(id);
    if (!inquiry) throw new ConvexError("Inquiry not found.");
    if (inquiry.status === status) return;
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
    await log(ctx, id, admin.email, "status", `Status: ${inquiry.status} → ${status}`);
  },
});

export const addNote = mutation({
  args: { id: v.id("inquiries"), text: v.string() },
  handler: async (ctx, { id, text }) => {
    const admin = await requireAdmin(ctx);
    const note = text.trim();
    if (!note) throw new ConvexError("Write something first.");
    if (note.length > 2000) throw new ConvexError("Keep notes under 2000 characters.");
    if (!(await ctx.db.get(id))) throw new ConvexError("Inquiry not found.");
    await ctx.db.patch(id, { updatedAt: Date.now() });
    await log(ctx, id, admin.email, "note", note);
  },
});

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const setSchedule = mutation({
  args: { id: v.id("inquiries"), date: v.string(), time: v.string() },
  handler: async (ctx, { id, date, time }) => {
    const admin = await requireAdmin(ctx);
    const inquiry = await ctx.db.get(id);
    if (!inquiry) throw new ConvexError("Inquiry not found.");
    if (date && !DATE_RE.test(date)) throw new ConvexError("Choose a valid date.");
    if (time && !TIME_RE.test(time)) throw new ConvexError("Choose a valid time.");
    if (!date && time) throw new ConvexError("Choose a date for this time.");
    const next = { scheduledDate: date || undefined, scheduledTime: date ? time || undefined : undefined };
    if (next.scheduledDate === inquiry.scheduledDate && next.scheduledTime === inquiry.scheduledTime) return;
    await ctx.db.patch(id, { ...next, updatedAt: Date.now() });
    const when = (d?: string, t?: string) => (d ? `${d}${t ? ` ${t}` : ""}` : "not scheduled");
    await log(ctx, id, admin.email, "schedule",
      `Schedule: ${when(inquiry.scheduledDate, inquiry.scheduledTime)} → ${when(next.scheduledDate, next.scheduledTime)}`);
  },
});

export const setQuote = mutation({
  args: { id: v.id("inquiries"), amountPesos: v.union(v.number(), v.null()), note: v.string() },
  handler: async (ctx, { id, amountPesos, note }) => {
    const admin = await requireAdmin(ctx);
    const inquiry = await ctx.db.get(id);
    if (!inquiry) throw new ConvexError("Inquiry not found.");
    let centavos: number | undefined;
    if (amountPesos !== null) {
      if (!Number.isFinite(amountPesos) || amountPesos < 0 || amountPesos > 10_000_000) throw new ConvexError("Enter an amount between ₱0 and ₱10,000,000.");
      centavos = Math.round(amountPesos * 100);
    }
    const cleanNote = note.trim().slice(0, 500) || undefined;
    if (centavos === inquiry.quoteCentavos && cleanNote === inquiry.quoteNote) return;

    // The price is stored on the inquiry as given; every change is logged with
    // the old and new amount, so a quote is never silently rewritten.
    const patch: Partial<Doc<"inquiries">> = { quoteCentavos: centavos, quoteNote: cleanNote, updatedAt: Date.now() };
    const fmt = (c?: number) => (c === undefined ? "none" : peso(c));
    await log(ctx, id, admin.email, "quote",
      `Quote: ${fmt(inquiry.quoteCentavos)} → ${fmt(centavos)}${cleanNote ? ` (${cleanNote})` : ""}`);
    if (centavos !== undefined && (inquiry.status === "New" || inquiry.status === "Contacted")) {
      patch.status = "Quoted";
      await log(ctx, id, admin.email, "status", `Status: ${inquiry.status} → Quoted`);
    }
    await ctx.db.patch(id, patch);
  },
});
