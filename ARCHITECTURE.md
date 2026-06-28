# ARCHITECTURE.md — System Design & Data Flows
## Filahi — AgriTech Marketplace

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE (BaaS)                                │
│   PostgreSQL + PostGIS │ Auth │ Realtime │ Storage │ Edge Functions     │
└────────────────┬────────────────────────────────┬───────────────────────┘
                 │                                │
       ┌─────────▼──────────┐           ┌─────────▼──────────┐
       │    apps/web        │           │    apps/driver     │
       │  Next.js 14+       │           │  React Native      │
       │  App Router        │           │  Expo SDK 51+      │
       │                    │           │  Android-first     │
       │  Routes:           │           │                    │
       │  /marketplace      │           │  Background GPS    │
       │  /admin            │           │  OTP screens       │
       │  /api/webhooks/    │           │  Trip management   │
       │    whatsapp        │           │                    │
       │  /api/trips/       │           └────────────────────┘
       │    validate-otp    │
       │                    │           ┌────────────────────┐
       └────────────────────┘           │   Meta WhatsApp    │
                                        │   Cloud API        │
                                        │                    │
                                        │   Farmer sends     │
                                        │   voice note →     │
                                        │   webhook fires    │
                                        └────────────────────┘
```

---

## 2. Complete User Journey Flows

### Flow A: Farmer Lists Produce (WhatsApp → Marketplace)

```
Farmer (WhatsApp)
    │
    │  🎙 Voice note: "3andi 200 hara djej arbi fi Mateur, wejdin l'ejmaah"
    ▼
[Meta WhatsApp Cloud API]
    │  POST to webhook
    ▼
[Next.js /api/webhooks/whatsapp]
    │  1. Verify Meta signature (X-Hub-Signature-256)
    │  2. Return HTTP 200 immediately
    │  3. Check idempotency: wa_message_id in whatsapp_messages?
    │  4. Queue async job
    ▼
[Async Processing Worker]
    │  1. Download audio (ogg) from Meta CDN using media_id
    │  2. Send to Groq/OpenAI Whisper → Darija transcription
    │  3. Check confidence score
    │
    ├── confidence ≥ 0.75 ──────────────────────────────────►
    │                                                         │
    │                                              [LLM Claude/GPT-4o-mini]
    │                                                         │
    │                                              Extract JSON:
    │                                              { product, quantity, unit,
    │                                                location, price... }
    │                                                         │
    │                                              INSERT inventory_items
    │                                              status = 'pending_confirmation'
    │                                                         │
    │                                              Send WhatsApp reply to farmer:
    │                                              "تأكدت يا عمي! حطيت 200 حارة
    │                                               بيض بلدي بالمطر. تأكيد؟ [✅]"
    │
    └── confidence < 0.75 ──────────────────────────────────►
                                                             │
                                              Log to admin /disputes
                                              Send WA to farmer: "مش فهمتك مليح،
                                              عاود أرسل أو كتب لي"
                                                             │

[Farmer taps ✅ Confirm button on WhatsApp]
    │
    ▼
[Webhook receives button reply]
    │  UPDATE inventory_items SET status = 'available'
    ▼
[Listing appears on /marketplace]
```

---

### Flow B: Buyer Places Order

```
Buyer (Web PWA /marketplace)
    │
    │  Browses catalog, selects produce, sets quantity
    ▼
[Next.js Server Action: createOrder()]
    │  1. Validate buyer auth (Supabase session)
    │  2. Check inventory_items.status = 'available'
    │  3. Check sufficient quantity
    │  4. Calculate total (platform_price * qty)
    │  5. BEGIN TRANSACTION:
    │     - INSERT orders (status = 'confirmed')
    │     - INSERT order_items
    │     - UPDATE inventory_items SET status = 'reserved'
    │  6. COMMIT
    │  7. INSERT ledger_entries (entry_type = 'buyer_payment', phase 1: logged only)
    ▼
