import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { calculateCommission, calculateFinalPrice } from '@filahi/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { inventoryItemId, quantity, deliveryAddress, notes } = await request.json()

    if (!inventoryItemId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: inventoryItemId, quantity' },
        { status: 400 },
      )
    }

    const { data: item } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', inventoryItemId)
      .eq('status', 'available')
      .single()

    if (!item) {
      return NextResponse.json({ error: 'Item not available' }, { status: 404 })
    }

    const unitPriceMillimes = item.platform_price_millimes || item.asking_price_millimes
    const totalMillimes = unitPriceMillimes * Math.round(quantity)
    const commissionMillimes = calculateCommission(totalMillimes)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        status: 'pending',
        total_price_millimes: totalMillimes + commissionMillimes,
        commission_millimes: commissionMillimes,
        delivery_address: deliveryAddress,
        delivery_notes: notes,
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      inventory_item_id: inventoryItemId,
      quantity,
      unit_price_millimes: unitPriceMillimes,
      total_millimes: totalMillimes,
    })

    if (itemError) {
      return NextResponse.json({ error: 'Failed to add order items' }, { status: 500 })
    }

    await supabase
      .from('inventory_items')
      .update({ status: 'reserved' })
      .eq('id', inventoryItemId)

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
