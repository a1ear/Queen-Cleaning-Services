import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, { search }) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("customers").withIndex("by_lastInquiry").order("desc").take(500);
    const term = search?.trim().toLowerCase();
    const digits = term?.replace(/\D/g, "");
    return term
      ? rows.filter((c) => c.name.toLowerCase().includes(term) || (digits && c.phone.includes(digits)) || c.email.includes(term))
      : rows;
  },
});

export const get = query({
  args: { id: v.string() }, // comes from the URL, so it may be malformed
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const id = ctx.db.normalizeId("customers", args.id);
    if (!id) return null;
    const customer = await ctx.db.get(id);
    if (!customer) return null;
    const inquiries = await ctx.db.query("inquiries").withIndex("by_customer", (q) => q.eq("customerId", id)).order("desc").collect();
    return {
      customer,
      inquiries: inquiries.map((r) => ({
        _id: r._id, ref: r.ref, createdAt: r._creationTime, service: r.service, address: r.address,
        status: r.status, scheduledDate: r.scheduledDate, quoteCentavos: r.quoteCentavos,
      })),
    };
  },
});
