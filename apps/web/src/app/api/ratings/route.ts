import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

const RatingCreateSchema = z.object({
  orderId: z.string().uuid(),
  tripId: z.string().uuid().optional(),
  targetId: z.string().uuid(),
  targetType: z.enum(['driver', 'farmer', 'product']),
  score: z.number().int().min(1).max(5),
  reviewText: z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const raw = await req.json()
  const parsed = RatingCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { orderId, tripId, targetId, targetType, score, reviewText } = parsed.data

  const { data: order } = await supabase
    .from('orders')
    .select('buyer_id')
    .eq('id', orderId)
    .single()

  if (!order || order.buyer_id !== user.id) {
    return NextResponse.json({ error: 'Order not found or not yours' }, { status: 404 })
  }

  const { data: existing } = await supabase
    .from('ratings')
    .select('id')
    .eq('order_id', orderId)
    .eq('reviewer_id', user.id)
    .eq('target_type', targetType)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already rated this target for this order' }, { status: 409 })
  }

  const { data: rating, error } = await supabase
    .from('ratings')
    .insert({
      order_id: orderId,
      trip_id: tripId,
      reviewer_id: user.id,
      target_id: targetId,
      target_type: targetType,
      score,
      review_text: reviewText,
    })
    .select()
    .single()

  if (error || !rating) {
    return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 })
  }

  return NextResponse.json({ rating }, { status: 201 })
}
