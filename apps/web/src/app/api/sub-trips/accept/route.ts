import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AcceptSubTripSchema } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('driver_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'courier') {
      return NextResponse.json({ error: 'Seuls les coursiers peuvent accepter des sous-trajets' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = AcceptSubTripSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
    }

    const { sub_trip_id } = parsed.data

    const { data, error } = await supabase.rpc('accept_sub_trip', {
      sub_trip_id,
      courier_uuid: user.id,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
