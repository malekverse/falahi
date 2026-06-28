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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Marché</h1>

      <Filters />

      <LoadMore
        initialItems={(initialListings || []) as ListingCardItem[]}
        category={params.category}
      />
    </div>
  )
}
