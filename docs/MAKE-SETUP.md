# Make.com setup: step by step

> Using Claude to do or check this? Point it at [MAKE-FOR-CLAUDE.md](MAKE-FOR-CLAUDE.md) instead.

This guide connects the website's **Request Services** form to a Google Sheet. When you're done,
every request a customer submits appears as a new row in the sheet within a few seconds.

**Time needed:** about 45 minutes the first time.
**You need:** the client's Google account (it will own the sheet), a Make.com account, and this
project running on your computer (`npm run dev`).

> Make occasionally renames buttons. If a label here doesn't match exactly, look for the closest
> match in the same place.

---

## How it works (read this once)

```
Customer fills in the form
        │
        ▼
Website server  (/api/inquiry)
  • checks every field
  • blocks spam and repeated submissions
  • creates the Inquiry ID, e.g. QC-20261006-7KQ2M
        │  sends the inquiry + a secret password
        ▼
Make.com scenario
  1. Custom webhook   receives the inquiry
  2. Filter           continues only if the secret password is correct
  3. Google Sheets    adds the row
  4. Webhook response replies {"ok":true} to the website
        │
        ▼
Google Sheet "Inquiries"  →  staff read it and update Status
```

The website tells the customer "Request Submitted!" **only after step 4**. If anything fails on
the way, the customer sees a friendly error with the business's phone number instead.

The Make address and the secret password are stored only on the server, never in the web page, so
nobody can copy them from the browser and flood the sheet with junk.

---

## Already built this for the old laundry version? Update it in 6 steps

The website now collects **Property Type** and **Property Size** instead of Service Type and Estimated
Amount, and the address is always filled in. The Make scenario, secret, and webhook URL stay the same.
You only update the sheet headers and two mappings.

1. **Google Sheet, row 1:** rename **G1** from `Estimated Amount` to `Property Type`, and **H1** from
   `Service Type` to `Property Size`. All other headers stay as they are.
2. **Make → the webhook module:** open it, click **Redetermine data structure**, and leave it waiting.
3. **Send a sample** with the command in step 3.3 below (it already has the new fields). Click **OK**
   when Make says it determined the structure.
4. **Make → the Google Sheets module:** open it. Make re-reads the headers. Map **Property Type (G)** to
   `propertyType` and **Property Size (H)** to `propertySize`. Click **OK** and save the scenario.
5. **Delete old test rows** in the sheet (not row 1).
6. Submit the live form once and check the new row (Part 5).

---

## Part 1: Create the Google Sheet

Sign in to Google **as the client** (or with the account that will own the inquiries).

1. Go to **sheets.google.com** and click **Blank spreadsheet**.
2. Click the title **Untitled spreadsheet** (top left) and rename it, e.g. `Queen Clean Inquiries`.
3. At the bottom, double-click the tab **Sheet1** and rename it to **`Inquiries`**.
   The spelling must be exact. Make looks for this name.
4. Click cell **A1** and type the headers below, pressing **Tab** after each so each goes in the
   next column (A to M):

   ```
   Timestamp	Inquiry ID	Full Name	Phone	Email	Service	Property Type	Property Size	Address	Preferred Date	Preferred Time	Message	Status
   ```

   Tip: copy the line above and paste it into A1. Google Sheets splits it into the 13 columns
   automatically.

5. **Freeze the header row:** menu **View → Freeze → 1 row**.
6. **Make Status a dropdown:**
   1. Click the column letter **M** to select the column, then Ctrl/Cmd-click **M1** to deselect the header.
      (Or type `M2:M` in the Name box at the top left and press Enter.)
   2. Menu **Data → Data validation → Add rule**.
   3. Under **Criteria**, choose **Dropdown**, and add these options one per line:
      `New`, `Contacted`, `Quoted`, `Confirmed`, `Completed`, `Cancelled`.
   4. Click **Done**.
7. **Highlight new inquiries (optional):**
   menu **Format → Conditional formatting**, range `M2:M`, **Format cells if… → Text is exactly** →
   `New`, choose a light yellow fill, then **Done**.
