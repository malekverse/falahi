import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMITS: Record<string, number> = {
  '/api/webhooks/whatsapp': 100,
  '/api/orders/create': 30,
  '/api/ratings': 20,
  '/api/admin/send-whatsapp': 20,
}

function createSupabaseWithCookies(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set(name, value, options)
          }
        },
      },
    },
  )
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const res = NextResponse.next()

  if (pathname.startsWith('/admin')) {
    const supabase = createSupabaseWithCookies(req, res)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      const redirectRes = NextResponse.redirect(url)
      for (const c of res.cookies.getAll()) {
        redirectRes.cookies.set(c.name, c.value)
      }
      return redirectRes
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const forbiddenRes = NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      for (const c of res.cookies.getAll()) {
        forbiddenRes.cookies.set(c.name, c.value)
      }
      return forbiddenRes
    }
  }

  if (RATE_LIMITS[pathname]) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown'
    const now = Date.now()
    const entry = rateLimit.get(ip)
    if (entry && now < entry.resetAt) {
      entry.count++
      if (entry.count > RATE_LIMITS[pathname]) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429, headers: { 'Retry-After': '60' } },
        )
      }
    } else {
      rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    }
  }

  return res
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
