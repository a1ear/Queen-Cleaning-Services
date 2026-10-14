# Convex setup: step by step

This guide takes the CRM from "works on my computer" to live on your Vercel site. Do the parts in
order. Allow about 45 minutes.

**You need:** a GitHub account (you have it), this project on your computer with `npm install`
done, your Vercel project, and the client's email address (the only one that will be able to
sign in to `/admin`).

> Convex occasionally renames buttons. If a label doesn't match exactly, look for the closest
> match in the same place.

```
Customer's browser ── POST /api/inquiry ──▶ Vercel (Next.js: spam checks)
                                              │ secret-checked call
                                              ▼
                                    Convex production database
                                              ▲
Owner's browser ── /admin (signed in) ────────┘ live updates
```

There are two Convex databases ("deployments") in one project:

| Deployment | Used by | Data |
|---|---|---|
| **Development** | `npm run dev` on your computer | Test data only |
| **Production** | the live site on Vercel | Real customers |

They never share data, so testing locally can't touch real customers.

---

## Part 1: Create your Convex account and project

1. In a terminal in the project folder, log in. This opens your browser:

   ```bash
   npx convex login
   ```

   Sign in with **GitHub** (easiest) and let it finish. The terminal says you're logged in.

2. Create the project. `--configure=new` tells Convex to make a new project instead of reusing
   the temporary local database I used for testing:

   ```bash
   npx convex dev --configure=new
   ```

   Answer the prompts:
   - **Team:** your personal team.
   - **Project name:** `queen-clean-crm` (any name is fine).
   - **Cloud or local:** choose **cloud deployment** if asked.

   It then deploys the database functions and keeps running (you'll see
   `Convex functions ready!`). **Leave this terminal open**. It redeploys whenever a file in
   `convex/` changes.

3. Check that `.env.local` was updated: `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` now point
   to your new cloud project (the URL ends in `.convex.cloud`). Your other lines stay.

---

## Part 2: Set up the admin login on your computer (development)

1. In a **second terminal**, run this with **your own** email (this is only for testing on
   your machine):

   ```bash
   node scripts/setup-convex-env.mjs --admin-email you@example.com --site-url http://localhost:3000
   ```

   It sets five values on the development database (`JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL`,
   `ADMIN_EMAIL`, `INQUIRY_SUBMIT_SECRET`) and writes the matching `INQUIRY_SUBMIT_SECRET` into
   `.env.local`. You'll see `set …` for each.

2. Start the website:

   ```bash
   npm run dev
   ```

3. Create your test admin password:
   - Open http://localhost:3000/admin. You're sent to the sign-in page. That's the protection working.
   - Click **First-time setup**.
   - Enter the email from step 1 and a password of **at least 12 characters**, twice.
   - Click **Create password and sign in**. You land on **Inquiries** (empty for now).

4. Send yourself a test request:
   - Open http://localhost:3000/request-a-quote in another tab, fill it in, and submit.
   - Switch back to `/admin`. The request appears **without refreshing**.

