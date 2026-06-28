import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

    const { sub_trip_id } = await req.json()
    if (!sub_trip_id) {
      return NextResponse.json({ error: 'sub_trip_id requis' }, { status: 400 })
    }

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
