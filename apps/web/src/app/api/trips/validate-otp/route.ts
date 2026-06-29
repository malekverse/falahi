import { NextResponse, type NextRequest } from 'next/server'
import { ValidateTripOTPSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()
    const parsed = ValidateTripOTPSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const { tripId, otp, type } = parsed.data

    // TODO: Call Supabase RPC for atomic OTP validation
    // const result = await supabase.rpc('validate_pickup_otp', { ... })

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('OTP validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
