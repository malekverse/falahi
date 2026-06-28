# BLOCKERS.md — Items Requiring Human Action

## Blocker 1: Supabase Project
**Status:** Open
**Context:** Phase 0 requires a running Supabase project to push migrations, generate types, and validate RLS.
**What's needed:**
1. Create a project at https://supabase.com
2. Enable PostGIS extension in the dashboard
3. Copy the Project URL, anon key, and service_role key to `.env.local`
4. Run `supabase link --project-ref <ref>` to link the CLI
5. Run `supabase db push` to apply migrations
6. Run `pnpm db:generate-types` to sync TypeScript types

## Blocker 2: Meta WhatsApp Cloud API
**Status:** Open
**Context:** Phase 1 WhatsApp bot requires a Meta Business Account with WhatsApp product enabled.
**What's needed:**
1. Create a Meta Business App at https://developers.facebook.com
2. Add WhatsApp product, get Phone Number ID, Access Token, App Secret
3. Set up webhook URL pointing to the deployed app
4. Add all values to `.env.local`

## Blocker 3: AI API Keys
**Status:** Open
**Context:** Phase 1 transcription and LLM extraction need API keys.
**What's needed:**
1. Get Groq API key (free tier) or OpenAI API key
2. Set `GROQ_API_KEY` or `OPENAI_API_KEY` in `.env.local`
