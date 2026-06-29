import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const start = Date.now()

  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from('profiles').select('id').limit(1)

    if (error) throw error

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({
      status: 'degraded',
      db: 'error',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 503 })
  }
}
