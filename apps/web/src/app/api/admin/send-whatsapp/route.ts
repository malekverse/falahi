import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@filahi/utils'

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

  const { to, message } = await req.json()

  if (!to || !message) {
    return NextResponse.json({ error: 'Numéro et message requis' }, { status: 400 })
  }

  try {
    await sendWhatsAppMessage(to, message)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
