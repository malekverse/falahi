# BLOCKERS.md — Items Requiring Human Action

## Blocker 1: Supabase Project (Blocks Phase 0, 5, 6 items)

**What needs to happen:**
1. Go to https://supabase.com → Create a new project (free tier)
2. Enable PostGIS extension in the SQL editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. Copy the project URL, anon key, and service_role key from Settings → API
4. Put them in `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
5. Also put them in `apps/driver/.env` (as `EXPO_PUBLIC_SUPABASE_*`)
6. Link the CLI and apply migrations:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
7. Generate TypeScript types:
   ```bash
   pnpm db:generate-types
   ```

**Unblocks:** Phase 0 (migrations, RLS, auth), Phase 5 (hub, geo-fence, zones, sub-trips), Phase 6 (DB backup)

## Blocker 2: Meta WhatsApp Cloud API (Blocks Phase 1, 6 items)

**What needs to happen:**
1. Go to https://developers.facebook.com → Create a Business App
2. Add WhatsApp product → Set up Cloud API
3. In the app dashboard, copy the Phone Number ID and Access Token
4. Generate an App Secret for webhook signature verification
5. Set up webhook URL (after Vercel deploy or ngrok):
   - URL: `https://your-domain.vercel.app/api/webhooks/whatsapp`
   - Verify token: choose any string
6. Subscribe to `messages` webhook field
7. Add to `.env.local`:
   ```
   META_WA_PHONE_NUMBER_ID=123456789012345
   META_WA_ACCESS_TOKEN=EAAxxxx...
   META_WA_WEBHOOK_VERIFY_TOKEN=your-secret
   META_WA_APP_SECRET=abc123...
   ```

**Unblocks:** Phase 1 (bot verification, message handling), Phase 6 (WA template approval)

## Blocker 3: AI API Keys (Blocks Phase 1 transcription)

**What needs to happen:**
1. Option A: Go to https://console.groq.com → Sign up → Create API key
   - Add `GROQ_API_KEY=gsk_...` to `.env.local`
   - Add `STT_PROVIDER=groq`
2. Option B: Go to https://platform.openai.com → Create API key
   - Add `OPENAI_API_KEY=sk-...` to `.env.local`
   - Add `STT_PROVIDER=openai`
3. For LLM extraction, add one of:
   - `ANTHROPIC_API_KEY=sk-ant-...` + `LLM_PROVIDER=claude`
   - Or reuse `OPENAI_API_KEY` + `LLM_PROVIDER=openai`

**Unblocks:** Phase 1 (Darija transcription, LLM extraction)

## Blocker 4: EAS Build (Blocks Phase 3 APK distribution)

**What needs to happen:**
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Build: `cd apps/driver && eas build --platform android --profile preview`
4. The APK will be downloadable from Expo dashboard after build

**Unblocks:** Phase 3 (Android APK distribution)

## Blocker 5: Sentry DSN (Blocks error monitoring)

**What needs to happen:**
1. Go to https://sentry.io → Create account → Create Next.js project
2. Copy the DSN from Project Settings → Client Keys (DSN)
3. Add to `.env.local`:
   ```
   SENTRY_DSN=https://xxx@xxx.ingest.us.sentry.io/1234567
   ```
   (Optional for public: `NEXT_PUBLIC_SENTRY_DSN=...` for client-side errors)

**Note:** Sentry config files are written and committed. Only the DSN env var is missing.

---

## Summary

| Blocker | Blocks | Human Action Required |
|---|---|---|
| Supabase project | Phase 0, 5, 6 | Create project, enable PostGIS, add keys |
| Meta WhatsApp API | Phase 1, 6 | Create Business App, setup webhook, add keys |
| AI API keys | Phase 1 | Create Groq or OpenAI key, add to env |
| EAS Build | Phase 3 | Install EAS CLI, run eas build |
| Sentry DSN | Error monitoring | Create Sentry project, copy DSN |
