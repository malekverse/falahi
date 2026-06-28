import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CreateGroupBuySchema } from '@/lib/validation'

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
      return NextResponse.json({ error: 'Only buyers can create group buys' }, { status: 403 })
    }

    const rawBody = await request.json()
    const parsed = CreateGroupBuySchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }

    const { inventoryItemId, targetQuantity, unit, unitPriceMillimes, expiresInHours } = parsed.data

    const { data: item } = await supabase
      .from('inventory_items')
      .select('id, status, product_name')
      .eq('id', inventoryItemId)
      .eq('status', 'available')
      .single()

    if (!item) {
      return NextResponse.json({ error: 'Item not available' }, { status: 404 })
    }

    const expiresAt = new Date(Date.now() + expiresInHours * 3600_000).toISOString()

    const { data: groupBuy, error } = await supabase
      .from('group_buys')
      .insert({
        creator_id: user.id,
        inventory_item_id: inventoryItemId,
        target_quantity: targetQuantity,
        unit,
        unit_price_millimes: unitPriceMillimes,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (error || !groupBuy) {
      return NextResponse.json({ error: 'Failed to create group buy' }, { status: 500 })
    }

    return NextResponse.json({ groupBuyId: groupBuy.id }, { status: 201 })
  } catch (error) {
    console.error('Group buy creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
