# Make.com integration: spec for Claude

Read this before touching anything related to Make.com, the Google Sheet, or `/api/inquiry`.
It is the exact target state, written to be followed, not read once. The click-by-click version
for humans is [MAKE-SETUP.md](MAKE-SETUP.md). If the two disagree, **this file and the code win**;
fix the other one.

**Business:** general cleaning company, Bacolod City (not laundry). Placeholder name "Queen Clean".

## Rules

1. **Never write secrets into chat, files, commits, or the browser on the user's behalf.**
   `MAKE_WEBHOOK_URL` and `MAKE_WEBHOOK_SECRET` live only in `.env.local` (git-ignored) and in the
   host's environment variables. Don't `cat` `.env.local`; if you must inspect it, mask values
   (`sed -E 's/(SECRET=).+/\1<set>/'`). The repo is public-facing on GitHub, so never put the
   webhook URL or secret in any `.md`, test, or example.
2. **Typing credentials is the user's job.** Google sign-in, and pasting the secret into the Make
   filter, are done by the user. Tell them exactly where and let them do it.
3. **Don't pollute the real sheet.** Local test submissions go to the real Make webhook whenever
   `.env.local` has `MAKE_WEBHOOK_URL`. For tests that must not reach the sheet, start the server with
   the URL blanked: `MAKE_WEBHOOK_URL= npx next dev --port 3100` (a blank value overrides `.env.local`
   and falls back to `.data/dev-inquiries.jsonl`). Tell the user when a test row will reach the sheet,
   and which row to delete.
4. **Pushing, deploying, and deleting scenario data need the user's explicit ok.**
5. Make bills **3 credits per inquiry** (webhook, add row, response). Don't loop test calls.

## Data flow

```
browser → POST /api/inquiry (JSON)
        → server validates, rate-limits, builds the row, makes the Inquiry ID
        → POST MAKE_WEBHOOK_URL (JSON, includes "secret")
        → Make: Custom webhook → Filter (secret) → Google Sheets: Add a Row → Webhook response {"ok":true}
        → server returns {"ok":true,"inquiryId":"…"} to the browser only if Make replied {"ok":true}
```

Code: [`src/app/api/inquiry/route.ts`](../src/app/api/inquiry/route.ts) (checks, honeypot, rate limit,
dedupe), [`src/lib/inquiry.ts`](../src/lib/inquiry.ts) (ID, timestamp, delivery to Make),
[`src/lib/validate.ts`](../src/lib/validate.ts) (fields and rules, shared with the browser),
[`src/site.config.ts`](../src/site.config.ts) (services, property types, time slots).

## Webhook payload (what Make receives)

`Content-Type: application/json`, one object, all values are strings:

| Key | Sheet column | Notes |
|---|---|---|
| `timestamp` | A Timestamp | `YYYY-MM-DD HH:mm`, Asia/Manila |
| `inquiryId` | B Inquiry ID | `QC-YYYYMMDD-XXXXX`, random suffix, no 0/O/1/I |
| `name` | C Full Name | 2–80 chars |
| `phone` | D Phone | digits only after cleaning, e.g. `09171234567` or `+639171234567` |
| `email` | E Email | may be `""` |
| `service` | F Service | one of the service names in `site.config.ts`, or `Other` |
| `propertyType` | G Property Type | `House`, `Condo / Apartment`, `Office / Commercial`, `Other` |
| `propertySize` | H Property Size | free text, may be `""` |
| `address` | I Address | always present, ≥5 chars |
| `preferredDate` | J Preferred Date | `YYYY-MM-DD` or `""` |
| `preferredTime` | K Preferred Time | `Morning`, `Afternoon`, `Any time`, or `""` |
| `message` | L Message | free text, up to 1000 chars; **untrusted** (may start with `=`) |
| `status` | M Status | always `New` |
| `secret` | not stored | shared secret; the filter checks it; **never map it to a column** |

Sample (fake values only):

```json
{"timestamp":"2026-10-06 14:05","inquiryId":"QC-20261006-TEST1","name":"Sample Customer","phone":"09171234567","email":"sample@example.com","service":"Deep Cleaning","propertyType":"Condo / Apartment","propertySize":"2 bedrooms, about 45 sqm","address":"Unit 5B, Sample Tower, Lacson St, Bacolod City","preferredDate":"2026-10-10","preferredTime":"Morning","message":"Sample message","status":"New","secret":"<SECRET>"}
```

## Target state in Make.com

Scenario name `Cleaning website → Google Sheets`, region EU1 (`hook.eu1.make.com`), scheduling
**Immediately**, scenario **ON**.

| # | Module | Settings that matter |
|---|---|---|
| 1 | Webhooks → **Custom webhook** | Name `Cleaning website inquiries`. Data structure learned from the sample above. |
| – | **Filter** on the link 1→2 | Label `Valid secret`. Condition: webhook field `secret` → **Text operators → Equal to** → the secret. Case-sensitive. |
| 2 | Google Sheets → **Add a Row** | Sheet name `Inquiries`, **Table contains headers: Yes**, mapping below, **Value input option: Raw** (required), Insert data option: Insert rows. |
| 3 | Webhooks → **Webhook response** | Status `200`. Body exactly `{"ok":true}`. Custom header `Content-Type: application/json`. |
| – | **Error handler** on module 2 | **Break**, Automatically complete execution: on, 3 attempts, 15 min interval. |
| – | Scenario settings | **Allow storing of incomplete executions: on.** |