8. **Lock down sharing:** click **Share** (top right).
   - Under **General access**, make sure it says **Restricted**.
   - Add each staff member's email as **Editor**.
   - **Never** choose "Anyone with the link". The sheet holds customers' phones and addresses.
9. **Email when a new inquiry arrives (free):** menu **Tools → Notification settings →
   Edit notifications** → choose **Any changes are made** and **Email – right away** → **Save**.

---

## Part 2: Create the secret password

The website and Make share a password so Make can tell real inquiries from fake ones.

1. In a terminal in the project folder, run:

   ```bash
   node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
   ```

2. Copy the output (32 random characters) and keep it in a password manager or a private note.
   You'll paste it into Make (Part 3) and into the website's settings (Part 4).

---

## Part 3: Build the scenario in Make.com

### 3.1 Create the account and scenario

1. Go to **make.com** and sign up (or log in). For a client project, it's best to create the Make
   account with the **client's business email** and invite yourself as a team member, so the
   client owns it if you ever stop working on the site.
2. When asked for a region, either is fine. Note that your webhook address will start with
   `hook.eu…` or `hook.us…` to match it.
3. In the left sidebar click **Scenarios**, then **Create a new scenario** (top right).
4. You'll see an empty canvas with a big **+** in the middle. Click the scenario name at the top
   left and rename it `Cleaning website → Google Sheets`.

### 3.2 Module 1: Custom webhook (receives the inquiry)

1. Click the big **+**. In the search box type **Webhooks** and click it.
2. Choose **Custom webhook**.
3. Next to the **Webhook** field click **Add**.
4. **Webhook name:** `Cleaning website inquiries`. Leave the rest as is and click **Save**.
5. Make shows the webhook address, something like:

   ```
   https://hook.eu2.make.com/abcdefgh12345678abcdefgh12345678
   ```

   Click **Copy address to clipboard** and save it next to your secret. This is the website's
   `MAKE_WEBHOOK_URL`.
6. The module now shows a spinning **"Make is now waiting for the data"** message (it may say
   "Stop" next to it). **Leave this open** and do Part 3.3 in a terminal.

> Make turns off webhooks that are not part of a saved scenario for 5 days. Save the scenario
> (Ctrl/Cmd + S) before you step away.

### 3.3 Send one sample inquiry so Make learns the fields

While Make is waiting, send a sample. Replace the two placeholders and run this in a terminal:

```bash
curl -X POST "PASTE_WEBHOOK_URL_HERE" -H "content-type: application/json" -d '{"timestamp":"2026-10-06 14:05","inquiryId":"QC-20261006-TEST1","name":"Sample Customer","phone":"09171234567","email":"sample@example.com","service":"Deep Cleaning","propertyType":"Condo / Apartment","propertySize":"2 bedrooms, about 45 sqm","address":"Unit 5B, Sample Tower, Lacson St, Bacolod City","preferredDate":"2026-10-10","preferredTime":"Morning","message":"Sample message","status":"New","secret":"PASTE_SECRET_HERE"}'
```

- The terminal prints `Accepted`. That's normal at this stage.
- In Make, the module shows **"Successfully determined."** Click **OK**.

If you ever add a field later, open this module, click **Redetermine data structure**, and send a
sample again.

### 3.4 The filter: only continue if the secret is correct

1. Hover to the right of the webhook module and click the small **+** to add the next module.
   Search **Google Sheets** and choose **Add a Row**. (You'll fill it in at 3.5. For now just close
   it with **OK**, or continue straight to 3.5 and come back here.)
2. Between the two modules there's now a dotted line. Click the **wrench icon** on that line (or the
   middle of the line) and choose **Set up a filter**.
3. **Label:** `Valid secret`
4. **Condition:**
   - Click the first box. A panel of webhook fields opens. Click **secret**.
   - **Operator:** open the dropdown, go to **Text operators**, and choose **Equal to**.
     (Not "Equal to (case insensitive)".)
   - In the last box, paste your secret password.
5. Click **OK**. The line now shows a filter icon.

Anything without the right secret stops here. Nothing is written and the website shows the error
message.

### 3.5 Module 2: Google Sheets, Add a Row

Open the Google Sheets module (click it).

