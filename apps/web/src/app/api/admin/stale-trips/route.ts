import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: trips, error } = await supabase.rpc('alert_stale_trips')

    if (error) {
      return NextResponse.json({ error: 'Failed to check' }, { status: 500 })
    }

    return NextResponse.json({ trips: trips ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
