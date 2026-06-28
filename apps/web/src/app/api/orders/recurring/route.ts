import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'buyer') {
      return NextResponse.json({ error: 'Only buyers can manage recurring orders' }, { status: 403 })
    }

    const { orderId, recurrenceInterval, recurrenceDay } = await request.json()

    if (!orderId || !recurrenceInterval || recurrenceDay === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['weekly', 'biweekly', 'monthly'].includes(recurrenceInterval)) {
      return NextResponse.json({ error: 'Invalid recurrence interval' }, { status: 400 })
    }

    if (recurrenceDay < 0 || recurrenceDay > 6) {
      return NextResponse.json({ error: 'Invalid day (0=Sun, 6=Sat)' }, { status: 400 })
    }

    const { data: order } = await supabase
      .from('orders')
      .select('buyer_id, status')
      .eq('id', orderId)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.buyer_id !== user.id) {
      return NextResponse.json({ error: 'Not your order' }, { status: 403 })
    }

    const now = new Date()
    const dayDiff = (recurrenceDay - now.getDay() + 7) % 7
    const nextRecurrence = new Date(now)
    nextRecurrence.setDate(now.getDate() + dayDiff)
    nextRecurrence.setHours(8, 0, 0, 0)

    const { error } = await supabase
      .from('orders')
      .update({
        is_recurring: true,
        recurrence_interval: recurrenceInterval,
        recurrence_day: recurrenceDay,
        next_recurrence_at: nextRecurrence.toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      return NextResponse.json({ error: 'Failed to set recurring' }, { status: 500 })
    }

    return NextResponse.json({ success: true, nextRecurrenceAt: nextRecurrence.toISOString() })
  } catch (error) {
    console.error('Recurring setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '0')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const { data: orders, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('buyer_id', user.id)
      .eq('is_recurring', true)
      .order('next_recurrence_at', { ascending: true })
      .range(page * limit, (page + 1) * limit - 1)

    return NextResponse.json({ orders: orders ?? [], count: count ?? 0 })
  } catch (error) {
    console.error('List recurring error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await request.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const { error } = await supabase
      .from('orders')
      .update({
        is_recurring: false,
        recurrence_interval: null,
        recurrence_day: null,
        next_recurrence_at: null,
      })
      .eq('id', orderId)
      .eq('buyer_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to cancel recurring' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel recurring error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
