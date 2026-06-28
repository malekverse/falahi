import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOffset, offsetResponse } from '@filahi/utils'

const PAGE_LIMIT = 20

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const category = searchParams.get('category')
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

  const { data: items, count } = await query

  return NextResponse.json(
    offsetResponse(items || [], offset, PAGE_LIMIT),
    { headers: { 'X-Total-Count': String(count ?? 0) } },
  )
}
