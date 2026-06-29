# Session Log

## 2026-06-29 — Enhancement Mode Sprint 2

### Enhancement Items Implemented
- **Health check endpoint** (`/api/health`): verifies Supabase connectivity, returns latency
- **DB indexes** (migration 010): 14 missing indexes for orders, disputes, ledger, profiles, etc.
- **Skeleton loading cards** (marketplace): `SkeletonCard` matching `ListingCard` layout; 4 cards shown during LoadMore fetch
- **Discount engine integration**: `calculateDiscount()` applied in marketplace listings; shows discount badge (e.g. "-20%") + strikethrough original price
- **Cron scheduler**: `vercel.json` with 3 schedules (recurring orders twice weekly, expire listings every 4h, stale trips every 15min); new `/api/cron/expire-listings` and `/api/cron/stale-trips` endpoints
- **Rate limiter**: per-sender rate limiting for WhatsApp webhook (30 msgs/min) via in-memory `checkRateLimit()`
- **How it Works** page at `/how-it-works`: 4-step illustrated flow
- **max_length helper**: reusable `zodMaxLength()` validator in `validation.ts`
- **Cache headers**: `Cache-Control: public, s-maxage=10, stale-while-revalidate=59` on marketplace API
- **Parallelised SSR**: `Promise.all` for regions + listings queries on marketplace page
- **SWR cache utility** (`lib/swr-cache.ts`): client-side fetch cache with stale/expiry windows
- **ARIA labels**: cart link, zone name input, review textarea
- **Color contrast**: gold-500 darkened from `#d4a017` to `#8B6914` (2.38→5.09, WCAG AA); all text/background combos verified ≥4.5:1
- **Keyboard navigation verifiied**: all interactive elements use semantic HTML, focus rings present, no `<div onClick>` anti-patterns
- **Meta WhatsApp templates**: `docs/meta-whatsapp/templates.json` (7 templates in Arabic) + `docs/meta-whatsapp/SUBMISSION_GUIDE.md`
- **DB backup script**: `scripts/backup-db.ps1` (local Docker) + `.github/workflows/db-backup.yml` (GitHub Action)
- **Seed data** (`scripts/seed-data.mjs`): creates 11 users + 10 inventory items + 1 hub + 3 zones + 2 drivers
- **BLOCKERS.md** + ROADMAP updates + ADR-013/014/015 (cursor pagination, rate limiting, Vercel cron)
- **ENVIRONMENT.md**: `CRON_SECRET` documented
- **Vitest setup** in `packages/utils`: 12 tests covering discount + pagination
- **3 bugs fixed by tests**: discount tier ordering, cursor ID decode, LIMIT+1 pagination pattern
- **`fetchLimit` exported** from `@filahi/utils`
- **Web production build verified** (Next.js 14.2.35, 0 errors)

### Enhancement Items Already Implemented (verified earlier)
- React.memo on heavy renders
- FreshnessBar + FairPriceWidget + ProductImage components
- Freshness bar color coding (green→yellow→red)
- Pulsing map marker when driver within 1km of hub
- Sentry monitoring (server + client + edge)
- CSV export on admin ledger
- CSP headers in next.config.js
- WhatsApp signature verification
- Admin Send WhatsApp (UI + API)
- Delivery zone map editor
- Driver / farmer / product ratings api
- Trust tier auto-upgrade trigger
- Group buy feature
- Dispute creation API + admin queue
- Recurring B2B orders (cron endpoint, CRUD API, B2B page)
- OTP generation uses `crypto.getRandomValues`
- Cursor-based pagination on marketplace

### Enhancement Items Verified as Pre-Existing (no action needed)
- **stale-while-revalidate caching**: added via `Cache-Control` header on marketplace API
- **Storage signed URLs audit**: `farmer_media` + `driver_documents` buckets exist in `config.toml` (private). No app code reads/writes them yet — pre-existing gap, will be needed when image upload UI is built
- **aria-label / alt text / keyboard nav audit**: completed — all semantic HTML, focus rings, labels present

### Blockers (need human + external infra)
- **Meta WA template approval**: access token expired 28-Jun-26 15:00 UTC. Template JSON + guide ready at `docs/meta-whatsawhatsapp/`
- **Weekly DB backup**: requires `SUPABASE_ACCESS_TOKEN` + `DB_PASSWORD` in GitHub secrets (or Docker locally)
- **Driver APK**: Expo build fails due to pnpm hoisting (`.npmrc: node-linker=hoisted` insufficient); needs `metro.config.js` with custom resolver or `@expo/metro-config` workspace support
- **Vercel env vars**: `CRON_SECRET`, `SENTRY_DSN`, `ANTHROPIC_API_KEY` need to be set in Vercel dashboard
- **`pnpm build` at root**: fails due to driver app; web build works via `pnpm build:web`
