# Cleaning company website + CRM, Bacolod City

A mobile-first website for a general cleaning company in Bacolod City, with a **Request Services**
form and a private **admin panel (CRM)** at `/admin`. Every request is saved to a Convex database.
The owner signs in to follow up: change status, quote a price, schedule the cleaning, add notes,
and see each customer's history.

- **Public pages:** Home, Services, About, Contact, Request Services, Privacy, 404
- **Admin (`/admin`):** Inquiries pipeline, inquiry detail with history, Schedule, Customers
- **Stack:** Next.js 16 (App Router, TypeScript), plain CSS, Convex (database + Convex Auth)
- **Form flow:** browser → `/api/inquiry` (spam checks) → Convex `inquiries.submit` (secret-checked: validate, rate-limit, save, log)

| Document | For |
|---|---|
| [docs/CRM-SETUP.md](docs/CRM-SETUP.md) | Developer: run locally, deploy to Vercel + Convex, backups, common tasks |
| [docs/CRM-FOR-CLAUDE.md](docs/CRM-FOR-CLAUDE.md) | Claude: data model, security rules, functions, what's been verified |
| [docs/CLIENT-GUIDE.md](docs/CLIENT-GUIDE.md) | Client: how to use the admin panel |

## Run it locally

```bash
npm install
npx convex dev          # terminal 1: database (first run logs in and creates the project)
npm run dev             # terminal 2: website
```

One-time admin setup is in [docs/CRM-SETUP.md](docs/CRM-SETUP.md#run-it-on-your-computer).

| Command | What it does |
|---|---|
| `npm run dev` | Website (Next.js) |
| `npm run dev:convex` | Database functions, redeployed on save |
| `npm test` | Unit tests for the form rules |
| `npm run check` | Lint + typecheck + tests |
| `npm run build` | Production build. **Fails while `contentReviewed` is false** (sample content) and when Convex isn't configured |

## Changing content

Everything the client is likely to change is in **[src/site.config.ts](src/site.config.ts)**:
business name, phone, address, hours, services and prices, About text, and form options. The
current values are **samples**. Replace them with the client's real details, then set
`contentReviewed: true`. Until then every page shows a **DEMO WEBSITE** banner.

- Prices: `price: null` shows "Ask for a quote". Never fill in a guessed price.
- Services feed the home page, the services page, the form dropdown, **and** the server's allow-list.
- Colours and font: the tokens at the top of [src/app/globals.css](src/app/globals.css). Admin styles: [src/app/admin/admin.css](src/app/admin/admin.css).

## Launch checklist

- [ ] All sample content replaced and confirmed by the client; `contentReviewed: true`
- [ ] Real domain on HTTPS; `siteUrl` updated
- [ ] Convex production deployed; `ADMIN_EMAIL` is the client's email; client chose their own password
- [ ] Every check in CRM-SETUP.md "Check it before handing over" passes on the live site
- [ ] A backup exported **and restored once** into a test deployment
- [ ] Form completed on a real phone over mobile data
- [ ] Client has the /admin link and CLIENT-GUIDE.md

## Architecture decisions

**Security is enforced in the database layer.** Every admin query and mutation calls
`requireAdmin`, which checks the signed-in user against `ADMIN_EMAIL` in Convex itself. The
`/admin` redirect in `src/proxy.ts` only decides which page to show. Calling Convex directly
without signing in gets "Not signed in." (tested for every admin function).

**Only the website can save inquiries.** `inquiries.submit` requires a server-only secret, so
nobody can skip the site's spam checks by calling the database directly. Validation runs again
inside Convex with the same rules (`src/lib/validate.ts`) and allow-lists (`src/site.config.ts`).

**History is never rewritten.** What the customer submitted is stored as sent and never edited.
Status, schedule and quote changes are recorded in an append-only `activity` log with the old and
new values, who made the change, and when. Quotes are stored in centavos as given.

**One customer per phone number.** Numbers are normalized (`+63 917…` → `0917…`) so repeat
clients show their whole history.

### The 13 layers

| Layer | Decision |
|---|---|
| Frontend | Public site plus admin. Loading (skeletons), empty, error, not-found and success states. |
| Backend & APIs | `/api/inquiry` (Next) for spam checks; Convex functions for all data rules. |
| Database & storage | Convex: `customers`, `inquiries`, append-only `activity`, `rateLimits`, auth tables. Indexed for every list. |
| Auth & permissions | Convex Auth, password provider, one admin email only, 12+ character passwords, failed sign-ins rate-limited by Convex Auth. 14-day session. |
| Hosting & deploy | Vercel (Next) + Convex cloud. Build: `npx convex deploy --cmd 'npm run build'`. |
| Cloud & compute | Serverless on both sides. Nothing to manage. |
| CI/CD & version control | Git; Vercel builds on push (and deploys Convex functions in the same step). `npm run check` before pushing. |
| Security | Server-side admin checks, server-only submit secret, same-origin check, 8 KB body cap, validation + allow-lists, honeypot, CSP (Convex origins only), security headers, `/admin` never indexed. |
| Rate limiting | In the database, so it holds across servers: 5 submissions per IP per 10 min, 120 per hour site-wide. |
| Caching & CDN | Public pages are static and served from the CDN; the proxy only runs on `/admin` and `/api/auth`. |
| Scaling | Fine for a local business. Lists show the newest 200 with search for older; revisit counts at tens of thousands of inquiries. |
| Monitoring & logs | Convex dashboard logs, Vercel function logs (no personal data in our log lines). |
| Availability & recovery | `npx convex export` backups (restore tested before launch), Convex's managed storage; the site is stateless. The form error shows the phone number, so customers can always reach the business. |

### Known limitations
- Single admin, by choice. Staff accounts would need roles (see CRM-FOR-CLAUDE.md).
- Password reset and customer data deletion are done in the Convex dashboard, not in the panel.
- About 180 KB (gzipped) of JavaScript is the React/Next.js runtime on public pages; the admin
  adds the Convex client. Pages are prerendered, so content shows before scripts load.
- `npm audit` reports advisories in `eslint-config-next`'s dependencies (dev-only lint tools, not
  shipped). The suggested "fix" downgrades to Next 14, so leave it.
