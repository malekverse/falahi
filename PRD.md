# PRD.md — Product Requirements Document
## Filahi — Tunisian AgriTech Marketplace

**Version:** 1.0 (Phase 1 MVP)
**Author:** Solo Founder
**Stack:** Next.js 14 + Supabase + React Native (Expo) + Meta WhatsApp Cloud API

---

## 1. Executive Summary

Filahi is a three-sided marketplace that eliminates predatory agricultural middlemen (Gachara) in Tunisia by connecting rural farmers directly with urban buyers through a technology-optimized logistics layer. The platform is designed around the real constraints of the Tunisian market: low-tech farmers, Android-only budget driver devices, unreliable rural internet, and a cash-dominant economy.

**Phase 1 Success Criteria:**
- At least 5 farmers actively listing produce via WhatsApp
- At least 3 successful end-to-end transactions (farm → hub → buyer)
- Unbroken GPS tracking over a 2-hour simulated highway run with screen locked
- Total infrastructure cost: 0 TND/month

---

## 2. Problem Statement

| Actor | Pain Today |
|---|---|
| Farmer | Gachara offers 1.2 TND/kg for tomatoes worth 3.5 TND in Tunis; farmer has no visibility into city prices and no transport options |
| Driver | Drives back from Tunis to Gafsa empty (kias fadha); zero coordination, zero extra income |
| Urban Buyer (Restaurant) | Prices volatile, supply unreliable, no traceability, forced to buy from wholesale market at inflated prices |
| Urban Consumer | Can't access genuine djej arbi, natural honey, or countryside eggs without knowing a farmer personally |

---

## 3. User Personas

### Persona 1: Farhat — The Farmer
- Location: Sidi Bouzid or Béja
- Age: 45–65
- Device: Basic Android smartphone, WhatsApp
- Connectivity: 2G/3G intermittent
- Languages: Tunisian Darija only
- Tech literacy: Low. Uses WhatsApp daily. Cannot navigate app stores.
- Key need: Get a fair price for his harvest before it rots

### Persona 2: Moncef — The Driver
- Location: Routes between interior Tunisia and Tunis
- Age: 30–50
- Vehicle: Isuzu D-Max or similar pickup
- Device: Mid-range Android (Xiaomi, Samsung A-series)
- Connectivity: 4G on highway, dead zones in valleys
- Languages: Darija + basic French
- Key need: Fill his empty return trips with paying cargo

### Persona 3: Karim — The Restaurant Buyer
- Location: La Marsa, Ennasr, or Sidi Bou Said (Tunis)
- Age: 28–45
- Device: iPhone or modern Android, desktop
- Languages: French primary, Arabic secondary
- Key need: Reliable weekly supply of traceable, high-quality produce at predictable prices

### Persona 4: Ameni — The Platform Admin
- Location: Tunis (remote)
- Device: Desktop / laptop
- Role: Monitors active trips, resolves disputes, manages hub operations
- Languages: French primary

---

## 4. Phase 1 — Core Features (Must-Have)

### Epic 1: Farmer WhatsApp Bot (Supply Intake)

**FR-1.1** The system exposes a POST webhook at `/api/webhooks/whatsapp` that accepts payloads from Meta WhatsApp Cloud API.

**FR-1.2** When a farmer sends a voice note (`.ogg` format from WhatsApp), the webhook:
1. Immediately returns HTTP 200 to Meta (avoid timeout)
2. Queues async processing
3. Downloads the audio file from Meta's CDN using the media ID
4. Sends audio to Whisper API (or Groq Whisper free tier) for Darija transcription
5. Passes transcribed text + system prompt to LLM (Claude or GPT-4o-mini) for structured JSON extraction
6. If confidence ≥ 75%: inserts into `inventory_items` table with status `pending_confirmation`
7. Sends farmer a WhatsApp confirmation message in Darija with a button to confirm listing
8. If confidence < 75%: sends farmer a clarification WhatsApp message; flags in admin dashboard

**FR-1.3** LLM extraction must output this JSON schema:
```json
{
  "product_name": "string",
  "quantity": "number",
  "unit": "string (kg|hara|litra|crate|piece)",
  "location_name": "string",
  "asking_price_tnd": "number | null",
  "harvest_date": "ISO date string | null",
  "notes": "string | null",
  "confidence_score": "number (0–1)"
}
```

