# AGENTS.md — AI Agent Operating Manual
## Tunisian AgriTech Marketplace (Filahi Platform)

> This file is the single source of truth for any AI agent (Cursor, Copilot, Claude Code, etc.) working on this codebase.
> Read it fully before writing a single line of code. No exceptions.

---

## 1. Project Identity

**Product Name:** Filahi (فلاحي) — Arabic for "my farmer"
**Type:** Three-sided marketplace connecting Tunisian farmers → drivers → urban buyers
**Solo Founder Stack:** One developer, AI-assisted execution
**Primary Goal of Phase 1:** Ship a working MVP with zero monthly infrastructure cost, validate the farmer→buyer transaction loop, and prove location tracking works on a locked Android phone.

---

## 2. What This Product Does (Plain Language)

Traditional middlemen (called **Gachara**) buy crops from farmers at exploitative prices and resell them in Tunis at 200–300% markup. Filahi cuts them out by:

1. Letting farmers list produce via **WhatsApp voice messages** (no app download)
2. Letting urban buyers (restaurants, groceries, individuals) browse and order on a **web marketplace**
3. Routing orders through **independent Isuzu/Dmax truck drivers** with background GPS tracking
4. Using a **micro-hub cross-docking model** near Bir El Kassaa/El Mourouj to decouple long-haul from last-mile
5. Securing every transaction with a **dual-OTP escrow** tied to wallet payouts

---

## 3. Monorepo Structure

The entire project lives in one folder. Do not split into multiple repos.

```
filahi/
├── AGENTS.md                  ← You are here
├── PRD.md                     ← Full product requirements
├── ARCHITECTURE.md            ← System design & data flow
├── DATA_MODELS.md             ← Database schema (canonical source)
├── ENVIRONMENT.md             ← All env vars & free-tier limits
├── GLOSSARY.md                ← Tunisian/domain terms the AI must know
├── DECISIONS.md               ← Architecture decision records (ADRs)
│
├── apps/
│   ├── web/                   ← Next.js 14+ App Router (buyer + admin)
│   ├── driver/                ← React Native + Expo (Android-first)
│   └── bot/                   ← WhatsApp webhook handler (Next.js API route or standalone)
│
├── packages/
│   ├── supabase/              ← Supabase client, types, RLS policies, migrations
│   ├── ui/                    ← Shared components (shadcn/ui base)
│   ├── types/                 ← Shared TypeScript interfaces (canonical)
│   └── utils/                 ← Shared pure functions (OTP gen, price calc, etc.)
│
├── supabase/
│   ├── migrations/            ← All SQL migration files (never edit tables directly)
│   ├── seed.sql               ← Dev seed data
│   └── config.toml            ← Supabase local dev config
│
└── docs/
    ├── flows/                 ← ASCII/Mermaid diagrams per user journey
    └── api/                   ← Endpoint documentation
```

---

## 4. Technology Stack (Strictly Free-Tier First)

### 4.1 Non-Negotiables

| Layer | Technology | Why |
|---|---|---|
| Database | **Supabase** (PostgreSQL + PostGIS + Auth + Realtime + Storage) | Free tier: 500MB DB, 50K MAU, 200 concurrent realtime connections |
| Web Framework | **Next.js 14+ App Router** | API routes replace a separate backend; hosted free on Vercel |
| Mobile | **React Native + Expo** (SDK 51+) | Free cloud builds via EAS; Expo Go for dev |
| Hosting (Web) | **Vercel** free tier | Zero config, edge functions, automatic HTTPS |
| Hosting (Bot) | **Vercel** serverless function OR same Next.js monorepo | Keep it simple |
| Maps | **react-map-gl + OpenStreetMap (Maplibre)** | $0 forever vs Google Maps billing |
| Geospatial | **PostGIS** (Supabase extension, one-click enable) | GEOADD, distance queries inside Postgres |
| Realtime tracking | **Supabase Realtime Broadcast** | WebSocket built-in, no Redis needed at this stage |
| WhatsApp | **Meta WhatsApp Cloud API** (free tier: 1000 business-initiated msgs/month) | Official, no third-party cost |
| AI / STT | **Whisper API (OpenAI)** OR **Groq Whisper** (free tier) | Tunisian Darija transcription |
| LLM Parsing | **Claude claude-sonnet-4-6 via API** OR **GPT-4o-mini** | Extract structured JSON from transcribed text |
| Auth | **Supabase Auth** (GoTrue) | Built-in, phone OTP supported |
| Storage | **Supabase Storage** | Product images, voice notes (50MB free) |
| Package manager | **pnpm** with workspaces | Fastest, monorepo-native |
| Language | **TypeScript** everywhere, strict mode | No `any`, no exceptions |

