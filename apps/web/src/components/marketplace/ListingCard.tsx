import React from 'react'
import { formatTND } from '@filahi/types'
import type { Millimes } from '@filahi/types'
import { FreshnessBar, FairPriceWidget } from '@filahi/ui'
import { useCart } from '@/lib/cart-context'

const CATEGORY_EMOJI: Record<string, string> = {
  vegetables: '🥬',
  fruit: '🍊',
  eggs: '🥚',
  honey: '🍯',
  olive_oil: '🫒',
  legumes: '🫘',
  grains: '🌾',
  herbs: '🌿',
}

interface ProductImageProps {
  imageUrl: string | null | undefined
  productName: string
  category: string
}

function ProductImage({ imageUrl, productName, category }: ProductImageProps) {
  if (imageUrl) {
    return (
      <div className="mb-3 h-36 w-full overflow-hidden rounded-lg bg-cream-100">
        <img src={imageUrl} alt={productName} className="h-full w-full object-cover" loading="lazy" />
      </div>
    )
  }
  return (
    <div className="mb-3 flex h-36 items-center justify-center rounded-lg bg-gradient-to-br from-cream-100 to-cream-200 text-5xl" aria-hidden="true">
      {CATEGORY_EMOJI[category] ?? '🥗'}
    </div>
  )
}

export interface ListingCardItem {
  id: number
  product_name: string
  product_category: string
  quantity: number
  unit: string
  asking_price_millimes: Millimes | null
  platform_price_millimes: Millimes | null
  location_name: string
  harvest_date: string | null
  shelf_life_days: number | null
  created_at: string
  image_url?: string | null
  farmer_id?: string
}

export const ListingCard = React.memo(function ListingCard({ item }: { item: ListingCardItem }) {
  const { addItem } = useCart()

  return (
    <div
      className="market-card"
      role="article"
      aria-label={`${item.product_name}, ${item.quantity} ${item.unit}, ${item.platform_price_millimes ? formatTND(item.platform_price_millimes) : ''}, ${item.location_name}`}
    >
      <ProductImage imageUrl={item.image_url} productName={item.product_name} category={item.product_category} />
      <div className="px-4 pb-4">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-base font-bold text-ink-900">{item.product_name}</h3>
        </div>

        <div className="mb-3 space-y-1">
          <p className="text-sm text-ink-500" aria-label={`Quantité: ${item.quantity} ${item.unit}`}>
            <span className="inline-block w-5 text-center text-ink-400">#</span> {item.quantity} {item.unit}
          </p>
          <p className="text-sm text-ink-500" aria-label={`Origine: ${item.location_name}`}>
            <span className="inline-block w-5 text-center text-ink-400">📍</span> {item.location_name}
          </p>
        </div>

        {item.platform_price_millimes && (
          <p className="price-tag mb-3 inline-block text-base" aria-label={`Prix: ${formatTND(item.platform_price_millimes)}`}>
            {formatTND(item.platform_price_millimes)}
          </p>
        )}

        {item.asking_price_millimes && (
          <div className="mb-2" role="complementary" aria-label="Comparaison de prix équitables">
            <FairPriceWidget
              askingPriceMillimes={item.asking_price_millimes}
              platformPriceMillimes={item.platform_price_millimes}
            />
          </div>
        )}

        <div className="mb-2" aria-label={`Fraîcheur: ${item.harvest_date ? `Récolté le ${new Date(item.harvest_date).toLocaleDateString('fr-TN')}` : 'Non spécifié'}`}>
          <FreshnessBar harvestDate={item.harvest_date} shelfLifeDays={item.shelf_life_days} />
        </div>

        <button
          type="button"
          onClick={() =>
            addItem({
              inventoryItemId: item.id,
              productName: item.product_name,
              category: item.product_category,
              quantity: 1,
              unit: item.unit,
              unitPriceMillimes: item.platform_price_millimes ?? item.asking_price_millimes ?? 0,
              locationName: item.location_name,
              farmerId: item.farmer_id ?? '',
            })
          }
          className="btn-primary mt-3 w-full text-sm"
          aria-label={`Ajouter ${item.product_name} au panier`}
        >
          + Ajouter
        </button>

        <div className="mt-2 text-[11px] text-ink-400">
          {item.harvest_date && (
            <span>Récolté le {new Date(item.harvest_date).toLocaleDateString('fr-TN')}</span>
          )}
        </div>
      </div>
    </div>
  )
})
