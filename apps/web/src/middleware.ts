import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 100

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Rate limiting for WhatsApp webhook
  if (pathname === '/api/webhooks/whatsapp') {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown'

    const now = Date.now()
    const entry = rateLimit.get(ip)

    if (entry && now < entry.resetAt) {
      entry.count++
      if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429, headers: { 'Retry-After': '60' } },
        )
      }
    } else {
      rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/webhooks/whatsapp'],
}
