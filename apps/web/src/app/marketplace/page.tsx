import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Filters } from '@/components/marketplace/Filters'
import { LoadMore } from '@/components/marketplace/LoadMore'
import { encodeCursor } from '@filahi/utils'
import type { ListingCardItem } from '@/components/marketplace/ListingCard'

const INITIAL_LIMIT = 20

interface SearchParams {
  category?: string
  region?: string
  minPrice?: string
  maxPrice?: string
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createServerSupabaseClient()

  const { data: regions } = await supabase
    .from('inventory_items')
    .select('location_name')
    .eq('status', 'available')
    .not('location_name', 'is', null)
    .order('location_name')

  const uniqueRegions = [...new Set<string>((regions ?? []).map((r) => r.location_name).filter(Boolean))]

  let query = supabase
    .from('inventory_items')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(INITIAL_LIMIT)

  if (params.category) {
    query = query.eq('product_category', params.category)
  }

  if (params.region) {
    query = query.eq('location_name', params.region)
  }

  if (params.minPrice) {
    const minMillimes = parseInt(params.minPrice) * 1000
    if (!isNaN(minMillimes)) {
      query = query.gte('platform_price_millimes', minMillimes)
    }
  }

  if (params.maxPrice) {
    const maxMillimes = parseInt(params.maxPrice) * 1000
    if (!isNaN(maxMillimes)) {
      query = query.lte('platform_price_millimes', maxMillimes)
    }
  }

  const { data: initialListings } = await query
  const items = (initialListings || []) as ListingCardItem[]
  const last = items[items.length - 1]
  const initialCursor = last
    ? encodeCursor({ createdAt: last.created_at, id: last.id })
    : undefined

  return (
    <div>
      <div className="mb-8">
        <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
          فلاحي — Marché
        </p>
        <h1 className="section-title mt-1">Produits disponibles</h1>
      </div>

      <Filters regions={uniqueRegions} />

      <LoadMore
        initialItems={items}
        initialCursor={initialCursor}
        category={params.category}
        region={params.region}
        minPrice={params.minPrice}
        maxPrice={params.maxPrice}
      />
    </div>
  )
}
