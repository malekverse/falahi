import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sanitizeText } from '@filahi/utils'

const CreateDisputeSchema = z.object({
  tripId: z.string().uuid(),
  disputeType: z.enum(['cargo_theft', 'otp_failure', 'gps_loss', 'quality_issue', 'no_show', 'other']),
  description: z.string().trim().max(2000).optional(),
})

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const raw = await req.json()
  const parsed = CreateDisputeSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { tripId, disputeType, description } = parsed.data

  const { data: trip } = await supabase
    .from('trips')
    .select('driver_id')
    .eq('id', tripId)
    .single()

  if (!trip) {
    return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 })
  }

  if (trip.driver_id !== user.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin' && profile?.role !== 'buyer') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
  }

  const { data: dispute, error } = await supabase
    .from('disputes')
    .insert({
      trip_id: tripId,
      raised_by: user.id,
      dispute_type: disputeType,
      description: description ? sanitizeText(description, 2000) : null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ dispute }, { status: 201 })
}
