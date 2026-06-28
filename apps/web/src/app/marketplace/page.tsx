import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { Filters } from '@/components/marketplace/Filters'

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

  if (params.category) {
    query = query.eq('product_category', params.category)
  }

  const { data: listings } = await query

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Marché</h1>

      <Filters />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(listings || []).map((item) => (
          <ListingCard key={item.id} item={item} />
        ))}
      </div>

      {(!listings || listings.length === 0) && (
        <p className="py-12 text-center text-gray-500">
          Aucun produit disponible pour le moment.
        </p>
      )}
    </div>
  )
}