### 4.2 Upgrade Path (When Revenue Exists)

- Supabase Pro ($25/mo) when hitting 500MB DB
- Replace Groq Whisper with a fine-tuned Darija model when accuracy becomes critical
- Add Redis (Upstash free tier first) for caching if Realtime hits 200-connection limit
- Vercel Pro only if serverless function duration limits are hit

### 4.3 Explicitly Forbidden (in Phase 1)

- ❌ Google Maps API (costs money at scale)
- ❌ Twilio SMS/WhatsApp (costs money; use Meta Cloud API directly)
- ❌ AWS / GCP / Azure (unnecessary complexity for MVP)
- ❌ Separate Express.js or NestJS server (Next.js API routes are sufficient)
- ❌ Docker in production (Vercel handles this)
- ❌ `any` type in TypeScript
- ❌ Direct database writes without going through Supabase RLS policies

---

## 5. User Roles & Their Interfaces

### 5.1 Farmer
- **Primary interface:** WhatsApp bot (no app download ever)
- **Optional interface:** Simple web page for profile/history (mobile browser, Arabic RTL)
- **Language:** Tunisian Darija (Arabic dialect) — ALL bot messages must be in Darija
- **Device assumption:** Low-end Android, WhatsApp installed, possibly slow 3G
- **Key actions:** List produce, confirm pickup OTP, check payment status

### 5.2 Driver
- **Primary interface:** React Native app (Android-first, iOS later)
- **Language:** Darija + French (mixed, as typical for Tunisian drivers)
- **Device assumption:** Mid-to-low Android (Xiaomi, Samsung A-series), 2–4GB RAM
- **Key actions:** Accept trip, input OTP at pickup, navigate to hub, input OTP at delivery, receive payout confirmation
- **Critical requirement:** Background GPS must work with phone screen locked

### 5.3 Buyer (B2B + B2C)
- **Primary interface:** Next.js web app (PWA-installable), React Native companion app later
- **Language:** French + Arabic (toggle)
- **Device assumption:** Modern smartphone or desktop
- **Key actions:** Browse catalog, place order, track delivery live, manage recurring subscriptions, download invoices

### 5.4 Admin (Platform Operator)
- **Primary interface:** `/admin` route inside the Next.js web app (protected)
- **Key actions:** Monitor all active trips on live map, review flagged drivers, manually resolve OTP disputes, manage hub operations, view financial ledger

---

## 6. Critical Domain Rules (Agent Must Never Violate)

1. **Cash is king.** Farmers receive payment via D17 postal transfer or Flouci wallet — never expect them to have a bank account. The platform holds digital payment from buyers and pays farmers separately.

2. **Never route long-haul trucks directly to restaurants.** All bulk trucks → micro-hub → last-mile courier. No exceptions. The routing engine must enforce this at the code level.

3. **Never start cold chain products in Phase 1.** No milk, fresh meat, or yogurt. Approved Phase 1 inventory: eggs (djej arbi), honey, olive oil, seasonal vegetables (potatoes, citrus, tomatoes), legumes.

4. **Whisper transcription confidence < 75% = human fallback.** Never auto-publish a listing from a low-confidence transcription. Route it to admin review and send the farmer a WhatsApp clarification request.

5. **Every financial state transition must be atomic.** Use Supabase database functions (RPC) for OTP validation + status update in a single transaction. Never do this in two separate API calls.

