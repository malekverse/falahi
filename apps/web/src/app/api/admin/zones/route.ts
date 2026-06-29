import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sanitizeText } from '@filahi/utils'

const ZoneCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  coordinates: z.array(z.array(z.number())).min(3),
  hubId: z.string().uuid().nullable(),
})

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
  }

  const raw = await req.json()
  const parsed = ZoneCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation échouée', details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, coordinates, hubId } = parsed.data

  const polygonGeoJson = JSON.stringify({
    type: 'Polygon',
    coordinates: [[...coordinates, coordinates[0]]],
  })

  const { data, error } = await supabase.rpc('create_delivery_zone', {
    zone_name: sanitizeText(name, 100),
    zone_boundary: polygonGeoJson,
    hub_id: hubId,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ zone: data }, { status: 201 })
}
