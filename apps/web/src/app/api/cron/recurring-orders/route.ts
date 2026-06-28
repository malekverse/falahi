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
    const { data, error } = await supabase.rpc('process_recurring_orders')

    if (error) {
      console.error('Recurring order processing error:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      ordersCreated: data?.length ?? 0,
      orders: data ?? [],
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
