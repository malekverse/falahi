import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOffset, offsetResponse } from '@filahi/utils'
import { MarketplaceQuerySchema } from '@/lib/validation'

const PAGE_LIMIT = 20

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = MarketplaceQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.flatten() }, { status: 400 })
  }

  const { cursor, category, region, minPrice, maxPrice } = parsed.data
  const offset = getOffset({ cursor })

  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('inventory_items')
    .select('*', { count: 'exact' })
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_LIMIT - 1)

  if (category) {
    query = query.eq('product_category', category)
  }

  if (region) {
    query = query.eq('location_name', region)
  }

  if (minPrice !== undefined) {
    query = query.gte('platform_price_millimes', minPrice * 1000)
  }

  if (maxPrice !== undefined) {
    query = query.lte('platform_price_millimes', maxPrice * 1000)
  }

  const { data: items, count } = await query

  return NextResponse.json(
    offsetResponse(items || [], offset, PAGE_LIMIT),
    { headers: { 'X-Total-Count': String(count ?? 0) } },
  )
}
