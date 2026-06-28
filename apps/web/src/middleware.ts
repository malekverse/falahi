import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMITS: Record<string, number> = {
  '/api/webhooks/whatsapp': 100,
  '/api/orders/create': 30,
  '/api/ratings': 20,
  '/api/admin/send-whatsapp': 20,
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const maxRequests = RATE_LIMITS[pathname]
  if (!maxRequests) return NextResponse.next()

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'

  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (entry && now < entry.resetAt) {
    entry.count++
    if (entry.count > maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } },
      )
    }
  } else {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/webhooks/whatsapp', '/api/orders/create', '/api/ratings', '/api/admin/send-whatsapp'],
}
