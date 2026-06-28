import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Filters } from '@/components/marketplace/Filters'
import { LoadMore } from '@/components/marketplace/LoadMore'
import type { ListingCardItem } from '@/components/marketplace/ListingCard'

const INITIAL_LIMIT = 12

interface SearchParams {
  category?: string
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('inventory_items')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(INITIAL_LIMIT)

  if (params.category) {
    query = query.eq('product_category', params.category)
  }

  const { data: initialListings } = await query

  return (
    <div>
      <div className="mb-8">
        <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
          فلاحي — Marché
        </p>
        <h1 className="section-title mt-1">Produits disponibles</h1>
      </div>

      <Filters />

      <LoadMore
        initialItems={(initialListings || []) as ListingCardItem[]}
        category={params.category}
      />
    </div>
  )
}
