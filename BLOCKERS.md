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

## 2. Weekly Automated DB Backup — Requires Docker

**What's blocked:** `supabase db dump` requires a running local Supabase instance (which needs Docker).

**Current status:** Backup script at `scripts/backup-db.ps1`. GitHub Action workflow at `.github/workflows/db-backup.yml` configured for weekly runs.

**Unblock action:**
1. Install Docker Desktop on your machine
2. Run `supabase start` to spin up local Supabase
3. Run `scripts/backup-db.ps1` to verify backup works
4. Or skip local entirely: add `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` to GitHub secrets; the workflow dumps directly from the remote DB

**Why it's stuck here:** No Docker runtime available in this environment. The GitHub Action approach works without Docker once secrets are configured.

---

## 3. `CRON_SECRET` — Not Deployed

**What's blocked:** The 3 Vercel cron endpoints (`/api/cron/recurring-orders`, `/api/cron/expire-listings`, `/api/cron/stale-trips`) require the `CRON_SECRET` environment variable to be set in Vercel's dashboard.

**Current status:** Config file at `apps/web/vercel.json` with schedules defined. Cron endpoints are deployed with the web app.

**Unblock action:**
1. Generate a random secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Add `CRON_SECRET` to Vercel project environment variables
3. Deploy the app
4. Verify: `curl -H "Authorization: Bearer <secret>" https://your-domain.vercel.app/api/cron/expire-listings`
