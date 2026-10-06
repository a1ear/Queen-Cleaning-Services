# Cleaning company website, Bacolod City (Phase 1)

A mobile-first website for a general cleaning company in Bacolod City, with a **Request Services** form that saves each
inquiry as a new row in the client's Google Sheet through **Make.com**. There is no database,
login, or admin dashboard. Staff manage inquiries directly in the sheet.

- **Pages:** Home, Services, About, Contact, Request Services, Privacy, 404
- **Stack:** Next.js 16 (App Router, TypeScript), plain CSS, no UI libraries
- **Form flow:** browser → `/api/inquiry` (validate, rate-limit, make Inquiry ID) → Make.com webhook (secret-checked) → Google Sheets

| Document | For |
|---|---|
| [docs/MAKE-SETUP.md](docs/MAKE-SETUP.md) | Developer: build the sheet and the Make.com scenario, then test it |
| [docs/MAKE-FOR-CLAUDE.md](docs/MAKE-FOR-CLAUDE.md) | Claude: exact Make.com target state, payload contract, rules, and verification steps |
| [docs/CLIENT-GUIDE.md](docs/CLIENT-GUIDE.md) | Client: how to read and track inquiries in the sheet |

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. No Make.com account is needed locally: with `MAKE_WEBHOOK_URL` unset,
submissions are written to `.data/dev-inquiries.jsonl` (git-ignored). To see the error and loading
states, put `MOCK_MAKE=fail` or `MOCK_MAKE=slow` in `.env.local`.

To test against the real scenario, copy `.env.example` to `.env.local` and fill in both values.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm test` | Unit tests for the validation rules |
| `npm run check` | Lint + typecheck + tests |
| `npm run build` | Production build. **Fails while `contentReviewed` is false**, so sample content can't ship by accident |
| `ALLOW_SAMPLE_CONTENT=1 npm run build` | Preview build with sample content (search engines are told not to index it) |

## Changing content

Everything the client is likely to change is in **[src/site.config.ts](src/site.config.ts)**:
business name, phone, address, hours, social links, services and prices, About text, and form options.
The current values are **samples**. Replace them with the client's real details, then set
`contentReviewed: true`.

- Prices: `price: null` shows "Ask for a quote". Never fill in a guessed price.
- Services feed the home page, the services page, the form dropdown, **and** the server's allow-list.
- `form.propertyTypes` and `form.sizeLabel` control the property questions on the quote form. The address is always required, because the job happens there.
- Colours and font: the tokens at the top of [src/app/globals.css](src/app/globals.css). The logo is
  `LogoMark` in [src/components/Icon.tsx](src/components/Icon.tsx), plus [src/app/icon.svg](src/app/icon.svg).

## Deploying

This needs a host that runs Next.js server code, because `/api/inquiry` runs on the server. A
plain static host is not enough.

1. Push the repo to GitHub and import it into the host (Vercel or Netlify both detect Next.js).
   **Vercel's free Hobby plan is for non-commercial use only.** A business site needs Vercel Pro, or
   use a host whose free tier allows commercial use. Check that the host supports Next.js 16.
2. Set environment variables: `MAKE_WEBHOOK_URL`, `MAKE_WEBHOOK_SECRET` (and `ALLOW_SAMPLE_CONTENT=1`
   on preview deploys only).
3. Connect the client's domain. HTTPS is automatic on these hosts.
4. Set `siteUrl` in `site.config.ts` to the real domain.
5. Run the checks in **docs/MAKE-SETUP.md → "Check it before handing over"** against the **live** site.

## Launch checklist

- [ ] All sample content replaced and confirmed by the client; `contentReviewed: true`
- [ ] Real domain on HTTPS; `siteUrl` updated
- [ ] Make scenario ON, Value input option **Raw**, incomplete executions stored
- [ ] All MAKE-SETUP.md checks pass on the live site; test rows deleted
- [ ] Sheet shared only with staff; notifications turned on
- [ ] Phone checked: form completed on a real phone over mobile data
- [ ] Share preview checked (paste the URL into Messenger)
- [ ] Client has the sheet link and CLIENT-GUIDE.md

## Architecture decisions

**Why a server route instead of posting straight to Make.com?** A browser-side form would publish
the webhook address in the page, and anyone could post junk rows into the sheet. Here the webhook
URL and a shared secret stay in server env vars, and the Make filter drops anything without the
secret. The server also re-validates every field (allow-listing the dropdown values), so a tampered
request can't put arbitrary text into Service or Property Type.

**Inquiry IDs** are `QC-YYYYMMDD-XXXXX` with a random suffix (no 0/O/1/I, so they're easy to read
over the phone). They're generated on the server, so the ID shown to the customer is the one in the sheet.

**Duplicates:** the submit button locks while sending; each filled-in form carries a one-time
`submissionId`, and the server returns the original Inquiry ID if the same submission arrives
again (double tap, retry after a timeout).

**Formula injection:** customers' text is written with Sheets' **Raw** input option, so `=…` is
stored as text. This is a Make setting, verified by a check in MAKE-SETUP.md.

### The 13 layers, scoped for Phase 1

| Layer | Decision |
|---|---|
| Frontend | In scope. Loading, error, empty-field, success, and 404 states. |
| Backend & APIs | In scope. One route, `/api/inquiry`, that validates everything server-side. |
| Database & storage | **Google Sheets by design** (PRD). No database in Phase 1. |
| Auth & permissions | Customers: none needed. Staff access = Google Sheet sharing. Server→Make protected by a shared secret. |
| Hosting & deploy | Node-capable Next.js host + client's domain over HTTPS. |
| Cloud & compute | One serverless function. Nothing else needed at this size. |
| CI/CD & version control | Git + host's build-on-push. `npm run check` before pushing. No CI pipeline yet (a single developer, a small site). |
| Security | Same-origin check, JSON-only, 8 KB body cap, server validation + allow-lists, honeypot, secret to Make, CSP and security headers, no secrets in the client bundle. |
| Rate limiting | 5 submissions per IP per 10 minutes, **in memory per server instance** (best effort on serverless). Swap for Upstash Redis if real abuse appears. |
| Caching & CDN | All pages are prerendered static HTML served from the host's CDN. The API is never cached. |
| Scaling | Not needed. The bottleneck is Make's operation quota, not the site. |
| Monitoring & logs | Host function logs (`[inquiry] delivered` / `delivery failed`, without personal data), Make's error emails, and Sheets' change emails. No paid APM. |
| Availability & recovery | Make keeps incomplete executions for re-run; Google Sheets keeps version history (File → Version history). The site is stateless, so redeploying restores it. The form's error message gives the phone number, so customers can always reach the shop. |

### Known limitations
- The rate limiter and duplicate detection are per server instance (see above).
- If the Make scenario is switched off, Make queues incoming calls and processes them when it's
  switched back on, but the customer has already been shown the error and may resubmit. Staff may
  see an occasional duplicate (same phone, minutes apart).
- The menu button needs JavaScript. Without it, every page is still linked from the footer.
- About 180 KB (gzipped) of JavaScript is the React/Next.js runtime. Pages are prerendered, so
  content shows before scripts load.
- `npm audit` reports advisories in `eslint-config-next`'s dependencies. These are dev-only lint
  tools and are not shipped to the site. The suggested "fix" downgrades to Next 14, so leave it until
  the Next team updates the package.
