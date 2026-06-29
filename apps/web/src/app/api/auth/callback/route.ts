import { NextResponse } from 'next/server'
import { createServerClient, serializeCookieHeader, type CookieOptions } from '@supabase/ssr'

export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json()

  if (!access_token) {
    return NextResponse.json({ error: 'Missing access_token' }, { status: 400 })
  }

  const headers = new Headers()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value, options } of cookiesToSet) {
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
          }
        },
      },
    },
  )

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return NextResponse.json({ ok: true, user: data.user }, { headers })
}
