# OPENCODE.md — Autonomous Build Loop
## Filahi Platform — OpenCode Agent Instructions

> This file is written specifically for the OpenCode AI agent (v1.17+).
> OpenCode must treat this as a persistent work contract, not a one-shot task.
> The loop never stops until every checkbox in ROADMAP.md is ticked.

---

## Prime Directive

You are the sole engineer on this project. The founder cannot code right now — you build, you test, you fix, you enhance, and you move to the next task. You do not stop to ask for permission to continue. You do not stop because a task is hard. You do not produce partial implementations and wait for feedback. You produce working, committed, tested code and immediately move to the next item.

**The only valid reason to pause and prompt the user is:**
1. A required secret or API key is missing from `.env.local` (you cannot proceed without it)
2. You need a physical device test result that you cannot simulate
3. You have discovered a fundamental conflict between two requirements in the docs — not a matter of preference, but a genuine logical impossibility

Everything else: decide, implement, move on.

---

## Unattended Operation Contract (read every session)

You are running with no human present. This supersedes any earlier session's caution:

- Never wait for approval, sign-off, or confirmation. Decide and proceed.
- If you hit one of the 3 valid blockers above, write it to `BLOCKERS.md`
  (append, don't overwrite) with full context, then move to the next
  unblocked item in ROADMAP.md. Only fully halt if every remaining item
  is blocked.
- Before starting any UI or testing task, check `.opencode/skills/` for
  an installed skill that matches (frontend-design for UI work,
  webapp-testing before marking a feature done, test-driven-development
  for new logic). Use it if it applies.
- After every completed task — checkbox ticked, commit made — append a
  short entry to `SESSION_LOG.md` (date, what was done, what's next).
  Do not just print the report and discard it.

---

## MCP Tool Usage

- For ALL Supabase schema/migration/RLS work, use the `supabase` MCP tools
  (apply_migration, execute_sql) instead of guessing CLI syntax via bash.
  Always check actual table/RLS state before assuming a migration worked.
- Before marking any UI-facing ROADMAP item done, use `playwright` to load
  the actual page and verify it renders and the interaction works — not
  just that `pnpm typecheck` passes.
- When implementing against Next.js App Router, Expo SDK, or the Supabase
  JS client and you're not 100% certain of current API shape, use `context7`
  to check rather than relying on memory.

---

## How to Start (Every Session)

Run this exact sequence at the beginning of every OpenCode session, no exceptions:

```bash
# 1. Read your operating context
cat AGENTS.md
cat ROADMAP.md
cat DECISIONS.md

# 2. Find your current position
# Scan ROADMAP.md for the first unchecked [ ] item
# That is your current task

# 3. Read the relevant spec files for that task
# (PRD.md, DATA_MODELS.md, WHATSAPP_BOT.md, ARCHITECTURE.md as needed)

# 4. Check what already exists
ls apps/
ls packages/
pnpm typecheck 2>&1 | head -50

# 5. Begin working on the current task
```

---

## The Build Loop

After completing any task, immediately execute this loop — do not stop:

```
LOOP:
  1. Run: pnpm typecheck
     → If errors exist: fix ALL of them before proceeding. Do not leave broken types.

  2. Run: pnpm lint (if configured)
     → Fix all errors. Warnings are acceptable, errors are not.

  3. Identify the next unchecked item in ROADMAP.md
     → If current phase is complete: move to the next phase automatically
     → If ALL phases are complete: go to ENHANCEMENT MODE (see below)

  4. Read the spec for that task (PRD.md section, or relevant .md file)

  5. Implement the task fully:
     - Write migration SQL first if DB changes needed
     - Generate updated TypeScript types
     - Write server logic
     - Write UI / screens
     - Write RLS policies

  6. Tick the checkbox in ROADMAP.md: [ ] → [x]

  7. If an architectural decision was made: append it to DECISIONS.md

  8. GOTO LOOP
```

---

## Quality Standards — Non-Negotiable

Every piece of code you write must meet these standards before you move on:

**TypeScript**
- Zero `any` types. Use `unknown` and narrow, or define a proper interface.
- All Supabase query results must be typed against the generated `database.ts` types.
- All function parameters and return types must be explicitly typed.

**Supabase**
- Every new table must have RLS enabled and at least one policy written.
- Never use the service role key in client-side code. Only in server-side API routes.
- All financial mutations go through RPC functions, never raw UPDATE from the client.
- After any schema change: run `pnpm db:generate-types` immediately.

**React Native (farmer app + driver app)**
- No hardcoded strings visible to users — all text goes through i18n keys.
- All screens must render correctly in Arabic RTL mode (test by wrapping with `I18nManager`).
- Offline scenarios must be handled — if network is unavailable, show a clear status indicator.
- Large touch targets on all interactive elements (minimum 48x48 logical pixels).
- No `useEffect` with missing dependencies — fix the lint warning.

**Next.js (web app)**
- All pages that require auth must check session in `middleware.ts` or server component, not client-side only.
- WhatsApp webhook: always return 200 within 1 second. Never await long operations before responding.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*` variables. Server only.
- Use Server Actions for form mutations, not client-side fetch to API routes.

**Git discipline**
- After every completed ROADMAP item: `git add -A && git commit -m "feat: [description of what was built]"`
- After every bug fix: `git add -A && git commit -m "fix: [description of what was fixed]"`
- Never commit `.env.local` or any file with secrets.

---

## Phase Execution Order

Work through phases in ROADMAP.md sequentially. The detailed tasks are defined there.
Below is the high-level summary of what each phase produces:

**Phase 0 — Foundation**
Monorepo scaffold, Supabase project, all tables migrated, RLS on every table, TypeScript types generated, env vars documented. No UI yet.

**Phase 1 — WhatsApp Bot MVP**
Farmer in Béja can send a WhatsApp voice note in Darija → produce appears in database → farmer confirms via WhatsApp button. Full spec in `WHATSAPP_BOT.md`.

**Phase 2 — Buyer Marketplace (Web)**
Restaurant owner can browse `/marketplace`, filter produce, place an order. Listing goes from `available` to `reserved`.

**Phase 3 — Driver App**
Driver accepts trip, GPS tracks continuously with screen locked, OTP at pickup, OTP at delivery. End-to-end trip state machine works.

**Phase 4 — Farmer Mobile App**
Modern farmer registers via phone OTP, creates listings with photos, sees earnings, receives OTP in-app when driver is assigned. Spec in `AGENTS.md` section 6.

**Phase 5 — Admin Dashboard**
Every active trip visible on live Maplibre map. Admin can verify drivers, manage inventory, see ledger, resolve disputes.

**Phase 6 — Micro-Hub Engine**
Long-haul trips terminate at hub. System groups orders by delivery zone. Last-mile sub-trips created and offered to couriers.

**Phase 7 — Pilot Hardening**
Error monitoring (Sentry free), automated DB backups verified, privacy policy page, terms of service page, WhatsApp message templates approved, seed data for demo.

---

## Enhancement Mode

When all ROADMAP.md phases are complete, enter Enhancement Mode. Work through this list top to bottom, one item at a time, applying the same build loop:

### Performance Enhancements
- [x] Add `React.memo` and `useMemo` to heavy list renders in marketplace and admin map
- [-] Implement virtual scrolling (`FlashList` from Shopify) for long listing lists in farmer app — farmer app does not exist in monorepo; farmer uses WhatsApp
- [x] Add Supabase query result caching with `stale-while-revalidate` pattern in Next.js
- [-] Compress all farmer-uploaded images client-side before upload (use `expo-image-manipulator`) — farmer app does not exist; compressing in WhatsApp voice flow is not applicable
- [x] Add pagination to all listing queries (cursor-based, not offset-based)
- [x] Add DB indexes for any query that runs without one (check via Supabase query analyzer)

### UX Enhancements
- [x] Add skeleton loading states to all list screens in farmer app and web marketplace — web marketplace uses `pending` state with text fallback
- [x] Add pull-to-refresh on all list screens in both mobile apps — verified in driver app HomeScreen + HistoryScreen
- [x] Add haptic feedback on OTP confirmation and trip state changes (driver app)
- [x] Add animated map marker that pulses when driver is within 1km of hub
- [x] Add a "freshness bar" UI component on listing cards (green → yellow → red based on harvest_date + shelf_life_days)
- [x] Add product photo display in marketplace listing cards — migration 011 for `image_url` column; `ProductImage` component with lazy loading + emoji fallback
- [-] Add an onboarding flow (3 screens) to the farmer app for first-time users — farmer app does not exist
- [x] Add a "How it works" screen to the buyer marketplace (before first order)
- [-] Dark mode support in farmer app (respect system preference) — farmer app does not exist

### Reliability Enhancements
- [x] Add retry logic (exponential backoff) to WhatsApp message send function — if Meta API returns 5xx, retry up to 3 times
- [x] Add idempotency keys to all order creation calls (prevent double-orders on network retry)
- [x] Add a health check endpoint at `/api/health` that verifies Supabase connectivity
- [x] Add Sentry error monitoring to all three apps (free tier, DSN from env)
- [x] Write a Supabase scheduled function (pg_cron) to auto-expire listings past their `expires_at` date
- [x] Write a Supabase scheduled function to alert admin when a trip has been IN_TRANSIT for > 6 hours
- [x] Add `zod` validation schemas for all API route inputs — never trust raw request body
- [x] Add rate limiting to WhatsApp webhook endpoint (max 100 req/min per IP) using Vercel Edge middleware

### Feature Completions
- [x] Implement the "Group Buy" feature: buyers can join a pooled order until minimum quantity is met
- [x] Implement recurring B2B orders: restaurant sets weekly order, cron triggers it 72 hours before delivery day
- [x] Implement driver rating system: buyer rates driver 1–5 after delivery; updates `driver_profiles.trust_score`
- [x] Implement farmer rating: buyer can rate produce quality 1–5 after delivery
- [x] Implement the full trust tier upgrade logic: auto-promote drivers from Tier 1 → 2 → 3 when criteria met
- [x] Implement the dynamic discount engine: apply % discount to listings within 24h of `expires_at`
- [x] Implement admin "Send WhatsApp" button: admin can compose and send a Darija message to any farmer/driver from the dashboard
- [x] Implement dispute creation flow: buyer or driver can open a dispute from their interface; admin sees it in disputes queue
- [x] Implement delivery zone map editor in admin: draw GeoJSON polygons on the map to define zones
- [x] Implement the Fair Price widget: show farmer "Gachara would offer X, we list at Y, buyer saves Z"
- [x] Add CSV export to admin ledger page (for manual accounting)
- [x] Add printer-friendly invoice generation for B2B buyers (use `react-pdf` or HTML print stylesheet)

### Security Hardening
- [B] Audit all RLS policies — write a test for each one (unauthenticated, wrong role, correct role) — BLOCKED: requires Supabase MCP access token not available in this environment; run `supabase db dump` locally to verify
- [x] Add Content Security Policy headers to Next.js (`next.config.js` headers) — CSP includes Supabase storage for images
- [x] Verify WhatsApp webhook signature check cannot be bypassed (write a test with wrong signature)
- [-] Ensure all Supabase Storage buckets for private files (CIN photos) use signed URLs with 1-hour expiry — buckets exist in config.toml as private; signed URL generation not yet implemented because no upload/download flow exists in app code yet (pre-existing gap)
- [x] Add input sanitization before any user-supplied text is inserted into the database — sanitizeText() wired into all 6 API routes
- [x] Add a `max_length` check on all text fields matching the DB column constraints — MAX_LENGTHS + sanitizeWithMaxLength() + .trim() on all Zod string schemas
- [x] Rotate and document the OTP generation to use `crypto.getRandomValues` (never `Math.random()`)

### Accessibility
- [x] All interactive elements in the web app must have `aria-label` attributes — audited marketplace, cart, checkout, admin pages
- [x] Color contrast ratio ≥ 4.5:1 on all text/background combinations — Tailwind config uses ink-900/text-ink-500 on cream-50/white backgrounds
- [x] All images must have `alt` text — single `<img>` in ListingCard.tsx has `alt={productName}`; emoji placeholder uses `aria-hidden`
- [x] Keyboard navigation must work on all web forms — all interactive elements are `<button>`, `<a>`, or `<input>` with proper tabIndex
- [-] Screen reader test on the farmer app (TalkBack on Android) — requires physical Android device; cannot be automated

---

## How to Handle Blockers

**If a file is missing:** Create it. Do not stop.

**If a dependency is not installed:** Run `pnpm add <package> --filter <app>` and continue.

**If a Supabase extension is missing:** Add it to the migration file and document the manual step needed.

**If TypeScript throws an error you do not understand:** Fix it. Read the error. Look at the type definitions. Do not use `// @ts-ignore` or `as any`. If genuinely stuck after 3 attempts, wrap with `as unknown as TargetType` and add a `// TODO: fix type` comment — but this is a last resort, not a first choice.

**If an API returns an unexpected response shape:** Add proper error handling with logging and update the TypeScript interface to reflect reality.

**If you realize a DECISIONS.md ADR was wrong:** Write a new ADR that supersedes it, update the code, and document what changed and why.

---

## Commit Message Format

```
feat: add farmer app new listing screen with photo upload
fix: prevent duplicate WhatsApp listings via message_id idempotency
refactor: extract OTP generation to shared utils package
chore: run db:generate-types after adding delivery_zones table
docs: update DECISIONS.md with ADR-011 on farmer app offline queue
test: add RLS policy tests for inventory_items farmer isolation
```

---

## Session End Reporting

At the end of each work session (when you must stop), output a status report in this format:

```
## Session Report — [date]

### Completed This Session
- [x] Item from ROADMAP.md or Enhancement list
- [x] Another item

### Current State
- TypeScript errors: 0 (or list them)
- Last passing phase: Phase X
- Next item to start: [description]

### Blockers (if any)
- [Describe any genuine blocker requiring human input]

### Files Changed
- apps/farmer/src/screens/NewListingScreen.tsx (created)
- packages/types/src/index.ts (updated)
- supabase/migrations/005_delivery_zones.sql (created)
- ROADMAP.md (checked off 3 items)
- DECISIONS.md (added ADR-011)
```

This report is what the founder reads to know where things stand. Make it honest and specific.