import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { JoinGroupBuySchema } from '@/lib/validation'

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
      return NextResponse.json({ error: 'Only buyers can join group buys' }, { status: 403 })
    }

    const raw = await request.json()
    const parsed = JoinGroupBuySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const { groupBuyId, quantity } = parsed.data

    const { data: result, error } = await supabase.rpc('join_group_buy', {
      group_buy_id: groupBuyId,
      join_quantity: quantity,
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to join group buy' }, { status: 500 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Group buy join error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
