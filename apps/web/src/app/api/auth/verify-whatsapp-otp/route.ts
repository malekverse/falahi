import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { phone, otp } = (await request.json()) as { phone: string; otp: string }

    const normalized = phone.startsWith('+') ? phone : `+216${phone.replace(/^00216/, '')}`
    if (!/^\+216\d{8}$/.test(normalized)) {
      return NextResponse.json({ error: 'Invalid Tunisian phone number' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: otpRecord } = await supabase
      .from('whatsapp_otps')
      .select('id, otp, expires_at, used')
      .eq('phone', normalized)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
    }

    await supabase
      .from('whatsapp_otps')
      .update({ used: true })
      .eq('id', otpRecord.id)

    let userId: string

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', normalized)
      .maybeSingle()

    if (existingProfile) {
      userId = existingProfile.id
    } else {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        phone: normalized,
        user_metadata: { role: 'buyer' },
      })

      if (authError || !authUser?.user) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      userId = authUser.user.id

      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        full_name: normalized,
        phone_number: normalized,
        role: 'buyer',
        preferred_lang: 'fr',
      })

      if (profileError) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
    }

    const sessionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/grant`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ user_id: userId }),
      },
    )

    if (!sessionResponse.ok) {
      const errText = await sessionResponse.text()
      console.error('Session grant failed:', errText)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    const session = await sessionResponse.json() as {
      access_token: string
      refresh_token: string
      expires_in: number
    }

    const response = NextResponse.json({ success: true, redirect: '/marketplace' })

    const cookieMaxAge = session.expires_in
    const isSecure = process.env.NODE_ENV === 'production'

    response.cookies.set('sb-access-token', session.access_token, {
      path: '/',
      maxAge: cookieMaxAge,
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
    })
    response.cookies.set('sb-refresh-token', session.refresh_token, {
      path: '/',
      maxAge: cookieMaxAge * 24,
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
    })

    return response
  } catch (err) {
    console.error('WhatsApp OTP verify failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