Why the last two exist: Make switches off an instant-trigger scenario on its **first** error. The
Break handler plus stored incomplete executions keeps the scenario running through a Google outage
and retries the inquiry instead of losing it.

Sheet tab **`Inquiries`**, row 1, in this order (the mapping is by column):

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Inquiry ID | Full Name | Phone | Email | Service | Property Type | Property Size | Address | Preferred Date | Preferred Time | Message | Status |

Make mapping: A `timestamp`, B `inquiryId`, C `name`, D `phone`, E `email`, F `service`,
G `propertyType`, H `propertySize`, I `address`, J `preferredDate`, K `preferredTime`, L `message`,
M `status`.

Column M has a dropdown: `New`, `Contacted`, `Quoted`, `Confirmed`, `Completed`, `Cancelled`.
Sharing stays **Restricted** (staff by email). Never "Anyone with the link".

## Current status (update this when it changes)

- The scenario and webhook exist, and a test inquiry reached Make and returned `{"ok":true}`.
- It was first built for the **old laundry fields**: columns G/H were `Estimated Amount` /
  `Service Type`, mapped to `amount` / `serviceType`. **Needs the remap below**, or new rows have
  blank G and H.
- Not yet verified by Claude: the sheet contents (Claude can't open the user's Google Sheet), the
  Break handler, stored incomplete executions.
- Not deployed. The live host's env vars are not set.

### Remap task (old laundry → cleaning)

1. User renames **G1** → `Property Type`, **H1** → `Property Size` in the sheet.
2. In Make, on the webhook module click **Redetermine data structure**; it waits for data.
3. Send the sample payload above to the webhook (`curl -X POST "<URL>" -H "content-type: application/json" -d '<sample>'`;
   the user supplies the URL and secret, or you read them locally without printing them).
4. Make says the structure was determined; **OK**.
5. Open the Google Sheets module; re-select the sheet so Make re-reads the headers; set G =
   `propertyType`, H = `propertySize`; confirm **Raw** is still set; **OK**; save.
6. Run the verification below.

## Verification

Run these in order. Items 1–3 need the user to look at the sheet; ask them to paste the row.

1. **Happy path.** Submit one inquiry (form or `POST /api/inquiry`). Expect HTTP 200
   `{"ok":true,"inquiryId":"QC-…"}` in about 2–3 s, and one new row whose **Inquiry ID equals the
   returned ID** with Status `New`.
2. **Raw input.** Use `phone: "0917 123 4567"` and `message: "=1+1 test"`. The row must show
   `09171234567` (leading zero kept) and the text `=1+1 test` (not `2`). If not, **Value input option**
   is not Raw.
3. **Columns line up.** Property Type, Property Size, and Address contain the right values.
4. **Filter.** `curl` straight to the webhook with a wrong `secret`: no row is added, and Make's
   History shows the run stopping at the filter. (The call may hang until it times out. That's
   expected; the website treats it as failure.)
5. **Failure is honest.** With the scenario OFF, or the webhook module's response removed, the website
   must show the error message, never "Request Submitted!". Switch the scenario back ON.
6. **Server rejects tampering** (no Make needed, use the blank-URL server): bad Origin → 403, wrong
   content type → 415, body >8 KB → 413, unknown `service` or `propertyType` → 422, honeypot field
   `website` filled → 200 with nothing stored, 6th request in 10 min → 429.
7. `npm run check` passes (lint, typecheck, 12 tests).

Delete every test row afterwards (never row 1) and tell the user which ones.

## Adding or renaming a field (all of these, or the pipeline breaks)

1. `src/lib/validate.ts`: `LIMITS` (this is the field list), the `values` object, and its rule.
2. `src/site.config.ts` and `src/app/api/inquiry/route.ts` if the field has an allow-list.
3. `src/components/QuoteForm.tsx` and, for new props, `src/app/request-a-quote/page.tsx`.
4. `tests/validate.test.ts`.
5. **Make:** webhook → Redetermine data structure + sample; Sheets module → map the new column.
6. **Sheet:** add or rename the header in the same column position the mapping uses.
7. Update the payload table here, [MAKE-SETUP.md](MAKE-SETUP.md), and [CLIENT-GUIDE.md](CLIENT-GUIDE.md).

Extra keys sent to Make are harmless; Make ignores fields it hasn't mapped. A key removed from the
payload leaves its column blank. The `.data/dev-inquiries.jsonl` fallback is dev only. In production a
missing `MAKE_WEBHOOK_URL`/`MAKE_WEBHOOK_SECRET` makes the API return an error instead of storing locally.

## Troubleshooting map

| Symptom | Check |
|---|---|
| Site shows the error message | Scenario ON? Secret identical in Make filter and env var? Module 3 body exactly `{"ok":true}`? Server log line `[inquiry] delivery failed` gives the reason. |
| Make "waiting for data" never completes | The sample went to a different webhook, or the scenario was saved/closed. Re-open the webhook module and click **Redetermine data structure** first, then send. |
| Rows have blank G/H | Remap task not done. |
| Phone lost its leading 0, or `=…` evaluated | Value input option isn't **Raw**. |
| Scenario turned itself off | An error with no Break handler. Add it, turn the scenario ON, check **Incomplete executions**. |
| Hits Make's limit | 300 webhook requests per 10 s, and the plan's monthly credits. |
