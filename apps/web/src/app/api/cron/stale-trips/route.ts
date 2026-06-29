import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { data: staleTrips, error } = await supabase.rpc('alert_stale_trips')

    if (error) {
      console.error('Stale trips query error:', error)
      return NextResponse.json({ error: 'Query failed' }, { status: 500 })
    }

    if (staleTrips && staleTrips.length > 0) {
      console.warn(`ALERT: ${staleTrips.length} stale trip(s) detected:`, staleTrips)
    }

    return NextResponse.json({
      success: true,
      staleTripsCount: staleTrips?.length ?? 0,
      staleTrips: staleTrips ?? [],
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
