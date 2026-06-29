# DECISIONS.md — Architecture Decision Records (ADRs)
## Filahi — AgriTech Marketplace

> Every non-obvious technical or product decision is documented here.
> Before making a conflicting choice, read the relevant ADR.
> To add a new decision: copy the template, assign the next ID, set status.

---

## ADR Template

```
## ADR-XXX: [Title]
**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded by ADR-YYY | Deprecated
**Context:** Why did this decision need to be made?
**Decision:** What was decided?
**Consequences:** What are the trade-offs?
```

---

## ADR-001: No Separate Backend Server (Next.js API Routes Only)

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Common patterns suggest separating frontend and backend. Options considered: Express.js, NestJS, FastAPI, or Next.js API routes.

**Decision:** Use Next.js 14+ API Routes / Server Actions as the only backend layer. No separate server.

**Consequences:**
- ✅ Zero additional hosting cost (all on Vercel free tier)
- ✅ Single deployment, no orchestration complexity
- ✅ TypeScript end-to-end with shared types
- ⚠️ Vercel serverless functions have 10-second timeout — all long-running tasks (Whisper transcription) must be async
- ⚠️ Not suitable if we eventually need persistent WebSocket connections server-side (mitigated by Supabase Realtime)

---

## ADR-002: Supabase Realtime Broadcast for GPS (Not DB Writes)

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Driver GPS pings every 45 seconds. Options: (A) Write to `trip_location_cache` table on every ping, (B) Use Supabase Realtime Broadcast (ephemeral, no DB write).

**Decision:** Use Realtime Broadcast for live tracking. Only write to DB on network reconnect (offline cache flush) and when trip status changes.

**Consequences:**
- ✅ Zero database writes per ping = no storage overhead
- ✅ Stays within 200 concurrent connection free tier limit (one channel per active trip)
- ⚠️ If admin refreshes page, they lose historical path — only see current position
- Acceptable: admin only needs current location, not replay of entire route

---

## ADR-003: Android-Only Driver App (Phase 1)

**Date:** 2026-01-01
**Status:** Accepted

**Context:** React Native supports iOS and Android. Background location on iOS requires significantly more configuration (background modes entitlements, App Store review complexity, different permission model).

**Decision:** Build and test driver app for Android only in Phase 1. iOS support is deferred to Phase 2 after revenue validation.

**Consequences:**
- ✅ Matches real user hardware (95%+ of Tunisian truck drivers use Android)
- ✅ Faster development cycle
- ✅ Avoids Apple Developer fee ($99/year) until revenue exists
- ⚠️ iOS users cannot drive for the platform in Phase 1 (acceptable)

---

## ADR-004: Prices Stored as Integer Millimes

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Financial data requires precision. Floating point arithmetic in computers is unreliable for money (0.1 + 0.2 ≠ 0.3).

**Decision:** All monetary values stored as INTEGER in PostgreSQL, denominated in millimes (1 TND = 1000 millimes). Display layer converts to TND string.

**Consequences:**
- ✅ No floating point rounding errors in financial calculations
- ✅ Standard practice for fintech (Stripe uses cents, same principle)
- ⚠️ All developers must remember the convention — enforced by TypeScript type `Millimes = number` and a mandatory `formatTND()` utility function

---

## ADR-005: WhatsApp Webhook Returns 200 Immediately (Async Processing)

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Meta's WhatsApp API requires webhook responses within 20 seconds or it retries the message. Whisper transcription alone can take 5–15 seconds.

**Decision:** Webhook endpoint returns HTTP 200 immediately after signature verification and idempotency check. All audio processing happens in a queued background task.

**Implementation options for background processing:**
- Option A: Vercel Edge Function with `waitUntil()` (free, simple)
- Option B: Supabase Edge Function triggered by DB insert (free)
- **Chosen: Option A** — `waitUntil()` in Next.js route handler keeps it in one codebase

**Consequences:**
- ✅ No Meta retries
- ✅ No duplicate listing creation
- ⚠️ If Vercel function crashes mid-processing, message is lost (acceptable in Phase 1; add retry queue in Phase 2)

---

