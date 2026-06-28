import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMITS: Record<string, number> = {
  '/api/webhooks/whatsapp': 100,
  '/api/orders/create': 30,
  '/api/ratings': 20,
  '/api/admin/send-whatsapp': 20,
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Admin route auth guard
  if (pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll() {
            // cookies are set via response on login, not in middleware
          },
        },
      },
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Rate limiting for API routes
  const maxRequests = RATE_LIMITS[pathname]
  if (maxRequests) {
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
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/webhooks/whatsapp',
    '/api/orders/create',
    '/api/ratings',
    '/api/admin/send-whatsapp',
  ],
}
