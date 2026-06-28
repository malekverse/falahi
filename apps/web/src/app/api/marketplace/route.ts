import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOffset, offsetResponse } from '@filahi/utils'

const PAGE_LIMIT = 20

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const category = searchParams.get('category')
  const region = searchParams.get('region')
  const minPriceTnd = searchParams.get('minPrice')
  const maxPriceTnd = searchParams.get('maxPrice')
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

  if (minPriceTnd) {
    const minMillimes = parseInt(minPriceTnd) * 1000
    if (!isNaN(minMillimes)) {
      query = query.gte('platform_price_millimes', minMillimes)
    }
  }

  if (maxPriceTnd) {
    const maxMillimes = parseInt(maxPriceTnd) * 1000
    if (!isNaN(maxMillimes)) {
      query = query.lte('platform_price_millimes', maxMillimes)
    }
  }

  const { data: items, count } = await query

  return NextResponse.json(
    offsetResponse(items || [], offset, PAGE_LIMIT),
    { headers: { 'X-Total-Count': String(count ?? 0) } },
  )
}