## ADR-006: OpenStreetMap via Maplibre GL JS (Not Google Maps)

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Map display needed for admin tracking panel and buyer order tracking. Google Maps API has a free tier but bills beyond it.

**Decision:** Use Maplibre GL JS (open source) with OpenStreetMap tile data. Library: `react-map-gl` with Maplibre renderer.

**Free tile options:**
- Option A: OpenStreetMap standard tiles (free, no API key, usage policy)
- Option B: Stadia Maps (free tier: 200K tile requests/month)
- Option C: Maptiler (free tier: 100K requests/month)
- **Chosen: Stadia Maps** — better looking tiles, generous free tier

**Consequences:**
- ✅ $0 cost for Phase 1
- ✅ No credit card required
- ⚠️ Slightly less accurate POI data vs Google Maps (acceptable for delivery tracking)
- ⚠️ Driver navigation uses deep link to Google Maps / Waze (user's installed app) — not in-app navigation

---

## ADR-007: OTP Validation via Supabase RPC (Not Application Layer)

**Date:** 2026-01-01
**Status:** Accepted

**Context:** OTP validation requires reading the stored OTP and updating the trip status atomically. Doing this in two separate application-layer calls risks race conditions.

**Decision:** Implement `validate_pickup_otp()` and `validate_delivery_otp()` as PostgreSQL functions called via Supabase RPC. These use `SELECT FOR UPDATE` to lock the row during validation.

**Consequences:**
- ✅ Atomic operation — impossible to have race conditions
- ✅ Cannot be bypassed from application layer
- ✅ Security: OTP values never returned to client; only compared server-side
- ⚠️ Supabase RPC requires `SECURITY DEFINER` for cross-table operations — must be carefully reviewed

---

## ADR-008: pnpm Workspaces for Monorepo

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Three apps (web, driver, bot) share types, Supabase client, and UI components. Options: npm workspaces, yarn workspaces, pnpm workspaces, Nx, Turborepo.

**Decision:** pnpm workspaces with Turborepo for build orchestration.

**Consequences:**
- ✅ Fastest package installation (symlinks, no duplication)
- ✅ `pnpm -r` runs scripts across all packages
- ✅ Turborepo caches build outputs — faster CI
- ⚠️ Expo (driver app) requires specific pnpm configuration (`nodeLinker: hoisted` in `.npmrc`)

---

## ADR-009: Farmer Has No Login (WhatsApp is Identity)

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Requiring farmers to create an account and remember a password contradicts the "zero friction" principle. But we need to link WhatsApp messages to a farmer profile.

**Decision:** Farmers are identified by their WhatsApp phone number (`wa_sender_id` in `profiles.whatsapp_id`). First time a new number messages the bot, a profile is auto-created. No password, no app, no login.

**Admin note:** Admin can manually link a WhatsApp number to a profile if there are issues.

**Consequences:**
- ✅ Zero onboarding friction for farmers
- ✅ WhatsApp is already their trusted communication channel
- ⚠️ Farmer has no way to log into a web interface (acceptable; admin handles any disputes on their behalf)
- ⚠️ If farmer changes WhatsApp number, admin must manually update `whatsapp_id`

---

## ADR-010: Phase 1 Payouts are Manual (No Flouci API Yet)

**Date:** 2026-01-01
**Status:** Accepted

**Context:** Flouci and Walletii APIs require business registration and API approval processes that take weeks. Phase 1 must ship faster than that.

**Decision:** In Phase 1, the ledger tracks exactly who is owed what, but the actual money transfer to farmers and drivers is handled manually by the admin (postal D17 transfer or hand-delivery). The admin sees a "Disbursements Due" view in the admin panel.

**Consequences:**
- ✅ Unblocks Phase 1 launch completely
- ✅ Ledger data is already structured for Phase 2 automation
- ⚠️ Admin manual work increases with volume — this is the forcing function to implement Phase 2 quickly
- ⚠️ Trust risk: farmers must trust they'll receive payment. Mitigated by WhatsApp confirmation message sent after each trip settlement.

---

## ADR-013: Cursor-Based Pagination (Over Offset)

**Status:** Accepted | **Date:** 2026-06-29

**Context:** The marketplace listing API needs pagination that is stable under active writes. Using `OFFSET` would cause items to shift and create duplicates/skips when new listings are inserted while a buyer is browsing.

**Decision:** Use cursor-based pagination with a composite cursor of `(created_at, id)`. The cursor is base64-encoded and decoded on the server. The query uses `.or(created_at.lt.{cursor}, and(created_at.eq.{cursor}, id.lt.{cursorId}))` for stable page boundaries. Retained `getOffset()` as a legacy export in `packages/utils` but all new code uses cursor-based.

**Consequences:**
- ✅ Stable across inserts — no duplicates or missed items
- ✅ Works with Supabase's `.or()` filter natively
- ⚠️ Cannot jump to arbitrary page number (unexpected UX for power users — acceptable for MVP)

---

## ADR-014: In-Memory Rate Limiting (No External Store)

**Status:** Accepted | **Date:** 2026-06-29

**Context:** The WhatsApp webhook needs rate limiting to prevent abuse. On Vercel's free tier, external stores (Redis/Upstash) add cost and complexity. Serverless functions may have multiple instances, making shared state unreliable.

**Decision:** Use an in-memory `Map<string, {count, resetAt}>` rate limiter keyed by sender WhatsApp ID. Best-effort rate limiting — not guaranteed across cold starts or multiple instances, but effective enough for the MVP threat model (Meta API is the only sender, rate limiting per waId prevents a single farmer's phone from flooding).

**Consequences:**
- ✅ Zero infrastructure cost
- ✅ No cold-start dependency
- ⚠️ Rate limit resets on cold start (acceptable — Meta retries with backoff)
- ⚠️ Not distributed — each Vercel instance has independent counters

---

## ADR-015: Vercel Cron Jobs Over Supabase pg_cron

**Status:** Accepted | **Date:** 2026-06-29

**Context:** Three scheduled tasks are needed: expire stale listings, alert on stale trips, process recurring orders. Supabase's pg_cron extension requires Docker and the Business tier ($25/mo+). Vercel Cron Jobs are free on the Hobby plan.

**Decision:** Write the scheduled logic as Supabase RPC functions (PostgreSQL, SECURITY DEFINER) and call them from Vercel Cron Jobs via HTTP endpoints. The cron endpoints are protected by a shared `CRON_SECRET` Bearer token. Vercel's `vercel.json` defines the schedules.

**Consequences:**
- ✅ Zero additional cost on Vercel Hobby plan
- ✅ All logic is still in the database (idempotent SQL functions)
- ✅ Simple to test: just HTTP GET with auth header
- ⚠️ Requires `CRON_SECRET` env var in Vercel dashboard
- ⚠️ 60-second Vercel function timeout could be tight for large batches — mitigated by `maxDuration: 60` and idempotent RPCs

---

## ADR-017: Docker-Free DB Backup via Supabase JS Client

**Date:** 2026-06-29

**Status:** Accepted

**Context:** The Phase 6 checklist requires a weekly automated DB backup. The original approach used `supabase db dump` which requires Docker (for local) or the Supabase CLI with an access token. Docker is unavailable in this environment and adding `SUPABASE_ACCESS_TOKEN` as a GitHub secret is an extra setup step.

**Decision:** Write a Node.js backup script (`scripts/backup-direct.mjs`) that uses `@supabase/supabase-js` with the existing service role key (`SUPABASE_SERVICE_ROLE_KEY`) to:
1. Iterate over all 17 user-created tables
2. Export each table to a separate JSON file
3. Create a `manifest.json` with row counts and timestamps
4. Write a `backups/latest.json` pointer for easy reference
5. No Docker, no Supabase CLI, no external dependencies beyond `@supabase/supabase-js`

The GitHub Action at `.github/workflows/db-backup.yml` was updated to use this script as the primary method.

**Consequences:**
- ✅ Works locally with zero setup: `pnpm exec node scripts/backup-direct.mjs`
- ✅ Works in CI with just a service role key secret (no Supabase access token needed)
- ✅ All tables exported as human-readable JSON
- ⚠️ JSON export is not a full SQL dump (no schema, no indexes, no functions) — for disaster recovery, the migration files serve as the schema source of truth
- ⚠️ JSON files may be large for tables with many rows (mitigated by compression via upload-artifact)