[Trip creation trigger fires]
    │  (Supabase Edge Function or Next.js background task)
    │
    │  1. Find all confirmed orders targeting same hub within batch window
    │  2. Group by origin region
    │  3. Generate OTP_PICKUP = crypto 4-digit
    │  4. Generate OTP_DELIVERY = crypto 4-digit
    │  5. INSERT trips (status = 'pending')
    │  6. Broadcast trip offer to eligible drivers via Realtime
    ▼
[Driver receives notification in React Native app]
```

---

### Flow C: Driver Executes Trip (GPS Tracking)

```
[Driver App — Trip Accepted]
    │
    │  status: pending → accepted
    ▼
[Driver navigates to farm via Google Maps deeplink]
    │
    │  Background task DRIVER_LOCATION_TASK starts
    │  Foreground notification shown: "Filahi — suivi actif"
    │
    │  Every 45 seconds:
    │    GPS ping → Check network
    │      ├── Online:  Broadcast via Supabase Realtime
    │      │             channel: trip:{trip_id}
    │      │             payload: {lat, lng, timestamp}
    │      └── Offline: Store in SecureStore queue
    │                    └── Flush on reconnect
    ▼
[Admin Map /admin/trips subscribes to all trip:{id} channels]
[Buyer Order page subscribes to trip:{their_trip_id} channel]
    │
    │  Both see live marker on OpenStreetMap (Maplibre GL JS)
    │  ETA = Haversine(driver_coords, hub_coords) / 60km/h
    ▼
[Driver arrives at farm — presses "I Arrived"]
    │
    │  WhatsApp message sent to farmer:
    │  "السواق جاك! كودك هو: 4821"
    ▼
[Farmer reads code, tells driver verbally]
    │
[Driver enters 4821 in app]
    │
    │  App calls: supabase.rpc('validate_pickup_otp', { trip_id, otp_input })
    │
    │  Supabase function (atomic):
    │    - SELECT trip FOR UPDATE
    │    - Verify status = 'accepted'
    │    - Verify otp_pickup matches
    │    - UPDATE status = 'in_transit'
    │    - UPDATE picked_up_at = NOW()
    │
    │  Returns: { success: true }
    ▼
[Driver drives to El Mourouj hub]
    │  GPS continues broadcasting
    ▼
[Driver arrives at hub]
    │
    │  Geo-fence check: if driver within 500m of hub → status = 'arrived_hub'
    │  Hub manager receives WhatsApp: "شاحنة وصلت! كود التسليم: 7293"
    ▼
[Hub manager enters 7293 on Admin panel]
    │
    │  supabase.rpc('validate_delivery_otp', { trip_id, otp_input })
    │  status → 'delivered'
    │
    │  INSERT ledger_entries:
    │    - driver_fee_millimes (logged, not yet disbursed in Phase 1)
    │    - farmer_payout (logged)
    │    - platform_commission (logged)
    ▼
[Admin disbursements happen manually in Phase 1]
[Automated via Flouci API in Phase 2]
```

---

### Flow D: Last-Mile Cross-Docking

```
[Truck delivers mixed cargo to Hub Bir El Kassaa]
    │
    ▼
[Hub Manager logs contents in Admin Panel]
    │  Matches physical crates to order_items
    ▼
[System groups order_items by delivery_zone]
    │  SELECT o.*, dz.name
    │  FROM orders o
    │  JOIN delivery_zones dz ON ST_Within(
    │    ST_SetSRID(ST_MakePoint(o.delivery_lng, o.delivery_lat), 4326),
    │    dz.boundary
    │  )
    │  WHERE o.status = 'in_transit'
    ▼
[System creates last-mile sub-trips per zone]
    │  Broadcast to couriers (scooter/van drivers) near hub
    ▼
[Courier accepts zone run]
    │  Same OTP flow, but:
    │    OTP_PICKUP = from hub manager
    │    OTP_DELIVERY = from end buyer
    ▼
[Buyer confirms receipt on web app or WhatsApp]
    │
    │  order.status → 'delivered'
    │  Final ledger entries created
