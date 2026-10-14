# CRM spec for Claude

Read this before changing anything in `convex/`, `src/app/admin/`, `src/proxy.ts`, or `/api/inquiry`.
Human setup steps are in [CRM-SETUP.md](CRM-SETUP.md). If they disagree, **the code and this file
win**; fix the other.

**Business:** general cleaning company, Bacolod City. Placeholder name "Queen Clean".
**Users:** a single admin, the email in Convex env `ADMIN_EMAIL`. No staff roles (the user chose "admin only").

## Rules

1. **Security lives in Convex, not the UI.** Every admin query/mutation starts with
   `await requireAdmin(ctx)` (`convex/auth.ts`). The proxy and hidden links are courtesy only.
   A new admin function without `requireAdmin` is a security bug.
2. **Never rewrite history.** Customer-submitted fields on `inquiries` are never patched.
   `activity` is append-only: no update or delete functions, ever. Staff changes (status,
   schedule, quote) are fields on the inquiry **plus** an `activity` row with old → new.
3. **`inquiries.submit` is only for the Next server.** It requires `INQUIRY_SUBMIT_SECRET`.
   Don't call it from the browser, and don't weaken the secret check.
4. **Never print or commit secrets.** `.env.local` is git-ignored. Mask values when inspecting
   (`sed -E 's/=.+/=<set>/'`). `DEV_ADMIN_PASSWORD` in `.env.local` is a local test login only.
5. **Test against a throwaway backend.** `CONVEX_AGENT_MODE=anonymous npx convex dev` gives a
   local database with no account. Never test against the client's production deployment.
   Clear test data with `npx convex import --table <t> --replace -y <empty.jsonl>`.
6. Pushing to `main` deploys on Vercel. Don't push without the user's ok.

## Data model (`convex/schema.ts`)

| Table | Purpose | Key indexes |
|---|---|---|
| `customers` | One per normalized phone (`09…`). Latest name/email, counts. | `by_phone`, `by_lastInquiry` |
| `inquiries` | One per form submission. `ref` like `QC-YYYYMMDD-XXXXX`. Status, schedule (`YYYY-MM-DD`, `HH:MM`), quote in **centavos**. | `by_ref`, `by_submission`, `by_customer`, `by_status`, `by_scheduledDate`, search `search` on `searchText` |
| `activity` | Append-only history per inquiry. `kind`: created, status, note, schedule, quote. `actor`: admin email or `website`. | `by_inquiry` |
| `rateLimits` | Fixed-window counters: `ip:<ip>` 5 per 10 min, `global` 120 per hour. | `by_key` |
| auth tables | Convex Auth (users, sessions, sign-in rate limits). | |

Statuses (`convex/lib/statuses.ts`): New → Contacted → Quoted → Confirmed → Completed / Cancelled.
Saving a quote moves New/Contacted to Quoted (logged).

## Functions

| Function | Who | Notes |
|---|---|---|
| `inquiries.submit` | Next server (secret) | Dedupe by `submissionId`; rate limit; `validateInquiry` with allow-lists from `site.config.ts`; upsert customer; insert inquiry + `created` activity. Returns `{ok, ref}` / `{ok:false, reason}`. |
| `inquiries.counts / list / get / upcoming` | admin | `list` takes `status` ("All" or a status) and optional `search` (search index). `get` takes a string id and returns `null` for malformed ids. |
| `inquiries.setStatus / addNote / setSchedule / setQuote` | admin | Each logs to `activity`. No-op if nothing changed. |
| `customers.list / get` | admin | |

Shared code: `src/lib/validate.ts` (field rules, phone normalization) and `src/site.config.ts`
are imported by both Next and Convex. Keep them free of Next or Node-only imports.

## Auth

- Convex Auth, Password provider. `profile()` rejects any email that isn't `ADMIN_EMAIL`, so
  only that address can sign up or sign in. Passwords: 12+ characters. Convex Auth rate-limits
  failed sign-ins.
- Next 16 `src/proxy.ts` (formerly middleware) uses `convexAuthNextjsMiddleware`. It redirects
  `/admin*` to `/admin/login` when signed out, and relays `/api/auth`. Its matcher covers only
  `/admin` and `/api/auth`, so public pages stay static.
- Env on Convex: `ADMIN_EMAIL`, `INQUIRY_SUBMIT_SECRET`, `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL`.
  Set them with `scripts/setup-convex-env.mjs` (`--prod` for production).

## Verified (2026-10-14, local anonymous backend)

- All 11 admin functions refuse calls without a login ("Not signed in."). `submit` refuses a
  wrong secret.
- Sign-up/sign-in refused for any non-admin email; admin sign-up refused under 12 characters.
- Submit: dedupe, 422 on tampered values, honeypot stores nothing, cross-site origin 403, 6th
  request per IP in 10 min → 429.
- Admin flow in the browser: login → list → detail → status/note/quote/schedule all logged;
  Schedule and Customers screens correct; malformed id → "Inquiry not found".
- Phone `+63 928…` and `0928…` merge into one customer.

## Known limits

- Lists show the newest 200 (search finds older ones). `counts` reads every inquiry: fine for a
  small business; switch to stored counters if it reaches tens of thousands.
- No in-app password reset or data deletion. Both are done in the Convex dashboard (CRM-SETUP.md).
- Single admin only. Adding staff later means a `role` on users, a `requireRole` helper, and an
  admin screen to invite people.
