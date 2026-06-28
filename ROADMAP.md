# ROADMAP.md — Execution Plan
## Filahi — Solo Founder Timeline

> This is the build sequence. Each phase must be completed and validated before the next starts.
> A "validated" phase means real users have successfully used the feature, not just that it compiles.

---

## Phase 0 — Foundation (Week 1–2)

**Goal:** Zero to working dev environment, no UI yet.

- [x] Monorepo initialized (pnpm workspaces + Turborepo)
- [ ] Supabase project created, PostGIS enabled
- [ ] All tables from DATA_MODELS.md migrated and verified
- [ ] TypeScript types auto-generated
- [ ] RLS tested: anonymous request returns 0 rows on every table
- [ ] Supabase Auth configured (phone OTP for buyers/drivers)
- [ ] Meta WhatsApp Cloud API account setup
- [x] Webhook verification working (GET handler)
- [ ] `.env.local` configured (no secrets committed to git)
- [x] `pnpm typecheck` passes with 0 errors

**Definition of Done:** A Postman request to `/api/webhooks/whatsapp` returns 200.

---

## Phase 1 — WhatsApp Bot MVP (Week 3–5)

**Goal:** A farmer in Béja can list produce by sending a voice note. You verify it works by doing it yourself.

- [x] Webhook POST handler with signature verification
- [x] Meta media download (audio file from message)
- [x] Groq Whisper integration (Darija transcription)
- [x] LLM extraction prompt (Claude/GPT-4o-mini → JSON)
- [x] Confidence threshold check (< 0.75 → human review)
- [x] Idempotency check (wa_message_id dedup)
- [x] Auto-farmer profile creation (first message)
- [x] WhatsApp confirmation button sent to farmer
- [x] Farmer button press → listing goes live
- [x] Farmer payment query ("flousi") → bot replies with status
- [x] Admin flagging for low-confidence transcriptions

**Manual test:** Record a voice note in Darija, send to your bot WhatsApp number, confirm the listing appears in your Supabase table with correct data.

**Definition of Done:** 5 test listings created via WhatsApp voice notes.

---

## Phase 2 — Buyer Marketplace (Week 6–8)

**Goal:** A restaurant owner in La Marsa can browse listings and place an order.

- [ ] `/marketplace` page with listing grid
- [ ] Filter by region, category, price
- [ ] Listing card: product, qty, price, region, freshness
- [ ] Commission calculation visible in price (not broken out)
- [ ] Buyer auth (Supabase email/phone login)
- [ ] Order creation (inventory reserved on order)
- [ ] Order confirmation page
- [ ] Recurring order setup (weekly subscription)
- [ ] French + Arabic language toggle
- [ ] Mobile responsive (PWA installable)

**Definition of Done:** Place a real order on the marketplace with a real product from Phase 1 bot test.

---

## Phase 3 — Driver App (Week 9–12)

**Goal:** A driver can accept a trip, drive, and complete delivery with GPS tracked the whole time.

- [ ] Driver registration (CIN upload, plate, vehicle type)
- [ ] Driver tier system (Tier 1 by default)
- [ ] Trip offer list (nearby offers via PostGIS)
- [ ] Trip acceptance
- [ ] Background GPS (Foreground Service, screen locked)
- [ ] Offline location caching (SecureStore queue)
- [ ] OTP entry at pickup (validates via Supabase RPC)
- [ ] OTP entry at delivery
- [ ] Trip history screen
- [ ] Foreground notification shown during active trip
- [ ] Android APK buildable via EAS

**Critical test:** Lock your Android phone, put it in your pocket, drive for 30 minutes. Verify continuous coordinate pings received in admin panel.

**Definition of Done:** End-to-end trip completed with GPS trace visible on admin map.

---

## Phase 4 — Admin Dashboard (Week 13–15)

**Goal:** You can monitor the whole system from one screen.

- [ ] Admin login (role-protected middleware)
- [ ] KPI overview: daily orders, active trips, revenue, open disputes
- [ ] Live trip map (all active drivers, Maplibre GL)
- [ ] Farmer management (profiles, listings, WA message log)
- [ ] Driver management (profiles, trust tier, document verification)
- [ ] Inventory management (approve, expire, edit)
- [ ] Disputes queue (GPS loss alerts, OTP failures)
- [ ] Ledger view (who is owed what, manual disbursement log)
- [ ] Manual WhatsApp send to any farmer/driver

**Definition of Done:** You can fully operate the business from the admin panel alone.

---

## Phase 5 — Micro-Hub Engine (Week 16–18)

**Goal:** Long-haul trucks deliver to hub; last-mile couriers handle city delivery.

- [ ] Hub registered in DB (Bir El Kassaa)
- [ ] Routing validation: reject direct-to-buyer long-haul trips
- [ ] Hub arrival geo-fence (500m radius check)
- [ ] Order grouping by delivery zone (PostGIS)
- [ ] Last-mile sub-trip creation
- [ ] Courier app/interface (can be same driver app with `role = courier`)
- [ ] Delivery zone boundaries drawn and stored as GeoJSON

**Definition of Done:** A batch of orders from multiple buyers in La Marsa is grouped into one last-mile courier run.

---

## Phase 6 — Pilot Launch (Week 19–20)

**Goal:** Real money flowing. 5 farmers, 3 buyers, 2 drivers.

**Pre-launch checklist:**
- [ ] Privacy policy published (INDP compliance)
- [ ] Terms of service published
- [ ] WA message templates approved by Meta
- [ ] Admin can process manual D17 payouts
- [ ] Error monitoring configured (Sentry free tier)
- [ ] Weekly automated DB backup confirmed
- [ ] Dispute resolution process documented

**Target metrics:**
- 5+ farmers with at least 1 listing each
- 3+ buyers with at least 1 completed order
- 2+ drivers with verified profiles
- 1+ complete end-to-end transaction (farm → hub → buyer)
- 0 cargo theft incidents
- Admin able to operate solo

---

## Phase 7 — Phase 2 Features (Post-Revenue)

Only start these after Phase 6 is generating consistent weekly revenue:

- Flouci / Walletii API integration (automated farmer payouts)
- iOS driver app
- B2B subscription billing (Stripe or local gateway)
- Consumer mobile app (React Native for buyers)
- Crop disease detection (image upload → AI diagnosis)
- Weather alerts for farmers
- Multi-hub support
- Driver earnings wallet + withdrawal flow
- Startup Act label application (for tax exemption)