```

---

## 3. Real-Time Architecture Detail

```
[Driver App]
    │  expo-location watchPositionAsync()
    │  (45s interval, Balanced accuracy)
    │
    ▼
[Supabase Realtime Broadcast]
    channel: `trip:${tripId}`
    event: 'location-ping'
    payload: { lat, lng, timestamp, driverId }

    (No DB write — this is broadcast only, zero DB overhead)
    │
    ├──► [Admin Dashboard — subscribes to ALL trip channels]
    │       Map: all driver markers updated live
    │
    └──► [Buyer App — subscribes to own trip only]
            Map: single driver marker + ETA countdown

// Driver app subscription code
const channel = supabase.channel(`trip:${tripId}`)
channel
  .on('broadcast', { event: 'location-ping' }, ({ payload }) => {
    updateDriverMarker(payload.lat, payload.lng)
    updateETA(payload.lat, payload.lng, hub.lat, hub.lng)
  })
  .subscribe()

// Driver app broadcast (every 45s from background task)
const ping = supabase.channel(`trip:${tripId}`)
ping.send({
  type: 'broadcast',
  event: 'location-ping',
  payload: { lat, lng, timestamp: new Date().toISOString(), driverId }
})
```

---

## 4. WhatsApp Bot State Machine

```
States per farmer WhatsApp session:
  IDLE → LISTING_IN_PROGRESS → AWAITING_CONFIRMATION → ACTIVE

IDLE:
  Any text/audio → Detect intent
    "bi3" / "3andi" / "nheb nbii3" → LISTING_IN_PROGRESS
    "flousi" / "wesh jani" → Reply with payment status

LISTING_IN_PROGRESS:
  Audio received → Whisper → LLM → JSON extracted
    High confidence → INSERT + send confirmation button → AWAITING_CONFIRMATION
    Low confidence → Ask clarification → stay in LISTING_IN_PROGRESS

AWAITING_CONFIRMATION:
  ✅ Button → UPDATE status = 'available' → IDLE
  ❌ Button → DELETE pending item → IDLE
  No response in 2h → Auto-cancel → IDLE
```

---

## 5. Error Handling Strategy

| Scenario | Detection | Response |
|---|---|---|
| Whisper API down | catch + HTTP error | Queue message for retry in 5 min via cron; notify admin |
| Supabase offline | Supabase client error | Driver app: show "offline mode" banner; cache writes locally |
| Invalid OTP (3 attempts) | Count OTP failures in `trips` table | Lock trip, alert admin, do not let driver proceed |
| GPS silent for 10 min (IN_TRANSIT) | Cron job checks `last_ping_at` | Admin alert + "Signal Lost" badge on map |
| WhatsApp duplicate message | Check `whatsapp_messages.wa_message_id` | Return 200, skip processing |
| Vercel function timeout | Immediate 200 return + async queue | Never process WhatsApp webhooks synchronously |
| Meta signature invalid | X-Hub-Signature-256 mismatch | Return 403, log attempt |

---

## 6. Performance Considerations

**Supabase Free Tier Limits to Respect:**
- 500MB database storage → Use `trip_location_cache` cleanup cron (48h TTL)
- 200 concurrent Realtime connections → Use Broadcast (not DB listeners) for GPS
- 1GB file storage → Compress driver CIN photos client-side before upload (<500KB each)
- 50,000 MAU Auth → Sufficient for Phase 1

**Query Optimization:**
- `inventory_items.coordinates`: GIST index mandatory (already in schema)
- `delivery_zones.boundary`: GIST index mandatory (already in schema)
- Never do `SELECT *` — always specify columns in production queries
- Use Supabase `.abortSignal()` on all real-time subscriptions when component unmounts

**Vercel Free Tier Limits to Respect:**
- 10-second function execution limit → WhatsApp webhook must return 200 in < 1s
- 100GB bandwidth/month → Optimize image delivery via Supabase Storage CDN