1. **Connection:** click **Add** (or **Create a connection**) → **Sign in with Google** → pick the
   Google account that owns the sheet from Part 1 → click **Allow** on Google's permission screen.
   Back in Make, click **Save** if asked.
2. **Search Method:** choose **Search by path** (or **Select from all**). Pick **My Drive**, then the
   spreadsheet from Part 1.
3. **Sheet Name:** `Inquiries`.
4. **Table contains headers:** **Yes**. Make reads row 1 and shows a box for each column.
5. **Map each column.** Click inside each box, and in the panel that opens click the matching field
   under **1. Webhooks – Custom webhook**:

   | Sheet column | Click this field |
   |---|---|
   | Timestamp (A) | `timestamp` |
   | Inquiry ID (B) | `inquiryId` |
   | Full Name (C) | `name` |
   | Phone (D) | `phone` |
   | Email (E) | `email` |
   | Service (F) | `service` |
   | Property Type (G) | `propertyType` |
   | Property Size (H) | `propertySize` |
   | Address (I) | `address` |
   | Preferred Date (J) | `preferredDate` |
   | Preferred Time (K) | `preferredTime` |
   | Message (L) | `message` |
   | Status (M) | `status` |

   Each box should show a small coloured tag like **1. phone**. **Don't** map `secret` anywhere.
6. Scroll down and turn on **Show advanced settings**.
7. **Value input option: Raw.** ⚠ This one is required. With the default ("User entered"):
   - phone `09171234567` would be saved as `9171234567` (the leading zero is lost), and
   - anything a customer types that starts with `=` would run as a spreadsheet formula. People use
     that trick to steal data from sheets.
8. **Insert data option:** **Insert rows**.
9. Click **OK**.

### 3.6 Module 3: Webhook response (tell the website it worked)

1. Hover to the right of the Google Sheets module, click **+**, search **Webhooks**, and choose
   **Webhook response**.
2. **Status:** `200`
3. **Body:** type exactly:

   ```
   {"ok":true}
   ```

4. Turn on **Show advanced settings** → **Custom headers** → **Add item**:
   - **Key:** `Content-Type`
   - **Value:** `application/json`
5. Click **OK**.

Your scenario now reads, left to right:

```
[Webhooks: Custom webhook] ──(Valid secret)──▶ [Google Sheets: Add a Row] ──▶ [Webhooks: Webhook response]
```

### 3.7 Keep one Google error from switching the form off

Make **switches off** a webhook scenario the first time a module errors, for example if Google is
briefly unavailable. Every inquiry after that would fail until someone turns it back on. Two
settings prevent that and make sure no inquiry is lost.

**a) Store failed runs so they can be retried**

1. At the bottom of the editor click the **gear icon** (**Scenario settings**).
2. Turn on **Allow storing of incomplete executions** (newer versions call it **Store incomplete
   executions**).
3. Click **OK**.

**b) Add a "Break" error handler to the Google Sheets module**

1. **Right-click** the Google Sheets module → **Add error handler**.
2. Choose **Break**.
3. In the Break settings, turn on **Automatically complete execution**, and set
   **Number of attempts** to `3` and **Interval between attempts** to `15` (minutes).
4. Click **OK**.

What happens now when Google fails:
- The customer sees the error message with the business's phone number, so they can call or try again.
- Make keeps the inquiry under **Incomplete executions** and retries it automatically. It usually
  reaches the sheet within 15 minutes.
- The scenario **stays on** for the next customer.
- Because the customer may also resubmit, staff may occasionally see the same person twice. That's
  better than losing an inquiry.

### 3.8 Save and switch it on

1. Press **Ctrl/Cmd + S** (or the **save** icon at the bottom).
2. At the bottom left, set the scheduling switch to **ON**. Make should say it runs
   **Immediately as data arrives**. Webhook scenarios run instantly on every plan.
3. Make emails the account owner when a scenario has problems. Make sure someone reads that inbox.

**Cost:** each inquiry uses **3 credits** (webhook, add row, response). The filter is free. Make's
Free plan includes a monthly allowance (1,000 at the time of writing), which is roughly 300
inquiries a month. Check **make.com/pricing** and watch usage under **Organization → Subscription**.