**FR-1.4** The system prompt for LLM parsing must include a Tunisian Darija vocabulary reference (see `GLOSSARY.md` units section) and handle regional accent variations.

**FR-1.5** Farmer confirmation via WhatsApp button press transitions listing from `pending_confirmation` to `available`.

**FR-1.6** Farmer can check payment status by sending any message containing "flousi" or "wesh jani" to the bot. Bot replies with last 3 transactions.

---

### Epic 2: Buyer Marketplace (Web PWA)

**FR-2.1** Route `/marketplace` displays all listings with status `available`, sorted by distance from buyer's selected city.

**FR-2.2** Each listing card shows: product name, quantity, price/unit, farm region, harvest date, freshness indicator (days since harvest), and a "Group Buy" toggle.

**FR-2.3** Buyers can filter by: region of origin, product category, price range, harvest recency.

**FR-2.4** The commission algorithm adds 12% to the farmer's asking price by default (configurable per admin). This is the platform's take. Displayed to buyer as final price — buyer never sees the farm price split.

**FR-2.5** Group Buy: if a listing has the group buy flag enabled, individual buyers can join an order until minimum quantity is reached. System auto-triggers when threshold met.

**FR-2.6** B2B Subscription: Restaurant buyers can configure a recurring weekly order (product, quantity, delivery day). System auto-creates a new order 72 hours before the scheduled delivery day.

**FR-2.7** Order placement emits a Supabase Realtime event that triggers trip creation workflow.

---

### Epic 3: Driver App (React Native + Expo)

**FR-3.1** Driver registration requires: full name, phone, CIN photo upload (Supabase Storage), vehicle plate, Carte Grise photo, and self-assigned vehicle type.

**FR-3.2** New drivers are assigned Tier 1 (low-value cargo only) until 5 successful trips with rating ≥ 4.0.

**FR-3.3** Home screen shows list of available trip offers near driver's current location (PostGIS radius query).

**FR-3.4** Trip acceptance locks the trip to that driver and transitions status to `accepted`.

**FR-3.5** Upon arriving at farm, driver presses "I have arrived". System sends OTP_PICKUP to farmer's WhatsApp. Driver enters 4-digit code. If correct → trip transitions to `in_transit`. This must be a single atomic Supabase RPC call.

**FR-3.6** Upon arriving at micro-hub, hub manager enters OTP_DELIVERY on admin panel or via WhatsApp. This transitions trip to `delivered`. Payout is calculated and logged (actual disbursement is manual/Flouci in Phase 2 — Phase 1 logs the amount only).

**FR-3.7** Background GPS (critical):
- Uses `expo-location` with `LocationAccuracy.Balanced`
- Registers a `TaskManager` background task named `DRIVER_LOCATION_TASK`
- Pings every 45 seconds when trip is `in_transit`
- Broadcasts to Supabase Realtime channel `trip:{trip_id}` with `{lat, lng, timestamp}`
- If network unavailable: stores coordinates in Expo SecureStore queue; flushes when connection restored
- Shows persistent foreground notification: "Filahi — suivi de livraison actif"

**FR-3.8** Driver app UI has exactly 4 screens: Home (trip list), Trip Detail (OTP + map link), History, Profile.

