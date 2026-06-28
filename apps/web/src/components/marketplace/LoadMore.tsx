'use client'

import { useState } from 'react'
import { ListingCard, type ListingCardItem } from './ListingCard'

export function LoadMore({
  initialItems,
  category,
  region,
  minPrice,
  maxPrice,
}: {
  initialItems: ListingCardItem[]
  category?: string
  region?: string
  minPrice?: string
  maxPrice?: string
}) {
  const [items, setItems] = useState<ListingCardItem[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  async function handleLoadMore() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('cursor', String(items.length))
      if (category) params.set('category', category)
      if (region) params.set('region', region)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)

      const res = await fetch(`/api/marketplace?${params}`)
      const data = await res.json()
      setItems((prev) => [...prev, ...data.items])
      setHasMore(data.hasMore)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <ListingCard key={item.id} item={item} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="btn-ghost rounded-lg border border-olive-600 px-8 py-3 text-sm font-medium text-olive-700 transition-colors hover:bg-olive-50 disabled:opacity-50"
            aria-label="Charger plus de produits"
          >
            {loading ? 'Chargement...' : 'Voir plus'}
          </button>
        </div>
      )}

      {!hasMore && items.length === 0 && (
        <p className="py-12 text-center text-sm text-ink-500">
          Aucun produit disponible pour le moment.
        </p>
      )}
    </>
  )
}
