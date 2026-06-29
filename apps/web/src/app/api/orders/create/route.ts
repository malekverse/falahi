import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { calculateCommission, calculateFinalPrice, sanitizeText } from '@filahi/utils'
import { OrderCreateSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await request.json()
    const parsed = OrderCreateSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { inventoryItemId, quantity, deliveryAddress, deliveryNotes, idempotencyKey } = parsed.data

    // Idempotency check
    if (idempotencyKey) {
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .eq('id', idempotencyKey)
        .single()

      if (existing) {
        return NextResponse.json({ orderId: existing.id, cached: true })
      }
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

    const orderInsert: Record<string, unknown> = {
      buyer_id: user.id,
      status: 'pending',
      total_price_millimes: totalMillimes + commissionMillimes,
      commission_millimes: commissionMillimes,
      delivery_address: deliveryAddress ? sanitizeText(deliveryAddress, 500) : undefined,
      delivery_notes: deliveryNotes ? sanitizeText(deliveryNotes, 500) : undefined,
    }

    if (idempotencyKey) {
      orderInsert.id = idempotencyKey
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
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
