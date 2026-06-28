import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const checks: Record<string, string> = {}

  // Supabase connectivity check
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' },
      })
      checks.supabase = response.ok ? 'connected' : `error: ${response.status}`
    } else {
      checks.supabase = 'not_configured'
    }
  } catch (err) {
    checks.supabase = `unreachable: ${err instanceof Error ? err.message : String(err)}`
  }

  // WhatsApp API config check
  checks.whatsapp = process.env.META_WA_PHONE_NUMBER_ID ? 'configured' : 'not_configured'

  // AI provider check
  if (process.env.GROQ_API_KEY) {
    checks.ai = 'groq_configured'
  } else if (process.env.OPENAI_API_KEY) {
    checks.ai = 'openai_configured'
  } else {
    checks.ai = 'not_configured'
  }

  // Sentry check
  checks.sentry = process.env.SENTRY_DSN ? 'configured' : 'not_configured'

  const allOk = Object.values(checks).every((v) => v === 'connected' || v === 'configured')

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 },
  )
}
