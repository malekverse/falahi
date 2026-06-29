# BLOCKERS.md — Current Blocking Issues

## 1. Meta WhatsApp Message Templates — Awaiting Approval

**What's blocked:** Business-initiated WhatsApp messages (welcome, confirmations, OTP, payouts) cannot be sent without approved templates.

**Current status:** Template JSON files created at `docs/meta-whatsapp/templates.json`. Submission guide at `docs/meta-whatsapp/SUBMISSION_GUIDE.md`.

**Unblock action:**
1. Log into https://business.facebook.com/wa/manage/message-templates/
2. Create each template from `docs/meta-whatsapp/templates.json`
3. Wait for Meta review (1–7 days typical)
4. Once approved, no code changes needed — `@filahi/utils` sends templates by name

**Why it's stuck here:** Template submission requires Meta Business Platform UI access — cannot be automated via CLI.

---

## ~~2. Weekly Automated DB Backup — Requires Docker~~ ✅ RESOLVED

**Resolution:** Created `scripts/backup-direct.mjs` — uses `@supabase/supabase-js` with service role key to export all 17 tables to JSON. No Docker needed. Verified working against remote `nrysujlctrhjucvdtivq.supabase.co` (17 tables, 2 rows exported).

**GitHub Action:** Updated at `.github/workflows/db-backup.yml` to use the direct script. Requires two GitHub secrets:
- `SUPABASE_URL` — `https://nrysujlctrhjucvdtivq.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` — the service role key from `.env`

**Local use:** `pnpm exec node scripts/backup-direct.mjs` (reads env from `.env` automatically when run via pnpm).

---

## 3. `CRON_SECRET` — Not Deployed

**What's blocked:** The 3 Vercel cron endpoints (`/api/cron/recurring-orders`, `/api/cron/expire-listings`, `/api/cron/stale-trips`) require the `CRON_SECRET` environment variable to be set in Vercel's dashboard.

**Current status:** Config file at `apps/web/vercel.json` with schedules defined. Cron endpoints are deployed with the web app.

**Unblock action:**
1. Generate a random secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Add `CRON_SECRET` to Vercel project environment variables
3. Deploy the app
4. Verify: `curl -H "Authorization: Bearer <secret>" https://your-domain.vercel.app/api/cron/expire-listings`
