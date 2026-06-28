import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const expectedToken = process.env.META_WA_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && token === expectedToken && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    // Verify signature
    const signature = request.headers.get('x-hub-signature-256')
    if (!signature) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Return 200 immediately to avoid Meta timeout
    // Processing happens in background via waitUntil pattern
    const { searchParams } = request.nextUrl
    const isBackground = searchParams.get('background') === 'true'

    if (!isBackground) {
      // TODO: trigger background processing (waitUntil or queue)
      console.log('WhatsApp webhook received:', JSON.stringify(payload))
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ status: 'error' }, { status: 200 })
  }
}
