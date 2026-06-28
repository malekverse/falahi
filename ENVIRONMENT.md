# ENVIRONMENT.md — Environment Variables & Configuration
## Filahi — All Apps

> Never hardcode any of these values. Never commit `.env.local` or `.env` to Git.
> Add all secrets to `.gitignore` and use Vercel's environment dashboard for production.

---

## .gitignore entries (mandatory)

```
.env
.env.local
.env.*.local
*.env
```

---

## apps/web — Next.js (.env.local)

```bash
# ─── Supabase ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key — NEVER expose to client. Server-side only.
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─── Meta WhatsApp Cloud API ──────────────────────────────────────────────
# Get from: https://developers.facebook.com → Your App → WhatsApp → API Setup
META_WA_PHONE_NUMBER_ID=123456789012345
META_WA_ACCESS_TOKEN=EAAxxxxxx...
META_WA_WEBHOOK_VERIFY_TOKEN=your-random-secret-string-here  # You choose this
META_WA_APP_SECRET=abc123...  # For X-Hub-Signature-256 verification

# ─── AI / Speech-to-Text ─────────────────────────────────────────────────
# Option A: OpenAI (pay-per-use, ~$0.006/min audio)
OPENAI_API_KEY=sk-...

# Option B: Groq (free tier, generous limits)
GROQ_API_KEY=gsk_...

# Which STT provider to use: 'openai' | 'groq'
STT_PROVIDER=groq

# ─── LLM for Structured Extraction ───────────────────────────────────────
# Option A: Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# Option B: OpenAI
# Uses OPENAI_API_KEY above

# Which LLM to use: 'claude' | 'openai'
LLM_PROVIDER=claude

# ─── App Config ──────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://filahi.tn                  # Production
# NEXT_PUBLIC_APP_URL=http://localhost:3000             # Development

# ─── Error Monitoring (Sentry) ────────────────────────────────────────────
# Create project at https://sentry.io → Get DSN from Settings → Client Keys (DSN)
# Free tier: 5k errors/month, 1 user
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxxxxx.ingest.us.sentry.io/1234567

# Commission rate (as a decimal)
PLATFORM_COMMISSION_RATE=0.12

# AI confidence threshold (below = human review)
AI_CONFIDENCE_THRESHOLD=0.75

# GPS stale alert (minutes without ping before admin alert)
GPS_STALE_THRESHOLD_MINUTES=10

# ─── Geofence ────────────────────────────────────────────────────────────
# Hub geofence radius in meters
HUB_GEOFENCE_RADIUS_METERS=500

# ─── Phase 2 (leave empty in Phase 1) ───────────────────────────────────
FLOUCI_API_KEY=
FLOUCI_APP_TOKEN=
WALLETII_API_KEY=
```

---

## apps/driver — React Native / Expo (.env)

Expo uses `process.env.EXPO_PUBLIC_*` for client-exposed variables.

```bash
# ─── Supabase ─────────────────────────────────────────────────────────────
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─── App Config ──────────────────────────────────────────────────────────
EXPO_PUBLIC_APP_ENV=development       # 'development' | 'production'

# Background task name (must match TaskManager.defineTask name in code)
EXPO_PUBLIC_BG_LOCATION_TASK=DRIVER_LOCATION_TASK

# GPS interval in milliseconds (45000 = 45 seconds)
EXPO_PUBLIC_GPS_INTERVAL_MS=45000

# Offline cache flush threshold (flush if queued items > this number)
EXPO_PUBLIC_GPS_CACHE_FLUSH_THRESHOLD=20
```

---

## packages/supabase — Shared client config

```typescript
// packages/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'  // Auto-generated

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

---

## Supabase Local Development

Install Supabase CLI:
```bash
npm install -g supabase
```

Local dev (runs Supabase locally via Docker):
```bash
supabase start
# Gives you: local URL, anon key, service_role key
# These are safe to commit to version control as they're only for local dev
```

Generate TypeScript types after any schema change:
```bash
supabase gen types typescript --local > packages/types/database.ts
```

---

## Free Tier Limits — Monitor These

| Service | Limit | Action at 80% |
|---|---|---|
| Supabase DB | 500 MB | Run cleanup crons, enable compression |
| Supabase Storage | 1 GB | Compress images client-side before upload |
| Supabase Realtime | 200 concurrent connections | Ensure channels are unsubscribed on unmount |
| Supabase Auth | 50,000 MAU | No action needed for Phase 1 |
| Vercel Serverless | 100 GB bandwidth, 10s timeout | Keep webhook async, use Edge runtime |
| Meta WhatsApp | 1,000 free business-initiated msgs/month | Use service messages (user-initiated) where possible |
| Groq Whisper | ~2M tokens/day free | Monitor via Groq dashboard |
| Expo EAS Build | 30 free builds/month | Build only when needed |

---

## Webhook URL Setup (Meta WhatsApp)

1. Deploy Next.js to Vercel
2. Go to Meta Developer Console → Your App → WhatsApp → Configuration
3. Set Webhook URL: `https://filahi.vercel.app/api/webhooks/whatsapp`
4. Set Verify Token: same as `META_WA_WEBHOOK_VERIFY_TOKEN` in your env
5. Subscribe to: `messages` webhook field

For local development, use ngrok:
```bash
npx ngrok http 3000
# Use the ngrok HTTPS URL as your webhook during dev
```