---

## Part 4: Connect the website

### On your computer (for testing)

1. In the project folder, create a file named **`.env.local`** (copy `.env.example` as a start).
2. Fill in:

   ```
   MAKE_WEBHOOK_URL=https://hook.eu2.make.com/your-webhook-address
   MAKE_WEBHOOK_SECRET=your-secret-from-part-2
   ```

3. Save. If `npm run dev` is already running, it picks up the change by itself (it prints
   `Reload env: .env.local`). Otherwise start it with `npm run dev`.

`.env.local` is git-ignored, so it is never committed.

### On the live host (when you deploy)

Add the same two values in the host's **Environment Variables** settings (Vercel: **Project →
Settings → Environment Variables**; Netlify: **Site configuration → Environment variables**),
then **redeploy**. They take effect only after a new deploy.

---

## Part 5: Test it (don't skip this)

Open http://localhost:3000/request-a-quote (or the live site). Tick each item:

- [ ] **Normal request:** fill in the form and submit. You see **Request Submitted!** with a
      reference number, and within a few seconds a new row appears with the **same Inquiry ID** and
      Status `New`.
- [ ] **Phone format:** enter `0917 123 4567`. The sheet shows `09171234567`, with the leading zero kept.
- [ ] **Formula safety:** put `=1+1` in the Message. The sheet shows the text `=1+1`, not `2`.
      (If it shows `2`, go back to 3.5 step 7 and set **Raw**.)
- [ ] **Property and address:** choose **Condo / Apartment** and enter an address. The row shows
      `Condo / Apartment` under Property Type and the full address under Address.
- [ ] **Wrong password:** change one letter of `MAKE_WEBHOOK_SECRET` in `.env.local`, submit. The site
      shows the error message and **no row** is added. Change it back.
- [ ] **Scenario off:** switch the scenario **OFF** in Make and submit. The site shows the error
      message, not success. Switch it back **ON**. Make holds calls it receives while off and
      processes them when it's back on, so this test row may appear afterwards.
- [ ] Check Make's **History** tab: each test run shows as successful (green), with no errors.

Then **delete all test rows** from the sheet (right-click the row number → **Delete row**).
Don't delete row 1.

Repeat the first three checks on the **live site** after deploying.

---

## Troubleshooting

| What you see | Most likely cause | Fix |
|---|---|---|
| The site always shows the error message | Scenario is OFF, secret doesn't match, or the env vars aren't set | Check the ON switch; compare the secret in the filter and in the env var character by character; on the host, redeploy after setting env vars. The host's logs show `[inquiry] delivery failed` with the reason. |
| Make **History** shows runs that stop at the filter | Wrong secret | Same as above. |
| Rows appear but the site shows an error | The Webhook response module is missing or its body isn't exactly `{"ok":true}` | Fix module 3 (3.6). |
| Phone loses the leading zero, or `=1+1` shows `2` | Value input option is "User entered" | Set it to **Raw** (3.5 step 7). |
| Rows stopped appearing after someone edited the sheet | The `Inquiries` tab or a header in row 1 was renamed or moved | Restore the exact names and order from Part 1. In the Google Sheets module, re-open it so Make re-reads the headers, and check the mapping. |
| Make shows the scenario turned off | An error happened before the Break handler was added, or a different module failed | Check **Incomplete executions** and **History**, fix the cause, turn it back ON, and make sure 3.7 is done. |
| A column is empty for every row | It wasn't mapped, or a field was added later | Open module 2 and map it. For new fields, use **Redetermine data structure** (3.3). |
| You think the secret leaked | — | Make a new one (Part 2), paste it into the filter (3.4) **and** the env var (Part 4), save the scenario, and redeploy. |

---

## Handover checklist

- [ ] The sheet is owned by the client's Google account and shared only with staff
- [ ] The Make account belongs to (or is shared with) the client
- [ ] Scenario is ON; Raw input; incomplete executions stored; Break handler added
- [ ] Every Part 5 check passes on the live site; test rows deleted
- [ ] Sheet notifications turned on for the owner
- [ ] Client has the sheet link and [CLIENT-GUIDE.md](CLIENT-GUIDE.md)