6. **RLS must be on every table.** No table may exist in Supabase without a Row Level Security policy. Verify with `SELECT * FROM pg_tables` + `rowsecurity` column check.

7. **The Driver app APK must stay under 15MB.** Check bundle size before every major dependency addition.

8. **All prices stored in millimes (integer).** Never store TND as a float. `1 TND = 1000 millimes`. Display layer handles formatting.

---

## 7. Agent Task Workflow

When implementing any feature, follow this exact sequence:

```
1. READ relevant section of PRD.md and DATA_MODELS.md first
2. CHECK DECISIONS.md for any prior ADR on this topic
3. WRITE the Supabase migration SQL first (if DB changes needed)
4. WRITE shared TypeScript types in packages/types/
5. WRITE the API route / server action
6. WRITE the UI component
7. WRITE the RLS policy if a new table was created
8. UPDATE DECISIONS.md if you made a non-obvious architectural choice
```

Never skip step 1–2. Agents that jump straight to UI code create inconsistencies.

---

## 8. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Database tables | `snake_case` plural | `inventory_items`, `trip_logs` |
| TypeScript types | `PascalCase` | `InventoryItem`, `TripStatus` |
| API routes (Next.js) | `kebab-case` | `/api/webhooks/whatsapp`, `/api/trips/validate-otp` |
| React components | `PascalCase` | `LiveDriverMap`, `OTPGate` |
| Supabase RPC functions | `snake_case` verb-first | `validate_pickup_otp`, `settle_trip_payout` |
| Env variables | `SCREAMING_SNAKE_CASE` | `NEXT_PUBLIC_SUPABASE_URL` |
| Feature branches | `feat/short-description` | `feat/whatsapp-voice-intake` |

---

## 9. Environment Variables Reference

See `ENVIRONMENT.md` for the full list. Never hardcode secrets. Never commit `.env.local`. The agent must check `ENVIRONMENT.md` before using any third-party service to know what key names to reference.

---

## 10. Testing Checklist (Before Marking Any Feature Done)

- [ ] TypeScript compiles with zero errors (`pnpm typecheck`)
- [ ] RLS policy tested: unauthenticated request returns 0 rows
- [ ] OTP state machine: cannot skip states (PENDING → DELIVERED without IN_TRANSIT)
- [ ] Background GPS: coordinate pings continue after phone screen locks (manual test on device)
- [ ] WhatsApp webhook: handles missing audio payload gracefully (returns 200, logs error)
- [ ] Price: stored as integer millimes, displayed as formatted TND string
- [ ] All user-facing strings exist in both French and Arabic (i18n keys, not hardcoded text)

---

## 11. Known Risks the Agent Must Code Defensively Against

| Risk | Mitigation in Code |
|---|---|
| Driver kills app mid-transit | Trip remains IN_TRANSIT; admin alerted if no ping for >10 min |
| Supabase Realtime 200-connection limit | Use broadcast channels (not DB listeners) for tracking; one channel per active trip |
| WhatsApp 24hr messaging window expires | System-initiated messages use approved template messages only |
| Vercel function timeout (10s free tier) | Whisper transcription must be async; webhook returns 200 immediately, processes in background |
| Network loss on Sidi Bouzid highway | Driver app caches coords in AsyncStorage; flushes on reconnect |
| PostGIS query timeout | All geo queries use spatial indexes; GIST index on `coordinates` column mandatory |

---

## 12. Glossary Reference

See `GLOSSARY.md` for all Tunisian/domain-specific terms. The agent must use correct terminology in code comments, variable names, and user-facing copy.

---

## 13. Out of Scope for Phase 1 (Do Not Build)

- iOS background tracking (Android only for now)
- Payment gateway integration (COD only in Phase 1; Flouci integration is Phase 2)
- Crop disease detection AI
- Weather alert system
- Cold chain / refrigeration tracking
- Multi-language admin panel (French only for admin)
- Public API for third-party integrations
- Farmer credit scoring