5. Optional: open the **Convex dashboard** (https://dashboard.convex.dev), pick your project, and
   click **Data**. You'll see the `inquiries`, `customers` and `activity` tables with your test.

> The `DEV_ADMIN_*` lines in `.env.local` were for my temporary test database. They don't apply
> to your new project, and you can delete them.

---

## Part 3: Create the production database

1. In the second terminal, run:

   ```bash
   npx convex deploy
   ```

   It asks to confirm deploying to **production**. Type `y`. This creates the production
   database and loads the functions into it.

2. Set the production secrets with the **client's** email (the only address that will ever be
   able to sign in), and your live site address:

   ```bash
   node scripts/setup-convex-env.mjs --prod --admin-email owner@clientbusiness.com --site-url https://your-site.vercel.app
   ```

   - Use the real domain instead of the `vercel.app` address once you have one, then run this
     again (it's safe to repeat; it signs the admin out).
   - It writes `INQUIRY_SUBMIT_SECRET` into **`.env.vercel.local`** in the project folder
     (git-ignored, never printed). You'll paste it into Vercel in Part 4, then delete the file.
     If you lose it, run the command again.

3. Get the production deploy key (lets Vercel update the database on each deploy):
   - Open https://dashboard.convex.dev and select your project.
   - At the top, switch from **Development** to **Production**.
   - Go to **Settings** (gear icon) → **General**.
   - Under **Deploy keys**, click **Generate Production Deploy Key**. If it asks for
     permissions, make sure **deploy** (`deployment:deploy`) is allowed.
   - Copy the key (it starts with `prod:`). Treat it like a password.

---

## Part 4: Configure Vercel

Open your project on https://vercel.com → **Settings**.

1. **Build command**
   - **Settings → Build and Deployment → Framework Settings** (older layouts: **General → Build & Development Settings**).
   - Turn on **Override** next to **Build Command** and enter:

     ```
     npx convex deploy --cmd 'npm run build'
     ```

   - **Save**. On every deploy this updates the production database functions first, then
     builds the site connected to them.

2. **Environment variables** (**Settings → Environment Variables**). Add each one, tick
   **Production only**, and **Save**:

   | Name | Value |
   |---|---|
   | `CONVEX_DEPLOY_KEY` | the `prod:…` key from Part 3, step 3 |
   | `INQUIRY_SUBMIT_SECRET` | the value in `.env.vercel.local` (Part 3, step 2) |
   | `ALLOW_SAMPLE_CONTENT` | `1` (keep until the client's real details are in; it shows the DEMO banner) |

3. **Remove the old Make.com variables:** delete `MAKE_WEBHOOK_URL` and `MAKE_WEBHOOK_SECRET`.
   Nothing uses them any more.

4. Don't add `NEXT_PUBLIC_CONVEX_URL` yourself. The build command sets it automatically from
   the deploy key.

---

## Part 5: Deploy

The CRM code isn't on GitHub yet. Pushing it before Parts 3–4 would make the Vercel build fail
(on purpose, with a clear message).

1. Ask Claude to commit and push, or push it yourself.
2. Vercel starts a build. Open **Deployments**, click the newest one, and watch the log for:
   - `Deploying to …convex.cloud` and `Convex functions ready`, then
   - the normal Next.js build ending in `Compiled successfully`.
3. If the build fails, the troubleshooting table below covers the usual causes.

---

## Part 6: Create the client's admin password (live)

Do this **with the client**, so only they know the password.

1. Open `https://your-site/admin`. You're sent to the sign-in page.
2. Click **First-time setup**.
3. The client enters **the email used in Part 3, step 2** and a password of at least 12
   characters, twice, then **Create password and sign in**.
4. Bookmark `/admin` on their phone and computer. They stay signed in for 14 days per device.

Any other email is refused. Only one admin account can exist for that email.

---

## Part 7: Check it before handing over

On the **live** site:

- [ ] Submit the **Request Services** form. The success screen shows a reference like
      `QC-20261014-7KQ2M`, and the request appears at `/admin` under **New** within seconds,
      without refreshing.
- [ ] Submit again with the same phone written differently (`+63 917…` vs `0917…`). Both
      requests sit under **one** customer on the **Customers** screen.
- [ ] Open `/admin` in a private window. You're sent to the sign-in page.
- [ ] Try **First-time setup** with a different email. It's refused.
- [ ] On a request, change the status, save a quote, set a cleaning date, and add a note. Each
      one appears in **History** with the time and the admin's email.
- [ ] The scheduled job shows on **Schedule**.
- [ ] Submit 6 requests quickly from one phone. The 6th is told to wait (spam protection).
- [ ] Delete your test data afterwards: Convex dashboard → **Production** → **Data** → select
      the test rows in `inquiries`, `customers` and `activity` → **Delete**.

---

## Part 8: Backups (do one now, and restore it once)

Convex stores the data, but keep your own copies. From the project folder:

```bash
npx convex export --prod --path backups/qc-$(date +%F).zip
```

The file goes into `backups/`, which is git-ignored, because exports contain customers'
personal data. Keep copies somewhere private (not a public drive link).

Prove the backup works once, before launch. Restore it into your **development** database,
never production:

```bash
npx convex import --replace-all backups/qc-YYYY-MM-DD.zip
```

Open http://localhost:3000/admin and confirm the requests are there. Then make backups a
monthly habit.

---

## Troubleshooting

| What you see | Cause and fix |
|---|---|
| Vercel build: `NEXT_PUBLIC_CONVEX_URL is not set` | The build command isn't overridden, or `CONVEX_DEPLOY_KEY` is missing or not ticked for Production. Recheck Part 4 and redeploy. |
| Vercel build: `site.config.ts still has sample content` | Add `ALLOW_SAMPLE_CONTENT=1` (Part 4), or finish the real content and set `contentReviewed: true`. |
| Vercel build: Convex says the key is invalid or has no permission | Generate a new **production** deploy key with the **deploy** permission (Part 3, step 3). |
| Form shows "We couldn't submit your request" | `INQUIRY_SUBMIT_SECRET` in Vercel doesn't match Convex production. Rerun Part 3, step 2, paste the new value into Vercel, and redeploy. Vercel → Logs shows `[inquiry] save failed`. |
| Admin sign-in says "Invalid email or password" for the client | Check `ADMIN_EMAIL` on production: Convex dashboard → **Production** → **Settings** → **Environment Variables**. Fix it by rerunning Part 3, step 2. |
| `/admin` keeps returning to the sign-in page | `SITE_URL` on production doesn't match the address you're using. Rerun Part 3, step 2 with the exact URL. |
| `npx convex …` asks you to log in | Run `npx convex login` again. |

---

## Common tasks later

| Task | How |
|---|---|
| **Client forgot the password** | Convex dashboard → **Production** → **Data** → `authAccounts`: delete the row for their email, and its row in `users`. Then they use **First-time setup** again. Requests are not affected. |
| **Change the admin email** | Rerun Part 3, step 2 with the new email (signs everyone out), then **First-time setup** with the new email. |
| **Customer asks to delete their data** | Convex dashboard → **Production** → **Data**: delete their rows in `customers`, `inquiries` (filter by phone) and the matching `activity` rows. Note the date of the request outside the system. |
| **See errors** | Convex dashboard → **Logs** (database side); Vercel → **Logs** (`[inquiry] save failed`). |
| **The secret may have leaked** | Rerun Part 3, step 2, update `INQUIRY_SUBMIT_SECRET` in Vercel, redeploy. |
| **Work on the code** | Terminal 1: `npx convex dev`. Terminal 2: `npm run dev`. Changes to `convex/` reach production only through a Vercel deploy. |