**FR-3.9** Map navigation uses native deep link to Google Maps or Waze (user's installed app), pre-filled with hub coordinates.

---

### Epic 4: Live Tracking (Admin + Buyer)

**FR-4.1** Admin dashboard `/admin/trips` shows all active trips as moving markers on a Maplibre/OpenStreetMap map.

**FR-4.2** Buyer order detail page shows their specific driver's location in real-time once trip is `in_transit`.

**FR-4.3** Both admin and buyer maps subscribe to Supabase Realtime Broadcast channel `trip:{trip_id}`.

**FR-4.4** If no ping received for a trip in `in_transit` status for more than 10 minutes, the admin dashboard shows a "⚠ Signal Lost" badge on that trip marker.

**FR-4.5** Estimated arrival shown to buyer based on driver's last known coordinates vs. hub coordinates (straight-line Haversine distance / assumed 60 km/h average).

---

### Epic 5: Micro-Hub Cross-Docking Engine

**FR-5.1** The routing algorithm must never assign a single buyer as the final destination for a long-haul truck. All long-haul trips terminate at the registered micro-hub(s).

**FR-5.2** When a long-haul trip is delivered to the hub, the system automatically creates last-mile sub-trips grouped by delivery zone (e.g., "Zone La Marsa", "Zone Ennasr").

**FR-5.3** Last-mile trip offers are broadcast to local couriers (scooter/van drivers registered with role `courier`).

**FR-5.4** Admin can manually define zone boundaries as GeoJSON polygons stored in a `delivery_zones` table.

---

### Epic 6: Admin Dashboard

**FR-6.1** Protected behind Supabase Auth + admin role check middleware.

**FR-6.2** Key admin pages:
- `/admin` — KPI overview (daily orders, active trips, revenue, disputes)
- `/admin/trips` — Live map + trip list with status filters
- `/admin/farmers` — Farmer profiles + listing history + WhatsApp message log
- `/admin/drivers` — Driver profiles + trust score + document verification queue
- `/admin/inventory` — All listings management (approve, expire, edit price)
- `/admin/disputes` — Flagged trips (stolen cargo alerts, OTP failures, low-confidence transcriptions)
- `/admin/ledger` — Transaction log with payout amounts (manual disbursement Phase 1)

**FR-6.3** Admin can manually send a WhatsApp message to any farmer or driver from the dashboard.

---

## 5. Phase 1 — Out of Scope

The following are explicitly deferred to Phase 2+:

- Automated wallet disbursement (Flouci/Walletii API integration)
- iOS driver app
- Cold chain products (milk, fresh meat)
- Weather alert system
- Crop disease AI detection
- Consumer mobile app (buyer app is web-only in Phase 1)
- Driver earnings wallet / withdrawal flow
- Multi-hub support (Phase 1: one hub only)
- Third-party API for external integrations

---

## 6. Non-Functional Requirements

### Performance
- All API routes must respond in < 3 seconds under normal load
- WhatsApp webhook must return 200 in < 1 second (processing is async)
- Supabase Realtime broadcast lag < 2 seconds for live tracking
- Driver app bundle size < 15MB (Expo managed workflow)

### Security
- All tables have RLS enabled and tested
- OTP tokens are cryptographically random (not sequential integers)
- CIN / Carte Grise photos stored in private Supabase Storage bucket (signed URLs only)
- Webhook signature verification on all Meta WhatsApp payloads
- Admin routes protected by middleware role check (not just client-side)

### Reliability
- Driver GPS cache survives app force-close (use Expo SecureStore, not in-memory)
- WhatsApp webhook idempotency: same message_id must not create duplicate listings
- Trip OTP transitions are atomic database transactions

### Accessibility & Localization
- All user-facing text supports Arabic (RTL) and French (LTR) toggle
- Admin panel: French only (Phase 1)
- Farmer bot: Darija only
- Driver app: Darija + French (mixed UI)
- Buyer web app: French primary, Arabic secondary
- All dates displayed in Tunisian locale (dd/mm/yyyy, GMT+1)
- Prices displayed as "X,XXX TND" (Tunisian formatting)

---

## 7. Monetization Model

| Stream | Mechanic | Rate | Phase |
|---|---|---|---|
| Marketplace Commission | 12% added to farmer's asking price, collected from buyer | Default 12%, admin-configurable | Phase 1 |
| Logistics Matching Fee | Flat fee added per trip offer shown to driver | 5–10 TND per accepted trip | Phase 1 |
| B2B Subscription | Monthly SaaS fee for restaurants with recurring orders | 99–299 TND/month | Phase 2 |
| Featured Listing | Farmer pays to boost listing visibility | TBD | Phase 2 |

---

## 8. Regulatory & Compliance Notes

- Store personal data (CIN, phone, address) in compliance with Tunisia's **INDP** (Instance Nationale de Protection des Données Personnelles)
- Do not store WhatsApp message content longer than 90 days
- CIN photos must not be used for any purpose beyond driver verification; add explicit data retention policy in ToS
- All financial transaction logs must be retained for 5 years (Tunisian commercial law)
- VAT registration required once revenue exceeds threshold — track from day 1
