import { NextResponse } from 'next/server'
import { generateOTP, sendWhatsAppMessage } from '@filahi/utils'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { phone } = (await request.json()) as { phone: string }

    const normalized = phone.startsWith('+') ? phone : `+216${phone.replace(/^00216/, '')}`
    if (!/^\+216\d{8}$/.test(normalized)) {
      return NextResponse.json({ error: 'Invalid Tunisian phone number' }, { status: 400 })
    }

    const waId = normalized.replace('+', '')
    const otp = generateOTP(6)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    await supabase.from('whatsapp_otps').insert({
      phone: normalized,
      otp,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })

    await sendWhatsAppMessage(waId, `🔐 رمز التحقق الخاص بك في فلاحي: ${otp}\n\nهذا الرمز صالح لمدة 5 دقائق.`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to send WhatsApp OTP:', err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
