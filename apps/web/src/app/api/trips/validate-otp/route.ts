import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { tripId, otp, type } = await request.json()

    if (!tripId || !otp || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: tripId, otp, type' },
        { status: 400 },
      )
    }

    if (type !== 'pickup' && type !== 'delivery') {
      return NextResponse.json(
        { error: 'type must be "pickup" or "delivery"' },
        { status: 400 },
      )
    }

    // TODO: Call Supabase RPC for atomic OTP validation
    // const result = await supabase.rpc('validate_pickup_otp', { ... })

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('OTP validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
